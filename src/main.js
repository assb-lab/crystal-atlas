/** Atlas UI: graph interaction, inspectors, comparison, sources, and controls. */
import { DATA } from "./data/atlas.js";
import { KINDS, ROUTES, LABPRESETS, OCCPRESETS } from "./data/presets.js";
import { esc, frac, normalize, shortestPath } from "./utils.js";
import { CrystalView, modelFor, fourFCC, SITE_COLORS } from "./viewer.js";

'use strict';

const $ = id => document.getElementById(id), N = new Map(DATA.nodes.map(n => [n.id, n])), E = new Map(DATA.edges.map(e => [e.id, e]));

const state = { tab: 'explore', family: 'fcc', selected: 'fcc', edge: null, bundle: null, strict: false, view: 'map', comp: [], lab: 'heusler', subVisible: [true, true, true, true], t: .125, o: .5, occPreset: 'spinel' };

let modelView = null, labView = null, visibleNodes = [], visibleEdges = [], lastFocus = null;

const PDFS = {};

function refHTML(refs) { return refs.map(r => `<button class="refchip" data-source="${r.s}" data-page="${r.p}" title="${esc(DATA.sources[r.s].title)}">${esc(DATA.sources[r.s].short)} · p.${r.p}<span>${esc(r.sec)} / PDF ${r.p + DATA.sources[r.s].offset}</span></button>`).join(''); }

function toast(s) { $('toast').textContent = s; $('toast').hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').hidden = true, 3500); }

function tab(id) { state.tab = id; document.body.dataset.page = id; document.querySelectorAll('.tabpage').forEach(p => p.hidden = p.id !== id); document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === id)); if (id === 'explore') {
    requestAnimationFrame(() => { fitMap(); modelView?.draw(); });
} if (id === 'lab') {
    if (!labView)
        labView = new CrystalView($('labcanvas'), true);
    updateLab();
    requestAnimationFrame(() => labView.draw());
} }

function family(id, fit = true) { state.family = id; state.edge = null; state.bundle = null; const nodes = DATA.nodes.filter(n => id === 'all' || n.family === id); if (!nodes.some(n => n.id === state.selected))
    state.selected = nodes.find(n => n.id === id)?.id || nodes[0]?.id; renderFamily(); renderGraph(); renderInspector(); if (fit)
    requestAnimationFrame(fitMap); }

function selectNode(id, jump = true) { if (!N.has(id))
    return; if (state.strict && !DATA.edges.some(e => e.strict && (e.a === id || e.b === id))) {
    state.strict = false;
    $('strictFilter').checked = false;
    toast('この構造の関係を表示するため、絞り込みを解除しました。');
} revealInspector(); state.selected = id; state.edge = null; state.bundle = null; if (jump && state.family !== 'all' && N.get(id).family !== state.family) {
    state.family = N.get(id).family;
    renderFamily();
    renderGraph();
    requestAnimationFrame(fitMap);
}
else
    renderGraph(); renderInspector(); renderList(); $('searchResults').innerHTML = ''; if (state.tab !== 'explore')
    tab('explore'); if (innerWidth <= 700)
    requestAnimationFrame(() => $('inspector').scrollIntoView({ behavior: 'smooth', block: 'start' })); }

function selectEdge(id) { const e = E.get(id); if (!e)
    return; revealInspector(); state.edge = id; state.bundle = null; renderGraph(); renderEdge(e); }

function revealInspector() { if (document.querySelector('.workspace').classList.contains('hide-right'))
    setPanel('right', true); }

function renderFamily() { const fs = DATA.families; const all = [['all', { short: 'すべてのファミリー', color: '#93a9ba' }], ...Object.entries(fs)]; $('families').innerHTML = all.map(([id, f]) => `<button class="familybutton ${state.family === id ? 'active' : ''}" data-family="${id}"><i class="dot" style="background:${f.color}"></i><span>${f.short}</span><span class="num">${id === 'all' ? DATA.nodes.length : DATA.nodes.filter(n => n.family === id).length}</span></button>`).join(''); $('familyTitle').innerHTML = state.family === 'all' ? '構造ファミリーの全体地図' : `<button class="crumb" data-family="all" title="全体地図へ戻る">全体地図</button><span class="crumbsep" aria-hidden="true">›</span>${esc(fs[state.family].name)}`; $('familySubtitle').textContent = state.family === 'all' ? `${Object.keys(fs).length} つのファミリーと、その間をつなぐ関係` : fs[state.family].subtitle; }

const SVGNS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}, text) { const el = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); if (text !== undefined)
    el.textContent = text; return el; }

function pos(n) { return { x: n.x, y: n.y }; }

function getVisible() { let nodes = DATA.nodes.filter(n => state.family === 'all' || n.family === state.family); let ids = new Set(nodes.map(n => n.id)); let edges = DATA.edges.filter(e => ids.has(e.a) && ids.has(e.b) && (!state.strict || e.strict)); if (state.strict) {
    const linked = new Set(edges.flatMap(e => [e.a, e.b]));
    nodes = nodes.filter(n => linked.has(n.id));
} return { nodes, edges }; }

function edgePath(a, b) {
    const w = 220, h = 86;
    let p = pos(a), q = pos(b);
    const dx = q.x - p.x, dy = q.y - p.y;
    let sx, sy, ex, ey, c1x, c1y, c2x, c2y;
    if (Math.abs(dy) < 72) {
        const s = Math.sign(dx) || 1;
        sx = p.x + s * w / 2;
        sy = p.y;
        ex = q.x - s * w / 2;
        ey = q.y;
        const bend = Math.max(28, Math.abs(dx) * .18);
        c1x = sx + s * bend;
        c2x = ex - s * bend;
        c1y = sy;
        c2y = ey;
    }
    else {
        const s = Math.sign(dy);
        sx = p.x;
        sy = p.y + s * h / 2;
        ex = q.x;
        ey = q.y - s * h / 2;
        const k = Math.max(35, Math.abs(ey - sy) * .5);
        c1x = sx;
        c1y = sy + s * k;
        c2x = ex;
        c2y = ey - s * k;
    }
    return { d: `M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`, mx: (sx + 3 * c1x + 3 * c2x + ex) / 8, my: (sy + 3 * c1y + 3 * c2y + ey) / 8 };
}

const CARD = { w: 220, h: 86 };

function crossEdgesOf(id) { return DATA.edges.filter(e => (e.a === id || e.b === id) && N.get(e.a).family !== N.get(e.b).family && (!state.strict || e.strict)); }

