import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    atlasDiagnostics?: () => Record<string, unknown>;
  }
}

const TARGETS = {
  served: "/",
  standalone: pathToFileURL(resolve(import.meta.dirname, "../../dist/crystal-atlas.html")).href,
};

/** Range inputs cannot be filled; set the value through the native setter so React sees the change. */
async function setRange(page: Page, selector: string, value: string) {
  await page.locator(selector).evaluate((el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

const diagnostics = (page: Page) =>
  page.evaluate(
    () => window.atlasDiagnostics!() as { nodes: number; selected: string; family: string },
  );

for (const [label, url] of Object.entries(TARGETS)) {
  test(`${label}: explore, lab, guide and export`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(url);
    await page.waitForFunction(() => typeof window.atlasDiagnostics === "function");
    expect((await diagnostics(page)).nodes).toBe(56);
    await expect(page.locator("#nodeLayer .node")).toHaveCount(10);

    // Search jumps to another family and shows the structure.
    await page.locator("#search").fill("L21");
    await page.locator('[data-searchnode="heusler"]').click();
    expect((await diagnostics(page)).selected).toBe("heusler");
    await expect(page.locator("#inspector h2")).toHaveText("フルホイスラー型");
    await page.locator("#strictFilter").check();
    expect(await page.locator("#edgeLayer .edge").count()).toBeGreaterThan(0);
    await page.locator("#strictFilter").uncheck();
    await page.locator("#listMode").click();
    await expect(page.locator("#listView")).toBeVisible();
    await page.locator("#mapMode").click();

    // Overview: tiles, a bundle's relation list, and opening a tile.
    await page.locator('#families [data-family="all"]').click();
    await expect(page.locator(".familytile")).toHaveCount(6);
    await page.locator(".bundlehit").first().focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#inspector .eyebrow").first()).toContainText("CROSS-FAMILY");
    await page.locator('[data-tile="fcc"]').click();
    expect((await diagnostics(page)).family).toBe("fcc");
    await expect(page.locator("#crossDock .crossitem").first()).toBeVisible();
    await expect(page.locator("#familyTitle .crumb")).toBeVisible();

    // Side panels collapse with ] and reopen when a structure is chosen.
    await page.locator("#map").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("]");
    await expect(page.locator(".workspace")).toHaveClass(/hide-right/);
    await page.locator('[data-node="nacl"]').click();
    await expect(page.locator(".workspace")).not.toHaveClass(/hide-right/);

    // Lab.
    await page.locator('#families [data-family="bcc"]').click();
    await page.locator('[data-node="heusler"]').click();
    await page.locator('[data-openlab="heusler"]').click();
    await expect(page.locator("#lab")).toBeVisible();
    await expect(page.locator("#siteLegend .sitecard")).toHaveCount(4);
    await page.locator('[data-labpreset="half"]').click();
    await expect(page.locator("#labCount")).toContainText("12 原子");
    await page.locator('[data-sub="0"]').uncheck();
    await expect(page.locator("#siteLegend .sitecard.off")).toHaveCount(1);
    await page.locator("#labLabels").check();
    await page.locator("#labReset").click();
    await page.locator('[data-occpreset="corundum"]').click();
    await expect(page.locator("#octaValue")).toHaveText("2/3");
    await setRange(page, "#tetraSlider", "0.25");
    await expect(page.locator("#tetraValue")).toHaveText("1/4");

    // Compare two structures, then the routes dialog.
    await page.locator('[data-tab="explore"]').click();
    await page.locator('#inspector [data-compare="heusler"]').click();
    await page.locator("#search").fill("MgAgAs");
    await page.locator('[data-searchnode="half"]').click();
    await page.locator('#inspector [data-compare="half"]').click();
    await page.locator("#compareOpen").click();
    await expect(page.locator(".comparetable")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#modalBackdrop")).toHaveCount(0);
    await page.locator("#routesBtn").click();
    await expect(page.locator(".routecard")).toHaveCount(6);
    await page.locator("#closeModal").click();

    // Guide and JSON export.
    await page.locator('[data-tab="guide"]').click();
    await expect(page.locator(".sourcecard")).toHaveCount(5);
    const download = page.waitForEvent("download");
    await page.locator("#exportBtn").click();
    const exported = JSON.parse(await readFile(await (await download).path(), "utf8")) as {
      nodes: unknown[];
      edges: unknown[];
    };
    expect([exported.nodes.length, exported.edges.length]).toEqual([56, 62]);

    // Phone width: no horizontal page scroll.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-tab="explore"]').click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
