/*
 * Build-time mermaid → SVG renderer (CJS).
 * Delegates the actual Chromium/puppeteer work to mermaid-render.mjs,
 * which runs as a separate ESM child process (hexo loads theme scripts
 * in CJS mode and blocks dynamic import() of puppeteer).
 *
 * Reads all ```mermaid blocks, feeds their source to the child as JSONL
 * on stdin, and swaps each block for an inline SVG (plus an embedded
 * PNG for the download button) on stdout.
 */
'use strict';

var path = require('path');
var cp = require('child_process');

function escapeHtmlReplacer(text) {
  return text.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&#123;/g, '{')
    .replace(/&#125;/g, '}')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

var RENDERER = path.resolve(__dirname, '..', 'mermaid-render.mjs');

hexo.extend.filter.register('after_post_render', function (data) {
  if (!data.content || data.content.indexOf('<pre') === -1) return data;

  var hasMermaid = /<pre\b[^>]*>[\s\S]*?(flowchart |sequenceDiagram|classDiagram|gantt|stateDiagram|erDiagram|gitGraph|pie)/i.test(data.content);
  if (!hasMermaid) return data;

  var result = data.content;

  // Collect all mermaid code blocks.
  var re = /<figure\b[^>]*>[\s\S]*?<pre\b[^>]*>([\s\S]*?)<\/pre>[\s\S]*?<\/figure>/gi;
  var matches = [];
  var m;
  while ((m = re.exec(result)) !== null) {
    var text = (m[1] || '')
      .replace(/<span class="line">/g, '')
      .replace(/<\/span>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .trim();
    text = escapeHtmlReplacer(text);
    if (!/^(flowchart |sequenceDiagram|classDiagram|gantt|stateDiagram|erDiagram|gitGraph|pie)/i.test(text)) {
      continue;
    }
    matches.push({ full: m[0], code: text });
  }

  if (matches.length === 0) return data;
  hexo.log.info('mermaid-build: rendering ' + matches.length + ' diagram(s) via puppeteer');

  // Feed all diagrams to the child renderer in a single spawn call.
  var stdin = matches.map(function (item) { return JSON.stringify({ code: item.code }); }).join('\n');

  var out = cp.spawnSync('node', [RENDERER], {
    input: stdin,
    encoding: 'utf-8',
    timeout: 120000
  });

  if (out.error) {
    hexo.log.error('mermaid-build: failed to spawn renderer: ' + out.error.message);
    return data;
  }

  var rendered = (out.stdout || '').trim().split(/\r?\n/).filter(Boolean);

  for (var i = 0; i < matches.length; i++) {
    var item = matches[i];
    try {
      var parsed = i < rendered.length ? JSON.parse(rendered[i]) : null;
      if (!parsed || parsed.err) {
        throw new Error(parsed && parsed.err ? parsed.err : 'no result from renderer');
      }
      if (!parsed.svg || !String(parsed.svg).includes('<svg')) {
        throw new Error('No SVG in renderer output');
      }
      var pngAttr = parsed.png ? ' data-png="data:image/png;base64,' + parsed.png + '"' : '';
      var wrapper = '<div class="mermaid-svg" tabindex="0" role="button" aria-label="点击放大图表"' + pngAttr + '>' + parsed.svg + '</div>';
      result = result.replace(item.full, wrapper);
    } catch (e) {
      hexo.log.warn('mermaid-build: diagram #' + (i + 1) + ' failed: ' + e.message);
    }
  }

  if (out.stderr) hexo.log.warn('mermaid-build: renderer stderr: ' + out.stderr);
  data.content = result;
  return data;
});