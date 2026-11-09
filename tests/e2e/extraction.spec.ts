import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const prefix = "pilot:K:2-3:";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: source occurrences and qualified relation candidates remain separate`, async ({
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
    await expect(page.getByTestId("catalog-ready")).toBeVisible({ timeout: 30000 });
    await page.locator("#catalogAsset").selectOption({ label: "bussei_el_061206.pdf" });
    await expect(page.getByTestId("extraction-ready")).toContainText(
      "登場記録 10 件 ／ 関係候補 10 件",
    );
    await expect(page.getByTestId("extraction-ready")).toContainText("採用 13 件 ／ 保留 7 件");
    const selector = page.locator("#extractionCandidate");
    const detail = page.getByTestId("extraction-detail");
    await expect(selector.locator("option")).toHaveCount(20);
    await selector.selectOption(prefix + "mention:1a");
    await expect(detail).toContainText("単純立方構造 · 登場記録（初回判断を参照）");
    await expect(detail.locator('[data-source="K"][data-page="157"]').first()).toBeVisible();
    await expect(detail).toContainText("simple-cubic");
    await expect(page.getByTestId("candidate-decision")).toContainText("初回判断：採用");
    await selector.selectOption(prefix + "mention:2c");
    await expect(detail.locator('[data-source="K"][data-page="158"]').first()).toBeVisible();
    await expect(detail).toContainText("simple-cubic");
    await expect(page.getByTestId("candidate-decision")).toContainText("初回判断：採用");
    await selector.selectOption(prefix + "relation:fcc-nacl");
    await expect(detail).toContainText("貫入 · 関係候補（初回判断を参照）");
    await expect(detail).toContainText("対称性低下なし");
    await expect(detail).toContainText("(1/2, 0, 0)");
    await expect(detail).toContainText("okamoto-lattices-fcc-nacl");
    await detail.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-extraction-desktop.png` });
    await selector.selectOption(prefix + "relation:fcc-nacl-voids");
    await expect(detail).toContainText("空隙占有");
    await expect(detail).toContainText("O孔を全占有");
    await expect(page.getByTestId("candidate-decision")).toContainText("初回判断：保留");
    await expect(page.getByTestId("candidate-decision")).toContainText("次に必要な作業");
    await expect(
      page
        .getByTestId("candidate-decision")
        .getByRole("button", { name: "採用した関係をDerivationで見る" }),
    ).toHaveCount(0);
    await selector.selectOption(prefix + "relation:zns-diamond");
    await expect(detail).toContainText("逆向き");
    await expect(detail).toContainText("Wyckoff対応の検証は未実施");
    await selector.selectOption(prefix + "relation:nacl-zns-comparison");
    await expect(detail).toContainText("編集上の比較候補（派生操作ではない）");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".catalog-range")).toHaveCount(3);
    await expect(page.locator(".catalog-range").nth(1).locator("dd")).toHaveText([
      "調査中",
      "調査中",
      "対象なし（確認済み）",
      "対象なし（確認済み）",
    ]);
    await expect(page.locator(".catalog-range").last()).toContainText("PDF 4–31");
    await expect(page.locator(".catalog-range").last().locator("dd")).toHaveText([
      "未調査",
      "未調査",
      "未調査",
      "未調査",
    ]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await detail.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-extraction-mobile.png` });
    await selector.selectOption(prefix + "mention:fcc-lattice");
    await expect(page.getByTestId("candidate-decision")).toContainText("初回判断：保留");
    await expect(page.getByTestId("candidate-decision")).toContainText("並進格子");
    await selector.selectOption(prefix + "relation:fcc-nacl");
    await page.getByRole("button", { name: "採用した関係をDerivationで見る" }).click();
    const assertionId = "adopted:" + prefix + "relation:fcc-nacl";
    await expect(page.locator(`[data-knowledge-record="${assertionId}"]`)).toBeVisible();
    await expect(page.locator(".knowledge-detail")).toContainText("文献の文脈を照合");
    await expect(page.locator(".knowledge-detail")).toContainText("二組の面心立方部分格子");
    await expect(page.locator(".knowledge-detail")).toContainText("(1/2, 0, 0)");
    await expect(page.locator(".knowledge-detail")).not.toContainText(
      "既存収録データから移行した記述",
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.locator(".knowledge-atlas > details > summary").click();
    await page.getByRole("button", { name: "読み方・出典", exact: true }).click();
    await page.getByRole("button", { name: "採用した関係をDerivationで見る" }).click();
    await expect(page.locator(`[data-knowledge-record="${assertionId}"]`)).toBeVisible();
    await expect(page.locator(".knowledge-detail")).toContainText(
      "面心立方部分格子の貫入で岩塩型を構築",
    );
    expect(errors).toEqual([]);
  });
}
