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
    await expect(page.getByTestId("extraction-ready")).toContainText("採用 20 件 ／ 保留 0 件");
    const selector = page.locator("#extractionCandidate");
    const detail = page.getByTestId("extraction-detail");
    await expect(selector.locator("option")).toHaveCount(20);
    await selector.selectOption(prefix + "mention:1a");
    await expect(detail).toContainText("単純立方構造 · 登場記録（現在の判断を参照）");
    await expect(detail.locator('[data-source="K"][data-page="157"]').first()).toBeVisible();
    await expect(detail).toContainText("simple-cubic");
    await expect(page.getByTestId("candidate-decision")).toContainText("現在の判断：採用");
    await selector.selectOption(prefix + "mention:2c");
    await expect(detail.locator('[data-source="K"][data-page="158"]').first()).toBeVisible();
    await expect(detail).toContainText("simple-cubic");
    await expect(page.getByTestId("candidate-decision")).toContainText("現在の判断：採用");
    await selector.selectOption(prefix + "relation:fcc-nacl");
    await expect(detail).toContainText("貫入 · 関係候補（現在の判断を参照）");
    await expect(detail).toContainText("対称性低下なし");
    await expect(detail).toContainText("(1/2, 0, 0)");
    await expect(detail).toContainText("okamoto-lattices-fcc-nacl");
    await detail.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-extraction-desktop.png` });
    await selector.selectOption(prefix + "relation:fcc-nacl-voids");
    await expect(detail).toContainText("空隙占有");
    await expect(detail).toContainText("O孔を全占有");
    await expect(page.getByTestId("candidate-decision")).toContainText("現在の判断：採用");
    await expect(page.getByTestId("occupation-spec")).toContainText("Na");
    await expect(page.getByTestId("occupation-spec")).toContainText("Cl");
    await expect(page.getByTestId("decision-history")).toContainText("判断の履歴（2件）");
    await expect(
      page
        .getByTestId("candidate-decision")
        .getByRole("button", { name: "採用した関係をDerivationで見る" }),
    ).toHaveCount(1);
    await selector.selectOption(prefix + "relation:zns-diamond");
    await expect(detail).toContainText("逆向き");
    await expect(detail).toContainText("Wyckoff対応の検証は未実施");
    await selector.selectOption(prefix + "relation:nacl-zns-comparison");
    await expect(detail).toContainText("編集上の比較候補（派生操作ではない）");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".catalog-range")).toHaveCount(4);
    await expect(page.locator(".catalog-range").nth(1).locator("dd")).toHaveText([
      "調査中",
      "調査中",
      "対象なし（確認済み）",
      "対象なし（確認済み）",
    ]);
    await expect(page.locator(".catalog-range").last()).toContainText("PDF 5–31");
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
    await expect(page.getByTestId("candidate-decision")).toContainText("現在の判断：採用");
    await expect(detail).toContainText("bravais:cF");
    await expect(detail).toContainText("ブラベー格子型");
    const history = page.getByTestId("decision-history");
    await expect(history).toContainText("判断の履歴（2件）");
    await history.locator("summary").click();
    await expect(history).toContainText("改訂前：保留");
    await expect(history).toContainText("現在：採用");
    await expect(history.locator('[data-source="K"][data-page="158"]').first()).toBeVisible();
    const profile = page.locator(".entity-profile");
    await expect(profile.getByTestId("entity-description")).toContainText("記述上の対応");
    await expect(profile).toContainText("同一性・派生操作・分類所属・群–部分群関係を主張しない");
    await expect(profile.getByRole("link", { name: /^Souvignier 2016/ })).toBeVisible();
    await profile.getByRole("button", { name: "面心立方 / 立方最密充填", exact: true }).click();
    await expect(profile).toContainText("構造モチーフ");
    await expect(profile).toContainText("fcc");
    await profile.getByRole("button", { name: "cF · 面心立方ブラベー格子型", exact: true }).click();
    await expect(profile).toContainText("対象の範囲：格子の型を表す");
    await profile.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/${label}-lattice-mobile.png` });
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
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.locator("#knowledgeFocus").selectOption("bravais:cF");
    await expect(page.locator(".knowledge-panel .entity-profile")).toContainText("ブラベー格子型");
    await expect(page.locator(".knowledge-panel .entity-profile")).toContainText("記述上の対応");
    await expect(page.locator("[data-knowledge-record]")).toHaveCount(0);
    await page.locator(".knowledge-panel .entity-profile").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-lattice-desktop.png` });
    for (const name of ["Family", "Symmetry"]) {
      await page.locator(`[data-atlas-mode="${name.toLowerCase()}"]`).click();
      await expect(page.getByTestId("knowledge-ready")).toBeVisible();
      await page.locator("#knowledgeFocus").selectOption("bravais:cF");
      await expect(page.locator(".knowledge-panel .entity-profile")).toContainText(
        "ブラベー格子型",
      );
      await expect(page.locator("[data-knowledge-record]")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
}
