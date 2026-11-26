// Location core: reads and removes GPS from photos, entirely on this device.
(function () {
  var TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };

  function isJpeg(u8) { return u8.length > 3 && u8[0] === 0xFF && u8[1] === 0xD8; }

  // Walk JPEG metadata segments until the image data starts.
  function segments(u8) {
    var out = [], pos = 2, len = u8.length;
    while (pos + 4 <= len) {
      if (u8[pos] !== 0xFF) break;
      var m = u8[pos + 1];
      if (m === 0xFF) { pos += 1; continue; }
      if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) { pos += 2; continue; }
      if (m === 0xDA || m === 0xD9) break;
      var segLen = (u8[pos + 2] << 8) | u8[pos + 3];
      var end = pos + 2 + segLen;
      if (segLen < 2 || end > len) break;
      out.push({ marker: m, body: pos + 4, end: end });
      pos = end;
    }
    return out;
  }

  function ascii(u8, start, n) {
    var s = '';
    for (var i = 0; i < n && start + i < u8.length; i++) s += String.fromCharCode(u8[start + i]);
    return s;
  }

  function tiffReader(u8, tiff) {
    var order = ascii(u8, tiff, 2);
    if (order !== 'II' && order !== 'MM') return null;
    var le = order === 'II';
    var dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    return {
      u16: function (at) { return dv.getUint16(at, le); },
      u32: function (at) { return dv.getUint32(at, le); }
    };
  }

  // Finds the GPS block inside one EXIF segment. Returns {at, entries} or null.
  function findGps(u8, tiff, limit, r) {
    var ifd0 = tiff + r.u32(tiff + 4);
    if (ifd0 + 2 > limit) return null;
    var count = r.u16(ifd0);
    for (var i = 0; i < count; i++) {
      var e = ifd0 + 2 + 12 * i;
      if (e + 12 > limit) return null;
      if (r.u16(e) === 0x8825) {
        var at = tiff + r.u32(e + 8);
        if (at + 2 > limit) return null;
        return { at: at, entries: r.u16(at) };
      }
    }
    return null;
  }

  function readRationals(u8, tiff, limit, r, entry) {
    var num = r.u32(entry + 4), off = tiff + r.u32(entry + 8), vals = [];
    for (var i = 0; i < num && off + 8 * i + 8 <= limit; i++) {
      var d = r.u32(off + 8 * i + 4);
      vals.push(d ? r.u32(off + 8 * i) / d : 0);
    }
    return vals;
  }

  // Reads location from a JPEG. Returns {jpeg, found, lat, lon, where[]}.
  function inspect(buffer) {
    var u8 = new Uint8Array(buffer);
    var result = { jpeg: isJpeg(u8), found: false, lat: null, lon: null, where: [] };
    if (!result.jpeg) return result;
    segments(u8).forEach(function (s) {
      if (s.marker !== 0xE1) return;
      if (ascii(u8, s.body, 6) === 'Exif\u0000\u0000') {
        var tiff = s.body + 6, r = tiffReader(u8, tiff);
        if (!r) return;
        var gps = findGps(u8, tiff, s.end, r);
        if (!gps || gps.entries === 0) return;
        var lat = null, lon = null, latRef = 'N', lonRef = 'E';
        for (var i = 0; i < gps.entries; i++) {
          var e = gps.at + 2 + 12 * i;
          if (e + 12 > s.end) break;
          var tag = r.u16(e);
          if (tag === 1) latRef = String.fromCharCode(u8[e + 8]);
          if (tag === 3) lonRef = String.fromCharCode(u8[e + 8]);
          if (tag === 2 || tag === 4) {
            var v = readRationals(u8, tiff, s.end, r, e);
            var deg = (v[0] || 0) + (v[1] || 0) / 60 + (v[2] || 0) / 3600;
            if (tag === 2) lat = deg; else lon = deg;
          }
        }
        if (lat !== null || lon !== null) {
          result.found = true;
          result.where.push('EXIF');
          if (lat !== null) result.lat = latRef === 'S' ? -lat : lat;
          if (lon !== null) result.lon = lonRef === 'W' ? -lon : lon;
        }
      } else if (ascii(u8, s.body, 40).indexOf('http://ns.adobe.com/xap/1.0/') !== -1) {
        var xmp = ascii(u8, s.body, s.end - s.body);
        if (/exif:GPS(Latitude|Longitude)\s*=\s*"\s*[^"\s]/.test(xmp) || /<exif:GPS(Latitude|Longitude)>\s*[^<\s]/.test(xmp)) {
          result.found = true;
          result.where.push('XMP');
        }
      }
    });
    return result;
  }

  // Empties the GPS block (and blanks XMP GPS values) in place.
  // Same length, picture untouched; orientation, date and camera stay.
  function scrub(buffer) {
    var u8 = new Uint8Array(buffer.slice(0));
    if (!isJpeg(u8)) return { ok: false, changed: false, bytes: u8 };
    var changed = false;
    segments(u8).forEach(function (s) {
      if (s.marker !== 0xE1) return;
      if (ascii(u8, s.body, 6) === 'Exif\u0000\u0000') {
        var tiff = s.body + 6, r = tiffReader(u8, tiff);
        if (!r) return;
        var gps = findGps(u8, tiff, s.end, r);
        if (!gps || gps.entries === 0) return;
        for (var i = 0; i < gps.entries; i++) {
          var e = gps.at + 2 + 12 * i;
          if (e + 12 > s.end) break;
          var bytes = (TYPE_SIZE[r.u16(e + 2)] || 1) * r.u32(e + 4);
          if (bytes > 4) {
            var at = tiff + r.u32(e + 8);
            if (at + bytes <= s.end) u8.fill(0, at, at + bytes);
          }
          u8.fill(0, e, e + 12);
        }
        u8[gps.at] = 0; u8[gps.at + 1] = 0;
        changed = true;
      } else if (ascii(u8, s.body, 40).indexOf('http://ns.adobe.com/xap/1.0/') !== -1) {
        var text = ascii(u8, s.body, s.end - s.body);
        var re = /(exif:GPS[A-Za-z]+\s*=\s*")([^"]*)(")|(<exif:GPS([A-Za-z]+)>)([\s\S]*?)(<\/exif:GPS\5>)/g, m;
        while ((m = re.exec(text)) !== null) {
          var startRel, valLen;
          if (m[1] !== undefined) { startRel = m.index + m[1].length; valLen = m[2].length; }
          else { startRel = m.index + m[4].length; valLen = m[6].length; }
          if (valLen > 0) {
            u8.fill(0x20, s.body + startRel, s.body + startRel + valLen);
            changed = true;
          }
        }
      }
    });
    return { ok: true, changed: changed, bytes: u8 };
  }

  window.GpsCore = { inspect: inspect, scrub: scrub, isJpeg: function (b) { return isJpeg(new Uint8Array(b)); } };
})();
