import { chooseScheme } from "./workspace-helpers.ts";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
}))
  test(`${label}: classification browsing links categories, members and source schemes`, async ({
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
    await page.locator('[data-atlas-mode="family"]').click();
    await expect(page.getByTestId("scheme-ready")).toHaveAttribute(
      "data-scheme",
      "scheme:HS:1998:table1",
      { timeout: 30000 },
    );
    await expect(page.locator("[data-atlas-class]")).toHaveCount(16);
    await expect(page.locator("[data-atlas-class]").first()).toHaveAttribute(
      "data-atlas-class",
      "class:HS:root",
    );
    await page.locator("#atlasClassSearch").fill("a0a0c-");
    await expect(page.locator("[data-atlas-class]")).toHaveCount(1);
    await expect(page.locator("[data-atlas-class]")).toHaveAttribute(
      "data-atlas-class",
      "class:HS:5",
    );
    await page.locator("#atlasClassSearch").clear();
    await page.locator('[data-atlas-class="class:HS:0"]').focus();
    await page.locator('[data-atlas-class="class:HS:0"]').press("Enter");
    const detail = page.getByRole("complementary", { name: "選択の詳細" });
    await expect(detail.getByRole("heading", { level: 3 })).toContainText("Pm−3m");
    await expect(detail.locator('[data-atlas-member="perov"]')).toBeVisible();
    await expect(detail.locator('[data-source="HS"][data-page="785"]')).toBeVisible();
    await detail.getByText(/^同じ構造の所属を比較/).click();
    await expect(detail).toContainText("Galasso");
    await page.screenshot({ path: `test-results/${label}-family-desktop.png` });
    await page.locator('[data-atlas-class="class:HS:1"]').click();
    await expect(detail).toContainText("具体的な所属構造は未登録");
    await chooseScheme(page, "scheme:legacy:GL+HS");
    await expect(page.getByRole("region", { name: "文献別の分類体系" })).toContainText(
      "複数文献を使った編集上の整理",
    );
    await expect(page.getByRole("region", { name: "文献別の分類体系" })).toContainText(
      "既存収録・未再照合",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    const first = page.locator("[data-atlas-class]").first();
    await first.click();
    await expect(detail).toBeVisible();
    await expect(page.getByRole("button", { name: "← 分類に戻る", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/${label}-family-mobile.png` });
    await page.getByRole("button", { name: "← 分類に戻る", exact: true }).click();
    await expect(page.locator("#atlasClassSearch")).toBeVisible();
    expect(errors).toEqual([]);
  });
