import { expect, test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { hasStrictRelation } from "../../src/lib/graph.ts";
import { initialState, reducer, type Action, type State } from "../../src/state.ts";

const run = (...actions: Action[]) => actions.reduce<State>(reducer, initialState());

test("opening a family keeps the selection when it belongs there, else picks the family's own card", () => {
  expect(run({ type: "family", id: "all" }).selected).toBe("fcc");
  const s = run({ type: "family", id: "bcc" });
  expect(s.selected).toBe("bcc");
  expect(s.fitSeq).toBe(1);
});

test("selecting a structure in another family jumps there and reveals the inspector", () => {
  const s = run(
    { type: "panel", side: "right", open: false },
    { type: "selectNode", id: "fluorite" },
  );
  expect(s.family).toBe("fluorite");
  expect(s.panels.right).toBe(true);
  expect(s.fitSeq).toBe(1);
});

test("selecting without jump, or from the overview, stays put", () => {
  expect(run({ type: "selectNode", id: "fluorite", jump: false }).family).toBe("fcc");
  expect(run({ type: "family", id: "all" }, { type: "selectNode", id: "fluorite" }).family).toBe(
    "all",
  );
});

test("selecting a structure with no confirmed relation lifts the strict filter with a notice", () => {
  const loose = DATA.nodes.find((n) => !hasStrictRelation(n.id))!;
  const s = run({ type: "strict", on: true }, { type: "selectNode", id: loose.id });
  expect(s.strict).toBe(false);
  expect(s.toast?.msg).toContain("絞り込みを解除");
});

test("edge, bundle and structure selections replace each other", () => {
  const s1 = run({ type: "selectBundle", key: "fcc|fluorite" }, { type: "selectEdge", id: "e1" });
  expect([s1.edge, s1.bundle]).toEqual(["e1", null]);
  const s2 = reducer(s1, { type: "selectBundle", key: "fcc|hcp" });
  expect([s2.edge, s2.bundle]).toEqual([null, "fcc|hcp"]);
  const s3 = reducer(s2, { type: "selectNode", id: "nacl" });
  expect([s3.edge, s3.bundle, s3.selected]).toEqual([null, null, "nacl"]);
});

test("comparison holds at most two structures", () => {
  const s = run(
    { type: "toggleCompare", id: "fcc" },
    { type: "toggleCompare", id: "nacl" },
    { type: "toggleCompare", id: "zns" },
  );
  expect(s.comp).toEqual(["fcc", "nacl"]);
  expect(s.toast).not.toBeNull();
  expect(reducer(s, { type: "toggleCompare", id: "fcc" }).comp).toEqual(["nacl"]);
});

test("following a route step closes the dialog and shows that structure unfiltered", () => {
  const s = run(
    { type: "strict", on: true },
    { type: "tab", tab: "guide" },
    { type: "modal", modal: { kind: "routes" } },
    { type: "pathNode", id: "rutile" },
  );
  expect(s).toMatchObject({
    modal: null,
    strict: false,
    tab: "explore",
    family: "rutile",
    selected: "rutile",
  });
});

test("moving a slider leaves the named occupancy preset", () => {
  const s = run({ type: "occPreset", key: "corundum" });
  expect(s.o).toBeCloseTo(2 / 3);
  expect(reducer(s, { type: "occ", t: 0.25, o: s.o }).occPreset).toBeNull();
});

test("citations without a PDF open the source entry in the guide", () => {
  const s = run(
    { type: "modal", modal: { kind: "compare" } },
    { type: "source", id: "M06", page: 150 },
  );
  expect(s).toMatchObject({ tab: "guide", modal: null, sourceFocus: { id: "M06", page: 150 } });
});