function renderGraph() {
    const v = getVisible();
    visibleNodes = v.nodes;
    visibleEdges = v.edges;
    ['clusterLayer', 'edgeLayer', 'nodeLayer', 'edgeLabels'].forEach(id => $(id).replaceChildren());
    $('map').classList.remove('tilehover');
    if (state.family === 'all')
        renderOverview();
    else
        renderFamilyGraph();
    renderCrossDock();
    const cross = visibleEdges.filter(e => N.get(e.a).family !== N.get(e.b).family).length;
    $('graphStatus').textContent = `表示 ${visibleNodes.length} 構造 / ${visibleEdges.length} 関係${state.family === 'all' ? ` · 領域をまたぐ関係 ${cross}` : ''}`;
    renderList();
}

function renderFamilyGraph() {
    for (const e of visibleEdges) {
        const p = edgePath(N.get(e.a), N.get(e.b));
        const hi = state.edge ? state.edge === e.id : (e.a === state.selected || e.b === state.selected);
        const k = KINDS[e.kind];
        const path = svgEl('path', { d: p.d, class: `edge ${hi ? 'highlight' : ''} ${state.edge === e.id ? 'selected' : ''}`, stroke: k.color, 'stroke-dasharray': k.dash, ...(!e.undirected ? { 'marker-end': `url(#arrow-${e.kind})` } : {}) });
        const hit = svgEl('path', { d: p.d, class: 'edgehit', 'data-edge': e.id, tabindex: '0', role: 'button', 'aria-label': `${N.get(e.a).name} と ${N.get(e.b).name}: ${e.label}` });
        hit.addEventListener('click', () => selectEdge(e.id));
        hit.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            selectEdge(e.id);
        } });
        const title = svgEl('title', {}, `${N.get(e.a).name} → ${N.get(e.b).name}\n${e.label}`);
        hit.append(title);
        $('edgeLayer').append(path, hit);
        if (state.edge === e.id) {
            const label = svgEl('g');
            let ww = Math.max(80, e.label.length * 11 + 14);
            label.append(svgEl('rect', { x: p.mx - ww / 2, y: p.my - 12, width: ww, height: 24, rx: 5, class: 'edgelabelbg' }), svgEl('text', { x: p.mx, y: p.my + 4, 'text-anchor': 'middle', class: 'edgelabel' }, e.label));
            $('edgeLabels').append(label);
        }
    }
    const cross = crossEdgesOf(state.selected).length;
    for (const n of visibleNodes) {
        const p = pos(n);
        const g = svgEl('g', { class: `node ${state.selected === n.id && !state.edge ? 'selected' : ''}`, transform: `translate(${p.x - CARD.w / 2},${p.y - CARD.h / 2})`, 'data-node': n.id, tabindex: '0', role: 'button', 'aria-label': `${n.name} ${n.formula}` });
        g.append(svgEl('rect', { width: CARD.w, height: CARD.h, rx: 9, class: 'main' }));
        g.append(svgEl('rect', { x: 0, y: 14, width: 3, height: 24, rx: 1.5, fill: DATA.families[n.family].color, class: 'familystripe' }));
        const title = svgEl('text', { x: 14, y: 26, class: 'title' }, n.name);
        if (n.name.length > 15) {
            title.setAttribute('textLength', '191');
            title.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        }
        g.append(title);
        g.append(svgEl('text', { x: 14, y: 47, class: 'formula' }, n.formula.length > 29 ? n.formula.slice(0, 27) + '…' : n.formula));
        const sg = svgEl('text', { x: 14, y: 69, class: 'sg' }, n.sg.length > 32 ? n.sg.slice(0, 30) + '…' : n.sg);
        g.append(sg);
        if (state.comp.includes(n.id)) {
            g.append(svgEl('circle', { cx: 207, cy: 12, r: 7, class: 'comparecircle' }), svgEl('text', { x: 207, y: 15, 'text-anchor': 'middle', fill: '#a7efd7', 'font-size': 9 }, state.comp.indexOf(n.id) + 1));
        }
        if (n.id === state.selected && cross) {
            // Marks that the selected card has neighbours outside this family (listed in the cross-family dock).
            g.append(svgEl('rect', { x: 194, y: 75, width: 42, height: 22, rx: 11, class: 'crossbadge' }), svgEl('text', { x: 215, y: 90, 'text-anchor': 'middle', class: 'crossbadgetext' }, `↗ ${cross}`));
        }
        g.append(svgEl('title', {}, `${n.name}\n${n.formula}\n${n.sg}`));
        g.addEventListener('click', () => { if (panMoved)
            return; selectNode(n.id, false); });
        g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            selectNode(n.id, false);
        } });
        $('nodeLayer').append(g);
    }
    $('graphNote').innerHTML = state.strict ? '<span>群–部分群の確認済み関係のみ</span>' : '<span>構造・矢印をクリックして詳細</span>';
}

// Overview: one tile per family, laid out so every cross-family bundle joins neighbouring tiles without crossings.
const OVERVIEW = { w: 400, h: 340, gx: 150, gy: 130, cols: 3, order: ['fluorite', 'fcc', 'bcc', 'perov', 'hcp', 'rutile'] };

function tileRect(id) { const ids = [...OVERVIEW.order.filter(f => DATA.families[f]), ...Object.keys(DATA.families).filter(f => !OVERVIEW.order.includes(f))], i = ids.indexOf(id), c = i % OVERVIEW.cols, r = Math.floor(i / OVERVIEW.cols); return { x: c * (OVERVIEW.w + OVERVIEW.gx), y: r * (OVERVIEW.h + OVERVIEW.gy), w: OVERVIEW.w, h: OVERVIEW.h }; }

function overviewBounds() { const rs = Object.keys(DATA.families).map(tileRect); return { x1: Math.min(...rs.map(r => r.x)), y1: Math.min(...rs.map(r => r.y)), x2: Math.max(...rs.map(r => r.x + r.w)), y2: Math.max(...rs.map(r => r.y + r.h)) }; }

function clipToRect(r, tx, ty, pad = 10) { const cx = r.x + r.w / 2, cy = r.y + r.h / 2, dx = tx - cx, dy = ty - cy; const t = Math.min(dx ? (r.w / 2 + pad) / Math.abs(dx) : Infinity, dy ? (r.h / 2 + pad) / Math.abs(dy) : Infinity); return [cx + dx * t, cy + dy * t]; }

