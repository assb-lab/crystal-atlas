/** Atlas UI: graph interaction, inspectors, comparison, sources, and controls. */
import { DATA } from "./data/atlas.js";
import { KINDS, ROUTES, LABPRESETS, OCCPRESETS } from "./data/presets.js";
import { esc, frac, normalize, shortestPath, sourcePdfPage } from "./utils.js";
import { CrystalView, modelFor, fourFCC, SITE_COLORS } from "./viewer.js";
import { modelPanelHTML, mountModelPanel, viewDirectionControls } from "./model-panels.js";
import { derivationPositions } from "./flow-layout.js";

'use strict';

const $ = id => document.getElementById(id), N = new Map(DATA.nodes.map(n => [n.id, n])), E = new Map(DATA.edges.map(e => [e.id, e]));

const state = { tab: 'explore', family: 'fcc', flow: null, collection: null, selected: 'fcc', edge: null, strict: false, view: 'map', comp: [], lab: 'heusler', subVisible: [true, true, true, true], t: .125, o: .5, occPreset: 'spinel' };

let modelView = null, labView = null, comparisonViews = [], visibleNodes = [], visibleEdges = [], lastFocus = null;
let graphPositions = new Map();

const PDFS = {};

function refHTML(refs) {
    return refs.map(ref => {
        const source = DATA.sources[ref.s];
        if (ref.p === undefined) {
            return `<a class="refchip" href="${esc(ref.url ?? source.article)}" target="_blank" rel="noopener" title="${esc(source.citation ?? source.title)}">${esc(source.short)} ↗<span>${esc(ref.sec)}</span></a>`;
        }
        const page = sourcePdfPage(source, ref);
        return `<button class="refchip" data-source="${ref.s}" data-page="${ref.p}" data-pdfpage="${page}" title="${esc(source.citation ?? source.title)}">${esc(source.short)} · p.${ref.p}<span>${esc(ref.sec)} / PDF ${page}</span></button>`;
    }).join('');
}

function toast(s) { $('toast').textContent = s; $('toast').hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').hidden = true, 3500); }

function tab(id) { state.tab = id; document.querySelectorAll('.tabpage').forEach(p => p.hidden = p.id !== id); document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === id)); if (id === 'explore') {
    requestAnimationFrame(() => { readMap(); modelView?.draw(); });
} if (id === 'lab') {
    if (!labView)
        labView = new CrystalView($('labcanvas'), true);
    updateLab();
    requestAnimationFrame(() => labView.draw());
} }

function family(id, fit = true) { state.flow = null; state.collection = null; state.family = id; state.edge = null; const nodes = DATA.nodes.filter(n => id === 'all' || n.family === id); if (!nodes.some(n => n.id === state.selected))
    state.selected = nodes.find(n => n.id === id)?.id || nodes[0]?.id; renderFamily(); renderGraph(); renderInspector(); if (fit)
    requestAnimationFrame(readMap); }

function selectNode(id, jump = true) { if (!N.has(id))
    return; if (state.strict && !DATA.edges.some(e => e.strict && (e.a === id || e.b === id))) {
    state.strict = false;
    $('strictFilter').checked = false;
    toast('この構造の関係を表示するため、絞り込みを解除しました。');
} state.selected = id; state.edge = null; if (jump && (state.flow || state.collection ? !visibleNodes.some(n => n.id === id) : state.family !== 'all' && N.get(id).family !== state.family)) {
    state.flow = null;
    state.collection = null;
    state.family = N.get(id).family;
    renderFamily();
}
    renderGraph(); renderInspector(); $('searchResults').innerHTML = ''; if (jump) requestAnimationFrame(readMap); if (state.tab !== 'explore')
    tab('explore'); if (innerWidth <= 700)
    requestAnimationFrame(() => $('inspector').scrollIntoView({ behavior: 'smooth', block: 'start' })); }

function selectEdge(id) { const e = visibleEdges.find(edge => edge.id === id) ?? E.get(id); if (!e)
    return; state.edge = id; renderGraph(); renderEdge(e); }

function openClassification(id) {
    const collection = DATA.collections.find(item => item.id === id);
    if (!collection) {
        family(state.family);
        return;
    }
    document.querySelector('.sidebar').scrollTop = 0;
    state.collection = collection;
    state.flow = null;
    state.selected = collection.ids[0];
    state.edge = null;
    state.strict = false;
    $('strictFilter').checked = false;
    renderFamily();
    renderGraph();
    renderInspector();
    mode('map');
}

