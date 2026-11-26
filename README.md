# Redact Studio

Blurs faces and removes GPS location from photos. Everything happens on your device: photos are never uploaded, and the app can't contact any other website. After the first visit it works offline.

## Put it online (GitHub Pages, free, about 10 minutes)

1. Sign in at github.com, or create a free account.
2. Click **New repository**. Name it `redact-studio`, leave it **Public**, and click **Create repository**.
3. Click **uploading an existing file**. Drag in everything inside this folder (the files and the `fonts`, `icons` and `vendor` folders, not the folder itself). Click **Commit changes**.
4. Open **Settings → Pages**. Under **Branch**, choose `main` and `/ (root)`, then **Save**.
5. After a minute or two the app is at `https://YOUR-USERNAME.github.io/redact-studio/`.

The repository holds only the app's code. No photos or personal details are in it.

## Install it

- **iPhone or iPad (Safari):** open the address, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** open the address and tap **Install** (or the menu, then **Install app**).
- **Mac or Windows (Chrome or Edge):** click the install icon at the right of the address bar.
- **Mac (Safari):** **File → Add to Dock**.

## Saving photos

- On a phone, **Save** opens the share sheet. Choose **Save Image** to put the copy in Photos.
- On a computer, the copy downloads.
- Copies with location removed end in `-noloc.jpg`. Blurred copies end in `-redacted.jpg` or `.png`.

## Updating

Upload the new files over the old ones in the same repository. Installed copies pick up the update the next time they open while online.
