/** Canvas crystal viewer for schematic and source-derived unit cells. */
import { LABPRESETS } from "./data/presets.js";
import { coordinateModels } from "./data/models.js";

// Balls visualize sites, not effective radii.
export const SITE_COLORS = ['#73d9dd', '#efba77', '#b7a1ed', '#ef91ba'];
const MODEL_COLORS = [...SITE_COLORS, '#b6d478', '#78aaf5', '#e88b79', '#85d1ac'];
const DEFAULT_CAMERA = { x: -.34, y: .62, zoom: 1, direction: null };
const cross = ([ax, ay, az], [bx, by, bz]) => [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];

/** Angles for a camera on the selected side of the cell, looking toward its center. */
export function directionAngles(cell, direction) {
    const axis = 'abc'.indexOf(direction.at(0));
    const vector = direction.includes('*')
        ? cross(cell[(axis + 1) % 3], cell[(axis + 2) % 3])
        : cell[axis];
    const scale = (direction.endsWith('-') ? -1 : 1) / Math.hypot(...vector);
    const [x, y, z] = vector.map(value => value * scale);
    return { x: Math.atan2(-y, Math.hypot(x, z)), y: Math.atan2(x, -z) };
}
const CELL_CORNERS = [
    [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
    [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1],
];
const CELL_EDGES = [
    [0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3],
    [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7],
];

function modelFromCoordinates(model) {
    const [a, b, c, alpha, beta, gamma] = model.parameters;
    const [ca, cb, cg] = [alpha, beta, gamma].map(angle => Math.cos(angle * Math.PI / 180));
    const sg = Math.sin(gamma * Math.PI / 180);
    const cy = (ca - cb * cg) / sg;
    const cell = [[a, 0, 0], [b * cg, b * sg, 0], [c * cb, c * cy, c * Math.sqrt(1 - cb * cb - cy * cy)]];
    const atoms = model.groups.flatMap(({ occupants, positions }, site) => {
        const el = Object.keys(occupants).join('/');
        const occupancy = Object.values(occupants).reduce((sum, value) => sum + value, 0);
        return positions.map(f => ({ f, el, site, occupancy }));
    });
    let colors;
    if (model.groups.length > MODEL_COLORS.length) {
        const species = [...new Set(model.groups.map(group => Object.keys(group.occupants).join('/')))];
        colors = model.groups.map(group => modelColor(species.indexOf(Object.keys(group.occupants).join('/'))));
    }
    return { ...model, cell, atoms: expanded(atoms), colors };
}

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

export function modelFor(id) { if (Object.hasOwn(coordinateModels, id))
    return modelFromCoordinates(coordinateModels[id]); const preset = LABPRESETS.find(p => p.id === id); if (preset && id !== 'bcc' && id !== 'b2')
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

export function modelColor(site, model) {
    return model?.colors?.[site] ?? MODEL_COLORS[site % MODEL_COLORS.length];
}

export class CrystalView {
    constructor(canvas, large = false, { camera = { ...DEFAULT_CAMERA }, onCameraChange } = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.large = large;
        this.camera = camera;
        this.onCameraChange = onCameraChange;
        this.model = null;
        this.visible = [true, true, true, true];
        this.labels = false;
        this.pointer = null;
        this.touches = new Map();
        this.pinch = null;
        this.abort = new AbortController();
        const opt = { signal: this.abort.signal };
        canvas.addEventListener('pointerdown', e => {
            canvas.setPointerCapture(e.pointerId);
            this.pointer = { x: e.clientX, y: e.clientY };
            this.touches.set(e.pointerId, this.pointer);
            if (this.touches.size === 2) this.pinch = this.touchDistance();
        }, opt);
        canvas.addEventListener('pointermove', e => {
            if (!this.touches.has(e.pointerId)) return;
            const point = { x: e.clientX, y: e.clientY };
            this.touches.set(e.pointerId, point);
            if (this.touches.size === 2) {
                const distance = this.touchDistance();
                if (this.pinch) this.changeZoom(distance / this.pinch);
                this.pinch = distance;
                this.pointer = null;
            } else if (this.pointer) {
                this.rotate((point.y - this.pointer.y) * .008, (point.x - this.pointer.x) * .008);
                this.pointer = point;
            }
        }, opt);
        const end = e => {
            this.touches.delete(e.pointerId);
            this.pointer = this.touches.values().next().value ?? null;
            this.pinch = null;
        };
        canvas.addEventListener('pointerup', end, opt);
        canvas.addEventListener('pointercancel', end, opt);
        canvas.addEventListener('wheel', e => {
            e.preventDefault();
            this.changeZoom(Math.exp(-e.deltaY * .001));
        }, { ...opt, passive: false });
        canvas.addEventListener('keydown', e => {
            const move = { ArrowLeft: [0, -.15], ArrowRight: [0, .15], ArrowUp: [-.15, 0], ArrowDown: [.15, 0] }[e.key];
            if (!move) return;
            e.preventDefault();
            this.rotate(...move);
        }, opt);
        this.ro = new ResizeObserver(() => this.draw());
        this.ro.observe(canvas);
    }
    touchDistance() {
        const [a, b] = this.touches.values();
        return Math.hypot(a.x - b.x, a.y - b.y);
    }
    changeZoom(factor) {
        this.camera.zoom = Math.max(.6, Math.min(2, this.camera.zoom * factor));
        this.cameraChanged();
    }
    rotate(dx, dy) {
        if (this.camera.direction) {
            Object.assign(this.camera, directionAngles(this.model.cell, this.camera.direction), { direction: null });
        }
        this.camera.x += dx;
        this.camera.y += dy;
        this.cameraChanged();
    }
    lookAlong(direction) {
        this.camera.direction = direction;
        this.cameraChanged();
    }
    cameraChanged() {
        this.draw();
        this.onCameraChange?.(this);
    }
    set(model) { this.model = model; this.draw(); }
    reset() { Object.assign(this.camera, DEFAULT_CAMERA); this.cameraChanged(); }
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
        const { direction, zoom } = this.camera;
        const { x: angleX, y: angleY } = direction ? directionAngles(basis, direction) : this.camera;
        this.canvas.dataset.direction = direction ?? '';
        const centered = f => [0, 1, 2].map(axis =>
            basis.reduce((value, vector, i) => value + (f[i] - .5) * vector[axis], 0));
        const diameter = 2 * Math.max(...CELL_CORNERS.map(f => Math.hypot(...centered(f))));
        const scale = .85 * Math.min(w, h) * zoom / diameter;
        const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
        const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
        const project = f => {
            const [cartX, cartY, cartZ] = centered(f);
            const x = cartX * cosY + cartZ * sinY;
            const depth = -cartX * sinY + cartZ * cosY;
            const y = cartY * cosX - depth * sinX;
            const z = cartY * sinX + depth * cosX;
            const perspective = direction ? 1 : 3.7 / (3.7 + z / diameter);
            return { x: w / 2 + x * scale * perspective, y: h / 2 - y * scale * perspective, z, r: perspective };
        };
        // Subtle ground glow (visual only).
        let grd = c.createRadialGradient(w / 2, h * .76, 3, w / 2, h * .76, w * .35);
        grd.addColorStop(0, 'rgba(75,154,167,.09)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = grd;
        c.fillRect(0, 0, w, h);
        const corners = CELL_CORNERS.map(project);
        c.strokeStyle = '#58798b';
        c.lineWidth = 1;
        c.globalAlpha = .7;
        c.beginPath();
        for (const [start, end] of CELL_EDGES) {
            const a = corners[start], b = corners[end];
            c.moveTo(a.x, a.y);
            c.lineTo(b.x, b.y);
        }
        c.stroke();
        c.globalAlpha = 1;
        const atoms = this.model.atoms.filter(a => this.visible[a.site] !== false).map(a => ({ ...a, p: project(a.f) })).sort((a, b) => b.p.z - a.p.z);
        const maxRadius = this.large ? 9.6 : 6.5;
        const radius = Math.max(2.8, Math.min(maxRadius, Math.min(w, h) / (4 * Math.sqrt(this.model.atoms.length))));
        for (const a of atoms) {
            const p = a.p, rad = (a.vacant ? 3.6 : radius) * p.r * zoom;
            const color = modelColor(a.site, this.model);
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
            c.globalAlpha = a.occupancy ?? 1;
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