function renderClassification() {
    const collection = state.collection;
    const panel = $('classificationInfo');
    $('classification').value = collection?.id ?? '';
    panel.hidden = !collection;
    if (!collection) {
        panel.replaceChildren();
        return;
    }
    const children = DATA.collections.filter(item => item.parent === collection.id);
    const parent = DATA.collections.find(item => item.id === collection.parent);
    const links = [...(parent ? [parent] : []), ...children];
    const { table } = collection;
    panel.innerHTML = `
        ${links.length ? `<div class="row">${links.map(item => `<button class="small" data-classification="${esc(item.id)}">${esc(item.short ?? item.title)}</button>`).join('')}</div>` : ''}
        ${table ? `<details><summary>${esc(table.title)}</summary>
            <div class="tablewrap"><table><thead><tr>${table.headings.map(heading => `<th scope="col">${esc(heading)}</th>`).join('')}<th scope="col">収録例</th></tr></thead>
            <tbody>${table.rows.map(row => `<tr>${row.cells.map(cell => `<td>${esc(cell)}</td>`).join('')}<td>${row.ids.map(id => `<button class="small flat" data-jump="${esc(id)}">${esc(N.get(id).name)}</button>`).join('') || '—'}</td></tr>`).join('')}</tbody></table></div>
        </details>` : ''}
    `;
    panel.hidden = !links.length && !table;
}

function classificationFacts(node) {
    const labels = DATA.structureLabels[node.id];
    if (!labels?.length) return '';
    return `<div class="classificationfacts">${labels.map(label => `<p><strong>${esc(label.key)}</strong>　${esc(label.value)}</p>${label.detail ? `<p class="smalltext muted">${esc(label.detail)}</p>` : ''}<div class="refchips">${refHTML(label.refs)}</div>`).join('')}</div>`;
}

function renderFamily() {
    const fs = DATA.families;
    const all = [['all', { short: 'すべてのファミリー', color: '#93a9ba' }], ...Object.entries(fs)];
    $('families').innerHTML = all.map(([id, f]) => `<button class="familybutton ${!state.flow && !state.collection && state.family === id ? 'active' : ''}" data-family="${id}"><i class="dot" style="background:${f.color}"></i><span>${f.short}</span><span class="num">${id === 'all' ? DATA.nodes.length : DATA.nodes.filter(n => n.family === id).length}</span></button>`).join('');
    $('sourceFlow').value = state.flow?.id ?? '';
    renderClassification();
    const selection = state.flow ?? state.collection;
    if (selection) {
        $('familyTitle').textContent = selection.title;
        $('familySubtitle').innerHTML = `${esc(selection.desc)} <span class="refchips">${refHTML(selection.refs)}</span>`;
        return;
    }
    $('familyTitle').textContent = state.family === 'all' ? '全構造の派生フロー' : fs[state.family].name;
    $('familySubtitle').textContent = state.family === 'all' ? '親構造を上段に配置し、ファミリー間の派生も下向きに表示。' : fs[state.family].subtitle;
}

const SVGNS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}, text) { const el = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); if (text !== undefined)
    el.textContent = text; return el; }

function pos(n) { return graphPositions.get(n.id); }

function getVisible() {
    if (state.flow) {
        const edges = state.flow.edges.map(id => ({ ...E.get(id), undirected: false })).filter(e => !state.strict || e.strict);
        const ids = new Set(edges.flatMap(e => [e.a, e.b]));
        return { nodes: [...ids].map(id => N.get(id)), edges };
    }
    const nodes = state.collection
        ? state.collection.ids.map(id => N.get(id))
        : DATA.nodes.filter(n => state.family === 'all' || n.family === state.family);
    const ids = new Set(nodes.map(n => n.id));
    const edges = DATA.edges.filter(e => ids.has(e.a) && ids.has(e.b) && (!state.strict || e.strict));
    const linked = new Set(edges.flatMap(e => [e.a, e.b]));
    return { nodes: state.strict ? nodes.filter(n => linked.has(n.id)) : nodes, edges };
}

