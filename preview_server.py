#!/usr/bin/env python3
"""Static preview server with Netlify-style pretty URL rewrites."""
from __future__ import annotations

import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# From _redirects: pretty path -> html file (200 rewrite)
REWRITES: dict[str, str] = {}
redirects = ROOT / "_redirects"
if redirects.exists():
    for line in redirects.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) >= 3 and parts[2].startswith("200") and parts[1].endswith(".html"):
            src, dest = parts[0], parts[1].lstrip("/")
            REWRITES[src.rstrip("/")] = dest
            REWRITES[src.rstrip("/") + "/"] = dest

# Handy aliases
REWRITES.setdefault("/emmys", "project-television-academy.html")
REWRITES.setdefault("/emmys/", "project-television-academy.html")
REWRITES.setdefault("/television-academy", "project-television-academy.html")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in REWRITES:
            self.path = "/" + REWRITES[path]
        return super().do_GET()

    def log_message(self, fmt, *args):
        # quieter logs
        if args and str(args[0]).startswith("GET") and "404" in str(args):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    port = 8080
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Serving {ROOT} on http://0.0.0.0:{port} with pretty URLs", flush=True)
    httpd.serve_forever()
