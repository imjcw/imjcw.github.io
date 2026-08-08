**Problem**: Lightbox shows SVG too small (~200px wide) because the cloned SVG's inline `style="max-width: 971px"` isn't being overridden by CSS.

**Root cause**: When cloning the SVG element, its inline `style` attribute carries over. Setting a new inline `style` in JS should work, but the CSS `.mermaid-lightbox-preview svg { width: auto; max-width: calc(100vw - 160px) }` conflicts with the SVG's intrinsic `width="100%"` attribute.

**Fix** (2 parts):

1. **JS** (`themes/comic/source/js/render-mermaid.js`): In `showLightbox()`, after cloning, explicitly set `width="100%"` and `style="max-width:none;width:100%;height:auto"` on the SVG element, and remove any conflicting `style` attribute.

2. **CSS** (`themes/comic/source/css/main.css`): Simplify `.mermaid-lightbox-preview svg` to just `width: 100%; height: auto` — no `max-width` constraints that might conflict.

3. **Rebuild + restart server** (already done above).

4. **Verify** with browser: click mermaid diagram → lightbox opens with SVG at full width (~1000px+), zoom controls work, download button triggers PNG download.

The border removal from the previous task is already confirmed working in the live page.