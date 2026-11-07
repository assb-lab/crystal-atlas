/** The primary hierarchy replaces family/collection/flow selection; shared tools remain covered. */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    packingDiagnostics?: () => Record<string, unknown>;
  }
}
const targets = {
  modular: "/",
  standalone: pathToFileURL(resolve(import.meta.dirname, "../../dist/crystal-atlas.html")).href,
};
const diag = (page: Page) => page.evaluate(() => window.packingDiagnostics!());
const positions = (page: Page) => page.locator("[data-packing-node]").evaluateAll((els) =>
  els.map((e) => [e.getAttribute("data-packing-node"), e.getAttribute("x"), e.getAttribute("y")]),
);
async function panel(page: Page, side: "Sidebar" | "Inspector") {
  const toggle = page.locator(`#toggle${side}`);
  if (await toggle.getAttribute("aria-expanded") !== "true") await toggle.click();
}
async function search(page: Page, query: string, id: string) {
  await panel(page, "Sidebar");
  await page.locator("#packingSearch").fill(query);
  await page.locator(`[data-packing-search="${id}"]`).click();
  await expect.poll(async () => (await diag(page)).selected).toBe(id);
}
async function lenses(page: Page) {
  await panel(page, "Sidebar");
  await page.locator(".packing-lenses").evaluate((e) => (e as HTMLDetailsElement).open = true);
}
async function collection(page: Page, id: string) {
  await lenses(page);
  const button = page.locator(`[data-packing-collection="${id}"]`);
  await button.evaluate((el) => {
    for (let parent = el.parentElement; parent; parent = parent.parentElement)
      if (parent instanceof HTMLDetailsElement) parent.open = true;
  });
  await button.click();
}

