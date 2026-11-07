/** Browser regression for the served build and the standalone file (translated from browser_smoke.py). */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    atlasDiagnostics?: () => Record<string, unknown>;
  }
}

const OUT = resolve(import.meta.dirname, "../../test-results");
const TARGETS = {
  modular: "/",
  standalone: pathToFileURL(resolve(import.meta.dirname, "../../dist/crystal-atlas.html")).href,
};

const diag = (page: Page, key: string) => page.evaluate((k) => window.atlasDiagnostics!()[k], key);
const shot = (page: Page, name: string, fullPage = true) =>
  page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

async function expanded(page: Page, id: string) {
  return (await page.locator(`#${id}`).getAttribute("aria-expanded")) === "true";
}

async function showSidebar(page: Page) {
  if (!(await expanded(page, "toggleSidebar"))) await page.locator("#toggleSidebar").click();
}

async function showInspector(page: Page) {
  if (!(await expanded(page, "toggleInspector"))) await page.locator("#toggleInspector").click();
}

async function showMap(page: Page) {
  if (page.viewportSize()!.width <= 900)
    for (const toggle of ["toggleSidebar", "toggleInspector"])
      if (await expanded(page, toggle)) await page.locator(`#${toggle}`).click();
}

async function searchFor(page: Page, value: string) {
  await showSidebar(page);
  await page.locator("#search").fill(value);
}

async function classification(page: Page, value: string, overview = true) {
  await showSidebar(page);
  await page.locator("#classification").selectOption(value);
  await showMap(page);
  if (overview) await page.locator("#overviewGraph").click();
}

