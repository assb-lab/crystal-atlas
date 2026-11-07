/** Canvas crystal viewer; models are idealized sites, not experimental CIFs. */
import { LABPRESETS } from "./data/presets.js";

// Balls visualize sites, not effective radii.
export const SITE_COLORS = ['#73d9dd', '#efba77', '#b7a1ed', '#ef91ba'];

const FTRANS = [[0, 0, 0], [0, .5, .5], [.5, 0, .5], [.5, .5, 0]];

const ORIGINS = [[0, 0, 0], [.5, .5, .5], [.25, .25, .25], [.75, .75, .75]];

export function expanded(atoms) { const output = [], seen = new Set(); for (const a of atoms) {
    const axes = a.f.map(v => Math.abs(v) < 1e-6 ? [0, 1] : [v]);
    for (const x of axes[0])
        for (const y of axes[1])
            for (const z of axes[2]) {
                const k = [x, y, z, a.el, a.site].join(',');
                if (!seen.has(k)) {
                    seen.add(k);
                    output.push({ ...a, f: [x, y, z] });
                }
            }
} return output; }

export function fourFCC(p, showVacancy = false) { const ats = []; p.els.forEach((el, i) => { if (!el && !showVacancy)
    return; for (const t of FTRANS)
    ats.push({ f: ORIGINS[i].map((v, j) => (v + t[j]) % 1), el: el || '□', site: i, vacant: !el }); }); return { atoms: expanded(ats), cell: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], caption: p.label }; }

export function modelFor(id) { const preset = LABPRESETS.find(p => p.id === id); if (preset && id !== 'bcc' && id !== 'b2')
    return fourFCC(preset); let cell = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], ats = []; const atom = (f, el, site) => ats.push({ f, el, site }); if (id === 'bcc' || id === 'b2') {
    atom([0, 0, 0], id === 'bcc' ? 'W' : 'Cs', 0);
    atom([.5, .5, .5], id === 'bcc' ? 'W' : 'Cl', id === 'bcc' ? 0 : 1);
}
else if (id === 'l12') {
    atom([0, 0, 0], 'Au', 0);
    FTRANS.slice(1).forEach(f => atom(f, 'Cu', 1));
}
else if (id === 'hcp' || id === 'nias' || id === 'wurtzite') {
    cell = [[1, 0, 0], [-.5, Math.sqrt(3) / 2, 0], [0, 0, Math.sqrt(8 / 3)]];
    if (id === 'hcp' || id === 'nias') {
        atom([1 / 3, 2 / 3, .25], id === 'hcp' ? 'X' : 'As', 0);
        atom([2 / 3, 1 / 3, .75], id === 'hcp' ? 'X' : 'As', 0);
        if (id === 'nias') {
            atom([0, 0, 0], 'Ni', 1);
            atom([0, 0, .5], 'Ni', 1);
        }
    }
    else {
        atom([0, 0, 0], 'Zn', 0);
        atom([2 / 3, 1 / 3, .5], 'Zn', 0);
        atom([0, 0, 3 / 8], 'S', 1);
        atom([2 / 3, 1 / 3, 7 / 8], 'S', 1);
    }
}
else if (id === 'perov' || id === 'reo3') {
    if (id === 'perov')
        atom([0, 0, 0], 'Sr', 0);
    atom([.5, .5, .5], id === 'perov' ? 'Ti' : 'Re', 1);
    [[.5, .5, 0], [.5, 0, .5], [0, .5, .5]].forEach(f => atom(f, 'O', 2));
}
else if (id === 'rutile') {
    cell[2][2] = .644;
    const u = .305;
    atom([0, 0, 0], 'Ti', 0);
    atom([.5, .5, .5], 'Ti', 0);
    [[u, u, 0], [1 - u, 1 - u, 0], [.5 + u, .5 - u, .5], [.5 - u, .5 + u, .5]].forEach(f => atom(f, 'O', 1));
} return { atoms: expanded(ats), cell }; }

