import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { DATA } from '../src/data/atlas.js';
import { KINDS, LABPRESETS, OCCPRESETS, ROUTES } from '../src/data/presets.js';
import { esc, frac, normalize, shortestPath } from '../src/utils.js';
import { expanded, fourFCC, modelFor } from '../src/viewer.js';

const ids = new Set(DATA.nodes.map(n => n.id));

test('the v1.0 dataset was preserved byte-for-byte after JSON serialization', async () => {
  const expected = (await readFile(new URL('./original-data.sha256', import.meta.url), 'utf8')).trim();
  assert.equal(createHash('sha256').update(JSON.stringify(DATA)).digest('hex'), expected);
});

test('the initial atlas has 56 structures, 62 relations, 13 strict relations', () => {
  assert.equal(DATA.nodes.length, 56);
  assert.equal(DATA.edges.length, 62);
  assert.equal(DATA.edges.filter(e => e.strict).length, 13);
  assert.equal(Object.keys(DATA.sources).length, 5);
  assert.equal(Object.keys(DATA.families).length, 6);
});

test('structure and relationship IDs are unique', () => {
  assert.equal(ids.size, DATA.nodes.length);
  assert.equal(new Set(DATA.edges.map(e => e.id)).size, DATA.edges.length);
});

test('structures reference known families and have valid graph positions', () => {
  for (const n of DATA.nodes) {
    assert.ok(DATA.families[n.family], n.id);
    for (const field of ['name', 'formula', 'sg', 'desc', 'packing', 'coord', 'link']) {
      assert.equal(typeof n[field], 'string', `${n.id}.${field}`);
      assert.ok(n[field].length, `${n.id}.${field}`);
    }
    assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y), n.id);
    if (n.occ) {
      assert.equal(n.occ.length, 2);
      assert.ok(n.occ.every(x => Number.isFinite(x) && x >= 0 && x <= 1), n.id);
      assert.ok(n.host, n.id);
    }
  }
});

test('every relationship has existing endpoints and a recognized category', () => {
  for (const e of DATA.edges) {
    assert.ok(ids.has(e.a) && ids.has(e.b), e.id);
    assert.notEqual(e.a, e.b);
    assert.ok(KINDS[e.kind], e.id);
    if (e.strict) {
      assert.equal(e.kind, 'symmetry');
      for (const field of ['index', 'basis', 'split']) assert.ok(e[field], `${e.id}.${field}`);
    }
  }
});

test('all source references resolve, with positive one-based PDF page numbers', () => {
  for (const item of [...DATA.nodes, ...DATA.edges, ...Object.values(OCCPRESETS)]) {
    assert.ok(item.refs.length);
    for (const ref of item.refs) {
      assert.ok(DATA.sources[ref.s], ref.s);
      assert.ok(Number.isInteger(ref.p));
      assert.ok(ref.p + DATA.sources[ref.s].offset > 0);
      assert.ok(ref.sec);
    }
  }
});

test('learning routes and lab presets reference existing structures', () => {
  for (const route of ROUTES) for (const id of route.ids) assert.ok(ids.has(id), id);
  for (const p of LABPRESETS) {
    assert.ok(ids.has(p.id), p.id);
    assert.equal(p.els.length, 4);
  }
});

test('search normalizes subscripts, full-width characters, and separators', () => {
  assert.equal(normalize('Ｌ２₁'), 'l21');
  assert.equal(normalize('Fm−3m'), normalize('Fm-3m'));
  assert.equal(normalize('Li₂O'), normalize('Li2O'));
});

test('HTML escaping does not interpret input markup', () => {
  assert.equal(esc('<b>"A" & \'B\'</b>'), '&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;');
  assert.equal(esc(null), '');
});

test('fraction formatting and occupancy arithmetic preserve textbook fractions', () => {
  assert.equal(frac(1 / 8), '1/8');
  assert.equal(frac(2 / 3), '2/3');
  assert.equal(2 * OCCPRESETS.spinel.t + OCCPRESETS.spinel.o, 0.75);
  assert.equal(2 * OCCPRESETS.fluorite.t + OCCPRESETS.fluorite.o, 2);
});

test('path search is explicitly undirected and honors the strict filter', () => {
  const edges = [{ a: 'a', b: 'b', strict: true }, { a: 'b', b: 'c' }];
  assert.deepEqual(shortestPath(edges, 'c', 'a'), ['c', 'b', 'a']);
  assert.equal(shortestPath(edges, 'a', 'c', true), null);
  assert.deepEqual(shortestPath(edges, 'b', 'a', true), ['b', 'a']);
  assert.deepEqual(shortestPath(edges, 'a', 'a'), ['a']);
  assert.equal(shortestPath(edges, 'a', 'unconnected'), null);
});

test('all displayed ideal models have finite cell vectors and atom positions', () => {
  for (const n of DATA.nodes.filter(n => n.model)) {
    const model = modelFor(n.model);
    assert.ok(model.atoms.length, n.id);
    assert.equal(model.cell.length, 3);
    for (const vec of model.cell) assert.ok(vec.every(Number.isFinite), n.id);
    for (const atom of model.atoms) {
      assert.ok(atom.f.every(x => Number.isFinite(x) && x >= 0 && x <= 1), n.id);
    }
  }
});

test('four-fcc models retain atom counts after periodic wrapping', () => {
  for (const preset of LABPRESETS) {
    const model = fourFCC(preset);
    const periodic = new Set(model.atoms.map(a => a.f.map(x => x % 1).join(',')));
    assert.equal(periodic.size, preset.els.filter(Boolean).length * 4, preset.id);
    const withVacancies = fourFCC(preset, true);
    const all = new Set(withVacancies.atoms.map(a => a.f.map(x => x % 1).join(',')));
    assert.equal(all.size, 16, preset.id);
  }
});

test('boundary expansion deduplicates and creates eight corners from an origin', () => {
  const atom = { f: [0, 0, 0], el: 'X', site: 0 };
  assert.equal(expanded([atom, atom]).length, 8);
});
