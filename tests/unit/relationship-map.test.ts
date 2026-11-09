import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import {
  connectedSystems,
  classificationSearchKey,
  visibleRelationships,
  relationshipLayout,
} from "../../src/lib/relationship-map.ts";
const edge = (id: string, subjectId: string, objectId: string) => ({ id, subjectId, objectId });
test("folding a branch retains a shared descendant reached from another parent", () => {
  const edges = [
    edge("ab", "a", "b"),
    edge("ac", "a", "c"),
    edge("bd", "b", "d"),
    edge("cd", "c", "d"),
    edge("de", "d", "e"),
  ];
  const v = visibleRelationships(edges, new Set(["b"]));
  assert.deepEqual(v.nodeIds, ["a", "b", "c", "d", "e"]);
  assert.deepEqual(
    v.edges.map((e) => e.id),
    ["ab", "ac", "cd", "de"],
  );
  const folded = visibleRelationships(edges, new Set(["b", "c"]));
  assert.deepEqual(folded.nodeIds, ["a", "b", "c"]);
  assert.equal(folded.edges.length, 2);
});
test("all source-specific parallel links and arbitrarily deep descendants remain reachable", () => {
  const edges = [
    ...Array.from({ length: 12 }, (_, i) => edge(`e${i}`, String(i), String(i + 1))),
    edge("alternate", "0", "1"),
  ];
  const v = visibleRelationships(edges, new Set());
  assert.equal(v.edges.length, 13);
  assert.equal(v.nodeIds.length, 13);
  const layout = relationshipLayout(
    v.nodeIds.map((id) => ({ id, title: id })),
    v.edges,
  );
  assert.equal(layout.cyclic, false);
  assert.ok(layout.nodes.find((n) => n.id === "12")!.y > layout.nodes.find((n) => n.id === "0")!.y);
});
test("components, cycles and diagram bounds remain explicit", () => {
  const edges = [edge("ab", "a", "b"), edge("ba", "b", "a"), edge("xy", "x", "y")];
  assert.equal(connectedSystems(edges).length, 2);
  const v = visibleRelationships(edges, new Set());
  assert.equal(v.edges.length, 3);
  const layout = relationshipLayout(
    v.nodeIds.map((id) => ({ id, title: id })),
    v.edges,
  );
  assert.equal(layout.cyclic, true);
  for (const n of layout.nodes) {
    assert.ok(n.x >= 0 && n.x + 220 <= layout.width);
    assert.ok(n.y >= 0 && n.y + 86 <= layout.height);
  }
});

test("Glazer plus/minus and space-group minus signs remain distinct in classification search", () => {
  assert.equal(classificationSearchKey("a⁰a⁰c⁻"), classificationSearchKey("a0a0c-"));
  assert.notEqual(classificationSearchKey("a⁰a⁰c⁻"), classificationSearchKey("a⁰a⁰c⁺"));
  assert.equal(classificationSearchKey("Pm−3m"), classificationSearchKey("pm-3m"));
});
