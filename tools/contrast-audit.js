// WCAG AA contrast audit: walks every text-bearing element, resolves its real
// effective background (compositing semi-transparent layers and inherited
// opacity), and reports anything under threshold.
(() => {
  const parse = c => {
    const m = c.match(/[\d.]+/g);
    if (!m) return null;
    return [ +m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3] ];
  };
  const over = (fg, bg) => {          // composite fg (with alpha) onto opaque bg
    const a = fg[3];
    return [0,1,2].map(i => fg[i]*a + bg[i]*(1-a)).concat(1);
  };
  const lum = ([r,g,b]) => {
    const f = v => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
  };
  const ratio = (a, b) => {
    const L1 = lum(a), L2 = lum(b);
    const hi = Math.max(L1,L2), lo = Math.min(L1,L2);
    return (hi + 0.05) / (lo + 0.05);
  };

  // cumulative opacity from el up to root
  const cumOpacity = el => {
    let o = 1, n = el;
    while (n && n.nodeType === 1) {
      const v = parseFloat(getComputedStyle(n).opacity);
      if (!isNaN(v)) o *= v;
      n = n.parentElement;
    }
    return o;
  };

  // effective background: walk up compositing until opaque; note gradients
  const effBg = el => {
    let stack = [], n = el, gradient = false;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') gradient = true;
      const c = parse(cs.backgroundColor);
      if (c && c[3] > 0) {
        stack.push(c);
        if (c[3] === 1) break;
      }
      n = n.parentElement;
    }
    let base = [255,255,255,1];
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return { bg: base, gradient };
  };

  const results = [];
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    // only elements holding their own visible text
    const txt = [...el.childNodes]
      .filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim())
      .join(' ')
      .trim();
    if (!txt) return;
    if (el.getBoundingClientRect().width === 0) return;

    const fgRaw = parse(cs.color);
    if (!fgRaw) return;
    const { bg, gradient } = effBg(el);
    const op = cumOpacity(el);
    const fg = over([fgRaw[0], fgRaw[1], fgRaw[2], fgRaw[3] * op], bg);

    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const r = ratio(fg, bg);

    if (r < need) {
      results.push({
        text: txt.slice(0, 42),
        sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''),
        size: size + 'px/' + weight,
        ratio: r.toFixed(2),
        need,
        gradient
      });
    }
  });

  // de-duplicate by selector+ratio so repeated components report once
  const seen = new Set(), uniq = [];
  for (const r of results) {
    const k = r.sel + '|' + r.ratio;
    if (seen.has(k)) continue;
    seen.add(k); uniq.push(r);
  }
  return JSON.stringify({ failures: uniq.length, total: results.length, items: uniq }, null, 1);
})()
