"use strict";

function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState,
  useRef,
  useCallback,
  useEffect
} = React;
const ACCENT = "#5EEAD4";
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 12;
const JPEG_QUALITY = 0.92;
const MAX_CANVAS_PIXELS = 16000000;
function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}
function clampZoom(z) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
}
function baseName(name) {
  return (name || "image").replace(/\.[^.]+$/, "").replace(/[^\w\-]+/g, "-").slice(0, 80) || "image";
}
function fmtBytes(n) {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}
function fmtCoord(n) {
  return n === null || n === undefined ? "?" : n.toFixed(2);
}
function fitCanvas(w, h) {
  const s = Math.min(1, Math.sqrt(MAX_CANVAS_PIXELS / (w * h)));
  return {
    w: Math.max(1, Math.floor(w * s)),
    h: Math.max(1, Math.floor(h * s)),
    scaled: s < 1
  };
}
const isTouch = () => !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
const isStandalone = () => !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches || navigator.standalone);
function downloadBlob(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
async function saveFiles(entries) {
  const files = entries.map(e => new File([e.blob], e.name, {
    type: e.blob.type || "image/jpeg"
  }));
  if (isTouch() && navigator.canShare && navigator.share) {
    let shareable = false;
    try {
      shareable = navigator.canShare({
        files
      });
    } catch (e) {
      shareable = false;
    }
    if (shareable) {
      try {
        await navigator.share({
          files
        });
        return {
          ok: true
        };
      } catch (err) {
        if (err && err.name === "AbortError") return {
          ok: false,
          declined: true
        };
        if (err && err.name === "NotAllowedError") return {
          ok: false,
          needsTap: true
        };
      }
    }
  }
  for (let i = 0; i < entries.length; i++) {
    downloadBlob(entries[i].name, entries[i].blob);
    if (i < entries.length - 1) await new Promise(r => setTimeout(r, 400));
  }
  return {
    ok: true
  };
}
function Icon(_ref) {
  let {
    children,
    size = 16,
    ...props
  } = _ref;
  return React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, props), children);
}
const Upload = p => React.createElement(Icon, p, React.createElement("path", {
  d: "M12 3v12"
}), React.createElement("path", {
  d: "m17 8-5-5-5 5"
}), React.createElement("path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
}));
const Download = p => React.createElement(Icon, p, React.createElement("path", {
  d: "M12 15V3"
}), React.createElement("path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
}), React.createElement("path", {
  d: "m7 10 5 5 5-5"
}));
const Trash2 = p => React.createElement(Icon, p, React.createElement("path", {
  d: "M3 6h18"
}), React.createElement("path", {
  d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
}), React.createElement("path", {
  d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
}), React.createElement("line", {
  x1: "10",
  x2: "10",
  y1: "11",
  y2: "17"
}), React.createElement("line", {
  x1: "14",
  x2: "14",
  y1: "11",
  y2: "17"
}));
const X = p => React.createElement(Icon, p, React.createElement("path", {
  d: "M18 6 6 18"
}), React.createElement("path", {
  d: "m6 6 12 12"
}));
const SlidersHorizontal = p => React.createElement(Icon, p, React.createElement("line", {
  x1: "21",
  x2: "14",
  y1: "4",
  y2: "4"
}), React.createElement("line", {
  x1: "10",
  x2: "3",
  y1: "4",
  y2: "4"
}), React.createElement("line", {
  x1: "21",
  x2: "12",
  y1: "12",
  y2: "12"
}), React.createElement("line", {
  x1: "8",
  x2: "3",
  y1: "12",
  y2: "12"
}), React.createElement("line", {
  x1: "21",
  x2: "16",
  y1: "20",
  y2: "20"
}), React.createElement("line", {
  x1: "12",
  x2: "3",
  y1: "20",
  y2: "20"
}), React.createElement("line", {
  x1: "14",
  x2: "14",
  y1: "2",
  y2: "6"
}), React.createElement("line", {
  x1: "8",
  x2: "8",
  y1: "10",
  y2: "14"
}), React.createElement("line", {
  x1: "16",
  x2: "16",
  y1: "18",
  y2: "22"
}));
const ImageOff = p => React.createElement(Icon, p, React.createElement("line", {
  x1: "2",
  x2: "22",
  y1: "2",
  y2: "22"
}), React.createElement("path", {
  d: "M10.41 10.41a2 2 0 1 1-2.83-2.83"
}), React.createElement("line", {
  x1: "13.5",
  x2: "6",
  y1: "13.5",
  y2: "21"
}), React.createElement("line", {
  x1: "18",
  x2: "21",
  y1: "12",
  y2: "15"
}), React.createElement("path", {
  d: "M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"
}), React.createElement("path", {
  d: "M21 15V5a2 2 0 0 0-2-2H9"
}));
const ZoomIn = p => React.createElement(Icon, p, React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "8"
}), React.createElement("line", {
  x1: "21",
  x2: "16.65",
  y1: "21",
  y2: "16.65"
}), React.createElement("line", {
  x1: "11",
  x2: "11",
  y1: "8",
  y2: "14"
}), React.createElement("line", {
  x1: "8",
  x2: "14",
  y1: "11",
  y2: "11"
}));
const ZoomOut = p => React.createElement(Icon, p, React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "8"
}), React.createElement("line", {
  x1: "21",
  x2: "16.65",
  y1: "21",
  y2: "16.65"
}), React.createElement("line", {
  x1: "8",
  x2: "14",
  y1: "11",
  y2: "11"
}));
const Maximize2 = p => React.createElement(Icon, p, React.createElement("path", {
  d: "M15 3h6v6"
}), React.createElement("path", {
  d: "m21 3-7 7"
}), React.createElement("path", {
  d: "M9 21H3v-6"
}), React.createElement("path", {
  d: "m3 21 7-7"
}));
const Move = p => React.createElement(Icon, p, React.createElement("path", {
  d: "M12 2v20"
}), React.createElement("path", {
  d: "m15 19-3 3-3-3"
}), React.createElement("path", {
  d: "m19 9 3 3-3 3"
}), React.createElement("path", {
  d: "M2 12h20"
}), React.createElement("path", {
  d: "m5 9-3 3 3 3"
}), React.createElement("path", {
  d: "m9 5 3-3 3 3"
}));
const MapPinOff = p => React.createElement(Icon, p, React.createElement("path", {
  d: "M12.75 7.09a3 3 0 0 1 2.16 2.16"
}), React.createElement("path", {
  d: "M17.072 17.072c-1.634 2.17-3.527 3.912-4.471 4.727a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 1.432-4.568"
}), React.createElement("path", {
  d: "m2 2 20 20"
}), React.createElement("path", {
  d: "M8.475 2.818A8 8 0 0 1 20 10c0 1.183-.31 2.377-.81 3.533"
}), React.createElement("path", {
  d: "M9.13 9.13a3 3 0 0 0 3.74 3.74"
}));
function LocationChip(_ref2) {
  let {
    info
  } = _ref2;
  if (!info) return null;
  if (!info.jpeg) return React.createElement(Chip, {
    tone: "muted"
  }, "Can't check this format");
  if (info.found) {
    const coords = info.lat !== null ? ` · ${fmtCoord(info.lat)}, ${fmtCoord(info.lon)}` : "";
    return React.createElement(Chip, {
      tone: "warn"
    }, "Location found", coords);
  }
  return React.createElement(Chip, {
    tone: "ok"
  }, "No location");
}
function Chip(_ref3) {
  let {
    tone,
    children
  } = _ref3;
  const styles = {
    warn: {
      color: "var(--warn)",
      borderColor: "rgba(251,191,36,0.45)",
      backgroundColor: "rgba(251,191,36,0.08)"
    },
    ok: {
      color: "var(--accent)",
      borderColor: "rgba(94,234,212,0.45)",
      backgroundColor: "rgba(94,234,212,0.08)"
    },
    bad: {
      color: "var(--bad)",
      borderColor: "rgba(248,113,113,0.45)",
      backgroundColor: "rgba(248,113,113,0.08)"
    },
    muted: {
      color: "var(--muted)",
      borderColor: "var(--line)",
      backgroundColor: "var(--raised)"
    }
  }[tone];
  return React.createElement("span", {
    className: "inline-flex items-center px-2 py-0.5 rounded-sm border font-mono text-[11px] tnum whitespace-nowrap",
    style: styles
  }, children);
}
function SectionLabel(_ref4) {
  let {
    children
  } = _ref4;
  return React.createElement("span", {
    className: "font-mono text-[11px] uppercase tracking-widest text-[#8B939F]"
  }, children);
}
function FaceRedactor(_ref5) {
  let {
    registerUpload
  } = _ref5;
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("image");
  const [locInfo, setLocInfo] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [blurAmount, setBlurAmount] = useState(22);
  const [overlayOpacity, setOverlayOpacity] = useState(0.35);
  const [format, setFormat] = useState("jpeg");
  const [hoveredId, setHoveredId] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({
    x: 0,
    y: 0
  });
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const [panning, setPanning] = useState(false);
  const [exportState, setExportState] = useState("idle");
  const [exportError, setExportError] = useState("");
  const [ready, setReady] = useState(null);
  const [notice, setNotice] = useState("");
  const viewportRef = useRef(null);
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const panStart = useRef(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);
  const handleFile = useCallback(file => {
    if (!file || !(file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name))) return;
    setFileName(baseName(file.name));
    setLocInfo(null);
    setReady(null);
    file.arrayBuffer().then(buf => setLocInfo(window.GpsCore.inspect(buf))).catch(() => setLocInfo(null));
    const reader = new FileReader();
    reader.onload = e => {
      setImage(e.target.result);
      setBoxes([]);
      setNextId(1);
      setZoom(1);
      setPan({
        x: 0,
        y: 0
      });
    };
    reader.readAsDataURL(file);
  }, []);
  useEffect(() => {
    registerUpload(() => fileInputRef.current?.click());
  }, [registerUpload]);
  const onInputChange = e => {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  };
  const onDrop = e => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({
      x: 0,
      y: 0
    });
  }, []);
  const zoomAtPoint = useCallback((rawZoom, cx, cy) => {
    const el = stageRef.current;
    if (!el) return;
    const z = zoomRef.current;
    const next = clampZoom(rawZoom);
    if (next === z) return;
    const rect = el.getBoundingClientRect();
    const p = panRef.current;
    const k = 1 - next / z;
    setPan({
      x: p.x + (cx - rect.left) * k,
      y: p.y + (cy - rect.top) * k
    });
    setZoom(next);
  }, []);
  const zoomStep = useCallback(factor => {
    const vp = viewportRef.current;
    if (!vp) return;
    const r = vp.getBoundingClientRect();
    zoomAtPoint(zoomRef.current * factor, r.left + r.width / 2, r.top + r.height / 2);
  }, [zoomAtPoint]);
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !image) return;
    const onWheel = e => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAtPoint(zoomRef.current * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
      } else {
        const p = panRef.current;
        setPan({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY
        });
      }
    };
    vp.addEventListener("wheel", onWheel, {
      passive: false
    });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [image, zoomAtPoint]);
  useEffect(() => {
    const isTyping = t => t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    const down = e => {
      if (e.code === "Space" && !e.repeat && !isTyping(e.target)) {
        e.preventDefault();
        setSpaceHeld(true);
        return;
      }
      if (!image || isTyping(e.target) || e.metaKey || e.ctrlKey) return;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomStep(1.25);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomStep(1 / 1.25);
      } else if (e.key === "0") {
        e.preventDefault();
        resetView();
      }
    };
    const up = e => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    const blur = () => setSpaceHeld(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [image, zoomStep, resetView]);
  const panMode = spaceHeld || moveMode;
  const onViewportPointerDown = e => {
    if (!image) return;
    if (panMode || e.button === 1) {
      e.preventDefault();
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        pan: panRef.current
      };
      setPanning(true);
    }
  };
  useEffect(() => {
    if (!panning) return;
    const move = e => {
      const s = panStart.current;
      if (!s) return;
      setPan({
        x: s.pan.x + (e.clientX - s.x),
        y: s.pan.y + (e.clientY - s.y)
      });
    };
    const up = () => setPanning(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [panning]);
  const getRelPos = e => {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: clamp01((e.clientX - rect.left) / rect.width),
      y: clamp01((e.clientY - rect.top) / rect.height)
    };
  };
  const onPointerDown = e => {
    if (!image || panMode || e.button !== 0) return;
    if (e.target.closest && e.target.closest("button")) return;
    e.preventDefault();
    const {
      x,
      y
    } = getRelPos(e);
    setDrawing({
      x0: x,
      y0: y,
      x1: x,
      y1: y
    });
  };
  const onPointerMove = e => {
    if (!drawing) return;
    const {
      x,
      y
    } = getRelPos(e);
    setDrawing(d => ({
      ...d,
      x1: x,
      y1: y
    }));
  };
  const finishDrawing = () => {
    if (!drawing) return;
    const x = Math.min(drawing.x0, drawing.x1);
    const y = Math.min(drawing.y0, drawing.y1);
    const w = Math.abs(drawing.x1 - drawing.x0);
    const h = Math.abs(drawing.y1 - drawing.y0);
    if (w > 0.002 && h > 0.002) {
      setBoxes(prev => [...prev, {
        id: nextId,
        x,
        y,
        w,
        h
      }]);
      setNextId(n => n + 1);
    }
    setDrawing(null);
  };
  useEffect(() => {
    if (!drawing) return;
    const move = e => onPointerMove(e);
    const up = () => finishDrawing();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [drawing]);
  const removeBox = id => setBoxes(prev => prev.filter(b => b.id !== id));
  const clearAll = () => setBoxes([]);
  const handleExport = () => {
    if (!image || !imgRef.current) return;
    const img = imgRef.current;
    const size = fitCanvas(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (boxes.length > 0) {
      const displayWidth = containerRef.current.clientWidth;
      const scale = canvas.width / displayWidth;
      const blurCanvas = document.createElement("canvas");
      blurCanvas.width = canvas.width;
      blurCanvas.height = canvas.height;
      const bctx = blurCanvas.getContext("2d");
      bctx.filter = `blur(${Math.max(1, blurAmount * scale)}px)`;
      bctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      boxes.forEach(b => {
        const sx = b.x * canvas.width,
          sy = b.y * canvas.height,
          sw = b.w * canvas.width,
          sh = b.h * canvas.height;
        ctx.drawImage(blurCanvas, sx, sy, sw, sh, sx, sy, sw, sh);
        if (overlayOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = overlayOpacity;
          ctx.fillStyle = "#000000";
          ctx.fillRect(sx, sy, sw, sh);
          ctx.restore();
        }
      });
    }
    setExportState("saving");
    setExportError("");
    setNotice(size.scaled ? `Saved at ${size.w}×${size.h}: phones can't handle the full size of this photo.` : "");
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    const ext = format === "jpeg" ? "jpg" : "png";
    canvas.toBlob(async blob => {
      if (!blob) {
        setExportState("error");
        setExportError("Couldn't render the image. Try a smaller photo.");
        return;
      }
      const entry = {
        name: `${fileName}-redacted.${ext}`,
        blob
      };
      const res = await saveFiles([entry]);
      setExportState("idle");
      if (res.needsTap) setReady(entry);
    }, mime, JPEG_QUALITY);
  };
  const saveReady = async () => {
    if (!ready) return;
    const res = await saveFiles([ready]);
    if (res.ok || res.declined) setReady(null);
  };
  const draftBox = drawing ? {
    x: Math.min(drawing.x0, drawing.x1),
    y: Math.min(drawing.y0, drawing.y1),
    w: Math.abs(drawing.x1 - drawing.x0),
    h: Math.abs(drawing.y1 - drawing.y0)
  } : null;
  const inv = 1 / zoom;
  const viewportCursor = panMode ? panning ? "grabbing" : "grab" : "default";
  return React.createElement(React.Fragment, null, React.createElement("input", {
    ref: fileInputRef,
    id: "blur-file",
    type: "file",
    accept: "image/*,.heic,.heif",
    className: "hidden",
    onChange: onInputChange
  }), exportState === "error" && exportError && React.createElement("div", {
    className: "px-5 py-2 text-[11px] font-mono border-b",
    style: {
      borderColor: "#3A1E1E",
      backgroundColor: "#1A1010",
      color: "var(--bad)"
    }
  }, exportError), React.createElement("div", {
    className: "flex-1 flex flex-col lg:flex-row min-h-0"
  }, React.createElement("div", {
    ref: viewportRef,
    className: "flex-1 relative overflow-hidden flex items-center justify-center p-6 lg:p-10 min-h-[320px]",
    style: {
      backgroundImage: "linear-gradient(45deg, #101317 25%, transparent 25%), linear-gradient(-45deg, #101317 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #101317 75%), linear-gradient(-45deg, transparent 75%, #101317 75%)",
      backgroundSize: "20px 20px",
      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
      backgroundColor: "var(--bg)",
      cursor: viewportCursor,
      touchAction: image ? "none" : "auto"
    },
    onDragOver: e => e.preventDefault(),
    onDrop: onDrop,
    onPointerDown: onViewportPointerDown
  }, !image ? React.createElement("button", {
    type: "button",
    onClick: () => fileInputRef.current?.click(),
    className: "flex flex-col items-center gap-3 text-center max-w-xs"
  }, React.createElement("span", {
    className: "w-14 h-14 rounded-sm border border-dashed border-[#3A414C] flex items-center justify-center text-[#5B6472]"
  }, React.createElement(ImageOff, {
    size: 22
  })), React.createElement("span", {
    className: "font-mono text-xs text-[#8B939F] uppercase tracking-wide"
  }, "No image loaded"), React.createElement("span", {
    className: "text-sm text-[#5B6472]"
  }, "Tap here to choose a photo, or drop one in.")) : React.createElement("div", {
    ref: stageRef,
    style: {
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: "0 0",
      willChange: "transform"
    }
  }, React.createElement("div", {
    ref: containerRef,
    className: "relative select-none shadow-2xl",
    style: {
      cursor: panMode ? "inherit" : "crosshair",
      touchAction: "none"
    },
    onPointerDown: onPointerDown
  }, React.createElement("img", {
    ref: imgRef,
    src: image,
    alt: "Photo being redacted",
    draggable: false,
    className: "block max-w-[80vw] max-h-[60vh] lg:max-h-[70vh] pointer-events-none"
  }), boxes.map((b, i) => React.createElement("div", {
    key: b.id,
    onMouseEnter: () => setHoveredId(b.id),
    onMouseLeave: () => setHoveredId(null),
    className: "absolute box-border blur-box",
    style: {
      left: `${b.x * 100}%`,
      top: `${b.y * 100}%`,
      width: `${b.w * 100}%`,
      height: `${b.h * 100}%`,
      backdropFilter: `blur(${blurAmount * zoom}px)`,
      WebkitBackdropFilter: `blur(${blurAmount * zoom}px)`,
      borderStyle: "solid",
      borderWidth: `${1.5 * inv}px`,
      borderColor: hoveredId === b.id ? ACCENT : "rgba(94,234,212,0.55)"
    }
  }, React.createElement("div", {
    className: "absolute inset-0 pointer-events-none",
    style: {
      backgroundColor: `rgba(0,0,0,${overlayOpacity})`
    }
  }), React.createElement("span", {
    className: "absolute font-mono",
    style: {
      left: 0,
      bottom: "100%",
      paddingBottom: 2,
      fontSize: 10,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      color: ACCENT,
      transform: `scale(${inv})`,
      transformOrigin: "left bottom"
    }
  }, String(i + 1).padStart(2, "0")), React.createElement("div", {
    className: "absolute",
    style: {
      top: 0,
      right: 0,
      transform: `scale(${inv})`,
      transformOrigin: "100% 0%"
    }
  }, React.createElement("button", {
    onClick: () => removeBox(b.id),
    "aria-label": `Remove box ${i + 1}`,
    className: "box-del w-6 h-6 rounded-full bg-[#0B0D10] border flex items-center justify-center hover:bg-[#F87171] hover:border-[#F87171] transition-colors",
    style: {
      borderColor: ACCENT,
      transform: "translate(50%, -50%)"
    }
  }, React.createElement(X, {
    size: 12
  }))))), draftBox && React.createElement("div", {
    className: "absolute pointer-events-none",
    style: {
      left: `${draftBox.x * 100}%`,
      top: `${draftBox.y * 100}%`,
      width: `${draftBox.w * 100}%`,
      height: `${draftBox.h * 100}%`,
      borderStyle: "dashed",
      borderWidth: `${2 * inv}px`,
      borderColor: ACCENT,
      backgroundColor: "rgba(94,234,212,0.08)"
    }
  }))), image && React.createElement("div", {
    className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-1.5 rounded-sm border border-[#262B33] bg-[#0E1116]/95 backdrop-blur-sm shadow-xl",
    onPointerDown: e => e.stopPropagation()
  }, React.createElement("button", {
    onClick: () => zoomStep(1 / 1.25),
    disabled: zoom <= MIN_ZOOM,
    title: "Zoom out  (\u2212)",
    "aria-label": "Zoom out",
    className: "w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[#1B1F26] text-[#8B939F] hover:text-[#E5E7EB] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
  }, React.createElement(ZoomOut, {
    size: 15
  })), React.createElement("button", {
    onClick: resetView,
    title: "Fit to screen  (0)",
    className: "min-w-[62px] px-2 h-8 font-mono text-[11px] rounded-sm hover:bg-[#1B1F26] transition-colors tnum",
    style: {
      color: zoom === 1 ? "#8B939F" : ACCENT
    }
  }, Math.round(zoom * 100), "%"), React.createElement("button", {
    onClick: () => zoomStep(1.25),
    disabled: zoom >= MAX_ZOOM,
    title: "Zoom in  (+)",
    "aria-label": "Zoom in",
    className: "w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[#1B1F26] text-[#8B939F] hover:text-[#E5E7EB] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
  }, React.createElement(ZoomIn, {
    size: 15
  })), React.createElement("div", {
    className: "w-px h-4 bg-[#262B33] mx-0.5"
  }), React.createElement("button", {
    onClick: () => setMoveMode(m => !m),
    title: "Move the photo instead of drawing",
    "aria-pressed": moveMode,
    "aria-label": "Move mode",
    className: "w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[#1B1F26] transition-colors",
    style: {
      color: moveMode ? ACCENT : "#8B939F",
      backgroundColor: moveMode ? "rgba(94,234,212,0.12)" : undefined
    }
  }, React.createElement(Move, {
    size: 15
  })), React.createElement("button", {
    onClick: resetView,
    title: "Reset view  (0)",
    "aria-label": "Reset view",
    className: "w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[#1B1F26] text-[#8B939F] hover:text-[#E5E7EB] transition-colors"
  }, React.createElement(Maximize2, {
    size: 14
  })))), React.createElement("aside", {
    className: "w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#262B33] bg-[#0E1116] p-5 flex flex-col gap-6 overflow-auto"
  }, image && React.createElement("div", {
    className: "flex flex-col gap-2"
  }, React.createElement(SectionLabel, null, "Location data"), React.createElement("div", null, React.createElement(LocationChip, {
    info: locInfo
  })), React.createElement("p", {
    className: "text-[12px] text-[#5B6472] leading-relaxed"
  }, locInfo && locInfo.found ? "The original has GPS location. The export won't: it's a fresh file with no hidden details." : "Exports never carry location, date or camera details.")), React.createElement("div", {
    className: "flex flex-col gap-3"
  }, React.createElement("button", {
    onClick: handleExport,
    disabled: !image || exportState === "saving",
    className: "flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-sm font-mono font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
    style: {
      backgroundColor: ACCENT,
      color: "#04201C"
    }
  }, React.createElement(Download, {
    size: 14
  }), exportState === "saving" ? "Saving…" : `Export ${format === "jpeg" ? "JPEG" : "PNG"}`), ready && React.createElement("button", {
    onClick: saveReady,
    className: "flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm border text-sm font-mono",
    style: {
      borderColor: ACCENT,
      color: ACCENT
    }
  }, React.createElement(Download, {
    size: 14
  }), " Ready: tap to save"), notice && React.createElement("p", {
    className: "text-[11px] font-mono",
    style: {
      color: "var(--warn)"
    }
  }, notice)), React.createElement("div", null, React.createElement("div", {
    className: "flex items-center gap-2 mb-2 text-[#8B939F]"
  }, React.createElement(SlidersHorizontal, {
    size: 13
  }), React.createElement(SectionLabel, null, "Blur strength")), React.createElement("input", {
    id: "blur-strength",
    type: "range",
    min: 2,
    max: 60,
    value: blurAmount,
    onChange: e => setBlurAmount(Number(e.target.value)),
    className: "w-full accent-[#5EEAD4]",
    "aria-label": "Blur strength"
  }), React.createElement("div", {
    className: "flex justify-between font-mono text-[11px] text-[#5B6472] mt-1 tnum"
  }, React.createElement("span", null, "light"), React.createElement("span", {
    style: {
      color: ACCENT
    }
  }, blurAmount, "px"), React.createElement("span", null, "heavy"))), React.createElement("div", null, React.createElement("div", {
    className: "flex items-center gap-2 mb-2 text-[#8B939F]"
  }, React.createElement(SlidersHorizontal, {
    size: 13
  }), React.createElement(SectionLabel, null, "Translucency")), React.createElement("input", {
    id: "blur-translucency",
    type: "range",
    min: 0,
    max: 100,
    value: Math.round(overlayOpacity * 100),
    onChange: e => setOverlayOpacity(Number(e.target.value) / 100),
    className: "w-full accent-[#5EEAD4]",
    "aria-label": "Translucency"
  }), React.createElement("div", {
    className: "flex justify-between font-mono text-[11px] text-[#5B6472] mt-1 tnum"
  }, React.createElement("span", null, "see-through"), React.createElement("span", {
    style: {
      color: ACCENT
    }
  }, Math.round(overlayOpacity * 100), "%"), React.createElement("span", null, "opaque"))), React.createElement("div", null, React.createElement("div", {
    className: "mb-2"
  }, React.createElement(SectionLabel, null, "Export format")), React.createElement("div", {
    className: "grid grid-cols-2 gap-1 p-1 rounded-sm border border-[#262B33] bg-[#14171C]",
    role: "radiogroup",
    "aria-label": "Export format"
  }, [["jpeg", "JPEG", "smaller"], ["png", "PNG", "exact"]].map(_ref6 => {
    let [val, label, note] = _ref6;
    return React.createElement("button", {
      key: val,
      role: "radio",
      "aria-checked": format === val,
      onClick: () => setFormat(val),
      className: "px-2 py-1.5 rounded-sm font-mono text-[11px] transition-colors",
      style: format === val ? {
        backgroundColor: "rgba(94,234,212,0.12)",
        color: ACCENT
      } : {
        color: "#8B939F"
      }
    }, label, " ", React.createElement("span", {
      className: "opacity-60"
    }, "\xB7 ", note));
  }))), React.createElement("div", {
    className: "h-px bg-[#262B33]"
  }), React.createElement("div", null, React.createElement("div", {
    className: "flex items-center justify-between mb-2"
  }, React.createElement(SectionLabel, null, "Boxes (", boxes.length, ")"), React.createElement("button", {
    onClick: clearAll,
    disabled: boxes.length === 0,
    className: "flex items-center gap-1 text-[11px] font-mono text-[#F87171] disabled:text-[#3A414C] disabled:cursor-not-allowed hover:opacity-80"
  }, React.createElement(Trash2, {
    size: 12
  }), "Clear all")), boxes.length === 0 ? React.createElement("p", {
    className: "text-[12px] text-[#5B6472] leading-relaxed"
  }, "Drag across a face on the photo to blur it. Each box gets an \xD7 to remove it.") : React.createElement("ul", {
    className: "flex flex-col gap-1.5 max-h-64 overflow-auto pr-1"
  }, boxes.map((b, i) => React.createElement("li", {
    key: b.id,
    onMouseEnter: () => setHoveredId(b.id),
    onMouseLeave: () => setHoveredId(null),
    className: "flex items-center justify-between px-2 py-1.5 rounded-sm border font-mono text-[11px]",
    style: {
      borderColor: hoveredId === b.id ? ACCENT : "#262B33",
      backgroundColor: "#14171C"
    }
  }, React.createElement("span", {
    style: {
      color: ACCENT
    }
  }, "Box ", String(i + 1).padStart(2, "0")), React.createElement("button", {
    onClick: () => removeBox(b.id),
    "aria-label": `Remove box ${i + 1}`,
    className: "text-[#5B6472] hover:text-[#F87171] p-1"
  }, React.createElement(X, {
    size: 12
  })))))), React.createElement("div", {
    className: "h-px bg-[#262B33]"
  }), React.createElement("div", null, React.createElement(SectionLabel, null, "Navigation"), React.createElement("dl", {
    className: "mt-2 flex flex-col gap-1 font-mono text-[11px] text-[#5B6472]"
  }, [["Draw box", "drag on the photo"], ["Zoom", "+ / − buttons, or ctrl + scroll"], ["Move", "move button, scroll, or space + drag"], ["Fit", "the % button, or 0"]].map(_ref7 => {
    let [k, v] = _ref7;
    return React.createElement("div", {
      key: k,
      className: "flex justify-between gap-3"
    }, React.createElement("dt", null, k), React.createElement("dd", {
      className: "text-[#8B939F] text-right"
    }, v));
  }))), React.createElement("p", {
    className: "text-[11px] font-mono text-[#5B6472] leading-relaxed"
  }, "Export renders the full-resolution photo with each box blurred. Zoom only affects your view. Nothing is uploaded anywhere."))));
}
async function cleanFile(file) {
  const buf = await file.arrayBuffer();
  const before = window.GpsCore.inspect(buf);
  let blob, method;
  if (before.jpeg) {
    const res = window.GpsCore.scrub(buf);
    blob = new Blob([res.bytes], {
      type: "image/jpeg"
    });
    method = res.changed ? "Location removed, picture unchanged" : "Nothing to remove, file unchanged";
  } else {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image"
    });
    const size = fitCanvas(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, size.w, size.h);
    blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", JPEG_QUALITY));
    if (!blob) throw new Error("render");
    method = size.scaled ? `Converted to JPEG (${size.w}×${size.h}) with no hidden details` : "Converted to JPEG with no hidden details";
  }
  const after = window.GpsCore.inspect(await blob.arrayBuffer());
  return {
    before,
    after,
    blob,
    method,
    verified: !after.found
  };
}
function LocationRemover(_ref8) {
  let {
    registerUpload
  } = _ref8;
  const [items, setItems] = useState([]);
  const [savingAll, setSavingAll] = useState(false);
  const [notice, setNotice] = useState("");
  const inputRef = useRef(null);
  const idRef = useRef(1);
  useEffect(() => {
    registerUpload(() => inputRef.current?.click());
  }, [registerUpload]);
  useEffect(() => () => items.forEach(it => it.thumb && URL.revokeObjectURL(it.thumb)), []);
  const update = (id, patch) => setItems(prev => prev.map(it => it.id === id ? {
    ...it,
    ...patch
  } : it));
  const addFiles = fileList => {
    const files = Array.from(fileList || []).filter(f => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!files.length) return;
    setNotice("");
    const fresh = files.map(f => ({
      id: idRef.current++,
      file: f,
      name: f.name,
      size: f.size,
      thumb: URL.createObjectURL(f),
      status: "working"
    }));
    setItems(prev => [...prev, ...fresh]);
    fresh.forEach(async it => {
      try {
        const res = await cleanFile(it.file);
        update(it.id, {
          status: res.verified ? "clean" : "failed",
          ...res,
          outName: `${baseName(it.name)}-noloc.jpg`
        });
      } catch (e) {
        update(it.id, {
          status: "error"
        });
      }
    });
  };
  const removeItem = id => setItems(prev => {
    const it = prev.find(x => x.id === id);
    if (it && it.thumb) URL.revokeObjectURL(it.thumb);
    return prev.filter(x => x.id !== id);
  });
  const markSaved = ids => setItems(prev => prev.map(it => ids.includes(it.id) ? {
    ...it,
    saved: true
  } : it));
  const saveOne = it => {
    saveFiles([{
      name: it.outName,
      blob: it.blob
    }]).then(res => {
      if (res.ok) markSaved([it.id]);else if (res.needsTap) setNotice("Your phone blocked the save. Tap Save again.");
    });
  };
  const saveAll = () => {
    const list = items.filter(x => x.status === "clean" && !x.saved);
    if (!list.length) return;
    setSavingAll(true);
    setNotice("");
    saveFiles(list.map(it => ({
      name: it.outName,
      blob: it.blob
    }))).then(res => {
      if (res.ok) markSaved(list.map(it => it.id));else if (res.needsTap) setNotice("Your phone blocked the save. Tap Save all again.");
      setSavingAll(false);
    });
  };
  const ready = items.filter(x => x.status === "clean");
  const unsaved = ready.filter(x => !x.saved);
  const foundCount = items.filter(x => x.before && x.before.found).length;
  return React.createElement("div", {
    className: "flex-1 flex flex-col lg:flex-row min-h-0"
  }, React.createElement("input", {
    ref: inputRef,
    id: "loc-files",
    type: "file",
    accept: "image/*,.heic,.heif",
    multiple: true,
    className: "hidden",
    onChange: e => {
      addFiles(e.target.files);
      e.target.value = "";
    }
  }), React.createElement("div", {
    className: "flex-1 min-w-0 p-5 lg:p-8 flex flex-col gap-4",
    onDragOver: e => e.preventDefault(),
    onDrop: e => {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
    }
  }, React.createElement("button", {
    onClick: () => inputRef.current?.click(),
    className: "w-full rounded-sm border border-dashed border-[#3A414C] hover:border-[#5EEAD4] bg-[#0E1116] px-5 py-6 flex flex-col sm:flex-row items-center gap-4 text-left transition-colors"
  }, React.createElement("span", {
    className: "w-12 h-12 shrink-0 rounded-sm border flex items-center justify-center",
    style: {
      borderColor: ACCENT,
      color: ACCENT
    }
  }, React.createElement(MapPinOff, {
    size: 20
  })), React.createElement("span", {
    className: "min-w-0"
  }, React.createElement("span", {
    className: "block font-mono text-xs uppercase tracking-wide text-[#E5E7EB]"
  }, "Choose photos, or drop them here"), React.createElement("span", {
    className: "block text-sm text-[#8B939F] mt-1"
  }, "Each photo is checked for GPS location and saved back without it. JPEGs keep their exact picture, orientation and date. Nothing is uploaded anywhere."))), notice && React.createElement("p", {
    className: "text-[12px] font-mono",
    style: {
      color: "var(--bad)"
    }
  }, notice), items.length === 0 ? React.createElement("p", {
    className: "text-[12px] text-[#5B6472] font-mono"
  }, "No photos yet.") : React.createElement("ul", {
    className: "flex flex-col gap-2"
  }, items.map(it => React.createElement("li", {
    key: it.id,
    className: "flex items-center gap-3 p-2 rounded-sm border border-[#262B33] bg-[#14171C]"
  }, React.createElement("img", {
    src: it.thumb,
    alt: "",
    className: "w-12 h-12 object-cover rounded-sm shrink-0 bg-[#0B0D10]",
    onError: e => {
      e.currentTarget.style.visibility = "hidden";
    }
  }), React.createElement("div", {
    className: "min-w-0 flex-1 flex flex-col gap-1"
  }, React.createElement("div", {
    className: "flex items-center gap-2 min-w-0"
  }, React.createElement("span", {
    className: "truncate text-sm text-[#E5E7EB]",
    title: it.name
  }, it.name), React.createElement("span", {
    className: "font-mono text-[11px] text-[#5B6472] tnum shrink-0"
  }, fmtBytes(it.size))), React.createElement("div", {
    className: "flex flex-wrap items-center gap-1.5"
  }, it.status === "working" && React.createElement(Chip, {
    tone: "muted"
  }, "Checking\u2026"), it.status === "error" && React.createElement(Chip, {
    tone: "bad"
  }, "Couldn't read this file"), it.before && React.createElement(LocationChip, {
    info: it.before
  }), it.status === "clean" && React.createElement(Chip, {
    tone: "ok"
  }, "Clean copy ready \u2713"), it.status === "failed" && React.createElement(Chip, {
    tone: "bad"
  }, "Still has location. Don't use")), it.method && React.createElement("span", {
    className: "text-[11px] text-[#5B6472]"
  }, it.method)), React.createElement("div", {
    className: "flex items-center gap-1 shrink-0"
  }, it.status === "clean" && React.createElement("button", {
    onClick: () => saveOne(it),
    disabled: savingAll,
    className: "flex items-center gap-1.5 px-2.5 py-2 rounded-sm border text-[11px] font-mono transition-colors disabled:opacity-40",
    style: it.saved ? {
      borderColor: "#262B33",
      color: "#8B939F"
    } : {
      borderColor: ACCENT,
      color: ACCENT
    }
  }, React.createElement(Download, {
    size: 12
  }), it.saved ? "Saved" : "Save"), React.createElement("button", {
    onClick: () => removeItem(it.id),
    "aria-label": `Remove ${it.name}`,
    className: "w-8 h-8 flex items-center justify-center text-[#5B6472] hover:text-[#F87171]"
  }, React.createElement(X, {
    size: 14
  }))))))), React.createElement("aside", {
    className: "w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#262B33] bg-[#0E1116] p-5 flex flex-col gap-6 overflow-auto"
  }, React.createElement("div", {
    className: "flex flex-col gap-2"
  }, React.createElement(SectionLabel, null, "This batch"), React.createElement("dl", {
    className: "flex flex-col gap-1 font-mono text-[12px] tnum"
  }, [["Photos", items.length], ["Had location", foundCount], ["Ready to save", ready.length]].map(_ref9 => {
    let [k, v] = _ref9;
    return React.createElement("div", {
      key: k,
      className: "flex justify-between"
    }, React.createElement("dt", {
      className: "text-[#8B939F]"
    }, k), React.createElement("dd", {
      className: "text-[#E5E7EB]"
    }, v));
  }))), React.createElement("button", {
    onClick: saveAll,
    disabled: unsaved.length === 0 || savingAll,
    className: "flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-sm font-mono font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
    style: {
      backgroundColor: ACCENT,
      color: "#04201C"
    }
  }, React.createElement(Download, {
    size: 14
  }), savingAll ? "Saving…" : `Save all (${unsaved.length})`), React.createElement("p", {
    className: "text-[11px] text-[#5B6472] leading-relaxed"
  }, "On a phone, Save opens the share sheet: choose Save Image to put the copies in Photos. On a computer they download. Saved copies end in \"-noloc.jpg\"."), React.createElement("div", {
    className: "h-px bg-[#262B33]"
  }), React.createElement("div", {
    className: "flex flex-col gap-2"
  }, React.createElement(SectionLabel, null, "Before posting"), React.createElement("ul", {
    className: "flex flex-col gap-2 text-[12px] text-[#8B939F] leading-relaxed"
  }, React.createElement("li", null, "Upload the \"-noloc\" copy, not the original."), React.createElement("li", null, "When replacing a photo on the blog, delete the old one from the Media Library too. Removing it from the post alone leaves the file online."), React.createElement("li", null, "To stop location at the source, turn off Location for the Camera app in the phone's privacy settings.")))));
}
function InstallHint() {
  const [evt, setEvt] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("rs-install-hint") === "hidden";
    } catch (e) {
      return false;
    }
  });
  useEffect(() => {
    const onPrompt = e => {
      e.preventDefault();
      setEvt(e);
    };
    const onInstalled = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  if (isStandalone() || dismissed) return null;
  const hide = () => {
    setDismissed(true);
    try {
      localStorage.setItem("rs-install-hint", "hidden");
    } catch (e) {}
  };
  if (evt) {
    return React.createElement("div", {
      className: "flex items-center justify-between gap-3 px-5 py-2 border-b border-[#262B33] bg-[#0E1116] text-[12px]"
    }, React.createElement("span", {
      className: "text-[#8B939F]"
    }, "Install Redact Studio to use it offline, like any other app."), React.createElement("span", {
      className: "flex items-center gap-2 shrink-0"
    }, React.createElement("button", {
      onClick: () => {
        evt.prompt();
        setEvt(null);
      },
      className: "px-2.5 py-1.5 rounded-sm font-mono text-[11px]",
      style: {
        backgroundColor: ACCENT,
        color: "#04201C"
      }
    }, "Install"), React.createElement("button", {
      onClick: hide,
      "aria-label": "Hide",
      className: "p-1 text-[#5B6472] hover:text-[#E5E7EB]"
    }, React.createElement(X, {
      size: 13
    }))));
  }
  if (isIOS()) {
    return React.createElement("div", {
      className: "flex items-center justify-between gap-3 px-5 py-2 border-b border-[#262B33] bg-[#0E1116] text-[12px]"
    }, React.createElement("span", {
      className: "text-[#8B939F]"
    }, "To install: tap the Share button, then ", React.createElement("span", {
      className: "text-[#E5E7EB]"
    }, "Add to Home Screen"), ". It then works offline."), React.createElement("button", {
      onClick: hide,
      "aria-label": "Hide",
      className: "p-1 shrink-0 text-[#5B6472] hover:text-[#E5E7EB]"
    }, React.createElement(X, {
      size: 13
    })));
  }
  return null;
}
function App() {
  const [mode, setMode] = useState("blur");
  const uploadRef = useRef({});
  const registerBlur = useCallback(fn => {
    uploadRef.current.blur = fn;
  }, []);
  const registerLoc = useCallback(fn => {
    uploadRef.current.loc = fn;
  }, []);
  const modes = [["blur", "Blur faces"], ["loc", "Remove location"]];
  return React.createElement("div", {
    className: "app-shell w-full bg-[#0B0D10] text-[#E5E7EB] font-sans flex flex-col"
  }, React.createElement("header", {
    className: "border-b border-[#262B33] px-5 py-4 flex items-center justify-between flex-wrap gap-3"
  }, React.createElement("div", {
    className: "flex items-center gap-3 min-w-0"
  }, React.createElement("div", {
    className: "w-8 h-8 shrink-0 rounded-sm flex items-center justify-center border",
    style: {
      borderColor: ACCENT,
      color: ACCENT
    }
  }, React.createElement("span", {
    className: "font-mono text-xs"
  }, "\u25A3")), React.createElement("div", {
    className: "min-w-0"
  }, React.createElement("h1", {
    className: "font-mono text-sm tracking-widest uppercase text-[#E5E7EB]"
  }, "Redact", React.createElement("span", {
    style: {
      color: ACCENT
    }
  }, "_"), "Studio"), React.createElement("p", {
    className: "text-[11px] text-[#8B939F] font-mono"
  }, mode === "blur" ? "blur faces in a photo" : "strip GPS location from photos", " \xB7 nothing leaves this device"))), React.createElement("div", {
    className: "flex items-center gap-2 flex-wrap"
  }, React.createElement("div", {
    className: "flex p-1 rounded-sm border border-[#262B33] bg-[#14171C]",
    role: "tablist",
    "aria-label": "Tool"
  }, modes.map(_ref10 => {
    let [val, label] = _ref10;
    return React.createElement("button", {
      key: val,
      role: "tab",
      "aria-selected": mode === val,
      onClick: () => setMode(val),
      className: "px-3 py-1.5 rounded-sm font-mono text-xs transition-colors",
      style: mode === val ? {
        backgroundColor: "rgba(94,234,212,0.12)",
        color: ACCENT
      } : {
        color: "#8B939F"
      }
    }, label);
  })), React.createElement("button", {
    onClick: () => uploadRef.current[mode] && uploadRef.current[mode](),
    className: "flex items-center gap-2 px-3 py-2 rounded-sm border border-[#262B33] hover:border-[#3A414C] bg-[#14171C] text-sm font-mono transition-colors"
  }, React.createElement(Upload, {
    size: 14
  }), mode === "blur" ? "Choose photo" : "Add photos"))), React.createElement(InstallHint, null), React.createElement("div", {
    className: mode === "blur" ? "flex-1 flex flex-col min-h-0" : "hidden"
  }, React.createElement(FaceRedactor, {
    registerUpload: registerBlur
  })), React.createElement("div", {
    className: mode === "loc" ? "flex-1 flex flex-col min-h-0" : "hidden"
  }, React.createElement(LocationRemover, {
    registerUpload: registerLoc
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}