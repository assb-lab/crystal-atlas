import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: extraction scopes separate machine proposals, page evidence and decisions`, async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (label === "standalone") await context.setOffline(true);
    await page.goto(url);
    await page.getByRole("button", { name: "読み方・出典", exact: true }).click();
    await page.getByText("文献目録とページ調査台帳", { exact: true }).click();
    await expect(page.getByTestId("catalog-ready")).toBeVisible({ timeout: 30000 });
    await page.locator("#catalogAsset").selectOption({ label: "bussei_el_061206.pdf" });
    await expect(page.locator("#extractionRun option")).toHaveCount(3);
    await page.locator("#extractionRun").selectOption("extraction:K:pdf4:v1");
    await expect(page.getByTestId("extraction-ready")).toContainText("未判断 9 件");
    await page.locator("#extractionCandidate").selectOption("manual:K:4:mention:5c");
    await expect(page.getByTestId("extraction-detail")).toContainText("不明注記が併存");
    await page.locator("#extractionCandidate").selectOption("manual:K:4:relation:hcp-wurtzite");
    await expect(page.getByTestId("extraction-detail")).toContainText("~3/8");
    await expect(page.getByTestId("candidate-decision")).toHaveCount(0);
    const auto = await page
      .locator("#extractionRun option")
      .evaluateAll((opts) =>
        opts
          .map((o) => (o as HTMLOptionElement).value)
          .find((v) => v.startsWith("extraction:auto:")),
      );
    expect(auto).toBeTruthy();
    await page.locator("#extractionRun").selectOption(auto!);
    await expect(page.getByTestId("extraction-ready")).toContainText("未判断 37 件");
    await expect(page.getByTestId("extraction-detail")).toContainText("印刷頁未確認");
    await page.getByText("抽出時の範囲と未解決事項", { exact: true }).click();
    await expect(page.getByText("辞書SHA-256：")).toBeVisible();
    await page.locator("#extractionRun").selectOption("extraction:K:pdf2-3:v1");
    await expect(page.getByTestId("extraction-ready")).toContainText("採用 20 件");
    await page.locator("#catalogAsset").selectOption({ label: "Ulrich_Müller.pdf" });
    await expect(page.getByTestId("extraction-ready")).toContainText("未判断 3 件");
    await page.locator("#extractionCandidate").selectOption("manual:M13:21:relation:diamond-zns");
    await expect(page.getByTestId("extraction-detail")).toContainText("対称性の候補");
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByTestId("extraction-detail").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-scope-mobile.png` });
    expect(errors).toEqual([]);
  });
}