function bundleKey(a, b) { const ids = Object.keys(DATA.families); return ids.indexOf(a) <= ids.indexOf(b) ? `${a}|${b}` : `${b}|${a}`; }

function bundles() { const m = new Map(); for (const e of visibleEdges) {
    const fa = N.get(e.a).family, fb = N.get(e.b).family;
    if (fa === fb)
        continue;
    const k = bundleKey(fa, fb);
    if (!m.has(k))
        m.set(k, []);
    m.get(k).push(e);
} return m; }

function fitText(text, max) { return text.length > max ? text.slice(0, max - 1) + '…' : text; }

let downTile = null;

function renderOverview() {
    const sel = N.get(state.selected), activeBundle = state.bundle || (state.edge && (() => { const e = E.get(state.edge), fa = N.get(e.a).family, fb = N.get(e.b).family; return fa !== fb ? bundleKey(fa, fb) : null; })());
    for (const [key, list] of bundles()) {
        const [fa, fb] = key.split('|'), ra = tileRect(fa), rb = tileRect(fb);
        const [x1, y1] = clipToRect(ra, rb.x + rb.w / 2, rb.y + rb.h / 2), [x2, y2] = clipToRect(rb, ra.x + ra.w / 2, ra.y + ra.h / 2);
        const gid = `bundle-${fa}-${fb}`, grad = svgEl('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1, y1, x2, y2 });
        grad.append(svgEl('stop', { offset: '0', 'stop-color': DATA.families[fa].color }), svgEl('stop', { offset: '1', 'stop-color': DATA.families[fb].color }));
        const d = `M${x1},${y1} L${x2},${y2}`, on = activeBundle === key;
        const line = svgEl('path', { d, class: `bundle ${on ? 'selected' : ''}`, stroke: `url(#${gid})`, 'stroke-width': 3 + list.length * 2.4, 'data-a': fa, 'data-b': fb });
        const label = `${DATA.families[fa].short} と ${DATA.families[fb].short}：${list.length} 本の関係`;
        const hit = svgEl('path', { d, class: 'bundlehit', tabindex: '0', role: 'button', 'aria-label': label });
        hit.append(svgEl('title', {}, `${label}\n${list.map(e => `${N.get(e.a).name} → ${N.get(e.b).name}`).join('\n')}`));
        hit.addEventListener('click', () => selectBundle(key));
        hit.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            selectBundle(key);
        } });
        $('edgeLayer').append(grad, line, hit);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, pill = svgEl('g', { class: `bundlelabel ${on ? 'selected' : ''}`, 'data-a': fa, 'data-b': fb });
        pill.append(svgEl('rect', { x: mx - 34, y: my - 17, width: 68, height: 34, rx: 17 }), svgEl('text', { x: mx, y: my + 7, 'text-anchor': 'middle' }, `${list.length} 本`));
        $('edgeLabels').append(pill);
    }
    for (const [id, f] of Object.entries(DATA.families)) {
        const r = tileRect(id), all = DATA.nodes.filter(n => n.family === id), shown = visibleNodes.filter(n => n.family === id), ids = new Set(shown.map(n => n.id));
        const current = sel?.family === id;
        const g = svgEl('g', { class: `familytile ${current ? 'current' : ''} ${shown.length ? '' : 'empty'}`, 'data-tile': id, tabindex: '0', role: 'button', 'aria-label': `${f.name}：${shown.length} 構造。開く`, style: `--fam:${f.color}` });
        g.append(svgEl('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 22, class: 'tilebg' }));
        g.append(svgEl('rect', { x: r.x, y: r.y + 30, width: 6, height: 44, rx: 3, fill: f.color }));
        g.append(svgEl('text', { x: r.x + 28, y: r.y + 58, class: 'tiletitle' }, f.short));
        g.append(svgEl('text', { x: r.x + 28, y: r.y + 88, class: 'tilesub' }, fitText(f.subtitle, 21)));
        g.append(svgEl('text', { x: r.x + r.w - 26, y: r.y + 60, 'text-anchor': 'end', class: 'tilecount' }, String(shown.length)));
        // Mini-map of the family, using the same coordinates as the family view.
        const xs = all.map(n => n.x), ys = all.map(n => n.y);
        const bx1 = Math.min(...xs) - CARD.w / 2, bx2 = Math.max(...xs) + CARD.w / 2, by1 = Math.min(...ys) - CARD.h / 2, by2 = Math.max(...ys) + CARD.h / 2;
        const area = { x: r.x + 24, y: r.y + 112, w: r.w - 48, h: r.h - 172 }, s = Math.min(area.w / (bx2 - bx1), area.h / (by2 - by1));
        const ox = area.x + (area.w - (bx2 - bx1) * s) / 2 - bx1 * s, oy = area.y + (area.h - (by2 - by1) * s) / 2 - by1 * s;
        const mini = svgEl('g', { class: 'minimap' });
        for (const e of visibleEdges)
            if (ids.has(e.a) && ids.has(e.b))
                mini.append(svgEl('line', { x1: ox + N.get(e.a).x * s, y1: oy + N.get(e.a).y * s, x2: ox + N.get(e.b).x * s, y2: oy + N.get(e.b).y * s, class: 'miniedge' }));
        for (const n of shown)
            mini.append(svgEl('rect', { x: ox + (n.x - CARD.w / 2) * s, y: oy + (n.y - CARD.h / 2) * s, width: CARD.w * s, height: CARD.h * s, rx: 4, class: `mininode ${n.id === state.selected ? 'sel' : ''}` }));
        g.append(mini);
        const degree = n => visibleEdges.filter(e => e.a === n.id || e.b === n.id).length;
        const reps = [...shown].sort((a, b) => degree(b) - degree(a)).slice(0, 3).map(n => n.name).join(' · ');
        g.append(svgEl('text', { x: r.x + 28, y: r.y + r.h - 26, class: 'tilereps' }, shown.length ? fitText(reps, 24) : 'この絞り込みでは該当なし'));
        g.append(svgEl('title', {}, `${f.name}\n${f.subtitle}${current ? `\n選択中：${sel.name}` : ''}\nクリックで開く`));
        g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            family(id);
        } });
        g.addEventListener('pointerenter', () => { $('map').classList.add('tilehover'); document.querySelectorAll('#map .bundle,#map .bundlelabel').forEach(b => b.classList.toggle('lit', b.dataset.a === id || b.dataset.b === id)); });
        g.addEventListener('pointerleave', () => $('map').classList.remove('tilehover'));
        $('nodeLayer').append(g);
    }
    $('graphNote').innerHTML = `${state.strict ? '<span>群–部分群の確認済み関係のみ</span>' : ''}<span>ファミリーをクリックして中へ</span><span>線の数字は領域をまたぐ関係の本数</span>`;
}

