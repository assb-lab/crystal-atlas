import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
}))
  test(`${label}: symmetry settings and ideal verification retain source direction and unknowns`, async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (label === "standalone") await context.setOffline(true);
    await page.goto(url);
    await page.locator('[data-atlas-mode="symmetry"]').click();
    await expect(page.locator("#knowledgeFocus")).toBeEnabled({ timeout: 30000 });
    const tree = page.getByRole("region", { name: "Bärnighausen tree" });
    await expect(tree).toContainText("登録 15 対応すべて");
    const branch = tree.locator('[data-tree-edge="adopted:manual:M13:21:relation:diamond-zns"]');
    await expect(branch).toContainText("t2");
    await branch.getByRole("button", { name: "この対応の設定と根拠", exact: true }).click();
    const spec = page.getByTestId("symmetry-spec");
    await expect(spec).toContainText("宣言した理想模型で代数検証済み");
    await expect(spec).toContainText("上位 192 ／ 下位 96");
    await expect(spec).toContainText("8a → 4a + 4c");
    await expect(spec).toContainText("[[1,0,0],[0,1,0],[0,0,1]]");
    await spec.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-symmetry-desktop.png` });
    await page.locator('[data-knowledge-record="relation:e8"]').click();
    await expect(spec).toContainText("既存strict・未再照合");
    await expect(spec).toContainText("未転記（t/k/iを推定しない）");
    await expect(spec).not.toContainText("代数検証済み");
    await page.setViewportSize({ width: 390, height: 844 });
    await spec.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/${label}-symmetry-mobile.png` });
    const shared = tree.locator('[data-tree-edge="relation:e8"]');
    await shared.getByRole("button", { name: "− 折り畳む", exact: true }).first().click();
    await expect(
      tree.locator('[data-tree-edge="adopted:manual:M13:21:relation:diamond-zns"]'),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
