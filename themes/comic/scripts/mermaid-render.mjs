#!/usr/bin/env node
/*
 * Standalone ESM renderer: reads one JSON line per diagram on stdin,
 * renders each to SVG+PNG via a single puppeteer (Chromium) instance,
 * writes one JSON line per diagram on stdout.
 *
 * Kept in a separate ESM file because hexo loads its theme scripts in
 * CJS mode, which blocks dynamic import() of puppeteer.
 *
 * stdin  : {"code": "<mermaid source>"}  (one JSON line per diagram)
 * stdout : {"svg": "<svg...>", "png": "<base64png>"}  (one JSON line per diagram)
 */

import puppeteer from 'puppeteer';
import fs from 'node:fs';

const MERMAID_SCRIPT = fs.readFileSync(
  new URL('./mermaid.min.js', import.meta.url),
  'utf-8'
);

function makePageHtml(code) {
  return '<!DOCTYPE html><html><head></head><body>' +
    '<div id="diagram-container"></div>' +
    '<script>' + MERMAID_SCRIPT + '</script>' +
    '<script>' +
    'window.__render = function() {' +
    '  return new Promise(function(resolve, reject) {' +
    '    try {' +
    '      mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });' +
    '      var svg = mermaid.render("diagram", ' + JSON.stringify(code) + ');' +
    '      resolve(svg);' +
    '    } catch(e) { reject(e); }' +
    '  });' +
    '};' +
    '</script></body></html>';
}

async function renderOne(browser, diagramCode) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
  try {
    await page.setContent(makePageHtml(diagramCode), { waitUntil: 'load' });
    const svg = await page.evaluate(() => window.__render());

    await page.evaluate((s) => {
      document.getElementById('diagram-container').innerHTML = s;
    }, svg);

    let png = null;
    try {
      const handle = await page.$('#diagram');
      if (handle) {
        await page.evaluate(() => {
          const el = document.getElementById('diagram');
          const vb = el.getAttribute('viewBox');
          if (vb) {
            const parts = vb.split(/[\s,]+/);
            if (parts.length >= 4) {
              el.style.maxWidth = 'none';
              el.style.width = parts[2] + 'px';
              el.style.height = parts[3] + 'px';
            }
          }
        });
        const buf = await handle.screenshot({ type: 'png' });
        png = buf.toString('base64');
      }
    } catch (e) {
      // PNG capture optional
    }

    return { svg: svg, png: png };
  } finally {
    await page.close();
  }
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf-8');
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const out = [];

  if (lines.length === 0) { process.exit(0); }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    for (const line of lines) {
      try {
        const { code } = JSON.parse(line);
        if (!code) { out.push(JSON.stringify({ code: code || '', err: 'empty code' })); continue; }
        const result = await renderOne(browser, code);
        out.push(JSON.stringify(result));
      } catch (e) {
        out.push(JSON.stringify({ err: e.message }));
      }
    }
  } finally {
    await browser.close();
  }

  process.stdout.write(out.join('\n') + '\n');
}

main().catch(async (e) => {
  process.stderr.write('mermaid-render FATAL: ' + e.message + '\n');
  process.exit(1);
});