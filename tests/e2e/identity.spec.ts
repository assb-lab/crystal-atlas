import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: material, phase, type and prototype models keep separate identities`, async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (e) => {
      if (e.type() === "error") errors.push(e.text());
    });
    if (label === "standalone") await context.setOffline(true);
    await page.goto(url);
    await page.locator('[data-atlas-mode="family"]').click();
    await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("identity-inventory")).toContainText("未分離の既存カード");
    await page.locator("#knowledgeFocus").selectOption("material:TiO2");
    const profile = page.locator(".knowledge-panel .entity-profile");
    await expect(profile).toContainText("化学物質（組成定義）");
    await expect(profile.getByTestId("entity-description")).toHaveCount(2);
    await profile
      .getByRole("button", { name: "TiO₂ · ルチル相（条件未転記）", exact: true })
      .click();
    await expect(profile).toContainText("物質の相");
    await expect(profile).toContainText("温度未転記 / 圧力未転記");
    await expect(profile).toContainText("室温・常圧とみなしません");
    await expect(profile.getByRole("link", { name: /^AFLOW · TiO₂/ }).first()).toBeVisible();
    await page.screenshot({ path: `test-results/${label}-identity-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#knowledgeFocus").selectOption("prototype:TiO2:anatase");
    await expect(profile).toContainText("原子種付きプロトタイプ");
    const model = profile.getByTestId("model-provenance");
    await model.locator("summary").click();
    await expect(model).toContainText("精密化／計算緩和の状態確認は未実施");
    await expect(model).toContainText("設定未転記 / 原点未転記");
    await expect(model).toContainText("設定1→2");
    await expect(model).toContainText("Ti: 1");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await model.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-identity-mobile.png` });
    await page.locator("#knowledgeFocus").selectOption("anatase");
    await expect(profile).toContainText("構造型");
    await expect(profile.getByTestId("model-provenance")).toContainText(
      "プロトタイプ（実験精密化とは別）",
    );
    expect(errors).toEqual([]);
  });
}
