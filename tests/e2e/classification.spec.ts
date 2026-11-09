import { chooseScheme, pickEntity } from "./workspace-helpers.ts";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: understand a structure's memberships, then compare a classification table`, async ({
    page,
    context,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    if (label === "standalone") await context.setOffline(true);
    await page.goto(url);
    await page.locator('[data-atlas-mode="family"]').click();
    await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
    const main = page.getByTestId("family-content");
    await expect(main).toHaveAttribute("data-subject-kind", "entity");
    await expect(main.getByRole("heading", { level: 3 })).toHaveText("立方ペロブスカイト");
    await expect(main.getByRole("heading", { name: /この構造はどこに属する/ })).toBeVisible();
    const memberships = main.locator("[data-family-membership]");
    expect(await memberships.count()).toBeGreaterThanOrEqual(4);
    await expect(main.locator("table")).toHaveCount(0);
    const first = await memberships.first().boundingBox();
    expect(first!.y + first!.height).toBeLessThan(1050);
    await page.screenshot({ path: `test-results/${label}-family-desktop.png` });
    const hs = main.locator('[data-family-membership="scheme:HS:1998:table1"]');
    await hs.locator('[data-atlas-path="class:HS:0"]').focus();
    await hs.locator('[data-atlas-path="class:HS:0"]').press("Enter");
    await expect(main).toHaveAttribute("data-subject-id", "class:HS:0");
    const table = main.getByRole("table");
    await expect(table.locator("tbody tr")).toHaveCount(16);
    await expect(table.locator('tr[aria-selected="true"]')).toContainText("Pm−3m");
    await expect(main.locator('[data-atlas-member="perov"]')).toBeVisible();
    await expect(
      page.locator('.family-evidence [data-source="HS"][data-page="785"]').first(),
    ).toBeVisible();
    await page.locator("#atlasClassSearch").fill("a0a0c-");
    await expect(table.locator("tbody tr")).toHaveCount(1);
    await expect(table.locator('[data-atlas-class="class:HS:5"]')).toBeVisible();
    await page.locator("#atlasClassSearch").clear();
    await table.locator('[data-atlas-class="class:HS:1"]').click();
    await expect(main).toContainText("具体的な所属構造は未登録");
    await page.screenshot({ path: `test-results/${label}-family-table.png` });
    await table.locator('[data-atlas-class="class:HS:0"]').click();
    await main.locator('[data-atlas-member="perov"]').click();
    await expect(main).toHaveAttribute("data-subject-kind", "entity");
    await chooseScheme(page, "scheme:legacy:GL+HS");
    await main.locator('[data-atlas-class="collection:glazer"]').click();
    await expect(main).toContainText("下位項目の登録は6系");
    await expect(main.locator(".family-children [data-atlas-class]")).toHaveCount(6);
    await main.locator('[data-atlas-class="collection:glazer-a0a0a0"]').click();
    await expect(main.locator(".family-breadcrumb")).toContainText("ペロブスカイト");
    await expect(main).toContainText("別体系：");
    await main.locator('[data-atlas-member="bt-cubic"]').click();
    await expect(main).toHaveAttribute("data-subject-id", "bt-cubic");
    await expect(main.locator("[data-family-membership]")).toHaveCount(4);
    await chooseScheme(page, "scheme:HS:1998:table1");
    await page.getByRole("button", { name: "対象の直接リンク・原記録", exact: true }).click();
    await expect(page.getByTestId("record-ready")).toContainText("Howard–Stokes");
    await page.reload();
    await expect(page.getByTestId("record-ready")).toContainText("Howard–Stokes", {
      timeout: 30000,
    });
    await page.getByRole("button", { name: "Familyでこの体系を見る", exact: true }).click();
    await expect(main).toHaveAttribute("data-subject-id", "scheme:HS:1998:table1");
    await expect(main.getByRole("table").locator("tbody tr")).toHaveCount(16);
    await page.locator("#atlasEntitySearch").fill("Glazer");
    await expect(
      page.locator(".family-results").getByText("分類体系", { exact: true }),
    ).toBeVisible();
    await expect(page.locator('[data-atlas-entity="collection:glazer"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
  test(`${label}: mobile first content and find rocksalt, its family and other members`, async ({
    page,
    context,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (label === "standalone") await context.setOffline(true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url);
    await page.locator('[data-atlas-mode="family"]').click();
    await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
    const main = page.getByTestId("family-content");
    const first = main.locator("[data-family-membership]").first();
    await expect(first).toBeVisible();
    const box = await first.boundingBox();
    expect(box!.y + box!.height).toBeLessThan(844);
    await page.screenshot({ path: `test-results/${label}-family-mobile.png` });
    await page.locator(".atlas-browse-toggle").click();
    await page.locator("#atlasEntitySearch").fill("NaCl");
    await expect(page.locator('[data-atlas-entity="nacl"]')).toContainText("構造型");
    await page.locator('[data-atlas-entity="nacl"]').click();
    await expect(main.getByRole("heading", { level: 3 })).toHaveText("岩塩型");
    await expect(main.locator("[data-family-membership]")).toHaveCount(2);
    await main.locator('[data-atlas-path="collection:galasso-4"]').click();
    await expect(main).toHaveAttribute("data-subject-kind", "item");
    await expect(main.locator('[data-atlas-member="pyrite"]')).toBeVisible();
    await main.locator('[data-atlas-member="pyrite"]').click();
    await expect(main).toHaveAttribute("data-subject-id", "pyrite");
    await page.getByRole("button", { name: "出典・詳しい説明", exact: true }).click();
    await expect(page.getByRole("complementary", { name: "選択の根拠と説明" })).toContainText(
      "未再照合",
    );
    await page.getByRole("button", { name: "← 所属・分類に戻る", exact: true }).click();
    await page.getByRole("button", { name: "← 前へ", exact: true }).click();
    await expect(main).toHaveAttribute("data-subject-id", "collection:galasso-4");
    await pickEntity(page, "material:TiO2");
    await expect(main).toContainText("この対象の所属は未登録");
    const empty = main.locator(".family-unregistered");
    await empty.locator("summary").click();
    await expect(empty).toContainText("未判断・未調査");
    await expect(empty.locator("button")).toHaveCount(10);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
}
