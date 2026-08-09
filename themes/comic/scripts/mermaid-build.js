/*
 * Build-time mermaid → SVG renderer.
 * Converts ```mermaid code blocks to inline SVG during `hexo generate`.
 * Uses puppeteer (headless Chrome) for accurate SVG layout rendering.
 */
'use strict';

var path = require('path');
var fs = require('fs');

var browserInstance = null;
var browserReady = false;

async function getBrowser() {
  if (browserReady) return browserInstance;

  var puppeteer = require('puppeteer');
  browserInstance = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  browserReady = true;
  hexo.log.info('mermaid-build: puppeteer browser launched');
  return browserInstance;
}

var MERMAID_SCRIPT = fs.readFileSync(path.resolve(__dirname, 'mermaid.min.js'), 'utf-8');

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

async function renderSVG(diagramCode) {
  var browser = await getBrowser();
  var page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  var html = makePageHtml(diagramCode);
  await page.setContent(html, { waitUntil: 'load' });

  var svg = await page.evaluate(function () {
    return window.__render();
  });

  await page.close();
  return svg;
}

hexo.extend.filter.register('after_post_render', async function (data) {
  if (!data.content || data.content.indexOf('<pre') === -1) return data;

  var hasMermaid = /<pre\b[^>]*>[\s\S]*?(flowchart |sequenceDiagram|classDiagram|gantt|stateDiagram|erDiagram|gitGraph|pie)/i.test(data.content);
  if (!hasMermaid) return data;

  var result = data.content;
  var re = /<pre\b[^>]*>([\s\S]*?)<\/pre>/gi;
  var matches = [];
  var m;
  while ((m = re.exec(result)) !== null) {
    var text = (m[1] || '')
      .replace(/<span class="line">/g, '')
      .replace(/<\/span>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .trim();
    text = text.replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#34;/g, '"')
      .replace(/&#123;/g, '{')
      .replace(/&#125;/g, '}')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
    if (!/^(flowchart |sequenceDiagram|classDiagram|gantt|stateDiagram|erDiagram|gitGraph|pie)/i.test(text)) {
      continue;
    }
    matches.push({ full: m[0], code: text });
  }

  if (matches.length === 0) return data;
  hexo.log.info('mermaid-build: rendering ' + matches.length + ' diagram(s) via puppeteer');

  for (var i = 0; i < matches.length; i++) {
    var item = matches[i];
    try {
      var svgHtml = await renderSVG(item.code);
      if (!svgHtml || !String(svgHtml).includes('<svg')) {
        throw new Error('No SVG in output');
      }
      var wrapper = '<div class="mermaid-svg" tabindex="0" role="button" aria-label="点击放大图表">' + svgHtml + '</div>';
      result = result.replace(item.full, wrapper);
    } catch (e) {
      hexo.log.warn('mermaid-build: diagram #' + (i + 1) + ' failed: ' + e.message);
    }
  }

  data.content = result;
  return data;
});

process.on('exit', function () {
  if (browserInstance) {
    try { browserInstance.close(); } catch (e) {}
  }
});
process.on('SIGINT', function () {
  if (browserInstance) {
    try { browserInstance.close(); } catch (e) {}
  }
  process.exit();
});