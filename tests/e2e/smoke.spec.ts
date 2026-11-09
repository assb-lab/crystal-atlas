/** Packing-first workspace plus regression coverage for unchanged model, lab and reference tools. */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    packingDiagnostics?: () => Record<string, unknown>;
    atlasDiagnostics?: () => Record<string, unknown>;
  }
}
const TARGETS = {
  modular: "/",
  standalone: pathToFileURL(resolve(import.meta.dirname, "../../dist/crystal-atlas.html")).href,
};
const diag = (page: Page) => page.evaluate(() => window.packingDiagnostics!());
async function sidebar(page: Page, side = "left") {
  const toggle = page.locator(side === "left" ? "#toggleSidebar" : "#toggleInspector");
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
}
async function search(page: Page, query: string, id: string) {
  await sidebar(page);
  await page.locator("#packingSearch").fill(query);
  await page.locator(`[data-packing-result="${id}"]`).click();
  await expect.poll(async () => (await diag(page)).selected).toBe(id);
}
async function index(page: Page, id: string, flow = false) {
  await sidebar(page);
  const button = page.locator(`[data-packing-${flow ? "flow" : "index"}="${id}"]`);
  await button.evaluate((el) => {
    for (let parent = el.parentElement; parent; parent = parent.parentElement)
      if (parent instanceof HTMLDetailsElement) parent.open = true;
  });
  await button.click();
  await expect
    .poll(async () => (await diag(page)).lens)
    .toEqual({ kind: flow ? "flow" : "collection", id });
}
const canvasNode = (page: Page, id: string) =>
  page.locator(`[data-packing-node="${id}"] > [role="button"]`).first();
async function cameraCenter(page: Page) {
  return page.evaluate(() => {
    const m = (
      document.querySelector("#packingViewport") as SVGGElement
    ).transform.baseVal.consolidate()!.matrix;
    const r = document.querySelector("#map")!.getBoundingClientRect();
    return [(r.width / 2 - m.e) / m.a, (r.height / 2 - m.f) / m.d, m.a];
  });
}

