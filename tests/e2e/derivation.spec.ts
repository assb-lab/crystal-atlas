import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: symbolic mappings and editorial recipes keep source order and boundaries`, async ({
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
    await page.locator(".knowledge-atlas > details > summary").click();
    await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
    const routes = page.getByRole("region", { name: "構築経路と操作の定義" });
    await expect(routes.locator(".route-members li")).toHaveCount(2);
    await expect(routes).toContainText("編集上の順序付き構築レシピ");
    await expect(routes.locator(".route-members li").first()).toContainText(
      "面心立方部分格子の貫入",
    );
    await expect(routes.locator(".route-members li").last()).toContainText("Na/Clの区別");
    await routes.locator("details > summary").click();
    await routes.locator("#operationDefinition").selectOption("operation:block_substitution");
    await expect(routes).toContainText("必要な記録：ブロックと向き");
    await expect(routes).toContainText("既存記述・未再照合");
    await page.locator('[data-knowledge-record="recipe:fcc-nacl-sc"]').click();
    await expect(page.locator(".knowledge-detail")).toContainText("編集上の複数手順");
    await expect(page.locator(".knowledge-detail .knowledge-step")).toHaveCount(2);
    await expect(page.locator(".knowledge-detail").getByTestId("label-map-spec")).toContainText(
      "Na / Cl → X",
    );
    await page.screenshot({ path: `test-results/${label}-recipe-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await routes.locator(".route-members li").last().getByRole("button").click();
    await expect(page.locator(".knowledge-detail")).toContainText("保留後の再照合による採用");
    await expect(page.locator(".knowledge-detail").getByTestId("label-map-spec")).toContainText(
      "到達する最小セル",
    );
    await expect(page.getByRole("button", { name: "対応する対称性関係を見る" })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.locator(".knowledge-detail").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${label}-label-map-mobile.png` });
    await page.getByRole("button", { name: "読み方・出典", exact: true }).click();
    await page.getByText("文献目録とページ調査台帳", { exact: true }).click();
    await expect(page.getByTestId("catalog-ready")).toBeVisible();
    await page.locator("#catalogAsset").selectOption({ label: "bussei_el_061206.pdf" });
    await expect(page.getByTestId("extraction-ready")).toContainText("採用 20 件 ／ 保留 0 件");
    await page.locator("#extractionCandidate").selectOption("pilot:K:2-3:relation:zns-diamond");
    await expect(page.getByTestId("label-map-spec")).toContainText("Zn / S → X");
    const history = page.getByTestId("decision-history");
    if ((await history.getAttribute("open")) === null) await history.locator("summary").click();
    await expect(history).toContainText("改訂前：保留");
    await expect(history).toContainText("現在：採用");
    expect(errors).toEqual([]);
  });
}
