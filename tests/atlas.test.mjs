import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { DATA } from '../src/data/atlas.js';
import { KINDS, LABPRESETS, OCCPRESETS, ROUTES } from '../src/data/presets.js';
import { esc, frac, normalize, shortestPath, sourcePdfPage } from '../src/utils.js';
import { expanded, fourFCC, modelFor } from '../src/viewer.js';

const ids = new Set(DATA.nodes.map(n => n.id));

test('the serialized dataset matches the curated snapshot', async () => {
  const expected = (await readFile(new URL('./dataset.sha256', import.meta.url), 'utf8')).trim();
  assert.equal(createHash('sha256').update(JSON.stringify(DATA)).digest('hex'), expected);
});

test('the atlas has 185 structures, 199 relations, 14 strict relations', () => {
  assert.equal(DATA.nodes.length, 185);
  assert.equal(DATA.edges.length, 199);
  assert.equal(DATA.edges.filter(e => e.strict).length, 14);
  assert.equal(Object.keys(DATA.sources).length, 11);
  assert.equal(Object.keys(DATA.families).length, 18);
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

test('source references resolve to valid PDF pages or linked articles', () => {
  for (const item of [...DATA.nodes, ...DATA.edges, ...Object.values(OCCPRESETS)]) {
    assert.ok(item.refs.length);
    for (const ref of item.refs) {
      assert.ok(DATA.sources[ref.s], ref.s);
      if (ref.p === undefined) {
        assert.match(ref.url ?? DATA.sources[ref.s].article, /^https:\/\//);
      } else {
        assert.ok(Number.isInteger(ref.p));
        const pdfPage = sourcePdfPage(DATA.sources[ref.s], ref);
        assert.ok(Number.isInteger(pdfPage) && pdfPage > 0);
      }
      assert.ok(ref.sec);
    }
  }
});

test('Galasso book references use bibliographic citations and resolve both PDF page offsets', () => {
  const early = DATA.nodes.find(n => n.id === 'bast').refs[0];
  const late = DATA.nodes.find(n => n.id === 'kmgf3').refs[0];
  const inorganic = DATA.nodes.find(n => n.id === 'scheelite').refs[0];
  assert.equal(sourcePdfPage(DATA.sources.G, early), 17);
  assert.equal(sourcePdfPage(DATA.sources.G, late), 196);
  assert.equal(sourcePdfPage(DATA.sources.GI, inorganic), 111);
  for (const id of ['G', 'GI']) assert.match(DATA.sources[id].citation, /F\. S\. Galasso, .*Pergamon Press/);
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

test('all structures render nonempty unit cells with finite coordinates', () => {
  for (const n of DATA.nodes) {
    const model = modelFor(n.model ?? n.id);
    assert.ok(model.atoms.length, n.id);
    assert.equal(model.cell.length, 3);
    for (const vec of model.cell) assert.ok(vec.every(Number.isFinite), n.id);
    for (const atom of model.atoms) {
      assert.ok(atom.f.every(x => Number.isFinite(x) && x >= 0 && x <= 1), n.id);
    }
  }
});

test('coordinate models preserve Wyckoff multiplicities and occupancy', () => {
  for (const [id, model] of Object.entries(DATA.models)) {
    assert.ok(ids.has(id), id);
    assert.ok(model.source.label, id);
    assert.ok(model.spaceGroup >= 1 && model.spaceGroup <= 230, id);
    assert.ok(model.parameters.every(x => Number.isFinite(x) && x > 0), id);
    const positions = new Set();
    for (const { wyckoff, occupants, positions: orbit } of model.groups) {
      assert.equal(orbit.length, Number.parseInt(wyckoff), id);
      const fractions = Object.values(occupants);
      assert.ok(fractions.length && fractions.every(value => value > 0), id);
      assert.ok(fractions.reduce((sum, value) => sum + value, 0) <= 1 + 1e-8, id);
      for (const site of orbit) {
        assert.ok(site.length === 3 && site.every(x => Number.isFinite(x) && x >= 0 && x < 1), id);
        assert.ok(!positions.has(site.join(',')), id);
        positions.add(site.join(','));
      }
    }
  }
  const oxygen = DATA.models.defectfluorite.groups.find(group => group.occupants.O);
  assert.equal(oxygen.positions.length * oxygen.occupants.O, 7);
  assert.deepEqual(DATA.models.inverse.groups.find(group => group.wyckoff === '16c').occupants, { Mg: 0.5, Al: 0.5 });
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
