/**
 * 0.22.3 exports WasmFS.createDataFile, but its async FSWriteFile wrapper calls
 * the unavailable legacy writeFile. Preload our snapshot as a new read-only file.
 * This adds no persistence or overwrite API. Refuse upstream wrapper changes.
 */
export function snapshotWorker(source: string): string {
  const call = "FS.writeFile(path, data);";
  if (source.split(call).length !== 2)
    throw new Error("Ladybug snapshot compatibility check failed: review the pinned worker API");
  return source.replace(
    call,
    `if (path !== "/atlas.lbdb") throw new Error("Only the distributed snapshot may be preloaded");
        if (typeof FS.writeFile === "function") FS.writeFile(path, data);
        else FS.createDataFile(path, null, data, true, false);`,
  );
}
