import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: catalog and pending page coverage are readable on desktop and mobile`, async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    if (label === "standalone") await context.setOffline(true);
    await page.goto(url);
    await page.getByRole("button", { name: "読み方・出典", exact: true }).click();
    await page.getByText("文献目録とページ調査台帳", { exact: true }).click();
    await expect(page.getByTestId("catalog-ready")).toContainText("16 資産", { timeout: 30000 });
    await expect(page.getByTestId("catalog-ready")).toContainText("3,760");
    const selector = page.locator("#catalogAsset");
    await selector.selectOption({ label: "inorganic-structural-chemistry-2ed-2006-muller.pdf" });
    const detail = page.getByTestId("catalog-detail");
    await expect(detail).toContainText("PDF 1–281");
    await expect(detail).toContainText("書誌対応確認済み");
    await expect(detail.locator("dd")).toHaveText(["未調査", "未調査", "未調査", "未調査"]);
    await expect(detail.getByRole("link", { name: /M06/ })).toHaveAttribute("href", "#source-M06");
    await detail.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-catalog-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await selector.selectOption({
      label: "curation/structural-classification-v1.5/cmt-original-si.pdf",
    });
    await expect(detail).toContainText("PDF 1–15");
    await expect(detail).toContainText("補足資料 / curation配置");
    await expect(detail).toContainText("資料区分：補足資料（主論文とは別PDF）");
    await expect(detail).toContainText("CM14");
    await expect(detail).toContainText("年・巻頁・DOIの記載がない");
    await expect(detail).toContainText("印刷頁対応: 未確認");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await detail.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-catalog-mobile.png` });
    await selector.selectOption({ label: "Ulrich_Müller.pdf" });
    await expect(detail).toContainText("PDF 1–20");
    await expect(detail).toContainText("PDF 21–21");
    await expect(detail).toContainText("PDF 22–349");
    await expect(detail.locator(".catalog-range").nth(1).locator("dd")).toHaveText([
      "調査中",
      "調査中",
      "対象なし（確認済み）",
      "対象なし（確認済み）",
    ]);
    await expect(detail).toContainText("IUCr Texts on Crystallography 18");
    await selector.selectOption({ label: "Perovskite_modern_and_ancient.pdf" });
    await expect(detail).toContainText("本文抜粋（書誌未解決）");
    await expect(detail).toContainText("全132頁の内容照合は未実施");
    await expect(detail.locator("dd")).toHaveText(["未調査", "未調査", "未調査", "未調査"]);
    expect(errors).toEqual([]);
  });
}
test("catalog reports a failed database load and can retry", async ({ page }) => {
  await page.route("**/knowledge/atlas.*.lbdb", (route) =>
    route.fulfill({ body: "damaged", contentType: "application/octet-stream" }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "読み方・出典", exact: true }).click();
  await page.getByText("文献目録とページ調査台帳", { exact: true }).click();
  const catalog = page.getByRole("region", { name: "文献目録と調査台帳" });
  await expect(catalog.getByRole("alert")).toContainText("サイズが一致しません");
  await page.unroute("**/knowledge/atlas.*.lbdb");
  await catalog.getByRole("button", { name: "再試行" }).click();
  await expect(page.getByTestId("catalog-ready")).toBeVisible({ timeout: 30000 });
  await expect(catalog.getByRole("alert")).toHaveCount(0);
});
