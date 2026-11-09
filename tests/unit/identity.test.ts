import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { identityRegistry } from "../../src/data/identity.ts";
import { appendIdentity } from "../../src/knowledge/identity.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
const rows = knowledgeDataset(DATA).rows;
test("substance, two phases and prototypes are separate from stable legacy IDs and geometry", () => {
  for (const id of ["rutile", "anatase"]) {
    const old = rows.Entity!.find(([key]) => key === id)!;
    assert.deepEqual(
      JSON.parse(String(old[3])),
      DATA.nodes.find((n) => n.id === id),
    );
    assert.equal(rows.Entity!.find(([key]) => key === `phase:TiO2:${id}`)![2], "material_phase");
    const phase = JSON.parse(String(rows.Entity!.find(([key]) => key === `phase:TiO2:${id}`)![3]));
    assert.equal(phase.conditions.temperatureK, null);
    assert.equal(phase.conditions.pressurePa, null);
    assert.equal(phase.substanceId, "material:TiO2");
    assert.equal(
      rows.Entity!.find(([key]) => key === `prototype:TiO2:${id}`)![2],
      "structural_prototype",
    );
  }
  assert.equal(rows.Entity!.find(([id]) => id === "material:TiO2")![2], "chemical_substance");
  assert.equal(rows.Assertion!.filter((r) => String(r[0]).startsWith("identity:")).length, 6);
  assert.ok(
    !rows.Assertion!.some((r) => String(r[0]).startsWith("identity:") && r[2] === "same_as"),
  );
});
test("every original coordinate model has explicit provenance and unknown conditions without changing coordinates", () => {
  assert.equal(rows.ModelContext!.length, Object.keys(DATA.models).length);
  assert.equal(rows.ContextFor!.length, Object.keys(DATA.models).length);
  for (const [id, model] of Object.entries(DATA.models)) {
    assert.deepEqual(
      JSON.parse(String(rows.StructureModel!.find(([key]) => key === `model:${id}`)![1])),
      model,
    );
    const context = JSON.parse(
      String(rows.ModelContext!.find(([key]) => key === `context:model:${id}`)![2]),
    );
    assert.deepEqual(context.source, model.source);
    assert.deepEqual(context.cell.parameters, model.parameters);
    assert.equal(context.modelKind, model.kind);
    assert.equal(context.refinementState, "not_established");
    assert.equal(context.conditions.temperatureK, null);
    assert.equal(context.cell.setting, null);
    assert.equal(context.cell.lengthUnit, model.kind === "schematic" ? "relative" : "angstrom");
  }
});
test("invalid identities and evidence cannot append partial claims", () => {
  const base = structuredClone(rows);
  const additions = new Set(identityRegistry.entities.map((e) => e.id));
  base.Entity = base.Entity!.filter(([id]) => !additions.has(String(id)));
  base.Assertion = base.Assertion!.filter(([id]) => !String(id).startsWith("identity:"));
  const invalid = (mutate: (r: typeof identityRegistry) => void) => {
    const target = structuredClone(base);
    const registry = structuredClone(identityRegistry);
    mutate(registry);
    assert.throws(() => appendIdentity(target, DATA, registry));
    assert.deepEqual(target, base);
  };
  invalid((r) => {
    r.entities[1]!.substanceId = "anatase";
  });
  invalid((r) => {
    r.entities[1]!.conditions!.temperatureK = -1;
  });
  invalid((r) => {
    r.claims[0]!.objectId = "prototype:TiO2:rutile";
  });
  invalid((r) => {
    r.claims[0]!.references = [];
  });
  invalid((r) => {
    r.entities.push(structuredClone(r.entities[0]!));
  });
  invalid((r) => {
    r.illustrations[0]!.modelId = "model:missing";
  });
});
