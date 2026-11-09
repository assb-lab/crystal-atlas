import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { hasStrictRelation } from "../../src/lib/atlas.ts";
import { initialState, reducer, type Action, type State } from "../../src/state.ts";

const run = (...actions: Action[]) => actions.reduce<State>(reducer, initialState());

test("Atlas mode changes retain exploration and ordinary navigation clears counterpart selection", () => {
  const start = run({ type: "classification", id: "perov-a-order" }, { type: "focusSelection" });
  const family = reducer(start, { type: "atlasMode", mode: "family" });
  const picked = reducer(family, { type: "selectNode", id: "nacoo2-p2", jump: false });
  assert.equal(picked.collection, start.collection);
  assert.equal(picked.family, start.family);
  assert.deepEqual(picked.exploration, start.exploration);
  assert.equal(picked.mapSeq, start.mapSeq);
  const symmetry = reducer(picked, {
    type: "atlasMode",
    mode: "symmetry",
    assertionId: "relation:e6",
  });
  assert.equal(symmetry.knowledgeAssertion, "relation:e6");
  assert.equal(reducer(symmetry, { type: "atlasMode", mode: "family" }).knowledgeAssertion, null);
  const normal = reducer(symmetry, { type: "tab", tab: "explore" });
  assert.equal(normal.atlasMode, "derivation");
  assert.equal(normal.knowledgeAssertion, null);
});

test("selecting on the map keeps the camera; jumping elsewhere re-frames and resets exploration", () => {
  const still = run({ type: "selectNode", id: "nacl", jump: false });
  assert.equal(still.mapSeq, 0);
  const jumped = run({ type: "focusSelection" }, { type: "selectNode", id: "heusler" });
  assert.equal(jumped.family, "bcc");
  assert.equal(jumped.exploration.anchor, "heusler");
  assert.deepEqual(jumped.exploration.history, []);
  assert.ok(jumped.mapSeq > 0);
});

test("a classification opens on its first structure, clears the strict filter and shows the map", () => {
  const s = run(
    { type: "strict", on: true },
    { type: "view", view: "list" },
    { type: "classification", id: "perov-a-order" },
  );
  assert.equal(s.collection, "perov-a-order");
  assert.equal(s.selected, "perov");
  assert.equal(s.strict, false);
  assert.equal(s.view, "map");
  assert.equal(run({ type: "classification", id: "" }).collection, null);
});

test("folding, reopening and walking back through focus anchors", () => {
  let s = run(
    { type: "classification", id: "perov-a-order" },
    { type: "selectNode", id: "camntio6-ht", jump: false },
  );
  s = reducer(s, { type: "fold" });
  assert.deepEqual(s.exploration.collapsed, ["camntio6-ht"]);
  s = reducer(s, { type: "openGroup", key: "camntio6-ht" });
  assert.deepEqual(s.exploration.collapsed, []);
  s = reducer(s, { type: "focusSelection" });
  assert.equal(s.exploration.mode, "focus");
  assert.equal(s.exploration.anchor, "camntio6-ht");
  assert.deepEqual(s.exploration.history, ["perov"]);
  s = reducer(s, { type: "back" });
  assert.equal(s.exploration.anchor, "perov");
  assert.equal(s.selected, "perov");
});

test("narrow screens show one overlay at a time; wide screens allow both", () => {
  const narrow = run({ type: "sidebar", side: "right", open: true, narrow: true });
  assert.deepEqual([narrow.sidebars.left, narrow.sidebars.right], [false, true]);
  const wide = run({ type: "sidebar", side: "right", open: true });
  assert.deepEqual([wide.sidebars.left, wide.sidebars.right], [true, true]);
  assert.equal(run({ type: "sidebarWidth", side: "left", width: 999 }).sidebars.leftWidth, 320);
  assert.equal(run({ type: "sidebarWidth", side: "right", width: 0 }).sidebars.rightWidth, 280);
});

test("relations open the detail sidebar; structures do so only on narrow screens", () => {
  assert.equal(run({ type: "selectEdge", id: "e1" }).sidebars.right, true);
  assert.equal(run({ type: "selectNode", id: "nacl", jump: false }).sidebars.right, false);
  assert.equal(
    run({ type: "selectNode", id: "nacl", jump: false, narrow: true }).sidebars.right,
    true,
  );
});

test("picking a search result from the all-families tree opens that structure's family", () => {
  const s = run(
    { type: "family", id: "all" },
    { type: "searchOpen", open: true },
    { type: "searchPick", id: "heusler" },
  );
  assert.equal(s.searchOpen, false);
  assert.equal(s.family, "bcc");
  assert.equal(s.selected, "heusler");
});

test("a structure without confirmed relations lifts the strict filter with a notice", () => {
  const loose = DATA.nodes.find((n) => !hasStrictRelation(n.id))!;
  const s = run({ type: "strict", on: true }, { type: "selectNode", id: loose.id });
  assert.equal(s.strict, false);
  assert.match(s.toast?.msg ?? "", /絞り込みを解除/);
});

test("route steps close dialogs and land unfiltered in the structure's family", () => {
  const s = run(
    { type: "strict", on: true },
    { type: "modal", modal: { kind: "routes" } },
    { type: "pathNode", id: "rutile" },
  );
  assert.equal(s.modal, null);
  assert.equal(s.strict, false);
  assert.equal(s.family, "rutile");
  assert.equal(s.selected, "rutile");
});

test("the focus anchor never points outside the current scope", () => {
  const s = run({ type: "flow", id: DATA.flows[0]!.id });
  const flowEdges = new Set(DATA.flows[0]!.edges);
  const inFlow = DATA.edges.some(
    (e) => flowEdges.has(e.id) && (e.a === s.exploration.anchor || e.b === s.exploration.anchor),
  );
  assert.ok(inFlow);
});
