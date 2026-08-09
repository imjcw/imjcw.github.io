/*
 * Serve source markdown alongside the article at the same URL path,
 * suffixed with "article.md" — e.g. /2026/08/08/AI/large-model-inference-caching/article.md
 */
'use strict';

var fs = require('fs');
var path = require('path');

function toRoute(permalink) {
  // Strip leading "/" and trailing "/"
  var route = permalink.replace(/^\/|\/$/g, '');
  // If it's an absolute URL, extract just the path
  var m = /^https?:\/\/[^\/]+\/(.*)$/.exec(route);
  return m ? m[1] : route;
}

hexo.extend.generator.register('raw-md', function () {
  var posts = hexo.locals.get('posts');
  var result = [];

  posts.forEach(function (post) {
    var source = post.source;
    if (!source) return;

    var permalink = post.permalink || '';
    if (!permalink) return;

    var route = toRoute(permalink);
    if (!route) return;

    var abs = path.join(hexo.config.source_dir, source);
    if (!fs.existsSync(abs)) return;

    var content = fs.readFileSync(abs, 'utf-8');
    result.push({
      path: route + '/article.md',
      data: function () { return content; },
      contentType: 'text/markdown; charset=utf-8'
    });
  });

  return result;
});