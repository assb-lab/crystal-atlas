import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { databaseLoader, withDeadline } from "../../src/knowledge/lifecycle.ts";
import { missingEvidenceLabel, stepProvenanceLabel } from "../../src/knowledge/presentation.ts";

test("concurrent callers share initialization and reset disposes before replacement", async () => {
  let opened = 0;
  let disposed = 0;
  let release!: () => void;
  const disposal = new Promise<void>((resolve) => {
    release = resolve;
  });
  const loader = databaseLoader(async () => ({
    id: ++opened,
    dispose: async () => {
      disposed++;
      await disposal;
    },
  }));
  const first = loader.get();
  assert.equal(loader.get(), first);
  assert.equal((await first).id, 1);
  const reset = loader.reset();
  assert.equal(loader.reset(), reset);
  const replacement = loader.get();
  await Promise.resolve();
  assert.equal(opened, 1);
  release();
  await reset;
  assert.equal((await replacement).id, 2);
  assert.equal(disposed, 1);
});
test("failed initialization can retry without retaining the failed instance", async () => {
  let attempts = 0;
  const loader = databaseLoader(async () => {
    if (++attempts === 1) throw new Error("failed initialization");
    return { dispose: () => Promise.resolve() };
  });
  await assert.rejects(loader.get(), /failed initialization/);
  await loader.get();
  assert.equal(attempts, 2);
});
test("a stalled vendor RPC fails within a deadline", async () => {
  await assert.rejects(
    withDeadline(new Promise<never>(() => {}), 10, "stalled worker"),
    /stalled worker/,
  );
  assert.equal(await withDeadline(Promise.resolve(42), 100, "unexpected"), 42);
});
test("missing evidence does not turn a scientific claim into editorial classification", () => {
  assert.match(missingEvidenceLabel("editorial"), /編集上/);
  assert.match(missingEvidenceLabel("legacy_curated"), /出典は未登録/);
  assert.doesNotMatch(missingEvidenceLabel("inferred"), /編集上/);
  assert.match(stepProvenanceLabel('{"detailState":"annotated"}'), /注釈.*再照合は未実施/);
  assert.match(stepProvenanceLabel('{"detailState":"not_transcribed"}'), /詳細未転記/);
});