/** Range inputs cannot be filled; set the value through the native setter so React sees the change. */
async function setRange(page: Page, selector: string, value: string) {
  await page.locator(selector).evaluate((el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

const pixels = (canvases: Element[]) =>
  canvases.map((canvas) => (canvas as HTMLCanvasElement).toDataURL());

async function exercise(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => typeof window.atlasDiagnostics === "function");
  expect(await diag(page, "nodes")).toBe(220);
  expect(await diag(page, "models")).toBe(220);
  expect(await diag(page, "exploration")).toBe("overview");
  await expect(page.locator("[data-group]")).toHaveCount(0);
  await page.locator("#overviewGraph").click();
  await expect(page.locator("#nodeLayer [data-node]")).toHaveCount(16);
  await showInspector(page);
  await searchFor(page, "L21");
  await page.locator('[data-searchnode="heusler"]').click();
  expect(await diag(page, "selected")).toBe("heusler");
  await expect(page.locator("#inspector h2")).toHaveText("フルホイスラー型");
  await page.locator("#strictFilter").check();
  expect(await page.locator("#edgeLayer .edge").count()).toBeGreaterThan(0);
  await page.locator("#strictFilter").uncheck();
  await page.locator("#listMode").click();
  await expect(page.locator("#listView")).toBeVisible();
  await page.locator("#mapMode").click();
  await page.locator('[data-openlab="heusler"]').click();
  await expect(page.locator("#lab")).toBeVisible();
  await expect(page.locator("#siteLegend .sitecard")).toHaveCount(4);
  await page.locator('[data-labpreset="half"]').click();
  await expect(page.locator("#labCount")).toContainText("12 原子");
  await page.locator('[data-sub="0"]').uncheck();
  await expect(page.locator("#siteLegend .sitecard.off")).toHaveCount(1);
  await page.locator("#labLabels").check();
  await page.locator('#labAxisControls [data-view-direction="b"]').click();
  await expect(page.locator("#labcanvas")).toHaveAttribute("data-direction", "b");
  await page.locator("#labReset").click();
  await expect(page.locator("#labcanvas")).toHaveAttribute("data-direction", "");
  await page.locator('[data-occpreset="corundum"]').click();
  await expect(page.locator("#octaValue")).toHaveText("2/3");
  await setRange(page, "#tetraSlider", "0.25");
  await expect(page.locator("#tetraValue")).toHaveText("1/4");
  await page.locator('[data-tab="explore"]').click();
  await page.locator('[data-compare="heusler"]').click();
  await searchFor(page, "MgAgAs");
  await page.locator('[data-searchnode="half"]').click();
  await page.locator('[data-compare="half"]').click();
  await page.locator("#compareOpen").click();
  await expect(page.locator(".comparetable")).toBeVisible();
  await expect(page.locator(".comparisonmodel canvas")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(page.locator("#modalBackdrop")).toBeHidden();
  await page.locator("#routesBtn").click();
  await expect(page.locator(".routecard")).toHaveCount(12);
  await page.locator("#closeModal").click();
  await page.locator('[data-tab="guide"]').click();
  await expect(page.locator(".sourcecard")).toHaveCount(25);
  const download = page.waitForEvent("download");
  await page.locator("#exportBtn").click();
  const exported = JSON.parse(await readFile((await (await download).path())!, "utf8"));
  expect([exported.nodes.length, exported.edges.length]).toEqual([220, 283]);
  expect(exported.models.defectfluorite.kind).toBe("average");
  await page.locator('[data-tab="explore"]').click();
  await page.locator('[data-family="fcc"]').click();
  await expect(page.locator("#map")).toBeVisible();
  await searchFor(page, "BaAl4");
  await page.locator('[data-searchnode="baal4"]').click();
  await page.locator('#inspector [data-relation="e66"]').click();
  await expect(page.locator("#inspector a.refchip").first()).toHaveAttribute(
    "href",
    "https://doi.org/10.1515/znb-2021-0022",
  );
  await page.locator('[data-comparepair="baal4,thcr2si2"]').click();
  await expect(page.locator(".comparisonrelations article").first()).toContainText("4d・4e");
  await page.keyboard.press("Escape");
}

async function exerciseExpandedCatalog(page: Page) {
  await searchFor(page, "Ba3SrTa2O9");
  await page.locator('[data-searchnode="bast"]').click();
  await expect(page.locator("#inspector canvas")).toBeVisible();
  await expect(page.locator("#inspector h2")).toContainText("1:2 規則型");
  await searchFor(page, "KMgF3");
  await page.locator('[data-searchnode="kmgf3"]').click();
  await page.locator('#inspector [data-source="G"][data-page="185"]').click();
  await expect(page.locator("#sourcePage-G")).toContainText("PDF 196ページ");
  await expect(page.locator("#source-G h3")).toContainText("Pergamon Press, Oxford, 1969");
  await page.locator('[data-tab="explore"]').click();
  await searchFor(page, "CaWO4");
  await page.locator('[data-searchnode="scheelite"]').click();
  await page.locator('#inspector [data-source="GI"][data-page="107"]').click();
  await expect(page.locator("#sourcePage-GI")).toContainText("PDF 111ページ");
  await expect(page.locator("#source-GI h3")).toContainText(
    "Structure and Properties of Inorganic Solids",
  );
  await page.locator('[data-tab="explore"]').click();
}

/** Averaged partial occupancy in a site table, then a side-by-side comparison of MnO₂ tunnels. */
async function exerciseAverageAndTunnels(page: Page) {
  await searchFor(page, "nacoo2-p2");
  await page.locator('[data-searchnode="nacoo2-p2"]').click();
  await expect(page.locator("#inspector .modelcaption").first()).toContainText("平均構造");
  await page.locator("#inspector .modeldetails summary").click();
  await expect(page.locator("#inspector .modelsites")).toContainText("6h");
  await expect(page.locator("#inspector .modelsites")).toContainText("Na 0.146 / 空孔 0.854");
  await searchFor(page, "pyrolusite");
  await page.locator('[data-searchnode="pyrolusite"]').click();
  await page.locator('#inspector [data-relation="breadth-pyrolusite-ramsdellite"]').click();
  await page.locator('[data-comparepair="pyrolusite,ramsdellite"]').click();
  await expect(page.locator(".comparisonmodel canvas")).toHaveCount(2);
  await expect(page.locator(".comparisonrelations article").first()).toContainText("1×2トンネル");
  await page.keyboard.press("Escape");
}

async function exerciseSearchAxesAndFlows(page: Page, label: string) {
  await page.locator('[data-tab="guide"]').click();
  await page.keyboard.press("Meta+k");
  await expect(page.locator("#globalSearch")).toBeVisible();
  await expect(page.locator("#globalResults button")).toHaveCount(220);
  await page.locator("#globalQuery").fill("Li2PbO3");
  await expect(page.locator("#globalResults button").first()).toContainText("Li₂PbO₃");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator("#globalSearch")).not.toBeVisible();
  expect(await diag(page, "selected")).toBe("li2pbo3");
  const canvas = page.locator("#inspector canvas");
  await page.locator('#inspector [data-view-direction="a"]').click();
  await expect(canvas).toHaveAttribute("data-direction", "a");
  const aView = await canvas.evaluate((c) => (c as HTMLCanvasElement).toDataURL());
  await page.locator('#inspector [data-view-direction="a*"]').click();
  expect(await canvas.evaluate((c) => (c as HTMLCanvasElement).toDataURL())).not.toBe(aView);
  await page.locator('#inspector [data-view-direction="a-"]').click();
  await expect(canvas).toHaveAttribute("data-direction", "a-");
  await page.locator("#inspector [data-reset-view]").click();
  await expect(canvas).toHaveAttribute("data-direction", "");
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
    await page.locator("#sourceFlow").selectOption(flow);
    expect(await page.locator("#nodeLayer .node").count()).toBeGreaterThan(0);
    expect(await page.locator("#edgeLayer .edge[marker-end]").count()).toBeGreaterThan(0);
    expect(await page.locator("#nodeLayer [textLength], #nodeLayer [lengthAdjust]").count()).toBe(
      0,
    );
  }
  await page.locator("#sourceFlow").selectOption("rocksalt");
  await shot(page, `${label}-okamoto-flow`);
  await page.locator('[data-family="shear"]').click();
  await page.locator("#overviewGraph").click();
  const title = page.locator('[data-node="tinb2o7"] .nodelabel.title');
  await expect(title).toHaveText("TiNb₂O₇ Wadsley–Roth型");
  expect(await title.evaluate((el) => getComputedStyle(el).textOverflow)).toBe("ellipsis");
  await shot(page, `${label}-natural-type`);
  await page.keyboard.press("Control+k");
  await expect(page.locator("#globalQuery")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#globalSearch")).not.toBeVisible();
  await expect(page.locator("#globalResults button")).toHaveCount(0);
}

async function exerciseClassifications(page: Page, label: string) {
  await page.locator('[data-tab="explore"]').click();
  await classification(page, "perov-a-order");
  expect(await diag(page, "collection")).toBe("perov-a-order");
  await expect(page.locator('#nodeLayer [data-node="camntio6"]')).toHaveCount(1);
  await page.locator('#nodeLayer [data-node="camntio6"]').dispatchEvent("click");
  await expect(page.locator("#inspector")).toContainText("1:1");
  await expect(page.locator("#inspector")).toContainText("a⁺a⁺c⁻");
  await expect(page.locator("#inspector .modelcaption").last()).toContainText("293 K");
  await shot(page, `${label}-a-site-order`);
  await classification(page, "glazer");
  await showMap(page);
  await page.locator("#classificationInfo details:has(table) > summary").click();
  await expect(page.locator("#classificationInfo tbody tr")).toHaveCount(15);
  await expect(page.locator("#classificationInfo")).toContainText("P4₂/nmc");
  expect((await page.locator("#graphStage").boundingBox())!.height).toBeGreaterThanOrEqual(200);
  await shot(page, `${label}-glazer`);
  await classification(page, "delmas");
  await showMap(page);
  await page.locator("#classificationInfo details:has(table) > summary").click();
  await expect(page.locator("#classificationInfo tbody tr")).toHaveCount(10);
  await page.locator('#classificationInfo [data-jump="licoo2-o4"]').click();
  expect(await diag(page, "collection")).toBe("delmas");
  await expect(page.locator("#inspector h2")).toHaveText("O4 · LiCoO₂");
  await expect(page.locator("#inspector")).toContainText("プロトタイプ");
  await shot(page, `${label}-delmas`);
  for (const collection of [
    "honeycomb",
    "honey-lithium",
    "pyrochlores",
    "pyro-beta",
    "galasso",
    "galasso-11",
  ]) {
    await classification(page, collection);
    expect(await diag(page, "collection")).toBe(collection);
    expect(await page.locator("#nodeLayer .node").count()).toBeGreaterThan(0);
    expect(await noHorizontalScroll(page)).toBe(true);
  }
  await shot(page, `${label}-galasso`);
  await classification(page, "perovskites");
  await page.locator("#focusGraph").click();
  await expect(page.locator('[data-node="camntio6-ht"]')).toHaveCount(1);
  await expect(page.locator('[data-node="camntio6"]')).toHaveCount(1);
  expect(await diag(page, "shownNodes")).toBeGreaterThan(20);
  await page.locator("#listMode").click();
  await expect(page.locator("#listView tbody tr")).toHaveCount(73);
  await page.locator("#mapMode").click();
  await page.locator("#readMap").click();
  expect(Number.parseFloat(await page.locator("#zoomText").innerText())).toBeGreaterThanOrEqual(60);
  await page.locator("#mapDown").click();
  await page.locator("#mapUp").click();
  await page.locator("#fitMap").click();
  await page.locator("#readMap").click();
  await shot(page, `${label}-bounded-map`);
  await page.keyboard.press("Meta+k");
  await page.locator("#globalQuery").fill("CaMnTi2O6");
  await expect(page.locator("#globalResults button")).toHaveCount(2);
  await page.keyboard.press("Escape");
}

async function cameraCenter(page: Page) {
  await page.waitForTimeout(100);
  return page.evaluate(() => {
    const m = (document.querySelector("#viewport") as SVGGElement).transform.baseVal.consolidate()!
      .matrix;
    const r = document.querySelector("#map")!.getBoundingClientRect();
    return [(r.width / 2 - m.e) / m.a, (r.height / 2 - m.f) / m.d, m.a];
  });
}

const near = (a: number[], b: number[]) => a.every((v, i) => Math.abs(v - b[i]!) < 0.1);

async function exerciseWorkspace(page: Page, label: string) {
  await classification(page, "perov-a-order", false);
  if (await expanded(page, "toggleInspector")) await page.locator("#toggleInspector").click();
  await expect(page.locator("#nodeLayer [data-node]")).toHaveCount(5);
  await expect(page.locator("#nodeLayer [data-group]")).toHaveCount(0);
  // Parent, child and grandchild coexist before any interaction.
  const levels = await page
    .locator("[data-node]")
    .evaluateAll((nodes) =>
      Object.fromEntries(
        nodes.map((n) => [
          (n as SVGGElement).dataset.node,
          (n as SVGGElement).transform.baseVal.consolidate()!.matrix.f,
        ]),
      ),
    );
  expect(levels.perov).toBeLessThan(levels["camntio6-ht"]);
  expect(levels["camntio6-ht"]).toBeLessThan(levels.camntio6);
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
  const camera = await page.locator("#viewport").getAttribute("transform");
  await page.locator('[data-node="camntio6-ht"]').click();
  expect(await page.locator("#viewport").getAttribute("transform")).toBe(camera);
  await page.locator("#foldBranch").click();
  await expect(page.locator('[data-node="camntio6"]')).toHaveCount(0);
  await expect(page.locator('[data-node="ccto"]')).toHaveCount(1);
  await expect(page.locator('[data-node="namn7o12"]')).toHaveCount(1);
  await expect(page.locator("#clusterLayer [marker-end]")).toHaveCount(0);
  await page.locator('[data-group="camntio6-ht"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-node="camntio6"]')).toHaveCount(1);
  await expect(page.locator("#foldBranch")).toBeFocused();
  await page.locator("#exploreSelection").click();
  expect(await diag(page, "anchor")).toBe("camntio6-ht");
  for (const id of ["perov", "camntio6-ht", "camntio6"])
    await expect(page.locator(`[data-node="${id}"]`)).toHaveCount(1);
  await page.locator("#exploreBack").click();
  expect(await diag(page, "anchor")).toBe("perov");
  await expect(page.locator('[data-node="camntio6"]')).toHaveCount(1);
  await page.locator("#overviewGraph").click();
  const curves = await page
    .locator("#edgeLayer .edge")
    .evaluateAll((edges) => edges.map((e) => e.getAttribute("d") ?? ""));
  expect(curves.every((d) => d.includes("C") && !d.includes("H") && !d.includes("V"))).toBe(true);
  const before = await cameraCenter(page);
  await page.locator("#toggleInspector").click();
  expect(near(before, await cameraCenter(page))).toBe(true);
  const left = page.locator("#leftResize");
  const oldWidth = Number(await left.getAttribute("aria-valuenow"));
  await left.focus();
  await page.keyboard.press("ArrowRight");
  await expect(left).toHaveAttribute("aria-valuenow", String(oldWidth + 20));
  expect(near(before, await cameraCenter(page))).toBe(true);
  const handle = (await page.locator("#rightResize").boundingBox())!;
  await page.mouse.move(handle.x + 3, handle.y + 100);
  await page.mouse.down();
  await page.mouse.move(handle.x - 37, handle.y + 100);
  await page.mouse.up();
  await expect(page.locator("#rightResize")).toHaveAttribute("aria-valuenow", "360");
  await expect(page.locator("#inspector canvas")).toBeVisible();
  expect((await page.locator("#map").boundingBox())!.width).toBeGreaterThan(700);
  await shot(page, `${label}-workspace`, false);
  await page.locator("#toggleSidebar").click();
  await page.locator("#toggleInspector").click();
  expect((await page.locator("#map").boundingBox())!.width).toBeGreaterThanOrEqual(
    page.viewportSize()!.width - 1,
  );
  for (const width of [1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(120);
    expect(await noHorizontalScroll(page)).toBe(true);
    expect((await page.locator("#map").boundingBox())!.height).toBeGreaterThanOrEqual(200);
    await showSidebar(page);
    await expect(page.locator("#classification")).toBeVisible();
    if (width <= 900) {
      await showInspector(page);
      await expect(page.locator("#structureSidebar")).toBeHidden();
      await page.keyboard.press("Escape");
      await expect(page.locator("#inspectorPanel")).toBeHidden();
    } else await page.locator("#toggleSidebar").click();
  }
  await shot(page, `${label}-workspace-mobile`, false);
  await page.setViewportSize({ width: 1440, height: 1050 });
  await showSidebar(page);
  await showInspector(page);
}

async function exerciseModelComparison(page: Page, label: string) {
  await searchFor(page, "defect fluorite");
  await page.locator('[data-searchnode="defectfluorite"]').click();
  await expect(page.locator("#inspector .modelcaption").first()).toContainText("平均構造");
  await page.locator("#inspector .modeldetails summary").click();
  await expect(page.locator("#inspector .modelsites")).toContainText("O 7/8 / 空孔 1/8");
  await page.locator('#inspector [data-relation="e37"]').click();
  await page.locator('[data-comparepair="pyrochlore,defectfluorite"]').click();
  const canvas = page.locator(".comparisonmodel canvas");
  await expect(canvas).toHaveCount(2);
  let initial = await canvas.evaluateAll(pixels);
  await page.locator(".comparisonmodel").first().locator('[data-view-direction="c*"]').click();
  for (const i of [0, 1]) await expect(canvas.nth(i)).toHaveAttribute("data-direction", "c*");
  await page.locator("#compareReset").click();
  expect(await canvas.evaluateAll(pixels)).toEqual(initial);
  await canvas.first().press("ArrowRight");
  const rotated = await canvas.evaluateAll(pixels);
  expect(rotated.every((p, i) => p !== initial[i])).toBe(true);
  await page.locator("#compareReset").click();
  expect(await canvas.evaluateAll(pixels)).toEqual(initial);
  await expect(page.locator(".comparisonrelations article").first()).toContainText(
    "局所の配列を平均化",
  );
  await page.locator(".comparisonmodel").last().locator("summary").click();
  initial = [await canvas.last().evaluate((c) => (c as HTMLCanvasElement).toDataURL())];
  const site = page.locator(".comparisonmodel").last().getByLabel("8c O 7/8 / 空孔 1/8");
  await site.uncheck();
  expect(await canvas.last().evaluate((c) => (c as HTMLCanvasElement).toDataURL())).not.toBe(
    initial[0],
  );
  await site.check();
  await expect(page.locator("#toast")).toBeHidden();
  await page.locator(".modal").evaluate((el) => (el.scrollTop = 0));
  await shot(page, `${label}-comparison`, false);
  await page.keyboard.press("Escape");
  await expect(page.locator("#modalBackdrop")).toBeHidden();
}

for (const [label, url] of Object.entries(TARGETS)) {
  test(`${label}: desktop and mobile interactions`, async ({ page }) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await exercise(page, url);
    await exerciseExpandedCatalog(page);
    await exerciseAverageAndTunnels(page);
    await exerciseSearchAxesAndFlows(page, label);
    await exerciseClassifications(page, label);
    await exerciseModelComparison(page, label);
    await exerciseWorkspace(page, label);
    await shot(page, `${label}-desktop`);
    await page.locator('[data-tab="lab"]').click();
    await shot(page, `${label}-lab`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-tab="explore"]').click();
    await page.locator("#openSearch").click();
    await expect(page.locator("#globalResults button")).toHaveCount(220);
    expect(await noHorizontalScroll(page)).toBe(true);
    await page.keyboard.press("Escape");
    await exerciseClassifications(page, `${label}-mobile`);
    await exerciseModelComparison(page, `${label}-mobile`);
    await shot(page, `${label}-mobile`);
    expect(await noHorizontalScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });
}
