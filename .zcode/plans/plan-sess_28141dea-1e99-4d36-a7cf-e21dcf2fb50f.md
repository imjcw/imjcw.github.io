## Build-time Mermaid SVG Rendering

### Problem
Currently mermaid diagrams are rendered client-side using a 2.78MB `mermaid.min.js` loaded in every post page with mermaid blocks. The user wants them pre-rendered to SVG during `hexo generate`.

### Solution

**1. Install `mermaid` npm package (Node.js API)**
- `npm install --save-dev mermaid` — the package includes a `mermaid.render()` API that works in Node.js without Chromium
- This is lightweight compared to `mermaid-cli`/`mmdc` which require Puppeteer/Chromium

**2. Create a Hexo filter script** (`themes/comic/scripts/mermaid-build.js`)
- Register a `before_post_render` or `after_post_render` filter
- Find all ```mermaid code blocks in the post markdown
- Use `mermaid.render()` to convert each block to an SVG string
- Replace the code block with an inline `<div class="mermaid-svg"><svg>...</svg></div>`
- The SVG is embedded directly in the generated HTML — no client-side compilation needed

**3. Remove client-side mermaid rendering**
- Remove `mermaid.min.js` from `themes/comic/source/js/` (no longer needed)
- Simplify `render-mermaid.js` to only handle lightbox interactions (click to zoom/pan/download)
- Remove `mermaid.init()` call since SVG is already rendered

**4. Keep lightbox interaction**
- The SVG lightbox dialog (zoom, pan, download as PNG) in `render-mermaid.js` continues to work on the pre-rendered SVG elements
- Just query `.mermaid-svg svg` instead of `.mermaid svg`

**5. Update `post.ejs`**
- Remove `mermaid.min.js` script tag
- Keep only the simplified `render-mermaid.js` for interactions

### Files to modify/create:
- `package.json` / `package-lock.json` — add `mermaid` devDependency
- `themes/comic/scripts/mermaid-build.js` — NEW: Hexo filter
- `themes/comic/source/js/render-mermaid.js` — simplified (remove mermaid.init, query `.mermaid-svg svg`)
- `themes/comic/layout/post.ejs` — remove mermaid.min.js script tag
- Delete `themes/comic/source/js/mermaid.min.js`

### Benefits:
- No 2.78MB JS download for visitors
- Diagrams render instantly on page load (already SVG in HTML)
- Works even with JS disabled (SVG is inline)
- Lightbox still works for zoom/pan/download