# Chat (Static GitHub Pages Version)

This repository now runs as a static chat demo for GitHub Pages using:

- HTML
- CSS
- Vanilla JavaScript (no PHP, no jQuery)

## How it works

Because GitHub Pages only serves static files, this app cannot use PHP sessions or server-side log files.

Instead, it uses:

- `localStorage` for chat message history
- `sessionStorage` for the current tab/session display name
- `BroadcastChannel` (when available) to sync updates across tabs/windows in the same browser
- a `localStorage` polling fallback when `BroadcastChannel` is unavailable

## Important limitation

Messages are only shared within the same browser profile on the same device.

This is **not** a true public multi-user chat backend. Cross-device or internet-wide real-time chat requires a backend service (for example, WebSocket server, database-backed API, or hosted realtime platform).

## GitHub Pages deployment

1. Push this repository to GitHub.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Select the branch and folder (usually `main` / `/root`) and save.
5. GitHub Pages will serve `index.html` as the site entry point.

## Local usage

Open `index.html` in a browser (or serve the folder with a static file server) and start chatting.