for (const [name, url] of Object.entries(targets)) {
  test.describe(name, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(url);
      await page.waitForFunction(() => typeof window.packingDiagnostics === "function");
    });

    test("packing roots, pyrochlore examples, ordering siblings and folding", async ({ page }) => {
      await expect(page.locator("[data-packing-root]")).toHaveCount(6);
      await expect(page.locator("#classification, #sourceFlow")).toHaveCount(0);
      expect((await diag(page)).unplaced).toEqual([]);
      await search(page, "パイロクロア", "pyrochlore");
      expect((await diag(page)).ids).toEqual(expect.arrayContaining([
        "fcc", "fluorite", "defectfluorite", "pyrochlore", "y2ti2o7", "la2zr2o7", "cd2re2o7",
      ]));
      const camera = await page.locator("#packingMap").getAttribute("viewBox");
      await page.locator('[data-packing-node="y2ti2o7"] .packing-card-main').dispatchEvent("click");
      await expect(page.locator("#packingMap")).toHaveAttribute("viewBox", camera!);
      await page.locator('[data-packing-fold="pyrochlore"]').dispatchEvent("click");
      await expect(page.locator('[data-packing-node="y2ti2o7"]')).toHaveCount(0);
      await page.locator('[data-packing-fold="pyrochlore"]').dispatchEvent("click");
      await expect(page.locator('[data-packing-node="y2ti2o7"]')).toHaveCount(1);
      await search(page, "Bサイトを並べ分ける", "perov-order-b");
      expect((await diag(page)).ids).toEqual(expect.arrayContaining([
        "fcc", "ccp-ax3", "perov", "doubleperov", "b-order12", "bamgwo6", "bast",
      ]));
      await search(page, "rutile", "rutile");
      expect((await diag(page)).ids).toEqual(expect.arrayContaining([
        "bcc", "b2", "rutile", "cacl2", "trirutile", "pyrolusite", "ti4o7", "ti5o9",
      ]));
      await page.locator("#packingAlternatives").check();
      expect(await page.locator(".packing-alternative-links > g").count()).toBeGreaterThan(0);
    });

    test("literature highlights preserve positions; narrowing keeps ancestors", async ({ page }) => {
      await search(page, "パイロクロア", "pyrochlore");
      const before = await positions(page);
      await lenses(page);
      await page.locator('.packing-lenses > details').first().evaluate((e) => (e as HTMLDetailsElement).open = true);
      await page.locator('[data-packing-source="K"]').click();
      expect(await positions(page)).toEqual(before);
      await collection(page, "pyro-alpha");
      expect(await positions(page)).toEqual(before);
      await page.locator("#packingLensOnly").click();
      expect((await diag(page)).ids).toEqual(expect.arrayContaining(["fcc", "fluorite", "pyrochlore", "y2ti2o7"]));
      await collection(page, "glazer");
      await page.locator(".packing-reference-table > summary").click();
      await expect(page.locator(".packing-reference-table tbody tr")).toHaveCount(15);
      await collection(page, "delmas");
      await expect(page.locator(".packing-reference-table tbody tr")).toHaveCount(10);
    });

    test("global search enters the hierarchy even under a folded branch", async ({ page }) => {
      await page.locator('[data-tab="guide"]').click();
      await page.keyboard.press("Control+k");
      await expect(page.locator("#globalResults button")).toHaveCount(220);
      await page.locator("#globalQuery").fill("La2Zr2O7");
      await page.keyboard.press("Enter");
      await panel(page, "Inspector");
      expect((await diag(page)).ids).toEqual(expect.arrayContaining(["fcc", "fluorite", "pyrochlore", "la2zr2o7"]));
      await expect(page.locator("#globalSearch")).not.toBeVisible();
      await expect(page.locator("#inspector canvas")).toBeVisible();
      await page.locator('#inspector [data-view-direction="a*"]').click();
      await expect(page.locator("#inspector canvas")).toHaveAttribute("data-direction", "a*");
      await page.locator("#inspector [data-reset-view]").click();
      await expect(page.locator("#inspector canvas")).toHaveAttribute("data-direction", "");
    });

    test("shared models, comparison, lab, citations and raw export remain usable", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await search(page, "nacoo2-p2", "nacoo2-p2");
      await page.locator("#inspector .modeldetails summary").click();
      await expect(page.locator("#inspector .modelsites")).toContainText("Na 0.146 / 空孔 0.854");
      await search(page, "La2Zr2O7", "la2zr2o7");
      await page.locator('[data-compare="la2zr2o7"]').click();
      await search(page, "Y2Ti2O7", "y2ti2o7");
      await page.locator('[data-compare="y2ti2o7"]').click();
      await page.locator("#compareOpen").click();
      await expect(page.locator(".comparisonmodel canvas")).toHaveCount(2);
      await page.keyboard.press("Escape");
      await page.locator('[data-tab="lab"]').click();
      await page.locator('[data-labpreset="half"]').click();
      await expect(page.locator("#labCount")).toContainText("12 原子");
      await page.locator('[data-sub="0"]').uncheck();
      await expect(page.locator("#siteLegend .sitecard.off")).toHaveCount(1);
      await page.locator('#labAxisControls [data-view-direction="b"]').click();
      await expect(page.locator("#labcanvas")).toHaveAttribute("data-direction", "b");
      await page.locator('[data-occpreset="corundum"]').click();
      await expect(page.locator("#octaValue")).toHaveText("2/3");
      await page.locator("#routesBtn").click();
      await expect(page.locator(".routecard")).toHaveCount(12);
      await page.keyboard.press("Escape");
      await page.locator('[data-tab="guide"]').click();
      await expect(page.locator(".sourcecard")).toHaveCount(25);
      const download = page.waitForEvent("download");
      await page.locator("#exportBtn").click();
      const data = JSON.parse(await readFile((await (await download).path())!, "utf8"));
      expect([data.nodes.length, data.edges.length]).toEqual([220, 283]);
      expect(data.models.defectfluorite.kind).toBe("average");
      await page.locator('[data-tab="explore"]').click();
      await search(page, "KMgF3", "kmgf3");
      await page.locator('#inspector [data-source="G"][data-page="185"]').click();
      await expect(page.locator("#sourcePage-G")).toContainText("PDF 196ページ");
      expect(errors).toEqual([]);
    });

    test("full width, resizable sidebars, mobile overlays and keyboard navigation", async ({ page }) => {
      await page.setViewportSize({ width: 2200, height: 1100 });
      expect((await page.locator("#workspace").boundingBox())!.width).toBeGreaterThan(2100);
      await panel(page, "Inspector");
      const separator = page.locator("#leftResize");
      await separator.focus();
      const width = Number(await separator.getAttribute("aria-valuenow"));
      await page.keyboard.press("ArrowRight");
      await expect(separator).toHaveAttribute("aria-valuenow", String(width + 20));
      await page.locator("#packingMap").focus();
      const camera = await page.locator("#packingMap").getAttribute("viewBox");
      await page.keyboard.press("ArrowRight");
      expect(await page.locator("#packingMap").getAttribute("viewBox")).not.toBe(camera);
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator("#toggleSidebar")).toHaveAttribute("aria-expanded", "false");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await search(page, "La2Zr2O7", "la2zr2o7");
      await expect(page.locator("#toggleSidebar")).toHaveAttribute("aria-expanded", "false");
      await panel(page, "Inspector");
      await expect(page.locator("#inspector")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator("#toggleInspector")).toHaveAttribute("aria-expanded", "false");
    });
  });
}
