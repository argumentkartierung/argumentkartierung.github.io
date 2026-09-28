(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var STYLE_ID = 'amb-frame-style';

  function rnd(a, b){ return a + Math.random() * (b - a); }
  function ri(a, b){ return Math.floor(rnd(a, b + 1)); }
  function pick(a){ return a[ri(0, a.length - 1)]; }
  function reduceMotion(){
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function injectCSS(){
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style'); s.id = STYLE_ID;
    s.textContent =
      '@keyframes amb-frame-drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-10px,5px,0)}100%{transform:translate3d(0,0,0)}}' +
      '.argmap-frame{position:relative;overflow:hidden;isolation:isolate;border-radius:18px;border:0;background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.01));color:currentColor}' +
      '.argmap-frame .amb-frame-svg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0}' +
      '.argmap-frame .amb-frame-drift{animation:amb-frame-drift 26s ease-in-out infinite}' +
      '.argmap-frame > *:not(.amb-frame-svg){position:relative;z-index:1}'
    document.head.appendChild(s);
  }

  function mount(host, opts){
    if (!host || host.dataset.ambFrameMounted) return;
    host.dataset.ambFrameMounted = '1';
    injectCSS();

    var o = {
      opacity: .82, roots: 1, maxNodes: 12, maxDepth: 4, maxChildren: 3,
      nodeW: [52, 82], nodeH: [18, 26], rowGap: 80,
      growEvery: 1200, growJitter: 320, crossLinkChance: .12, arrows: true,
      hold: 2200, fade: 700, loop: true, drift: true,
      width: 1200, height: 360, colors: {}, preserveAspectRatio: 'xMidYMid meet'
    };
    for (var k in (opts || {})) o[k] = opts[k];
    var C = { support: '#2f8f5b', attack: '#cf4b3e', node: 'currentColor', stroke: 'currentColor' };
    for (var c in (o.colors || {})) C[c] = o.colors[c];

    var W = o.width, H = o.height, motion = !reduceMotion();

    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.style.overflow = 'hidden';
    host.style.isolation = 'isolate';

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', o.preserveAspectRatio || 'xMidYMid meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'amb-frame-svg');
    svg.style.opacity = o.opacity;
    host.insertBefore(svg, host.firstChild);

    var root = document.createElementNS(NS, 'g');
    if (motion && o.drift) root.setAttribute('class', 'amb-frame-drift');
    var edgeLayer = document.createElementNS(NS, 'g');
    var nodeLayer = document.createElementNS(NS, 'g');
    root.appendChild(edgeLayer); root.appendChild(nodeLayer);
    svg.appendChild(root);

    var nodes, edges, roots, phase, phaseT, nextGrow, raf = null, last = 0;

    function makeNode(rank, parent){
      var n = {
        rank: rank, parent: parent || null, children: [],
        w: rnd(o.nodeW[0], o.nodeW[1]), h: rnd(o.nodeH[0], o.nodeH[1]),
        jx: rnd(-8, 8), jy: rnd(-7, 7),
        appear: 0, cx: 0, cy: 0, tx: 0, ty: 0
      };
      var g = document.createElementNS(NS, 'g');
      var r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', -n.w / 2); r.setAttribute('y', -n.h / 2);
      r.setAttribute('width', n.w); r.setAttribute('height', n.h);
      r.setAttribute('rx', '5');
      r.setAttribute('fill', C.node); r.setAttribute('fill-opacity', '.10');
      r.setAttribute('stroke', C.stroke); r.setAttribute('stroke-opacity', '.55');
      r.setAttribute('stroke-width', '1.2');
      g.appendChild(r);
      n.rectEl = r;

      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', '0');
      t.setAttribute('y', '0');
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'middle');
      t.setAttribute('font-size', '9');
      t.setAttribute('font-weight', '700');
      t.setAttribute('letter-spacing', '.04em');
      t.setAttribute('fill', C.stroke);
      t.style.pointerEvents = 'none';
      t.style.opacity = '0';
      g.appendChild(t);

      g.style.opacity = '0';
      n.el = g;
      n.titleEl = t;
      if (parent){ parent.children.push(n); n.cx = parent.cx; n.cy = parent.cy; }
      nodes.push(n); nodeLayer.appendChild(g);
      return n;
    }

    function makeEdge(from, to, kind){
      var e = { from: from, to: to, kind: kind, draw: 0, head: 0, soff: 0, toff: 0, dashed: true };
      var col = kind === 'support' ? C.support : C.attack;
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', col);
      p.setAttribute('stroke-width', '1.4'); p.setAttribute('stroke-linecap', 'round');
      p.style.opacity = '0';
      e.path = p; edgeLayer.appendChild(p);
      if (o.arrows){
        var h = document.createElementNS(NS, 'polygon');
        h.setAttribute('points', '0,0 -7.5,-3 -7.5,3');
        h.setAttribute('fill', col);
        h.style.opacity = '0';
        e.headEl = h; edgeLayer.appendChild(h);
      }
      edges.push(e);
      return e;
    }

    function wrapLabel(label){
      var raw = String(label || '').trim();
      if (!raw) return [];
      if (raw.length <= 14) return [raw];
      var words = raw.split(/\s+/);
      if (words.length > 1){
        var first = words[0];
        var rest = words.slice(1).join(' ');
        if (first.length + rest.length <= 22) return [first, rest];
      }
      var chunks = [];
      for (var i = 0; i < raw.length; i += 12){
        var chunk = raw.slice(i, i + 12).trim();
        if (chunk) chunks.push(chunk);
      }
      if (chunks.length === 0) return [raw];
      if (chunks.length === 1) return [chunks[0]];
      return [chunks[0], chunks.slice(1).join(' ')];
    }

    function syncNodeTitles(){
      nodes.forEach(function (n){
        var label = 'These';
        if (n.parent){
          var hasSupport = Array.isArray(n._out) && n._out.some(function (e){ return e.kind === 'support'; });
          var hasAttack = Array.isArray(n._out) && n._out.some(function (e){ return e.kind === 'attack'; });
          label = hasSupport ? 'Argument (Stützung)' : (hasAttack ? 'Argument (Einwand)' : '');
        }

        var lines = wrapLabel(label);
        while (n.titleEl.firstChild) n.titleEl.removeChild(n.titleEl.firstChild);
        lines.forEach(function (line, index){
          var tspan = document.createElementNS(NS, 'tspan');
          tspan.setAttribute('x', '0');
          tspan.setAttribute('dy', index === 0 ? '0' : '10');
          tspan.textContent = line;
          n.titleEl.appendChild(tspan);
        });

        var needsTwoLines = lines.length > 1;
        n.h = Math.max(n.h, needsTwoLines ? 28 : 18);
        if (n.rectEl){
          n.rectEl.setAttribute('height', n.h);
          n.rectEl.setAttribute('y', -n.h / 2);
        }
        n.titleEl.setAttribute('y', needsTwoLines ? '-3' : '0');
        n.titleEl.style.display = lines.length ? 'block' : 'none';
      });
    }

    function layout(){
      var cursor = 0;
      function place(n){
        if (!n.children.length){ n.slot = cursor++; return n.slot; }
        var xs = n.children.map(place);
        n.slot = (xs[0] + xs[xs.length - 1]) / 2;
        return n.slot;
      }
      roots.forEach(function (r){ place(r); cursor += 1; });

      var minS = Infinity, maxS = -Infinity;
      nodes.forEach(function (n){ if (n.slot < minS) minS = n.slot; if (n.slot > maxS) maxS = n.slot; });
      var spanS = maxS - minS;
      var padX = 90, padY = 48;
      var rowStep = o.rowGap || (H - padY * 2) / Math.max(o.maxDepth - 1, 1);
      var topY = o.rowGap ? Math.max((H - rowStep * (o.maxDepth - 1)) / 2, padY * .5) : padY;
      nodes.forEach(function (n){
        n.tx = spanS > 0 ? padX + ((n.slot - minS) / spanS) * (W - padX * 2) + n.jx : W / 2 + n.jx;
        n.ty = topY + n.rank * rowStep + n.jy;
      });

      nodes.forEach(function (n){ n._in = []; n._out = []; });
      edges.forEach(function (e){ e.to._in.push(e); e.from._out.push(e); });
      function fan(list, node, key, by){
        list.sort(function (a, b){ return by(a) - by(b); });
        var span = Math.min(Math.max(node.w - 14, 0), (list.length - 1) * 16);
        list.forEach(function (e, i){
          e[key] = list.length === 1 ? 0 : -span / 2 + span * (i / (list.length - 1));
        });
      }
      nodes.forEach(function (n){
        fan(n._in, n, 'toff', function (e){ return e.from.tx; });
        fan(n._out, n, 'soff', function (e){ return e.to.tx; });
      });
      syncNodeTitles();
    }

    function grow(){
      var cand = nodes.filter(function (n){
        return n.rank < o.maxDepth - 1 && n.children.length < o.maxChildren && n.appear > .5;
      });
      if (!cand.length) return false;
      var parent = cand[0], best = -1;
      cand.forEach(function (n){
        var w = Math.random() / (1 + n.children.length);
        if (w > best){ best = w; parent = n; }
      });

      var child = makeNode(parent.rank + 1, parent);
      makeEdge(child, parent, Math.random() < .6 ? 'support' : 'attack');
      layout();
      return true;
    }

    function reset(){
      while (edgeLayer.firstChild) edgeLayer.removeChild(edgeLayer.firstChild);
      while (nodeLayer.firstChild) nodeLayer.removeChild(nodeLayer.firstChild);
      nodes = []; edges = []; roots = [];
      for (var i = 0; i < Math.max(o.roots, 1); i++) roots.push(makeNode(0, null));
      layout();
      nodes.forEach(function (n){ n.cx = n.tx; n.cy = n.ty; });
      phase = 'grow'; phaseT = 0; nextGrow = o.growEvery * .35;
      root.style.opacity = '1';
    }

    function render(dt){
      var k = Math.min(dt / 200, 1);

      nodes.forEach(function (n){
        n.cx += (n.tx - n.cx) * k;
        n.cy += (n.ty - n.cy) * k;
        n.appear = Math.min(n.appear + dt / 450, 1);
        var e = n.appear, s = .85 + .15 * (1 - Math.pow(1 - e, 3));
        n.el.setAttribute('transform', 'translate(' + n.cx + ',' + n.cy + ') scale(' + s + ')');
        n.el.style.opacity = String(e);
        if (n.titleEl) n.titleEl.style.opacity = String(Math.min(.85, .2 + e));
      });

      edges.forEach(function (e){
        var c = e.from, p = e.to;
        var x1 = c.cx + e.soff, y1 = c.cy - c.h / 2;
        var x2 = p.cx + e.toff, y2 = p.cy + p.h / 2 + 5;
        var dx = x2 - x1, bend = Math.max((y1 - y2) * .42, 14);
        var c1x = x1 + dx * .18, c1y = y1 - bend;
        var c2x = x2 - dx * .18, c2y = y2 + bend;
        e.path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + c1x + ',' + c1y + ' ' + c2x + ',' + c2y + ' ' + x2 + ',' + y2);

        if (c.appear > .35) e.draw = Math.min(e.draw + dt / 700, 1);
        if (e.draw < 1){
          var len = 0;
          try { len = e.path.getTotalLength(); } catch (_) {}
          if (!len || !isFinite(len)) len = (Math.abs(dx) + Math.abs(y1 - y2)) * 1.4 + 24;
          e.path.style.strokeDasharray = len;
          e.path.style.strokeDashoffset = len * (1 - e.draw);
        } else if (e.dashed){
          e.path.style.strokeDasharray = 'none';
          e.path.style.strokeDashoffset = '0';
          e.dashed = false;
        }
        e.path.style.opacity = String(.65 * Math.min(e.draw * 4, 1));

        if (e.headEl){
          if (e.draw >= 1) e.head = Math.min(e.head + dt / 250, 1);
          var ang = Math.atan2(y2 - c2y, x2 - c2x) * 180 / Math.PI;
          e.headEl.setAttribute('transform', 'translate(' + x2 + ',' + y2 + ') rotate(' + ang + ')');
          e.headEl.style.opacity = String(.8 * e.head);
        }
      });
    }

    function frame(now){
      var dt = Math.min(now - last, 64); last = now;

      if (phase === 'grow'){
        nextGrow -= dt;
        if (nextGrow <= 0){
          if (nodes.length >= o.maxNodes || !grow()){ phase = 'hold'; phaseT = o.hold; }
          else nextGrow = Math.max(o.growEvery + rnd(-o.growJitter, o.growJitter), 120);
        }
      } else if (phase === 'hold'){
        phaseT -= dt;
        if (phaseT <= 0){
          if (!o.loop){ render(dt); raf = null; return; }
          phase = 'fade'; phaseT = o.fade;
        }
      } else if (phase === 'fade'){
        phaseT -= dt;
        root.style.opacity = String(Math.max(phaseT / o.fade, 0));
        if (phaseT <= 0){ reset(); }
      }

      render(dt);
      raf = requestAnimationFrame(frame);
    }

    function start(){
      reset();
      if (!motion){
        var guard = 0;
        while (nodes.length < o.maxNodes && guard++ < 200 && grow()){}
        nodes.forEach(function (n){ n.cx = n.tx; n.cy = n.ty; n.appear = 1; });
        edges.forEach(function (e){ e.draw = 1; e.head = 1; });
        render(16);
        return;
      }
      last = (global.performance ? performance.now() : Date.now());
      raf = requestAnimationFrame(frame);
    }

    start();

    return {
      restart: start,
      destroy: function (){
        if (raf) cancelAnimationFrame(raf);
        svg.remove(); delete host.dataset.ambFrameMounted;
      }
    };
  }

  function mountAll(selector, opts){
    Array.prototype.forEach.call(document.querySelectorAll(selector || '.argmap-frame'),
      function (el){ mount(el, opts); });
  }

  global.ArgmapFrame = { mount: mount, mountAll: mountAll };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mountAll('.argmap-frame'); });
  } else {
    mountAll('.argmap-frame');
  }
})(window);
