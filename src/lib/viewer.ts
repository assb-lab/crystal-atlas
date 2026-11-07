/** Canvas crystal viewer; models are idealized sites, not experimental CIFs. */
import { LABPRESETS } from "../data/presets.ts";
import type { LabPreset } from "../types.ts";

// Balls visualize sites, not effective radii.
export const SITE_COLORS = ["#73d9dd", "#efba77", "#b7a1ed", "#ef91ba"];

type Vec3 = [number, number, number];

export interface Atom {
  /** Fractional coordinates. */
  f: Vec3;
  el: string;
  site: number;
  vacant?: boolean;
}

export interface Model {
  atoms: Atom[];
  cell: Vec3[];
  caption?: string;
}

const FTRANS: Vec3[] = [
  [0, 0, 0],
  [0, 0.5, 0.5],
  [0.5, 0, 0.5],
  [0.5, 0.5, 0],
];

const ORIGINS: Vec3[] = [
  [0, 0, 0],
  [0.5, 0.5, 0.5],
  [0.25, 0.25, 0.25],
  [0.75, 0.75, 0.75],
];

const unitCell = (): Vec3[] => [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

/** Repeats atoms on cell faces/edges/corners so a single cell looks complete. */
export function expanded(atoms: Atom[]): Atom[] {
  const output: Atom[] = [];
  const seen = new Set<string>();
  for (const a of atoms) {
    const axes = a.f.map((v) => (Math.abs(v) < 1e-6 ? [0, 1] : [v]));
    for (const x of axes[0]!)
      for (const y of axes[1]!)
        for (const z of axes[2]!) {
          const k = [x, y, z, a.el, a.site].join(",");
          if (!seen.has(k)) {
            seen.add(k);
            output.push({ ...a, f: [x, y, z] });
          }
        }
  }
  return output;
}

/** Four interpenetrating fcc sublattices A–D with the preset's elements. */
export function fourFCC(p: LabPreset, showVacancy = false): Model {
  const ats: Atom[] = [];
  p.els.forEach((el, i) => {
    if (!el && !showVacancy) return;
    for (const t of FTRANS)
      ats.push({
        f: ORIGINS[i]!.map((v, j) => (v + t[j]!) % 1) as Vec3,
        el: el || "□",
        site: i,
        vacant: !el,
      });
  });
  return { atoms: expanded(ats), cell: unitCell(), caption: p.label };
}

export function modelFor(id: string): Model {
  const preset = LABPRESETS.find((p) => p.id === id);
  if (preset && id !== "bcc" && id !== "b2") return fourFCC(preset);
  let cell = unitCell();
  const ats: Atom[] = [];
  const atom = (f: Vec3, el: string, site: number) => ats.push({ f, el, site });
  if (id === "bcc" || id === "b2") {
    atom([0, 0, 0], id === "bcc" ? "W" : "Cs", 0);
    atom([0.5, 0.5, 0.5], id === "bcc" ? "W" : "Cl", id === "bcc" ? 0 : 1);
  } else if (id === "l12") {
    atom([0, 0, 0], "Au", 0);
    FTRANS.slice(1).forEach((f) => atom(f, "Cu", 1));
  } else if (id === "hcp" || id === "nias" || id === "wurtzite") {
    cell = [
      [1, 0, 0],
      [-0.5, Math.sqrt(3) / 2, 0],
      [0, 0, Math.sqrt(8 / 3)],
    ];
    if (id === "hcp" || id === "nias") {
      atom([1 / 3, 2 / 3, 0.25], id === "hcp" ? "X" : "As", 0);
      atom([2 / 3, 1 / 3, 0.75], id === "hcp" ? "X" : "As", 0);
      if (id === "nias") {
        atom([0, 0, 0], "Ni", 1);
        atom([0, 0, 0.5], "Ni", 1);
      }
    } else {
      atom([0, 0, 0], "Zn", 0);
      atom([2 / 3, 1 / 3, 0.5], "Zn", 0);
      atom([0, 0, 3 / 8], "S", 1);
      atom([2 / 3, 1 / 3, 7 / 8], "S", 1);
    }
  } else if (id === "perov" || id === "reo3") {
    if (id === "perov") atom([0, 0, 0], "Sr", 0);
    atom([0.5, 0.5, 0.5], id === "perov" ? "Ti" : "Re", 1);
    (
      [
        [0.5, 0.5, 0],
        [0.5, 0, 0.5],
        [0, 0.5, 0.5],
      ] as Vec3[]
    ).forEach((f) => atom(f, "O", 2));
  } else if (id === "rutile") {
    cell[2]![2] = 0.644;
    const u = 0.305;
    atom([0, 0, 0], "Ti", 0);
    atom([0.5, 0.5, 0.5], "Ti", 0);
    (
      [
        [u, u, 0],
        [1 - u, 1 - u, 0],
        [0.5 + u, 0.5 - u, 0.5],
        [0.5 - u, 0.5 + u, 0.5],
      ] as Vec3[]
    ).forEach((f) => atom(f, "O", 1));
  }
  return { atoms: expanded(ats), cell };
}

interface Projected {
  x: number;
  y: number;
  z: number;
  r: number;
}

/** Imperative canvas renderer with drag-rotate and wheel/pinch zoom. Call destroy() when done. */
export class CrystalView {
  angleX = -0.34;
  angleY = 0.62;
  zoom = 1;
  model: Model | null = null;
  visible: boolean[] = [true, true, true, true];
  labels = false;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly large: boolean;
  private pointer: { x: number; y: number } | null = null;
  private readonly touches = new Map<number, { x: number; y: number }>();
  private pinch: number | null = null;
  private readonly abort = new AbortController();
  private readonly ro: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, large = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.large = large;
    const opt = { signal: this.abort.signal };
    canvas.addEventListener(
      "pointerdown",
      (e) => {
        canvas.setPointerCapture(e.pointerId);
        this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        this.pointer = { x: e.clientX, y: e.clientY };
        if (this.touches.size === 2) {
          const [a, b] = [...this.touches.values()] as [
            { x: number; y: number },
            { x: number; y: number },
          ];
          this.pinch = Math.hypot(a.x - b.x, a.y - b.y);
        }
      },
      opt,
    );
    canvas.addEventListener(
      "pointermove",
      (e) => {
        if (!this.touches.has(e.pointerId)) return;
        this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.touches.size === 2) {
          const [a, b] = [...this.touches.values()] as [
            { x: number; y: number },
            { x: number; y: number },
          ];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (this.pinch) this.zoom = Math.max(0.6, Math.min(2, (this.zoom * d) / this.pinch));
          this.pinch = d;
          this.pointer = null;
          this.draw();
          return;
        }
        if (!this.pointer) return;
        this.angleY += (e.clientX - this.pointer.x) * 0.008;
        this.angleX += (e.clientY - this.pointer.y) * 0.008;
        this.pointer = { x: e.clientX, y: e.clientY };
        this.draw();
      },
      opt,
    );
    const end = (e: PointerEvent) => {
      this.touches.delete(e.pointerId);
      this.pointer = null;
      this.pinch = null;
    };
    canvas.addEventListener("pointerup", end, opt);
    canvas.addEventListener("pointercancel", end, opt);
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.zoom = Math.max(0.6, Math.min(2, this.zoom * Math.exp(-e.deltaY * 0.001)));
        this.draw();
      },
      { ...opt, passive: false },
    );
    this.ro = new ResizeObserver(() => this.draw());
    this.ro.observe(canvas);
  }

  set(model: Model) {
    this.model = model;
    this.draw();
  }

  reset() {
    this.angleX = -0.34;
    this.angleY = 0.62;
    this.zoom = 1;
    this.draw();
  }

  destroy() {
    this.abort.abort();
    this.ro.disconnect();
  }

  draw() {
    const c = this.ctx;
    if (!this.model || !c) return;
    const r = this.canvas.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    if (w < 1 || h < 1) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
    }
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    const basis = this.model.cell;
    const extent = Math.max(...basis.map((v) => Math.hypot(...v)));
    const scale = (Math.min(w * 0.49, h * 0.42) * this.zoom) / extent;
    const cy = h * 0.52;
    const project = (f: number[]): Projected => {
      const v = [0, 0, 0];
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) v[j]! += (f[i]! - 0.5) * basis[i]![j]!;
      const ca = Math.cos(this.angleY);
      const sa = Math.sin(this.angleY);
      const cb = Math.cos(this.angleX);
      const sb = Math.sin(this.angleX);
      const x = v[0]! * ca + v[2]! * sa;
      const z = -v[0]! * sa + v[2]! * ca;
      const y = v[1]! * cb - z * sb;
      const zz = v[1]! * sb + z * cb;
      const persp = 3.7 / (3.7 + zz / extent);
      return { x: w / 2 + x * scale * persp, y: cy - y * scale * persp, z: zz, r: persp };
    };
    // Subtle ground glow (visual only).
    const grd = c.createRadialGradient(w / 2, h * 0.76, 3, w / 2, h * 0.76, w * 0.35);
    grd.addColorStop(0, "rgba(75,154,167,.09)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = grd;
    c.fillRect(0, 0, w, h);
    const corners: Vec3[] = [];
    for (let x = 0; x < 2; x++)
      for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) corners.push([x, y, z]);
    c.strokeStyle = "#58798b";
    c.lineWidth = 1;
    c.globalAlpha = 0.7;
    for (let i = 0; i < 8; i++)
      for (let j = i + 1; j < 8; j++) {
        const a = corners[i]!;
        const b = corners[j]!;
        if (a.reduce((s, v, k) => s + Math.abs(v - b[k]!), 0) !== 1) continue;
        const p = project(a);
        const q = project(b);
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(q.x, q.y);
        c.stroke();
      }
    c.globalAlpha = 1;
    const atoms = this.model.atoms
      .filter((a) => this.visible[a.site] !== false)
      .map((a) => ({ ...a, p: project(a.f) }))
      .sort((a, b) => b.p.z - a.p.z);
    for (const a of atoms) {
      const p = a.p;
      const rad = (a.vacant ? 3.6 : this.large ? 9.6 : 6.5) * p.r * this.zoom;
      const color = SITE_COLORS[a.site % 4]!;
      if (a.vacant) {
        c.globalAlpha = 0.27;
        c.strokeStyle = color;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(p.x, p.y, rad, 0, Math.PI * 2);
        c.stroke();
        c.globalAlpha = 1;
        continue;
      }
      const g = c.createRadialGradient(
        p.x - rad * 0.32,
        p.y - rad * 0.4,
        rad * 0.06,
        p.x,
        p.y,
        rad,
      );
      g.addColorStop(0, "#ecffff");
      g.addColorStop(0.28, color);
      g.addColorStop(1, "#1a3a50");
      c.fillStyle = g;
      c.beginPath();
      c.arc(p.x, p.y, rad, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = color;
      c.globalAlpha = 0.55;
      c.lineWidth = 0.7;
      c.stroke();
      c.globalAlpha = 1;
      if (this.labels) {
        c.font = `${this.large ? 10 : 8}px system-ui`;
        c.fillStyle = "#d8e8ef";
        c.fillText(a.el, p.x + rad + 3, p.y + 3);
      }
    }
    const origin = project([0, 0, 0]);
    for (const [label, f] of [
      ["a", [0.25, 0, 0]],
      ["b", [0, 0.25, 0]],
      ["c", [0, 0, 0.25]],
    ] as [string, Vec3][]) {
      const p = project(f);
      c.strokeStyle = "#8fa5b3";
      c.globalAlpha = 0.8;
      c.beginPath();
      c.moveTo(origin.x, origin.y);
      c.lineTo(p.x, p.y);
      c.stroke();
      c.globalAlpha = 1;
      c.font = "11px ui-monospace,monospace";
      c.fillStyle = "#bdccd5";
      c.fillText(label, p.x + 3, p.y - 3);
    }
  }
}