function selectBundle(key) { revealInspector(); state.bundle = key; state.edge = null; renderGraph(); renderBundle(key); }

function renderBundle(key) { modelView?.destroy(); modelView = null; const [fa, fb] = key.split('|'), A = DATA.families[fa], B = DATA.families[fb], list = bundles().get(key) || []; $('inspector').innerHTML = `<div class="inspecthead"><div class="eyebrow">CROSS-FAMILY / 領域をまたぐ関係</div><h2 style="font-size:19px"><span style="color:${A.color}">${esc(A.short)}</span> ↔ <span style="color:${B.color}">${esc(B.short)}</span></h2><div class="muted smalltext">${list.length} 本の関係。矢印を選ぶと詳細を表示します。</div><div class="row" style="margin-top:11px"><button class="small" data-family="${fa}">${esc(A.short)} を開く</button><button class="small" data-family="${fb}">${esc(B.short)} を開く</button></div></div><div class="inspectbody"><div class="relationlist">${list.map(e => { const a = N.get(e.a), b = N.get(e.b); return `<button class="relationitem" data-relation="${e.id}"><div><span style="color:${KINDS[e.kind].color}">${e.undirected ? '↔' : '→'}</span> ${esc(a.name)} ${e.undirected ? '↔' : '→'} ${esc(b.name)}<small>${esc(e.label)} · ${esc(KINDS[e.kind].name)}</small></div><span class="relarr">›</span></button>`; }).join('')}</div><div class="detailsection"><div class="note">ファミリーは本アトラスの編集上の分類です。領域をまたぐ関係は、分類の境界が一つの見方にすぎないことを示します。</div></div></div>`; $('inspector').scrollTop = 0; }

function renderCrossDock() { const dock = $('crossDock'), list = state.family === 'all' ? [] : crossEdgesOf(state.selected); dock.hidden = !list.length; if (!list.length)
    return; $('crossCount').textContent = list.length; $('crossList').innerHTML = list.map(e => { const out = e.a === state.selected, other = N.get(out ? e.b : e.a), f = DATA.families[other.family], k = KINDS[e.kind]; return `<button class="crossitem" data-jump="${other.id}" title="${esc(N.get(state.selected).name)} ${e.undirected ? '↔' : out ? '→' : '←'} ${esc(other.name)}：${esc(e.label)}（${esc(f.short)} へ移動）"><span class="crossarrow" style="color:${k.color}">${e.undirected ? '↔' : out ? '→' : '←'}</span>${esc(other.name)}<i class="dot" style="background:${f.color}" aria-hidden="true"></i><small>${esc(f.short)}</small></button>`; }).join(''); }

function renderSide() { if (state.edge)
    renderEdge(E.get(state.edge));
else if (state.bundle)
    renderBundle(state.bundle);
else
    renderInspector(); }

