import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: source classification schemes retain overlap and editorial boundaries`, async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (label === "standalone") await context.setOffline(true);
    await page.goto(url);
    await page.locator('[data-atlas-mode="family"]').click();
    await expect(page.locator("#knowledgeFocus")).toBeEnabled({ timeout: 30000 });
    await page.locator("#knowledgeFocus").selectOption("perov");
    const schemes = page.getByRole("region", { name: "文献別の分類体系" });
    await expect(schemes.getByTestId("scheme-ready")).toBeVisible();
    await expect(schemes).toContainText("分類項目（16件すべて）");
    await expect(schemes).toContainText("頁画像で限定確認");
    await expect(schemes).toContainText("Galasso");
    await schemes.getByText("所属・包含（16件すべて）", { exact: true }).click();
    await expect(schemes.locator('[data-source="HS"][data-page="785"]').last()).toBeVisible();
    await page.screenshot({ path: `test-results/${label}-schemes-desktop.png` });
    await page.locator("#classificationScheme").selectOption("scheme:legacy:GL+HS");
    await expect(schemes).toContainText("複数文献を使った編集上の整理");
    await expect(schemes).toContainText("既存収録・未再照合");
    await expect(schemes.getByTestId("scheme-ready")).toHaveAttribute(
      "data-scheme",
      "scheme:legacy:GL+HS",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await schemes.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-schemes-mobile.png` });
    expect(errors).toEqual([]);
  });
}