export class CrystalView {
    constructor(canvas, large = false) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.large = large; this.angleX = -.34; this.angleY = .62; this.zoom = 1; this.model = null; this.visible = [true, true, true, true]; this.labels = false; this.pointer = null; this.touches = new Map(); this.pinch = null; this.abort = new AbortController(); const opt = { signal: this.abort.signal }; canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); this.pointer = { x: e.clientX, y: e.clientY }; if (this.touches.size === 2) {
        const [a, b] = [...this.touches.values()];
        this.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    } }, opt); canvas.addEventListener('pointermove', e => { if (!this.touches.has(e.pointerId))
        return; this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (this.touches.size === 2) {
        const [a, b] = [...this.touches.values()];
        let d = Math.hypot(a.x - b.x, a.y - b.y);
        if (this.pinch)
            this.zoom = Math.max(.6, Math.min(2, this.zoom * d / this.pinch));
        this.pinch = d;
        this.pointer = null;
        this.draw();
        return;
    } if (!this.pointer)
        return; this.angleY += (e.clientX - this.pointer.x) * .008; this.angleX += (e.clientY - this.pointer.y) * .008; this.pointer = { x: e.clientX, y: e.clientY }; this.draw(); }, opt); const end = e => { this.touches.delete(e.pointerId); this.pointer = null; this.pinch = null; }; canvas.addEventListener('pointerup', end, opt); canvas.addEventListener('pointercancel', end, opt); canvas.addEventListener('wheel', e => { e.preventDefault(); this.zoom = Math.max(.6, Math.min(2, this.zoom * Math.exp(-e.deltaY * .001))); this.draw(); }, { ...opt, passive: false }); this.ro = new ResizeObserver(() => this.draw()); this.ro.observe(canvas); }
    set(model) { this.model = model; this.draw(); }
    reset() { this.angleX = -.34; this.angleY = .62; this.zoom = 1; this.draw(); }
    destroy() { this.abort.abort(); this.ro.disconnect(); }
    draw() {
        if (!this.model || !this.ctx)
            return;
        const r = this.canvas.getBoundingClientRect(), w = r.width, h = r.height;
        if (w < 1 || h < 1)
            return;
        const dpr = Math.min(devicePixelRatio || 1, 2);
        if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
            this.canvas.width = Math.round(w * dpr);
            this.canvas.height = Math.round(h * dpr);
        }
        const c = this.ctx;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, w, h);
        const basis = this.model.cell;
        const extent = Math.max(...basis.map(v => Math.hypot(...v)));
        const scale = Math.min(w * .49, h * .42) * this.zoom / extent;
        const cy = h * .52;
        const project = f => { let v = [0, 0, 0]; for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                v[j] += (f[i] - .5) * basis[i][j]; const ca = Math.cos(this.angleY), sa = Math.sin(this.angleY), cb = Math.cos(this.angleX), sb = Math.sin(this.angleX); const x = v[0] * ca + v[2] * sa, z = -v[0] * sa + v[2] * ca, y = v[1] * cb - z * sb, zz = v[1] * sb + z * cb; const persp = 3.7 / (3.7 + zz / extent); return { x: w / 2 + x * scale * persp, y: cy - y * scale * persp, z: zz, r: persp }; };
        // Subtle ground glow (visual only).
        let grd = c.createRadialGradient(w / 2, h * .76, 3, w / 2, h * .76, w * .35);
        grd.addColorStop(0, 'rgba(75,154,167,.09)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = grd;
        c.fillRect(0, 0, w, h);
        const corners = [];
        for (let x = 0; x < 2; x++)
            for (let y = 0; y < 2; y++)
                for (let z = 0; z < 2; z++)
                    corners.push([x, y, z]);
        const segs = [];
        for (let i = 0; i < 8; i++)
            for (let j = i + 1; j < 8; j++)
                if (corners[i].reduce((s, v, k) => s + Math.abs(v - corners[j][k]), 0) === 1)
                    segs.push([project(corners[i]), project(corners[j])]);
        c.strokeStyle = '#58798b';
        c.lineWidth = 1;
        c.globalAlpha = .7;
        segs.forEach(([a, b]) => { c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); });
        c.globalAlpha = 1;
        const atoms = this.model.atoms.filter(a => this.visible[a.site] !== false).map(a => ({ ...a, p: project(a.f) })).sort((a, b) => b.p.z - a.p.z);
        for (const a of atoms) {
            const p = a.p, rad = (a.vacant ? 3.6 : (this.large ? 9.6 : 6.5)) * p.r * this.zoom;
            const color = SITE_COLORS[a.site % 4];
            if (a.vacant) {
                c.globalAlpha = .27;
                c.strokeStyle = color;
                c.lineWidth = 1;
                c.beginPath();
                c.arc(p.x, p.y, rad, 0, Math.PI * 2);
                c.stroke();
                c.globalAlpha = 1;
                continue;
            }
            let g = c.createRadialGradient(p.x - rad * .32, p.y - rad * .4, rad * .06, p.x, p.y, rad);
            g.addColorStop(0, '#ecffff');
            g.addColorStop(.28, color);
            g.addColorStop(1, '#1a3a50');
            c.fillStyle = g;
            c.beginPath();
            c.arc(p.x, p.y, rad, 0, Math.PI * 2);
            c.fill();
            c.strokeStyle = color;
            c.globalAlpha = .55;
            c.lineWidth = .7;
            c.stroke();
            c.globalAlpha = 1;
            if (this.labels) {
                c.font = `${this.large ? 10 : 8}px system-ui`;
                c.fillStyle = '#d8e8ef';
                c.fillText(a.el, p.x + rad + 3, p.y + 3);
            }
        }
        const origin = project([0, 0, 0]);
        [['a', [.25, 0, 0]], ['b', [0, .25, 0]], ['c', [0, 0, .25]]].forEach(([label, f]) => { const p = project(f); c.strokeStyle = '#8fa5b3'; c.globalAlpha = .8; c.beginPath(); c.moveTo(origin.x, origin.y); c.lineTo(p.x, p.y); c.stroke(); c.globalAlpha = 1; c.font = '11px ui-monospace,monospace'; c.fillStyle = '#bdccd5'; c.fillText(label, p.x + 3, p.y - 3); });
    }
}
