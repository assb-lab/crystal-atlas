import { expect, test } from "vite-plus/test";
import {
  familyPaths,
  membershipGroups,
  familyTopics,
  schemeNames,
} from "../../src/lib/family-navigation.ts";
import type { FamilyClaim } from "../../src/lib/family-navigation.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
import { DATA } from "../../src/data/atlas.ts";
const claim = (
  id: string,
  subjectId: string,
  objectId: string,
  operation = "included_in",
  schemeId = "s",
): FamilyClaim => ({
  id,
  subjectId,
  objectId,
  operation,
  schemeId,
  status: "imported_not_revalidated",
  basis: "editorial_synthesis",
  description: "",
  subjectTitle: subjectId,
  objectTitle: objectId,
});
test("all paths preserve shared children, cross-scheme assertions and memberships without depth caps", () => {
  const chain = Array.from({ length: 12 }, (_, i) => claim(`c${i}`, `n${i + 1}`, `n${i}`));
  const claims = [
    ...chain,
    claim("other", "n12", "other-root", "included_in", "other"),
    claim("m1", "entity", "n12", "member_of"),
    claim("m2", "entity", "n0", "member_of"),
    claim("m3", "entity", "n12", "member_of", "other"),
  ];
  const paths = familyPaths("n12", claims);
  expect(paths).toHaveLength(2);
  expect(paths[0]!.ids).toHaveLength(13);
  expect(paths[1]!.claims[0]!.schemeId).toBe("other");
  const groups = membershipGroups("entity", claims);
  expect(groups).toHaveLength(2);
  expect(groups[0]!.records).toHaveLength(2);
  expect(groups[0]!.paths).toHaveLength(2);
  expect(groups[1]!.records).toHaveLength(1);
  expect(familyPaths("n12", [...chain, claim("loop", "n0", "n12")])).toEqual([]);
});
test("editorial navigation only points to actual entities and schemes, without merging homonymous items", () => {
  const d = knowledgeDataset(DATA);
  const entities = new Set(d.rows.Entity!.map((r) => String(r[0])));
  const schemes = new Set(d.rows.ClassificationScheme!.map((r) => String(r[0])));
  for (const topic of familyTopics)
    for (const entry of topic.entries)
      expect(
        entry.subject.kind === "scheme"
          ? schemes.has(entry.subject.id)
          : entities.has(entry.subject.id),
      ).toBe(true);
  for (const id of Object.keys(schemeNames)) expect(schemes.has(id)).toBe(true);
  expect(entities.has("class:HS:0")).toBe(true);
  expect(entities.has("collection:glazer-a0a0a0")).toBe(true);
});
