import { pickEntity, chooseScheme } from "./workspace-helpers.ts";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { recordPath, referenceHash } from "../../src/knowledge/navigation.ts";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: cross-record search, direct references, reload and per-view state`, async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (label === "standalone") await context.setOffline(true);
    await page.goto(url);
    await page.locator('[data-atlas-mode="family"]').click();
    await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
    await pickEntity(page, "perov");
    await chooseScheme(page, "scheme:legacy:GL+HS");
    await page.locator('[data-atlas-mode="symmetry"]').click();
    await expect(page.getByTestId("knowledge-ready")).toBeVisible();
    await pickEntity(page, "diamond");
    const old = page.locator('[data-atlas-node="diamond"]').locator("..");
    await old
      .getByRole("button", { name: /の枝を折り畳む/ })
      .first()
      .click();
    await page.locator('[data-atlas-mode="family"]').click();
    await expect(page.getByTestId("atlas-focus")).toHaveAttribute("data-entity-id", "perov");
    await expect(page.locator('[data-atlas-scheme="scheme:legacy:GL+HS"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.locator('[data-atlas-mode="symmetry"]').click();
    await expect(page.getByTestId("atlas-focus")).toHaveAttribute("data-entity-id", "diamond");
    await expect(old.getByRole("button", { name: /の枝を展開/ }).first()).toBeVisible();
    await page.locator("#openSearch").click();
    await page.locator("#searchScope").selectOption("mention");
    await page.locator("#globalQuery").fill("六方晶ダイヤモンド");
    const hit = page.locator('[data-searchrecord="mention:manual:K:4:mention:5c"]');
    await expect(hit).toBeVisible();
    await page.screenshot({ path: `test-results/${label}-cross-search-desktop.png` });
    await hit.click();
    await expect(page.getByTestId("record-ready")).toContainText("不明注記が併存");
    await expect(
      page.getByTestId("record-ready").locator('[data-source="K"][data-pdfpage="4"]'),
    ).toBeVisible();
    const href = await page
      .getByRole("link", { name: "このレコードの直接リンク", exact: true })
      .getAttribute("href");
    expect(href).toContain("kind=mention");
    await page.reload();
    await expect(page.getByTestId("record-ready")).toContainText("不明注記が併存", {
      timeout: 30000,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByTestId("record-ready").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-direct-mobile.png` });
    expect(errors).toEqual([]);
  });
}
test("SSG is real HTML without JavaScript and subpath app references resolve", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(
    `${baseURL}/${recordPath("assertion", "adopted:manual:M13:21:relation:diamond-zns")}`,
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Müller Fig.1.1");
  await expect(page.locator("body")).toContainText("PDF 21");
  const appLink = await page.getByRole("link", { name: "アプリで探索" }).getAttribute("href");
  expect(appLink).toContain("../../index.html#atlas?");
  await page.screenshot({ path: "test-results/ssg-desktop.png" });
  await context.close();
  const mobileContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(
    `${baseURL}/${recordPath("assertion", "adopted:manual:M13:21:relation:diamond-zns")}`,
  );
  await expect(mobile.locator("nav")).toHaveCount(1);
  expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
    true,
  );
  await mobile.screenshot({ path: "test-results/ssg-mobile.png" });
  await mobileContext.close();
  // Serve the exact dist bytes under a prefix, including hashed Worker/DB/SSG paths.
  const p = await browser.newPage();
  await p.route("**/nested/**", async (route) => {
    const relative =
      decodeURIComponent(new URL(route.request().url()).pathname.slice("/nested/".length)) ||
      "index.html";
    if (relative.includes("..")) return route.abort();
    try {
      const body = await readFile(resolve("dist", relative));
      return route.fulfill({
        body,
        contentType: relative.endsWith(".js")
          ? "text/javascript"
          : relative.endsWith(".css")
            ? "text/css"
            : relative.endsWith(".html")
              ? "text/html"
              : relative.endsWith(".json")
                ? "application/json"
                : "application/octet-stream",
      });
    } catch {
      return route.fulfill({ status: 404, body: "missing" });
    }
  });
  await p.goto(
    `${baseURL}/nested/index.html${referenceHash({ kind: "entity", id: "phase:TiO2:anatase" })}`,
  );
  await expect(p.getByTestId("record-ready")).toContainText("アナターゼ", { timeout: 30000 });
  await p.getByRole("button", { name: "Atlasでこの対象を見る" }).click();
  await expect(p.locator("#knowledgeFocus")).toHaveValue("phase:TiO2:anatase");
  await p.close();
});
test("release mismatch fails explicitly, then reloads a coherent manifest", async ({ page }) => {
  await page.route("**/knowledge/manifest.json", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.schemaVersion = -1;
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  await page.locator('[data-atlas-mode="family"]').click();
  await expect(page.locator(".knowledge-error")).toContainText("版が一致しません");
  await page.unroute("**/knowledge/manifest.json");
  await page.getByRole("button", { name: "再試行", exact: true }).click();
  await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
});
test("standalone reports missing gzip support without silently losing the database", async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    Object.defineProperty(globalThis, "DecompressionStream", { value: undefined });
  });
  await context.setOffline(true);
  await page.goto(pathToFileURL(resolve("dist/crystal-atlas.html")).href);
  await page.locator('[data-atlas-mode="family"]').click();
  await expect(page.locator(".knowledge-error")).toContainText("gzip展開に対応したブラウザ");
});
