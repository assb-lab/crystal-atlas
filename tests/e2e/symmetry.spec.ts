import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
}))
  test(`${label}: symmetry graph drives settings, source checks and shared branch folding`, async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    if (label === "standalone") await context.setOffline(true);
    await page.goto(url);
    await page.locator('[data-atlas-mode="symmetry"]').click();
    await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
    const graph = page.getByRole("region", { name: "対称性の関係図" });
    const checked = graph.locator(
      '[data-knowledge-record="adopted:manual:M13:21:relation:diamond-zns"]',
    );
    await checked.click();
    const spec = page.getByTestId("symmetry-spec");
    await expect(spec).toContainText("宣言した理想模型で代数検証済み");
    await expect(spec).toContainText("8a → 4a + 4c");
    await page.getByText("セル・基底・原点・Wyckoffの詳細", { exact: true }).click();
    await expect(spec).toContainText("[[1,0,0],[0,1,0],[0,0,1]]");
    await page.screenshot({ path: `test-results/${label}-symmetry-desktop.png` });
    await graph.locator('[data-knowledge-record="relation:e8"]').focus();
    await graph.locator('[data-knowledge-record="relation:e8"]').press("Enter");
    await expect(spec).toContainText("既存strict・未再照合");
    await expect(spec).toContainText("未転記（t/k/iを推定しない）");
    await expect(spec).not.toContainText("代数検証済み");
    const fold = page
      .locator('[data-atlas-node="diamond"]')
      .locator("..")
      .getByRole("button", { name: /の枝を折り畳む/ });
    await fold.click();
    await expect(graph.locator('[data-tree-edge="relation:e8"]')).toHaveCount(0);
    await expect(graph.locator('[data-atlas-node="zns"]')).toBeVisible();
    await page.getByRole("button", { name: "折り畳みをすべて解除" }).click();
    await expect(checked).toBeVisible();
    await page.locator('[data-atlas-system="all"]').click();
    await expect(graph.locator("[data-tree-edge]")).toHaveCount(15);
    const labels = await graph.locator("[data-knowledge-record]").evaluateAll((items) =>
      items.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      }),
    );
    for (let i = 0; i < labels.length; i++)
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i]!,
          b = labels[j]!;
        expect(a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h).toBe(
          false,
        );
      }
    await page.locator('[data-atlas-system="diamond"]').click();
    const before = await graph.locator("svg").getAttribute("width");
    await page.getByRole("button", { name: "図を拡大", exact: true }).click();
    expect(await graph.locator("svg").getAttribute("width")).not.toBe(before);
    await page.getByRole("button", { name: "全体に合わせる", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "関係図", exact: true }).click();
    await checked.click();
    await expect(page.getByRole("complementary", { name: "選択の詳細" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/${label}-symmetry-mobile.png` });
    await page.getByRole("button", { name: "← 図に戻る", exact: true }).click();
    await expect(graph).toBeVisible();
    expect(errors).toEqual([]);
  });
