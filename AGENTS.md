# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static HTML/CSS/JS portfolio site** (Adam Lorber portfolio). There is no build step, no package manager, and no dependencies to install. See `README.txt` for the author-facing overview.

- **Structure**: `index.html` (homepage), `project-*.html` (9 case-study pages), `editor.html` / `case-study-editor.html` (browser-only visual editors), `site.js` (theme toggle, email copy, mobile menu), `images/<project-name>/` (per-project media). All links between pages are relative.
- **Run (dev)**: serve the folder over HTTP from the repo root, e.g. `python3 -m http.server 8000`, then open `http://localhost:8000/index.html`. Node is also available if you prefer `npx serve`. Opening files via `file://` mostly works but a local server is more reliable for relative paths.
- **Build/deploy**: none required. The site is deployed by dragging the folder to Netlify drop (per `README.txt`).
- **Lint/test**: there is no configured lint or test tooling in this repo. Verify changes by loading the affected page(s) in a browser and exercising interactions (theme toggle, nav, project links).
- **Note**: The two `*-editor.html` tools run entirely client-side in the browser tab; their edits are not persisted to the repo unless exported and re-added manually.
