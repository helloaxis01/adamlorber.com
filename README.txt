ADAM LORBER PORTFOLIO — README
================================
Everything in this folder is your current, real site as of today.

WHAT'S IN HERE
--------------
- index.html                    → homepage (hero, work grid, About, Contact, footer sitemap)
- project-*.html                → 9 case-study pages
- images/{project-name}/        → each project's photos, videos, and gifs
- editor.html                   → visual tool for homepage text, thumbnails, hero stack
- case-study-editor.html        → visual tool for a case study's Challenge/Approach/Outcome content

HOW TO VIEW OR DEPLOY
----------------------
- To just look at it: open index.html directly in any browser. All links between
  pages are relative, so as long as this whole folder stays together, everything works.
- To go live: drag this entire folder onto https://app.netlify.com/drop for an
  instant live URL. No build step needed.

IMPORTANT — HOW TO KEEP THIS IN SYNC WITH CLAUDE
--------------------------------------------------
This folder only reflects what Claude actually has. Two ways to make changes,
and only one of them keeps this folder truly in sync:

1. RECOMMENDED: Upload photos/videos and instructions directly in chat with
   Claude. Claude edits the real files and syncs them back to you every time.
   This is the only way that's been fully reliable — use it for anything you
   want Claude to build or fix.

2. Using editor.html or case-study-editor.html yourself in your browser: these
   tools run entirely in your browser tab. Whatever you change there ONLY
   exists in that tab and in whatever .zip you export from it — Claude never
   sees it automatically. If you use these tools and want Claude to pick up
   from where you left off, you must upload the resulting file back to Claude
   in chat afterward.

Bottom line: if you want Claude's help with something, hand Claude the actual
file first (or just ask, if it's already something Claude has). Don't assume
edits made only in the browser tools are visible on Claude's end.
