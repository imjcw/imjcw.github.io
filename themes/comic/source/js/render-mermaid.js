/*
 * Mermaid SVG interaction handler (lightbox: zoom, pan, download).
 * SVG diagrams are pre-rendered at build time — this script only adds interactivity.
 */
(function () {
  var currentScale = 1;
  var activeLightbox = null;
  var panX = 0, panY = 0;
  var isPanning = false;
  var panDragging = false, panDx = 0, panDy = 0;

  function createDialog () {
    if (document.getElementById('mermaid-lightbox')) return;
    var overlay = document.createElement('div');
    overlay.id = 'mermaid-lightbox';
    overlay.innerHTML =
      '<div class="mbox">' +
        '<div class="mbox-head">' +
          '<div class="mbox-dots">' +
            '<span class="mbox-dot red"></span>' +
            '<span class="mbox-dot yellow"></span>' +
            '<span class="mbox-dot green"></span>' +
          '</div>' +
          '<div class="mbox-actions">' +
            '<span class="mbox-btn mbox-btn-reset" data-action="reset" title="重置">&#8635;</span>' +
            '<button class="mbox-btn" data-action="download" title="下载 PNG">&#8595;</button>' +
            '<button class="mbox-btn" data-action="close" title="关闭">&times;</button>' +
          '</div>' +
        '</div>' +
        '<div class="mbox-body">' +
          '<div class="mbox-preview"></div>' +
        '</div>' +
        '<div class="mbox-foot">' +
          '<button class="mbox-zoom" data-action="zoom-out" title="缩小">&minus;</button>' +
          '<span class="mbox-scale">100%</span>' +
          '<button class="mbox-zoom" data-action="zoom-in" title="放大">&#65291;</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('[data-action="close"]').addEventListener('click', hideDialog);
    overlay.querySelector('[data-action="download"]').addEventListener('click', downloadPng);
    overlay.querySelector('[data-action="zoom-in"]').addEventListener('click', function () { zoomAt(1.2); });
    overlay.querySelector('[data-action="zoom-out"]').addEventListener('click', function () { zoomAt(0.83); });
    overlay.querySelector('[data-action="reset"]').addEventListener('click', function () { setZoom(1); resetPan(); });

    var resetBtn = overlay.querySelector('[data-action="reset"]');

    document.addEventListener('keydown', function (e) {
      if (overlay.style.display !== 'flex') return;
      if (isPanning) return;
      if (e.key === 'Escape') hideDialog();
      if (e.key === '+' || e.key === '=') { zoomAt(1.2); showReset(resetBtn); }
      if (e.key === '-') { zoomAt(0.83); showReset(resetBtn); }
      if (e.key === '0') { setZoom(1); resetPan(); hideReset(resetBtn); }
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        isPanning = true;
        setPanCursor(true);
      }
    });

    document.addEventListener('keyup', function (e) {
      if (e.key === ' ' && isPanning) {
        isPanning = false;
        setPanCursor(false);
      }
    });

    var body = overlay.querySelector('.mbox-body');

    body.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoomAt(e.deltaY > 0 ? 0.92 : 1.08, e.clientX, e.clientY);
      showReset(resetBtn);
    }, { passive: false });

    body.addEventListener('mousedown', function (e) {
      if (isPanning && e.button === 0) {
        panDragging = true;
        panDx = e.clientX - panX;
        panDy = e.clientY - panY;
        setPanCursor(true);
        var preview = overlay.querySelector('.mbox-preview');
        preview.style.transition = 'none';
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', function (e) {
      if (!panDragging) return;
      panX = e.clientX - panDx;
      panY = e.clientY - panDy;
      applyScale();
    });

    document.addEventListener('mouseup', function () {
      if (panDragging) {
        panDragging = false;
        var preview = overlay.querySelector('.mbox-preview');
        if (preview) preview.style.transition = 'transform 0.12s ease';
        setPanCursor(isPanning);
      }
    });

    var modal = overlay.querySelector('.mbox');
    var head = overlay.querySelector('.mbox-head');
    var dragging = false, dx = 0, dy = 0;
    head.addEventListener('mousedown', function (e) {
      dragging = true;
      dx = e.clientX - modal.offsetLeft;
      dy = e.clientY - modal.offsetTop;
      modal.style.transition = 'none';
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      modal.style.left = (e.clientX - dx) + 'px';
      modal.style.top = (e.clientY - dy) + 'px';
      modal.style.right = 'auto';
      modal.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', function () {
      if (dragging) { dragging = false; modal.style.transition = ''; }
    });
  }

  function showReset (btn) {
    if (btn && (currentScale !== 1 || panX !== 0 || panY !== 0)) btn.style.display = 'flex';
    else if (btn) btn.style.display = 'none';
  }

  function hideReset (btn) {
    if (btn) btn.style.display = 'none';
  }

  function zoomAt (factor, mouseX, mouseY) {
    var newScale = Math.max(0.3, Math.min(5, currentScale * factor));
    if (mouseX != null) {
      var preview = document.querySelector('.mbox-preview');
      var bodyEl = document.querySelector('.mbox-body');
      if (preview && bodyEl) {
        var pr = preview.getBoundingClientRect();
        var br = bodyEl.getBoundingClientRect();
        var ratio = newScale / currentScale;
        var newW = pr.width * ratio;
        var newH = pr.height * ratio;
        var svgX = (mouseX - pr.left) / currentScale;
        var svgY = (mouseY - pr.top) / currentScale;
        panX = mouseX - br.left - (br.width - newW) / 2 - svgX * newScale;
        panY = mouseY - br.top - (br.height - newH) / 2 - svgY * newScale;
      }
    }
    currentScale = newScale;
    applyScale();
  }

  function setZoom (s) {
    currentScale = s;
    applyScale();
  }

  function applyScale () {
    var p = document.querySelector('.mbox-preview');
    if (p) p.style.setProperty('--zoom', currentScale);
    var s = document.querySelector('.mbox-scale');
    if (s) s.textContent = Math.round(currentScale * 100) + '%';
    if (p) p.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + currentScale + ')';
  }

  function resetPan () {
    panX = 0;
    panY = 0;
    applyScale();
  }

  function setPanCursor (on) {
    var body = document.querySelector('.mbox-body');
    if (body) body.style.cursor = on ? 'grab' : 'default';
    if (panDragging) {
      var b2 = document.querySelector('.mbox-body');
      if (b2) b2.style.cursor = 'grabbing';
    }
  }

  function showDialog (svg) {
    createDialog();
    var overlay = document.getElementById('mermaid-lightbox');
    var preview = overlay.querySelector('.mbox-preview');
    preview.innerHTML = '';
    preview.style.transform = '';
    preview.style.transition = '';

    var cloned = svg.cloneNode(true);
    cloned.removeAttribute('style');
    cloned.removeAttribute('width');
    cloned.removeAttribute('height');

    var vb = cloned.getAttribute('viewBox');
    var w = 1100;
    if (vb) {
      var parts = vb.split(/[\s,]+/);
      if (parts.length >= 3) {
        var vw = parseFloat(parts[2]);
        if (vw > 200 && vw < 2400) w = Math.min(Math.round(vw), 1160);
      }
    }
    cloned.style.cssText = 'width:' + w + 'px; height:auto; max-width:100%;';

    activeLightbox = svg;
    currentScale = 1;
    panX = 0;
    panY = 0;
    applyScale();
    preview.appendChild(cloned);
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (document.activeElement) document.activeElement.blur();

    var resetBtn = overlay.querySelector('[data-action="reset"]');
    if (resetBtn) resetBtn.style.display = 'none';
  }

  function hideDialog () {
    var overlay = document.getElementById('mermaid-lightbox');
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    activeLightbox = null;
    isPanning = false;
    panDragging = false;
    panX = 0;
    panY = 0;
  }

  function downloadPng () {
    if (!activeLightbox) return;
    var clone = activeLightbox.cloneNode(true);
    clone.removeAttribute('style');
    clone.removeAttribute('width');
    clone.removeAttribute('height');
    var bbox = activeLightbox.getBBox ? activeLightbox.getBBox() : null;
    if (bbox) {
      clone.setAttribute('width', String(bbox.width));
      clone.setAttribute('height', String(bbox.height));
    }
    var data = new XMLSerializer().serializeToString(clone);
    var blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function () {
      var s = 2;
      var canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * s;
      canvas.height = img.naturalHeight * s;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fffef0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(function (b) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = (activeLightbox.id || 'diagram') + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  // Attach click/keyboard handlers to all pre-rendered mermaid SVG containers
  document.querySelectorAll('.mermaid-svg').forEach(function (container) {
    if (container.dataset.bound) return;
    container.dataset.bound = '1';
    var svg = container.querySelector('svg');
    if (!svg) return;

    var handler = function () {
      if (document.getElementById('mermaid-lightbox').style.display === 'flex') return;
      showDialog(svg);
    };

    container.addEventListener('click', handler);
    container.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });
})();