function initDefs() { for (const [key, k] of Object.entries(KINDS)) {
    const m = svgEl('marker', { id: `arrow-${key}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
    m.append(svgEl('path', { d: 'M0 0L10 5L0 10Z', fill: k.color }));
    $('mapDefs').append(m);
} }

const cam = { x: 0, y: 0, k: 1 };

function applyCam() { $('viewport').setAttribute('transform', `translate(${cam.x},${cam.y}) scale(${cam.k})`); $('zoomText').textContent = Math.round(cam.k * 100) + '%'; }

function fitMap() { if (state.tab !== 'explore' || state.view !== 'map')
    return; const r = $('map').getBoundingClientRect(); if (!r.width || !r.height)
    return; if (state.family === 'all') {
    // Screen space reserved for the note chips above and the zoom controls below.
    const b = overviewBounds(), pad = 30, top = 44, bottom = 64, h = r.height - top - bottom;
    cam.k = Math.min((r.width - pad * 2) / (b.x2 - b.x1), (h - pad) / (b.y2 - b.y1), 1.25);
    cam.x = r.width / 2 - (b.x1 + b.x2) / 2 * cam.k;
    cam.y = top + h / 2 - (b.y1 + b.y2) / 2 * cam.k;
    applyCam();
    return;
} let points = visibleNodes.map(pos); if (!points.length) {
    cam.x = r.width / 2;
    cam.y = r.height / 2;
    cam.k = 1;
    applyCam();
    return;
} let x1 = Math.min(...points.map(p => p.x)) - 140, x2 = Math.max(...points.map(p => p.x)) + 140, y1 = Math.min(...points.map(p => p.y)) - 90, y2 = Math.max(...points.map(p => p.y)) + 105; const top = 40, h = r.height - top; cam.k = Math.min(r.width / (x2 - x1), h / (y2 - y1), 1.25) * .96; cam.x = r.width / 2 - (x1 + x2) / 2 * cam.k; cam.y = top + h / 2 - (y1 + y2) / 2 * cam.k; applyCam(); }

function zoom(f, cx, cy) { const r = $('map').getBoundingClientRect(); cx ??= r.width / 2; cy ??= r.height / 2; const old = cam.k; cam.k = Math.max(.13, Math.min(3.8, cam.k * f)); cam.x = cx - (cx - cam.x) * cam.k / old; cam.y = cy - (cy - cam.y) * cam.k / old; applyCam(); }

let pointers = new Map(), panStart = null, panMoved = false, pinch = null;

$('map').addEventListener('pointerdown', ev => { const r = $('map').getBoundingClientRect(); pointers.set(ev.pointerId, { x: ev.clientX - r.left, y: ev.clientY - r.top }); panMoved = false; if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    panStart = null;
    ev.preventDefault();
    return;
} downTile = pointers.size === 1 ? ev.target.closest('[data-tile]')?.dataset.tile : null; if (ev.target.closest('.node,.edgehit,.bundlehit'))
    return; panStart = { x: ev.clientX, y: ev.clientY, cx: cam.x, cy: cam.y }; $('map').setPointerCapture(ev.pointerId); $('map').classList.add('dragging'); });

$('map').addEventListener('pointermove', ev => { if (!pointers.has(ev.pointerId))
    return; const r = $('map').getBoundingClientRect(); pointers.set(ev.pointerId, { x: ev.clientX - r.left, y: ev.clientY - r.top }); if (pointers.size === 2 && pinch) {
    const [a, b] = [...pointers.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y), x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
    zoom(dist / pinch.dist, x, y);
    cam.x += x - pinch.x;
    cam.y += y - pinch.y;
    applyCam();
    pinch = { dist, x, y };
    panMoved = true;
    return;
} if (!panStart)
    return; const dx = ev.clientX - panStart.x, dy = ev.clientY - panStart.y; if (Math.hypot(dx, dy) > 3)
    panMoved = true; cam.x = panStart.cx + dx; cam.y = panStart.cy + dy; applyCam(); });

function endPointer(ev) { pointers.delete(ev.pointerId); if (pointers.size < 2)
    pinch = null; panStart = null; $('map').classList.remove('dragging'); setTimeout(() => panMoved = false, 100); }

$('map').addEventListener('pointerup', ev => { const tile = downTile; downTile = null; const moved = panMoved; endPointer(ev); if (tile && !moved)
    family(tile); });

$('map').addEventListener('pointercancel', endPointer);

$('map').addEventListener('wheel', ev => { ev.preventDefault(); const r = $('map').getBoundingClientRect(); zoom(Math.exp(-ev.deltaY * .0013), ev.clientX - r.left, ev.clientY - r.top); }, { passive: false });

function renderList() { $('listView').innerHTML = `<table class="structuretable"><thead><tr><th>構造・代表組成</th><th>対称性／結晶系</th><th>占有率 T / O</th></tr></thead><tbody>${visibleNodes.map(n => `<tr data-listnode="${n.id}" tabindex="0" class="${state.selected === n.id ? 'selected' : ''}"><td>${esc(n.name)}<small>${esc(n.formula)}</small></td><td>${esc(n.sg)}</td><td class="mono">${n.occ ? n.occ.map(frac).join(' / ') : '—'}</td></tr>`).join('')}</tbody></table>`; }

function mode(view) { state.view = view; $('graphStage').hidden = view !== 'map'; $('listView').hidden = view !== 'list'; $('mapMode').classList.toggle('active', view === 'map'); $('listMode').classList.toggle('active', view === 'list'); if (view === 'map')
    requestAnimationFrame(fitMap); }

function relationHTML(n) { const list = DATA.edges.filter(e => (e.a === n.id || e.b === n.id) && (!state.strict || e.strict)); if (!list.length)
    return '<p class="smalltext muted">この絞り込みでは接続がありません。</p>'; return list.map(e => { const other = N.get(e.a === n.id ? e.b : e.a), out = e.a === n.id; return `<button class="relationitem" data-relation="${e.id}"><div><span style="color:${KINDS[e.kind].color}">${e.undirected ? '↔' : out ? '→' : '←'}</span> ${esc(other.name)}${other.family !== n.family ? '<span style="color:#8ac0ce"> ↗</span>' : ''}<small>${esc(e.label)}</small></div><span class="relarr">›</span></button>`; }).join(''); }

function renderInspector() { modelView?.destroy(); modelView = null; const n = N.get(state.selected); if (!n)
    return; const f = DATA.families[n.family]; $('inspector').innerHTML = `<div class="inspecthead"><div class="row"><button class="small flat mobilenavnote" data-backmap="true">地図へ ↑</button><span class="eyebrow" style="color:${f.color}">${esc(f.short)} / STRUCTURE</span><span class="spacer"></span><button class="small flat" data-compare="${n.id}">${state.comp.includes(n.id) ? '比較から外す' : '＋ 比較'}</button></div><h2>${esc(n.name)}</h2><div class="formula">${esc(n.formula)}</div></div><div class="inspectbody"><p class="desc">${esc(n.desc)}</p>${n.model ? '<div class="inspectmodel"><canvas id="miniCanvas"></canvas></div><div class="modelcaption">ドラッグで回転 / 理想化したサイト模型。CIF・実測値ではありません。</div>' : ''}<div class="detailsection"><h3>構造を記述する</h3><div class="facts"><div class="fact"><div class="key">空間群・対称性</div><div class="value mono">${esc(n.sg)}</div></div><div class="fact"><div class="key">基準となる骨格</div><div class="value">${esc(n.packing)}</div></div><div class="fact"><div class="key">配位環境</div><div class="value">${esc(n.coord)}</div></div><div class="fact"><div class="key">多面体・部分構造の連結</div><div class="value">${esc(n.link)}</div></div></div></div>${n.occ ? `<div class="detailsection"><h3>全空隙を分母にした占有率</h3><div class="occgrid">${n.occ.map((o, i) => `<div class="occrow"><span>${i ? 'O' : 'T'}孔</span><div class="occbar"><i style="width:${o * 100}%"></i></div><span class="mono">${frac(o)}</span></div>`).join('')}</div><div class="occbase">基準粒子：${esc(n.host)}。T孔2N個・O孔N個を分母に数えます。</div></div>` : ''}${n.note ? `<div class="detailsection"><div class="note">${esc(n.note)}</div></div>` : ''}<div class="detailsection"><h3>つながる構造 <span class="muted">/ 矢印の詳細へ</span></h3><div class="relationlist">${relationHTML(n)}</div></div><div class="detailsection"><h3>参考資料</h3><div class="refchips">${refHTML(n.refs)}</div></div>${LABPRESETS.some(p => p.id === n.id) ? `<button data-openlab="${n.id}" class="small" style="margin-top:18px;width:100%">４副格子の模型で見る ↗</button>` : ''}</div>`; if (n.model) {
    modelView = new CrystalView($('miniCanvas'));
    modelView.set(modelFor(n.model));
} }

function renderEdge(e) { modelView?.destroy(); modelView = null; const a = N.get(e.a), b = N.get(e.b), k = KINDS[e.kind]; $('inspector').innerHTML = `<div class="inspecthead"><div class="eyebrow" style="color:${k.color}">RELATION / ${k.name}</div><h2 style="font-size:19px">${esc(e.label)}</h2><div class="row" style="margin-top:11px"><button class="small" data-jump="${a.id}">${esc(a.name)}</button><span>${e.undirected ? '↔' : '→'}</span><button class="small" data-jump="${b.id}">${esc(b.name)}</button></div></div><div class="inspectbody"><p class="desc">${esc(e.desc)}</p>${e.strict ? `<div class="detailsection"><span class="badge good">文献で確認した群–部分群関係</span></div><div class="detailsection"><div class="facts"><div class="fact"><div class="key">対称性の対応</div><div class="value mono">${esc(a.sg)} → ${esc(b.sg)}</div></div><div class="fact"><div class="key">部分群の種類と指数</div><div class="value mono">${esc(e.index)}</div></div><div class="fact"><div class="key">基底・原点・セル</div><div class="value">${esc(e.basis)}</div></div><div class="fact"><div class="key">サイト・Wyckoff位置の対応</div><div class="value">${esc(e.split)}</div></div></div></div>` : `<div class="detailsection"><div class="note">この線は「${k.name}」を示します。本版では群–部分群指数、基底・原点、全原子位置の変換を検証した矢印としては扱いません。</div></div>`}${e.warning ? `<div class="detailsection"><div class="note warn">${esc(e.warning)}</div></div>` : ''}<div class="detailsection"><div class="note warn">構造の関係と、実際の反応・相転移は別です。矢印の向きは記述上の派生方向であり、実行可能な変換や安定性を保証しません。</div></div><div class="detailsection"><h3>この関係の出典</h3><div class="refchips">${refHTML(e.refs)}</div></div><button class="small" data-comparepair="${a.id},${b.id}" style="margin-top:18px;width:100%">２つの構造を比較する →</button><button class="small flat" data-jump="${state.selected}" style="margin-top:8px;width:100%">構造カードに戻る</button></div>`; $('inspector').scrollTop = 0; }

function search() { const q = normalize($('search').value); if (!q) {
    $('searchResults').innerHTML = '';
    return;
} const hits = DATA.nodes.filter(n => normalize([n.name, n.formula, n.aliases, n.sg, n.desc].join(' ')).includes(q)).sort((a, b) => (normalize(b.name).includes(q) ? 1 : 0) - (normalize(a.name).includes(q) ? 1 : 0)); $('searchResults').innerHTML = hits.slice(0, 14).map(n => `<button data-searchnode="${n.id}">${esc(n.name)}<small>${esc(n.formula)} · ${esc(DATA.families[n.family].short)}</small></button>`).join('') || '<p class="smalltext muted" style="padding:10px">一致する構造はありません。</p>'; }

function toggleCompare(id) { if (state.comp.includes(id))
    state.comp = state.comp.filter(i => i !== id);
else if (state.comp.length < 2)
    state.comp.push(id);
else {
    toast('比較は２構造までです。トレイから一つ外してください。');
    return;
} renderTray(); renderGraph(); renderSide(); }

function renderTray() { $('compareTray').hidden = !state.comp.length; $('trayItems').innerHTML = state.comp.map((id, i) => `<span class="pill">${i + 1} ${esc(N.get(id).name)}<button data-compare="${id}" aria-label="比較から外す">×</button></span>`).join(''); $('compareOpen').disabled = state.comp.length !== 2; }

function shortest(a, b) { return shortestPath(DATA.edges, a, b, state.strict); }

function openModal(title, html) { lastFocus = document.activeElement; $('modalTitle').textContent = title; $('modalBody').innerHTML = html; $('modalBackdrop').hidden = false; document.body.style.overflow = 'hidden'; $('closeModal').focus(); }

function closeModal() { $('modalBackdrop').hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); }

function compare() { if (state.comp.length !== 2)
    return; const [a, b] = state.comp.map(id => N.get(id)); const rows = [['対称性', 'sg'], ['骨格', 'packing'], ['配位環境', 'coord'], ['連結', 'link'], ['要点', 'desc']]; let path = shortest(a.id, b.id); openModal('構造を並べて比較', `<table class="comparetable"><tbody><tr><th>構造</th>${[a, b].map(n => `<td><div class="comptitle">${esc(n.name)}</div><div class="mono muted">${esc(n.formula)}</div></td>`).join('')}</tr>${rows.map(([label, key]) => `<tr><th>${label}</th><td>${esc(a[key])}</td><td>${esc(b[key])}</td></tr>`).join('')}<tr><th>T / O孔<br>占有率</th>${[a, b].map(n => `<td>${n.occ ? `<b class="mono">${n.occ.map(frac).join(' / ')}</b><br><span class="muted">基準：${esc(n.host)}</span>` : 'この記述では未設定'}</td>`).join('')}</tr><tr><th>出典</th>${[a, b].map(n => `<td><div class="refchips">${refHTML(n.refs)}</div></td>`).join('')}</tr></tbody></table><div style="margin-top:22px"><h3>地図上の接続経路 ${state.strict ? '<span class="badge">群–部分群のみ</span>' : ''}</h3><div class="pathsteps">${path ? path.map((id, i) => `${i ? '<span class="arrow">—</span>' : ''}<button data-pathnode="${id}">${esc(N.get(id).name)}</button>`).join('') : 'このデータと絞り込み条件では接続経路がありません。'}</div><p class="note">関係の向きを問わず、このアトラス内の最短接続列を探しています。相転移経路、共通のaristotype、実際の原子移動を示すものではありません。</p></div>`); }

function routes() { openModal('構造をたどる６つの学習ルート', `<p class="muted smalltext" style="margin-bottom:17px">各構造名からカードへ移動します。学習の順番であって、連続した相転移の順番ではありません。</p><div class="routecards">${ROUTES.map(r => `<div class="routecard"><h3>${r.title}</h3><p>${r.desc}</p><div class="row">${r.ids.map(id => `<button data-pathnode="${id}">${esc(N.get(id).name)} ↗</button>`).join('')}</div></div>`).join('')}</div>`); }

function renderSources() { $('sources').innerHTML = Object.entries(DATA.sources).map(([id, s]) => `<article class="sourcecard" id="source-${id}"><div class="sourceid">[${id}]</div><div><h3>${esc(s.title)}</h3><p>${esc(s.author)} · ${s.year}<br>${esc(s.edition)}</p><p>${esc(s.coverage)}</p>${s.filename ? `<div class="filehint">${esc(s.filename)}</div>` : ''}<div id="sourcePage-${id}" class="sourcepage" hidden></div></div><div class="sourceactions">${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">公開PDFを開く ↗</a>` : `<button data-pdf="${id}">お手元のPDFを関連付ける</button><input type="file" accept="application/pdf,.pdf" id="pdf-${id}" data-pdffile="${id}" hidden><span id="pdfStatus-${id}" class="muted smalltext">未関連付け · ローカル処理</span>`}</div></article>`).join(''); }

function openSource(id, p) { const s = DATA.sources[id]; if (!s)
    return; const page = Number(p) + s.offset; if (s.url || PDFS[id]) {
    window.open((PDFS[id] || s.url).split('#')[0] + '#page=' + page, '_blank', 'noopener');
    return;
} if (!$('modalBackdrop').hidden)
    closeModal(); tab('guide'); const el = $('sourcePage-' + id); el.hidden = false; el.textContent = `参照箇所：印刷 p.${p} ／ PDF ${page}ページ。下のボタンでPDFを関連付けると、このページを開けます。`; el.dataset.pdfpage = page; $('source-' + id).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); }

function updateLab() { const p = LABPRESETS.find(p => p.id === state.lab) || LABPRESETS[0]; $('labSelect').value = p.id; $('labModelName').textContent = p.label; $('labModelFormula').textContent = p.formula; $('labDesc').textContent = p.desc; const coords = ['(0, 0, 0)', '(½, ½, ½)', '(¼, ¼, ¼)', '(¾, ¾, ¾)']; $('siteLegend').innerHTML = p.els.map((el, i) => `<div class="sitecard ${!state.subVisible[i] ? 'off' : ''}"><header><label><input type="checkbox" data-sub="${i}" ${state.subVisible[i] ? 'checked' : ''}><i class="sitedot" style="background:${SITE_COLORS[i]}"></i><b>${'ABCD'[i]}</b></label></header><div class="element" style="color:${SITE_COLORS[i]}">${el || '□'}</div><div class="xyz">${coords[i]}</div><div class="status">${el ? '4 原子 / 共通セル' : '4 空サイト / 共通セル'}</div></div>`).join(''); const count = {}; p.els.filter(Boolean).forEach(el => count[el] = (count[el] || 0) + 4); $('labCount').textContent = '周期セル内の内訳：' + Object.entries(count).map(([el, num]) => `${el} ${num}`).join(' + ') + `　（合計 ${p.els.filter(Boolean).length * 4} 原子）`; $('labRefs').innerHTML = refHTML([{ s: 'M06', p: 161, sec: 'Fig.15.3' }, { s: 'K', p: 160, sec: '図7' }]); $('labPresets').innerHTML = LABPRESETS.map(l => `<button data-labpreset="${l.id}" class="${p.id === l.id ? 'active' : ''}">${l.label}</button>`).join(''); if (labView) {
    labView.visible = state.subVisible;
    labView.labels = $('labLabels').checked;
    labView.set(fourFCC(p, true));
} }

function updateOccupancy(key) { if (key) {
    state.occPreset = key;
    state.t = OCCPRESETS[key].t;
    state.o = OCCPRESETS[key].o;
    $('tetraSlider').value = state.t;
    $('octaSlider').value = state.o;
} const p = OCCPRESETS[state.occPreset]; $('occupancyPresets').innerHTML = Object.entries(OCCPRESETS).map(([id, o]) => `<button data-occpreset="${id}" class="${id === state.occPreset ? 'active' : ''}">${o.name}</button>`).join(''); $('tetraValue').textContent = frac(state.t); $('octaValue').textContent = frac(state.o); const r = 2 * state.t + state.o; $('occupancyResult').textContent = Number(r.toFixed(3)); $('occupancyEquation').textContent = `2 × ${frac(state.t)} + ${frac(state.o)} = ${frac(r)}`; $('occupancyTitle').textContent = p ? p.title : '任意の占有率を数える'; $('occupancyDesc').textContent = p ? p.desc : 'これは幾何学的な数え上げです。この数値から構造名は決まりません。占有サイトの選び方、周期性、骨格の歪み、元素の種類を指定する必要があります。'; $('occupancyRefs').innerHTML = refHTML(p ? p.refs : [{ s: 'M13', p: 168, sec: '§13.1' }]); }

// Events. All user-supplied strings are rendered as text; there are no remote calls.
document.addEventListener('click', ev => { const b = ev.target.closest('button,a,tr[data-listnode]'); if (!b)
    return; const d = b.dataset; if (d.backmap)
    $('graphStage').scrollIntoView({ behavior: 'smooth', block: 'center' }); if (d.tab)
    tab(d.tab); if (d.family)
    family(d.family); if (d.searchnode)
    selectNode(d.searchnode); if (d.listnode)
    selectNode(d.listnode, false); if (d.relation)
    selectEdge(d.relation); if (d.jump)
    selectNode(d.jump); if (d.compare)
    toggleCompare(d.compare); if (d.comparepair) {
    state.comp = d.comparepair.split(',');
    renderTray();
    renderGraph();
    compare();
} if (d.pathnode) {
    closeModal();
    state.strict = false;
    $('strictFilter').checked = false;
    selectNode(d.pathnode);
    family(N.get(d.pathnode).family);
    selectNode(d.pathnode, false);
} if (d.source)
    openSource(d.source, Number(d.page)); if (d.pdf)
    $('pdf-' + d.pdf).click(); if (d.openlab) {
    state.lab = d.openlab;
    state.subVisible = [true, true, true, true];
    tab('lab');
} if (d.labpreset) {
    state.lab = d.labpreset;
    state.subVisible = [true, true, true, true];
    updateLab();
} if (d.occpreset)
    updateOccupancy(d.occpreset); });

document.addEventListener('keydown', ev => { if (ev.key === 'Escape') {
    closeModal();
    $('searchResults').innerHTML = '';
} if (ev.target.matches('tr[data-listnode]') && ev.key === 'Enter')
    selectNode(ev.target.dataset.listnode, false); if (!$('modalBackdrop').hidden && ev.key === 'Tab') {
    const f = [...$('modalBackdrop').querySelectorAll('button,a,input,select,[tabindex="0"]')].filter(e => !e.disabled);
    if (ev.shiftKey && document.activeElement === f[0]) {
        ev.preventDefault();
        f.at(-1).focus();
    }
    else if (!ev.shiftKey && document.activeElement === f.at(-1)) {
        ev.preventDefault();
        f[0].focus();
    }
} });

$('search').addEventListener('input', search);

$('search').addEventListener('keydown', ev => { if (ev.key === 'Enter') {
    const b = $('searchResults').querySelector('button');
    if (b)
        b.click();
} });

$('strictFilter').addEventListener('change', ev => { state.strict = ev.target.checked; state.edge = null; state.bundle = null; renderGraph(); renderInspector(); requestAnimationFrame(fitMap); });

$('zoomIn').onclick = () => zoom(1.25);

$('zoomOut').onclick = () => zoom(.8);

$('fitMap').onclick = fitMap;

$('mapMode').onclick = () => mode('map');

$('listMode').onclick = () => mode('list');

// Edge-anchored side panels can be collapsed to give the map more room. The choice is a per-viewer convenience.
const PANEL_KEY = 'crystal-atlas:panels';

function setPanel(side, open, save = true) { const ws = document.querySelector('.workspace'), btn = $(side === 'left' ? 'toggleLeft' : 'toggleRight'); ws.classList.toggle(`hide-${side}`, !open); btn.setAttribute('aria-expanded', String(open)); btn.classList.toggle('active', open); btn.title = `${side === 'left' ? '検索・絞り込み' : '詳細'}パネルを${open ? '隠す' : '表示'} ( ${side === 'left' ? '[' : ']'} )`; if (save)
    try {
        localStorage.setItem(PANEL_KEY, JSON.stringify({ left: !ws.classList.contains('hide-left'), right: !ws.classList.contains('hide-right') }));
    }
    catch { } }

function togglePanel(side) { setPanel(side, document.querySelector('.workspace').classList.contains(`hide-${side}`)); }

$('toggleLeft').onclick = () => togglePanel('left');

$('toggleRight').onclick = () => togglePanel('right');

try {
    const saved = JSON.parse(localStorage.getItem(PANEL_KEY) || '{}');
    setPanel('left', saved.left !== false, false);
    setPanel('right', saved.right !== false, false);
}
catch {
    setPanel('left', true, false);
    setPanel('right', true, false);
}

document.addEventListener('keydown', ev => { if (state.tab !== 'explore' || ev.metaKey || ev.ctrlKey || ev.altKey || !$('modalBackdrop').hidden || ev.target.closest('input,select,textarea,[contenteditable]'))
    return; if (ev.key === '[') {
    ev.preventDefault();
    togglePanel('left');
} if (ev.key === ']') {
    ev.preventDefault();
    togglePanel('right');
} });

$('compareOpen').onclick = compare;

$('compareClear').onclick = () => { state.comp = []; renderTray(); renderGraph(); renderSide(); };

$('routesBtn').onclick = routes;

$('sidebarRoute').onclick = routes;

$('closeModal').onclick = closeModal;

$('modalBackdrop').addEventListener('click', ev => { if (ev.target === $('modalBackdrop'))
    closeModal(); });

$('labSelect').addEventListener('change', ev => { state.lab = ev.target.value; state.subVisible = [true, true, true, true]; updateLab(); });

$('labLabels').onchange = () => { if (labView) {
    labView.labels = $('labLabels').checked;
    labView.draw();
} };

$('labReset').onclick = () => labView?.reset();

$('labToNode').onclick = () => selectNode(state.lab);

document.addEventListener('change', ev => { if (ev.target.dataset.sub !== undefined) {
    state.subVisible[Number(ev.target.dataset.sub)] = ev.target.checked;
    updateLab();
} if (ev.target.dataset.pdffile) {
    const id = ev.target.dataset.pdffile, f = ev.target.files[0];
    if (!f)
        return;
    if (!f.name.toLowerCase().endsWith('.pdf')) {
        toast('PDFファイルを選択してください。');
        return;
    }
    if (PDFS[id])
        URL.revokeObjectURL(PDFS[id]);
    PDFS[id] = URL.createObjectURL(f);
    $('pdfStatus-' + id).textContent = '関連付け済み：' + f.name;
    $('pdfStatus-' + id).style.color = '#8fddbf';
    const pageEl = $('sourcePage-' + id);
    if (pageEl.dataset.pdfpage) {
        const p = pageEl.dataset.pdfpage;
        pageEl.innerHTML = `PDF ${esc(p)}ページを開く準備ができました。 <a href="${PDFS[id]}#page=${esc(p)}" target="_blank" rel="noopener">該当箇所を開く ↗</a>`;
    }
    toast('PDFをこのページ内で関連付けました。');
} });

['tetraSlider', 'octaSlider'].forEach(id => $(id).addEventListener('input', () => { state.t = Number($('tetraSlider').value); state.o = Number($('octaSlider').value); state.occPreset = null; updateOccupancy(); }));

$('exportBtn').onclick = () => { const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json;charset=utf-8' }), u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = 'crystal-atlas-data-v1.json'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1500); toast('出典を含む構造・関係データを書き出しました。'); };

$('nodeCount').textContent = $('sideNodeCount').textContent = DATA.nodes.length;

$('edgeCount').textContent = $('sideEdgeCount').textContent = DATA.edges.length;

$('strictCount').textContent = DATA.edges.filter(e => e.strict).length;

$('legend').innerHTML = Object.entries(KINDS).map(([id, k]) => `<div class="legenditem"><span class="linemark" style="border-color:${k.color};border-top-style:${id === 'symmetry' ? 'solid' : id === 'analogy' ? 'dotted' : 'dashed'}"></span>${k.name}</div>`).join('');

$('guideKinds').innerHTML = Object.entries(KINDS).filter(([id]) => id !== 'symmetry').map(([id, k]) => `<div class="guideitem"><strong style="color:${k.color}">${k.name}</strong><div>${k.meaning}</div></div>`).join('');

$('guideSymRefs').innerHTML = refHTML([{ s: 'M06', p: 216, sec: '§18.3' }, { s: 'M13', p: 4, sec: '§1.2' }, { s: 'M06', p: 21, sec: '§3.3' }]);

$('labSelect').innerHTML = LABPRESETS.map(p => `<option value="${p.id}">${p.label} — ${p.formula}</option>`).join('');

initDefs();

renderSources();

renderFamily();

renderGraph();

renderInspector();

updateOccupancy('spinel');

new ResizeObserver(() => { if (state.tab === 'explore' && state.view === 'map')
    requestAnimationFrame(fitMap); }).observe($('graphStage'));

requestAnimationFrame(fitMap);

// Expose only read-only diagnostics useful for validating the embedded dataset.
window.atlasDiagnostics = () => ({ nodes: DATA.nodes.length, edges: DATA.edges.length, strict: DATA.edges.filter(e => e.strict).length, shownNodes: visibleNodes.length, shownEdges: visibleEdges.length, selected: state.selected, family: state.family, tab: state.tab, models: DATA.nodes.filter(n => n.model).length });