function edgePath(a, b) {
    const w = 220, h = 86;
    let p = pos(a), q = pos(b);
    const dx = q.x - p.x, dy = q.y - p.y;
    let sx, sy, ex, ey, c1x, c1y, c2x, c2y;
    if (Math.abs(dy) > 150) {
        const sign = Math.sign(dy);
        const side = (p.x + q.x < 0 ? -1 : 1) * (Math.max(...[...graphPositions.values()].map(point => Math.abs(point.x))) + 150);
        const fromY = p.y + sign * 60, toY = q.y - sign * 60;
        return {
            d: `M${p.x},${p.y + sign * 43} V${fromY} H${side} V${toY} H${q.x} V${q.y - sign * 43}`,
            mx: side, my: (fromY + toY) / 2,
        };
    }
    if (Math.abs(dy) < 72 && Math.abs(dx) > 300) {
        const top = p.y - 65;
        return { d: `M${p.x},${p.y - 43} V${top} H${q.x} V${q.y - 43}`, mx: (p.x + q.x) / 2, my: top };
    }
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

function renderGraph() {
    const v = getVisible();
    visibleNodes = v.nodes;
    visibleEdges = v.edges;
    const columns = $('map').clientWidth < 450 ? 1 : $('map').clientWidth < 720 ? 2 : 3;
    graphPositions = derivationPositions(v.nodes, v.edges, columns);
    ['clusterLayer', 'edgeLayer', 'nodeLayer', 'edgeLabels'].forEach(id => $(id).replaceChildren());
    const connected = new Set([state.selected]);
    visibleEdges.filter(e => e.a === state.selected || e.b === state.selected).forEach(e => { connected.add(e.a); connected.add(e.b); });
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
        const title = svgEl('title', {}, `${N.get(e.a).name} ${e.undirected ? '↔' : '→'} ${N.get(e.b).name}\n${e.label}`);
        hit.append(title);
        $('edgeLayer').append(path, hit);
        if (state.edge === e.id) {
            const label = svgEl('g');
            let ww = Math.max(80, e.label.length * 11 + 14);
            label.append(svgEl('rect', { x: p.mx - ww / 2, y: p.my - 12, width: ww, height: 24, rx: 5, class: 'edgelabelbg' }), svgEl('text', { x: p.mx, y: p.my + 4, 'text-anchor': 'middle', class: 'edgelabel' }, e.label));
            $('edgeLabels').append(label);
        }
    }
    for (const n of visibleNodes) {
        const p = pos(n);
        const g = svgEl('g', { class: `node ${state.selected === n.id && !state.edge ? 'selected' : ''}`, transform: `translate(${p.x - 110},${p.y - 43})`, 'data-node': n.id, tabindex: '0', role: 'button', 'aria-label': `${n.name} ${n.formula}` });
        g.append(svgEl('rect', { width: 220, height: 86, rx: 9, class: 'main' }));
        g.append(svgEl('rect', { x: 0, y: 14, width: 3, height: 24, rx: 1.5, fill: DATA.families[n.family].color, class: 'familystripe' }));
        for (const [kind, text, y, width] of [['title', n.name, 12, state.comp.includes(n.id) ? 179 : 192], ['formula', n.formula, 35, 192], ['sg', n.sg, 57, 192]]) {
            const box = svgEl('foreignObject', { x: 14, y, width, height: 20 });
            const label = document.createElement('div');
            label.className = `nodelabel ${kind}`;
            label.textContent = text;
            box.append(label);
            g.append(box);
        }
        if (state.comp.includes(n.id)) {
            g.append(svgEl('circle', { cx: 207, cy: 12, r: 7, class: 'comparecircle' }), svgEl('text', { x: 207, y: 15, 'text-anchor': 'middle', fill: '#a7efd7', 'font-size': 9 }, state.comp.indexOf(n.id) + 1));
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
    const cross = DATA.edges.filter(e => (e.a === state.selected || e.b === state.selected) && N.get(e.a).family !== N.get(e.b).family && (!state.strict || e.strict)).length;
    $('graphNote').innerHTML = `${state.strict ? '<span>群–部分群の確認済み関係のみ</span>' : '<span>上段の親構造から下段の派生へ ↓</span>'}${cross && state.family !== 'all' && !state.flow ? `<span>選択構造に領域をまたぐ関係 ${cross} 件 ↗</span>` : ''}`;
    $('graphStatus').textContent = `表示 ${visibleNodes.length} 構造 / ${visibleEdges.length} 関係`;
    renderList();
}

function initDefs() { for (const [key, k] of Object.entries(KINDS)) {
    const m = svgEl('marker', { id: `arrow-${key}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
    m.append(svgEl('path', { d: 'M0 0L10 5L0 10Z', fill: k.color }));
    $('mapDefs').append(m);
} }

const cam = { x: 0, y: 0, k: 1 };

function applyCam() { $('viewport').setAttribute('transform', `translate(${cam.x},${cam.y}) scale(${cam.k})`); $('zoomText').textContent = Math.round(cam.k * 100) + '%'; }

function fitMap() { if (state.tab !== 'explore' || state.view !== 'map')
    return; const r = $('map').getBoundingClientRect(); if (!r.width || !r.height)
    return; let points = visibleNodes.map(pos); if (!points.length) {
    cam.x = r.width / 2;
    cam.y = r.height / 2;
    cam.k = 1;
    applyCam();
    return;
} let x1 = Math.min(...points.map(p => p.x)) - 175, x2 = Math.max(...points.map(p => p.x)) + 175, y1 = Math.min(...points.map(p => p.y)) - 90, y2 = Math.max(...points.map(p => p.y)) + 105; if (state.family === 'all')
    y1 -= 50; cam.k = Math.min(r.width / (x2 - x1), r.height / (y2 - y1), 1.25) * .96; cam.x = r.width / 2 - (x1 + x2) / 2 * cam.k; cam.y = r.height / 2 - (y1 + y2) / 2 * cam.k; applyCam(); }

function readMap() {
    if (state.tab !== 'explore' || state.view !== 'map') return;
    const rect = $('map').getBoundingClientRect();
    if (!rect.width || !visibleNodes.length) return;
    const points = [...graphPositions.values()];
    const left = Math.min(...points.map(p => p.x)) - 175;
    const right = Math.max(...points.map(p => p.x)) + 175;
    cam.k = Math.min(1.05, rect.width / (right - left) * .96);
    cam.x = rect.width / 2 - (left + right) / 2 * cam.k;
    const top = Math.min(...points.map(p => p.y)) - 60;
    const bottom = Math.max(...points.map(p => p.y)) + 60;
    cam.y = (bottom - top) * cam.k <= rect.height - 130
        ? (rect.height - 30) / 2 - (top + bottom) / 2 * cam.k
        : Math.min(60 - top * cam.k, Math.max(rect.height - 90 - bottom * cam.k, 130 - (graphPositions.get(state.selected)?.y ?? top) * cam.k));
    applyCam();
}

function zoom(f, cx, cy) { const r = $('map').getBoundingClientRect(); cx ??= r.width / 2; cy ??= r.height / 2; const old = cam.k; cam.k = Math.max(.05, Math.min(3.8, cam.k * f)); cam.x = cx - (cx - cam.x) * cam.k / old; cam.y = cy - (cy - cam.y) * cam.k / old; applyCam(); }

let pointers = new Map(), panStart = null, panMoved = false, pinch = null;

$('map').addEventListener('pointerdown', ev => { const r = $('map').getBoundingClientRect(); pointers.set(ev.pointerId, { x: ev.clientX - r.left, y: ev.clientY - r.top }); panMoved = false; if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    panStart = null;
    ev.preventDefault();
    return;
} if (ev.target.closest('.node,.edgehit'))
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

$('map').addEventListener('pointerup', endPointer);

$('map').addEventListener('pointercancel', endPointer);

$('map').addEventListener('wheel', ev => { ev.preventDefault(); const r = $('map').getBoundingClientRect(); zoom(Math.exp(-ev.deltaY * .0013), ev.clientX - r.left, ev.clientY - r.top); }, { passive: false });

function renderList() { $('listView').innerHTML = `<table class="structuretable"><thead><tr><th>構造・代表組成</th><th>対称性／結晶系</th><th>占有率 T / O</th></tr></thead><tbody>${visibleNodes.map(n => `<tr data-listnode="${n.id}" tabindex="0" class="${state.selected === n.id ? 'selected' : ''}"><td>${esc(n.name)}<small>${esc(n.formula)}</small></td><td>${esc(n.sg)}</td><td class="mono">${n.occ ? n.occ.map(frac).join(' / ') : '—'}</td></tr>`).join('')}</tbody></table>`; }

function mode(view) { state.view = view; $('graphStage').hidden = view !== 'map'; $('listView').hidden = view !== 'list'; $('mapMode').classList.toggle('active', view === 'map'); $('listMode').classList.toggle('active', view === 'list'); if (view === 'map')
    requestAnimationFrame(readMap); }

function relationHTML(n) { const list = DATA.edges.filter(e => (e.a === n.id || e.b === n.id) && (!state.strict || e.strict)); if (!list.length)
    return '<p class="smalltext muted">この絞り込みでは接続がありません。</p>'; return list.map(e => { const other = N.get(e.a === n.id ? e.b : e.a), out = e.a === n.id; return `<button class="relationitem" data-relation="${e.id}"><div><span style="color:${KINDS[e.kind].color}">${e.undirected ? '↔' : out ? '→' : '←'}</span> ${esc(other.name)}${other.family !== n.family ? '<span style="color:#8ac0ce"> ↗</span>' : ''}<small>${esc(e.label)}</small></div><span class="relarr">›</span></button>`; }).join(''); }

function renderInspector() { modelView?.destroy(); modelView = null; const n = N.get(state.selected); if (!n)
    return; const f = DATA.families[n.family]; const model = modelFor(n.model ?? n.id); $('inspector').innerHTML = `<div class="inspecthead"><div class="row"><button class="small flat mobilenavnote" data-backmap="true">地図へ ↑</button><span class="eyebrow" style="color:${f.color}">${esc(f.short)} / STRUCTURE</span><span class="spacer"></span><button class="small flat" data-compare="${n.id}">${state.comp.includes(n.id) ? '比較から外す' : '＋ 比較'}</button></div><h2>${esc(n.name)}</h2><div class="formula">${esc(n.formula)}</div></div><div class="inspectbody"><p class="desc">${esc(n.desc)}</p>${classificationFacts(n)}${model.atoms.length ? modelPanelHTML(n, model) : ''}<div class="detailsection"><h3>構造を記述する</h3><div class="facts"><div class="fact"><div class="key">空間群・対称性</div><div class="value mono">${esc(n.sg)}</div></div><div class="fact"><div class="key">基準となる骨格</div><div class="value">${esc(n.packing)}</div></div><div class="fact"><div class="key">配位環境</div><div class="value">${esc(n.coord)}</div></div><div class="fact"><div class="key">多面体・部分構造の連結</div><div class="value">${esc(n.link)}</div></div></div></div>${n.occ ? `<div class="detailsection"><h3>全空隙を分母にした占有率</h3><div class="occgrid">${n.occ.map((o, i) => `<div class="occrow"><span>${i ? 'O' : 'T'}孔</span><div class="occbar"><i style="width:${o * 100}%"></i></div><span class="mono">${frac(o)}</span></div>`).join('')}</div><div class="occbase">基準粒子：${esc(n.host)}。T孔2N個・O孔N個を分母に数えます。</div></div>` : ''}${n.note ? `<div class="detailsection"><div class="note">${esc(n.note)}</div></div>` : ''}<div class="detailsection"><h3>つながる構造 <span class="muted">/ 矢印の詳細へ</span></h3><div class="relationlist">${relationHTML(n)}</div></div><div class="detailsection"><h3>参考資料</h3><div class="refchips">${refHTML(n.refs)}</div></div>${LABPRESETS.some(p => p.id === n.id) ? `<button data-openlab="${n.id}" class="small" style="margin-top:18px;width:100%">４副格子の模型で見る ↗</button>` : ''}</div>`; if (model.atoms.length) {
    modelView = mountModelPanel($('inspector').querySelector('.crystalpanel'), model);
} }

function renderEdge(e) { modelView?.destroy(); modelView = null; const a = N.get(e.a), b = N.get(e.b), k = KINDS[e.kind]; $('inspector').innerHTML = `<div class="inspecthead"><div class="eyebrow" style="color:${k.color}">RELATION / ${k.name}</div><h2 style="font-size:19px">${esc(e.label)}</h2><div class="row" style="margin-top:11px"><button class="small" data-jump="${a.id}">${esc(a.name)}</button><span>${e.undirected ? '↔' : '→'}</span><button class="small" data-jump="${b.id}">${esc(b.name)}</button></div></div><div class="inspectbody"><p class="desc">${esc(e.desc)}</p>${e.strict ? `<div class="detailsection"><span class="badge good">文献で確認した群–部分群関係</span></div><div class="detailsection"><div class="facts"><div class="fact"><div class="key">対称性の対応</div><div class="value mono">${esc(a.sg)} → ${esc(b.sg)}</div></div><div class="fact"><div class="key">部分群の種類と指数</div><div class="value mono">${esc(e.index)}</div></div><div class="fact"><div class="key">基底・原点・セル</div><div class="value">${esc(e.basis)}</div></div><div class="fact"><div class="key">サイト・Wyckoff位置の対応</div><div class="value">${esc(e.split)}</div></div></div></div>` : `<div class="detailsection"><div class="note">この線は「${k.name}」を示します。本版では群–部分群指数、基底・原点、全原子位置の変換を検証した矢印としては扱いません。</div></div>`}${e.warning ? `<div class="detailsection"><div class="note warn">${esc(e.warning)}</div></div>` : ''}<div class="detailsection"><div class="note warn">構造の関係と、実際の反応・相転移は別です。矢印の向きは記述上の派生方向であり、実行可能な変換や安定性を保証しません。</div></div><div class="detailsection"><h3>この関係の出典</h3><div class="refchips">${refHTML(e.refs)}</div></div><button class="small" data-comparepair="${a.id},${b.id}" style="margin-top:18px;width:100%">２つの構造を比較する →</button><button class="small flat" data-jump="${state.selected}" style="margin-top:8px;width:100%">構造カードに戻る</button></div>`; $('inspector').scrollTop = 0; }

function searchMatches(value) {
    const query = normalize(value);
    if (!query) return DATA.nodes;
    function priority(node) {
        if ([node.formula, node.name, node.aliases].some(value => normalize(value) === query)) return 2;
        return Number(normalize(node.name).includes(query));
    }
    return DATA.nodes.filter(node =>
        normalize([node.id, node.name, node.formula, node.aliases, node.sg, node.desc, ...(DATA.structureLabels[node.id] ?? []).map(label => label.value)].join(' ')).includes(query))
        .sort((a, b) => priority(b) - priority(a));
}

function renderSearchResults(results, hits) {
    results.innerHTML = hits.map(node => `<button data-searchnode="${node.id}">${esc(node.name)}<small>${esc(node.formula)} · ${esc(DATA.families[node.family].short)}</small></button>`).join('') ||
        '<p class="smalltext muted" style="padding:10px">一致する構造はありません。</p>';
}

function search() {
    const value = $('search').value;
    if (normalize(value)) renderSearchResults($('searchResults'), searchMatches(value));
    else $('searchResults').replaceChildren();
}

function globalSearchResults() {
    const hits = searchMatches($('globalQuery').value);
    renderSearchResults($('globalResults'), hits);
    $('globalResults').scrollTop = 0;
    $('globalCount').textContent = `${hits.length} / ${DATA.nodes.length} 件`;
}

function openGlobalSearch() {
    const dialog = $('globalSearch');
    if (!dialog.open) {
        $('globalQuery').value = '';
        globalSearchResults();
        dialog.showModal();
    }
    $('globalQuery').focus();
    $('globalQuery').select();
}

function closeGlobalSearch() {
    $('globalSearch').close();
    $('globalResults').replaceChildren();
}

function toggleCompare(id) { if (state.comp.includes(id))
    state.comp = state.comp.filter(i => i !== id);
else if (state.comp.length < 2)
    state.comp.push(id);
else {
    toast('比較は２構造までです。トレイから一つ外してください。');
    return;
} renderTray(); renderGraph(); if (state.edge)
    renderEdge(E.get(state.edge));
else
    renderInspector(); }

function renderTray() { $('compareTray').hidden = !state.comp.length; $('trayItems').innerHTML = state.comp.map((id, i) => `<span class="pill">${i + 1} ${esc(N.get(id).name)}<button data-compare="${id}" aria-label="比較から外す">×</button></span>`).join(''); $('compareOpen').disabled = state.comp.length !== 2; }

function shortest(a, b) { return shortestPath(DATA.edges, a, b, state.strict); }

function clearComparisonViews() {
    comparisonViews.forEach(view => view.destroy());
    comparisonViews = [];
}

function openModal(title, html) { clearComparisonViews(); lastFocus = document.activeElement; $('modalTitle').textContent = title; $('modalBody').innerHTML = html; $('modalBackdrop').hidden = false; $('modalBody').parentElement.scrollTop = 0; document.body.style.overflow = 'hidden'; $('closeModal').focus(); }

function closeModal() { clearComparisonViews(); $('modalBackdrop').hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); }

function compare() {
    if (state.comp.length !== 2) return;
    const pair = state.comp.map(id => N.get(id));
    const [a, b] = pair;
    const models = pair.map(n => modelFor(n.model ?? n.id));
    const rows = [['対称性', 'sg'], ['骨格', 'packing'], ['配位環境', 'coord'], ['連結', 'link'], ['要点', 'desc']];
    const path = shortest(a.id, b.id);
    const direct = DATA.edges.filter(e =>
        ((e.a === a.id && e.b === b.id) || (e.a === b.id && e.b === a.id)) && (!state.strict || e.strict));
    openModal('構造を並べて比較', `
        <div class="comparisoncontrols">
            <div><h3>単位胞を比較</h3><p class="muted smalltext">回転・ズームを同期。表示倍率とサイトの色は単位胞ごとに設定しています。</p></div>
            <button class="small" id="compareReset">視点を戻す</button>
        </div>
        <div class="comparisonmodels">${pair.map((n, i) => modelPanelHTML(n, models[i], true)).join('')}</div>
        <table class="comparetable"><tbody>
            <tr><th scope="row">構造</th>${pair.map(n => `<td><div class="comptitle">${esc(n.name)}</div><div class="mono muted">${esc(n.formula)}</div></td>`).join('')}</tr>
            ${rows.map(([label, key]) => `<tr><th scope="row">${label}</th><td>${esc(a[key])}</td><td>${esc(b[key])}</td></tr>`).join('')}
            <tr><th scope="row">T / O孔<br>占有率</th>${pair.map(n => `<td>${n.occ ? `<b class="mono">${n.occ.map(frac).join(' / ')}</b><br><span class="muted">基準：${esc(n.host)}</span>` : 'この記述では未設定'}</td>`).join('')}</tr>
            <tr><th scope="row">出典</th>${pair.map(n => `<td><div class="refchips">${refHTML(n.refs)}</div></td>`).join('')}</tr>
        </tbody></table>
        ${direct.length ? `<section class="comparisonrelations"><h3>直接の関係</h3>
            ${direct.map(e => `<article><span class="badge">${KINDS[e.kind].name}</span>
                <h4>${esc(N.get(e.a).name)} ${e.undirected ? '↔' : '→'} ${esc(N.get(e.b).name)}</h4>
                <p>${esc(e.desc)}</p>${e.strict ? `<p class="smalltext muted">${esc(e.index)} · ${esc(e.split)}</p>` : ''}
                <div class="refchips">${refHTML(e.refs)}</div></article>`).join('')}
        </section>` : ''}
        <section class="comparisonrelations">
            <h3>地図上の接続経路 ${state.strict ? '<span class="badge">群–部分群のみ</span>' : ''}</h3>
            <div class="pathsteps">${path ? path.map((id, i) => `${i ? '<span class="arrow">—</span>' : ''}<button data-pathnode="${id}">${esc(N.get(id).name)}</button>`).join('') : 'このデータと絞り込み条件では接続経路がありません。'}</div>
            <p class="note">接続列は矢印の向きを問わない地図上の最短経路です。各関係の結晶学的な意味は、矢印の詳細に記載しています。</p>
        </section>`);
    function redrawPeer(changed) {
        comparisonViews.filter(view => view !== changed).forEach(view => view.draw());
    }
    const panels = $('modalBody').querySelectorAll('.comparisonmodel');
    comparisonViews = [];
    panels.forEach((panel, i) => {
        comparisonViews.push(mountModelPanel(panel, models[i], {
            camera: comparisonViews[0]?.camera,
            onCameraChange: redrawPeer,
        }));
    });
    $('compareReset').onclick = () => comparisonViews[0]?.reset();
}

function routes() { openModal(`構造をたどる${ROUTES.length}の学習ルート`, `<p class="muted smalltext" style="margin-bottom:17px">各構造名からカードへ移動します。学習の順番であって、連続した相転移の順番ではありません。</p><div class="routecards">${ROUTES.map(r => `<div class="routecard"><h3>${r.title}</h3><p>${r.desc}</p><div class="row">${r.ids.map(id => `<button data-pathnode="${id}">${esc(N.get(id).name)} ↗</button>`).join('')}</div></div>`).join('')}</div>`); }

function renderSources() {
    $('sources').innerHTML = Object.entries(DATA.sources).map(([id, source]) => `
        <article class="sourcecard" id="source-${id}">
            <div class="sourceid">[${id}]</div>
            <div><h3>${esc(source.citation ?? source.title)}</h3>
                ${source.citation ? '' : `<p>${esc(source.author)} · ${esc(source.year)}<br>${esc(source.edition)}</p>`}
                <p>${esc(source.coverage)}</p>
                <div id="sourcePage-${id}" class="sourcepage" hidden></div>
            </div>
            <div class="sourceactions">
                ${source.article ? `<a href="${esc(source.article)}" target="_blank" rel="noopener">ウェブ資料 ↗</a>` : ''}
                ${source.url ? `<a href="${esc(source.url)}" target="_blank" rel="noopener">公開PDFを開く ↗</a>` : ''}
                ${source.filename ? `<button data-pdf="${id}">お手元のPDFを関連付ける</button>
                    <input type="file" accept="application/pdf,.pdf" id="pdf-${id}" data-pdffile="${id}" hidden>
                    <span id="pdfStatus-${id}" class="muted smalltext">未関連付け · ローカル処理</span>` : ''}
            </div>
        </article>`).join('');
}

function openSource(id, p, page) { const s = DATA.sources[id]; if (!s)
    return; if (s.url || PDFS[id]) {
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
    family(d.family); if (d.classification) openClassification(d.classification); if (d.searchnode) {
    if (b.closest('#globalSearch')) {
        closeGlobalSearch();
        if (!$('modalBackdrop').hidden) closeModal();
        if (state.family === 'all' && !state.flow && !state.collection) family(N.get(d.searchnode).family);
    }
    selectNode(d.searchnode);
} if (d.listnode)
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
    openSource(d.source, Number(d.page), Number(d.pdfpage)); if (d.pdf)
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

document.addEventListener('keydown', ev => {
    if ((ev.metaKey || ev.ctrlKey) && !ev.altKey && !ev.shiftKey && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        openGlobalSearch();
        return;
    }
    if ($('globalSearch').open) return;
    if (ev.key === 'Escape') {
    if (!$('modalBackdrop').hidden) closeModal();
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

$('openSearch').onclick = openGlobalSearch;
for (const type of ['cancel', 'submit']) {
    $('globalSearch').addEventListener(type, event => {
        event.preventDefault();
        closeGlobalSearch();
    });
}
$('globalQuery').addEventListener('input', globalSearchResults);
$('globalSearch').addEventListener('keydown', ev => {
    const buttons = [...$('globalResults').querySelectorAll('button')];
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement);
    if (ev.key === 'Enter' && ev.target === $('globalQuery')) {
        ev.preventDefault();
        buttons[0].click();
    }
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        const next = index + (ev.key === 'ArrowDown' ? 1 : -1);
        if (next < 0) $('globalQuery').focus();
        else buttons[Math.min(next, buttons.length - 1)].focus();
    }
});

$('sourceFlow').addEventListener('change', ev => {
    const flow = DATA.flows.find(item => item.id === ev.target.value);
    if (!flow) {
        family(state.family);
        return;
    }
    state.flow = flow;
    state.collection = null;
    state.selected = E.get(flow.edges[0]).a;
    state.edge = null;
    state.strict = false;
    $('strictFilter').checked = false;
    renderFamily();
    renderGraph();
    renderInspector();
    mode('map');
});

$('classification').addEventListener('change', ev => openClassification(ev.target.value));

$('search').addEventListener('keydown', ev => { if (ev.key === 'Enter') {
    const b = $('searchResults').querySelector('button');
    if (b)
        b.click();
} });

$('strictFilter').addEventListener('change', ev => { state.strict = ev.target.checked; state.edge = null; renderGraph(); renderInspector(); requestAnimationFrame(readMap); });

$('zoomIn').onclick = () => zoom(1.25);

$('zoomOut').onclick = () => zoom(.8);

$('fitMap').onclick = fitMap;
$('readMap').onclick = readMap;
for (const [id, sign] of [['mapUp', 1], ['mapDown', -1]]) {
    $(id).onclick = () => {
        cam.y += sign * $('map').clientHeight * .65;
        applyCam();
    };
}

$('mapMode').onclick = () => mode('map');

$('listMode').onclick = () => mode('list');

$('compareOpen').onclick = compare;

$('compareClear').onclick = () => { state.comp = []; renderTray(); renderGraph(); if (state.edge)
    renderEdge(E.get(state.edge));
else
    renderInspector(); };

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

$('labAxisControls').innerHTML = viewDirectionControls();
$('labAxisControls').addEventListener('click', event => {
    const direction = event.target.closest('button')?.dataset.viewDirection;
    if (direction) labView?.lookAlong(direction);
});

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

$('exportBtn').onclick = () => { const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json;charset=utf-8' }), u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = `crystal-atlas-data-v${DATA.version}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1500); toast('出典を含む構造・関係データを書き出しました。'); };

$('nodeCount').textContent = DATA.nodes.length;

$('edgeCount').textContent = DATA.edges.length;

$('sourceCount').textContent = Object.keys(DATA.sources).length;

$('strictCount').textContent = DATA.edges.filter(e => e.strict).length;

$('legend').innerHTML = Object.entries(KINDS).map(([id, k]) => `<div class="legenditem"><span class="linemark" style="border-color:${k.color};border-top-style:${id === 'symmetry' ? 'solid' : id === 'analogy' ? 'dotted' : 'dashed'}"></span>${k.name}</div>`).join('');

$('guideKinds').innerHTML = Object.entries(KINDS).filter(([id]) => id !== 'symmetry').map(([id, k]) => `<div class="guideitem"><strong style="color:${k.color}">${k.name}</strong><div>${k.meaning}</div></div>`).join('');

$('guideSymRefs').innerHTML = refHTML([{ s: 'M06', p: 216, sec: '§18.3' }, { s: 'M13', p: 4, sec: '§1.2' }, { s: 'M06', p: 21, sec: '§3.3' }]);

$('labSelect').innerHTML = LABPRESETS.map(p => `<option value="${p.id}">${p.label} — ${p.formula}</option>`).join('');

initDefs();

$('sourceFlow').append(...DATA.flows.map(flow => new Option(flow.title, flow.id)));
for (const group of new Set(DATA.collections.map(collection => collection.group))) {
    const options = document.createElement('optgroup');
    options.label = group;
    options.append(...DATA.collections.filter(collection => collection.group === group)
        .map(collection => new Option(collection.title, collection.id)));
    $('classification').append(options);
}

renderSources();

renderFamily();

renderGraph();

renderInspector();

updateOccupancy('spinel');

new ResizeObserver(() => {
    if (state.tab === 'explore' && state.view === 'map') requestAnimationFrame(() => {
        renderGraph();
        readMap();
    });
}).observe($('graphStage'));

requestAnimationFrame(readMap);

// Expose only read-only diagnostics useful for validating the embedded dataset.
window.atlasDiagnostics = () => ({ nodes: DATA.nodes.length, edges: DATA.edges.length, strict: DATA.edges.filter(e => e.strict).length, shownNodes: visibleNodes.length, shownEdges: visibleEdges.length, collection: state.collection?.id ?? null, selected: state.selected, family: state.family, tab: state.tab, models: DATA.nodes.filter(n => n.model || Object.hasOwn(DATA.models, n.id)).length });