for (const [label, url] of Object.entries(TARGETS)) {
  test.describe(label, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(url);
      await page.waitForFunction(() => typeof window.packingDiagnostics === "function");
    });
    test("one navigation, explicit overview and pyrochlore realizations", async ({ page }) => {
      expect((await diag(page)).shownNodes).toBe(4);
      await expect(page.locator("#classification,#sourceFlow,#families")).toHaveCount(0);
      await index(page, "pyro-alpha");
      const d = await diag(page);
      const rank = d.ranks as Record<string, number>;
      expect(rank.fcc).toBeLessThan(rank.fluorite);
      expect(rank.fluorite).toBeLessThan(rank.defectfluorite);
      expect(rank.defectfluorite).toBeLessThan(rank.pyrochlore);
      for (const id of ["y2ti2o7", "la2zr2o7", "cd2re2o7"])
        expect(rank.pyrochlore).toBeLessThan(rank[id]);
      expect(d.contextIds).toContain("fcc");
      await canvasNode(page, "pyrochlore").press("Enter");
      await page.locator("#packingFold").click();
      await expect(page.locator('[data-packing-node="y2ti2o7"]')).toHaveCount(0);
      await page.locator("#packingExpandAll").click();
      await expect(page.locator('[data-packing-node="y2ti2o7"]')).toHaveCount(1);
      await page.locator("#packingFit").click();
      await page.screenshot({ path: `test-results/${label}-pyrochlore.png` });
    });
    test("parallel ordering branches and all classification tables survive", async ({ page }) => {
      await index(page, "perov-b-order");
      const d = await diag(page);
      for (const id of [
        "fcc",
        "@mixed-ccp",
        "perov",
        "@perov-order",
        "doubleperov",
        "@b12",
        "bast",
      ])
        expect(d.shownIds).toContain(id);
      const rank = d.ranks as Record<string, number>;
      expect(rank.doubleperov).toBe(rank["@b12"]);
      await index(page, "glazer");
      await page.locator("#classificationInfo > summary").click();
      await expect(page.locator("#classificationInfo tbody tr")).toHaveCount(15);
      await index(page, "delmas");
      await expect(page.locator("#classificationInfo tbody tr")).toHaveCount(10);
      await page.locator('[data-jump="licoo2-o4"]').click();
      await expect(page.locator("#inspector h2")).toHaveText("O4 · LiCoO₂");
      expect((await diag(page)).lens).toEqual({ kind: "collection", id: "delmas" });
    });
    test("documentary overlays cannot change the primary hierarchy", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      for (const flow of [
        "lattices",
        "fourfcc",
        "coloring",
        "rocksalt",
        "nias",
        "blocks",
        "layered",
        "iridates",
      ]) {
        await index(page, flow, true);
        expect((await diag(page)).shownNodes).toBeGreaterThan(0);
      }
      const before = (await diag(page)).shownIds;
      await page.getByLabel("出典を強調", { exact: true }).selectOption("K");
      await page.getByLabel("重ねる関係を群–部分群に限定").check();
      expect((await diag(page)).shownIds).toEqual(before);
      await page.locator("#listMode").click();
      await expect(page.locator(".packing-explore .listview")).toBeVisible();
      expect(errors).toEqual([]);
    });
    test("rutile, Magneli members and inverse ReO3 have connected parents", async ({ page }) => {
      await search(page, "rutile", "rutile");
      const d = await diag(page);
      for (const id of ["bcc", "b2", "rutile", "pyrolusite", "@magneli", "ti4o7", "ti5o9"])
        expect(d.shownIds).toContain(id);
      const rank = d.ranks as Record<string, number>;
      expect(rank.ti4o7).toBe(rank.ti5o9);
      await search(page, "Cu3N", "cu3n");
      for (const id of ["fcc", "perov", "reo3", "cu3n"])
        expect((await diag(page)).shownIds).toContain(id);
    });
    test("model lab and averaged occupancy stay functional", async ({ page }) => {
      await search(page, "L21", "heusler");
      await page.locator('[data-openlab="heusler"]').click();
      await expect(page.locator("#siteLegend .sitecard")).toHaveCount(4);
      await page.locator('[data-labpreset="half"]').click();
      await expect(page.locator("#labCount")).toContainText("12 原子");
      await page.locator('[data-sub="0"]').uncheck();
      await expect(page.locator("#siteLegend .sitecard.off")).toHaveCount(1);
      await page.locator('#labAxisControls [data-view-direction="b"]').click();
      await expect(page.locator("#labcanvas")).toHaveAttribute("data-direction", "b");
      await page.locator('[data-occpreset="corundum"]').click();
      await expect(page.locator("#octaValue")).toHaveText("2/3");
      await page.locator('[data-tab="explore"]').click();
      await search(page, "nacoo2-p2", "nacoo2-p2");
      await page.locator("#inspector .modeldetails summary").click();
      await expect(page.locator("#inspector .modelsites")).toContainText("Na 0.146 / 空孔 0.854");
    });
    test("comparison keeps synchronized rotation, projections and site visibility", async ({
      page,
    }) => {
      await search(page, "defect fluorite", "defectfluorite");
      await page.locator("#inspector .modeldetails summary").click();
      await expect(page.locator("#inspector .modelsites")).toContainText("O 7/8 / 空孔 1/8");
      await page.locator("#inspector .packing-related > summary").click();
      await page.locator('[data-relation="e37"]').click();
      await page.locator('[data-comparepair="pyrochlore,defectfluorite"]').click();
      const canvas = page.locator(".comparisonmodel canvas");
      await expect(canvas).toHaveCount(2);
      const pixels = () =>
        canvas.evaluateAll((els) => els.map((c) => (c as HTMLCanvasElement).toDataURL()));
      const initial = await pixels();
      await page.locator(".comparisonmodel").first().locator('[data-view-direction="c*"]').click();
      for (const i of [0, 1]) await expect(canvas.nth(i)).toHaveAttribute("data-direction", "c*");
      await page.locator("#compareReset").click();
      expect(await pixels()).toEqual(initial);
      await canvas.first().press("ArrowRight");
      expect((await pixels()).every((p, i) => p !== initial[i])).toBe(true);
      await page.locator(".comparisonmodel").last().locator("summary").click();
      const before = await canvas.last().evaluate((c) => (c as HTMLCanvasElement).toDataURL());
      await page.locator(".comparisonmodel").last().getByLabel("8c O 7/8 / 空孔 1/8").uncheck();
      expect(await canvas.last().evaluate((c) => (c as HTMLCanvasElement).toDataURL())).not.toBe(
        before,
      );
      await page.keyboard.press("Escape");
      await expect(page.locator("#modalBackdrop")).toBeHidden();
    });
    test("global search from another tab and repeated selection reveal the primary path", async ({
      page,
    }) => {
      await page.locator('[data-tab="guide"]').click();
      await page.keyboard.press("Control+k");
      await page.locator("#globalQuery").fill("Li2PbO3");
      await page.keyboard.press("Enter");
      await expect(page.locator("#inspector h2")).toContainText("Li₂PbO₃");
      const canvas = page.locator("#inspector canvas");
      await page.locator('#inspector [data-view-direction="a"]').click();
      const aView = await canvas.evaluate((c) => (c as HTMLCanvasElement).toDataURL());
      await page.locator('#inspector [data-view-direction="a*"]').click();
      expect(await canvas.evaluate((c) => (c as HTMLCanvasElement).toDataURL())).not.toBe(aView);
      await sidebar(page);
      await page.locator('[data-packing-nav="bcc"]').click();
      await page.keyboard.press("Control+k");
      await page.locator("#globalQuery").fill("Li2PbO3");
      await page.keyboard.press("Enter");
      await expect.poll(async () => (await diag(page)).shownIds).toContain("li2pbo3");
    });
    test("citations, full raw JSON export and learning routes remain available", async ({
      page,
    }) => {
      await search(page, "KMgF3", "kmgf3");
      await page.locator('#inspector [data-source="G"][data-page="185"]').click();
      await expect(page.locator("#sourcePage-G")).toContainText("PDF 196ページ");
      await expect(page.locator(".sourcecard")).toHaveCount(27);
      const download = page.waitForEvent("download");
      await page.locator("#exportBtn").click();
      const exported = JSON.parse(await readFile((await (await download).path())!, "utf8"));
      expect([exported.nodes.length, exported.edges.length]).toEqual([220, 283]);
      await page.locator("#routesBtn").click();
      await expect(page.locator(".routecard")).toHaveCount(12);
      await page.keyboard.press("Escape");
    });
    test("resizing preserves the graph centre; narrow sidebars and wide window edges work", async ({
      page,
    }) => {
      await index(page, "pyro-alpha");
      await canvasNode(page, "pyrochlore").press("Enter");
      await page.locator("#packingFit").click();
      const before = await cameraCenter(page);
      await page.locator("#toggleInspector").click();
      await expect
        .poll(async () => (await cameraCenter(page)).every((v, i) => Math.abs(v - before[i]) < 0.2))
        .toBe(true);
      const left = page.locator("#leftResize");
      const width = Number(await left.getAttribute("aria-valuenow"));
      await left.focus();
      await page.keyboard.press("ArrowRight");
      await expect(left).toHaveAttribute("aria-valuenow", String(width + 20));
      for (const w of [2200, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width: w, height: 900 });
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
          .toBe(true);
        expect((await page.locator("#map").boundingBox())!.height).toBeGreaterThanOrEqual(180);
        await sidebar(page);
        await sidebar(page, "right");
        if (w <= 900) {
          await expect(page.locator("#structureSidebar")).toBeHidden();
          await page.keyboard.press("Escape");
          await expect(page.locator("#inspectorPanel")).toBeHidden();
        }
        if (w === 2200) {
          const gaps = await page.evaluate(() => [
            document.querySelector("#structureSidebar")!.getBoundingClientRect().left,
            innerWidth - document.querySelector("#inspectorPanel")!.getBoundingClientRect().right,
          ]);
          expect(gaps).toEqual([0, 0]);
        }
      }
      await page.screenshot({ path: `test-results/${label}-packing-mobile.png` });
    });
  });
}
