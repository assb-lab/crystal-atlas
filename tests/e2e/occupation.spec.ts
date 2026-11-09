import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
const prefix = "pilot:K:2-3:relation:";
for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: reviewed void specifications retain roles, selections and held history`, async ({
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
    await expect(page.getByTestId("extraction-ready")).toContainText("採用 17 件 ／ 保留 3 件");
    for (const [name, host, guest, voidKind, selection] of [
      ["nacl", "Na", "Cl", "八面体", "すべて"],
      ["zns", "Zn", "S", "四面体", "2種類のうち一方"],
      ["fluorite", "Ca", "F", "四面体", "両方"],
    ]) {
      if (name === "zns") await page.setViewportSize({ width: 390, height: 844 });
      await page.locator("#extractionCandidate").selectOption(prefix + `fcc-${name}-voids`);
      const decision = page.getByTestId("candidate-decision");
      await expect(decision).toContainText("現在の判断：採用");
      const spec = decision.getByTestId("occupation-spec");
      await expect(spec.locator("dd")).toHaveText([
        "理想fccモチーフ fcc",
        host!,
        guest!,
        voidKind!,
        selection!,
      ]);
      const history = page.getByTestId("decision-history");
      if ((await history.getAttribute("open")) === null) await history.locator("summary").click();
      await expect(history).toContainText("改訂前：保留");
      await expect(history).toContainText("現在：採用");
      await expect(history.locator('[data-source="K"][data-page="158"]').first()).toBeVisible();
      if (name === "fluorite") {
        await expect(spec).toContainText("プロトタイプとの補助照合");
        await expect(
          decision.getByRole("link", { name: /^AFLOW · Fluorite/ }).first(),
        ).toHaveAttribute("href", "https://aflow.org/p/AB2_cF12_225_a_c-001/");
      } else await expect(spec).toContainText("骨格選択の解釈");
      await page.getByRole("button", { name: "採用した関係をDerivationで見る" }).click();
      const id = `adopted:${prefix}fcc-${name}-voids`;
      await expect(page.locator(`[data-knowledge-record="${id}"]`)).toBeVisible();
      await expect(page.locator(".knowledge-detail")).toContainText("保留後の再照合による採用");
      await expect(page.locator(".knowledge-detail")).not.toContainText("初回採用");
      await expect(
        page.locator(".knowledge-detail").getByTestId("occupation-spec").locator("dd"),
      ).toHaveText(["理想fccモチーフ fcc", host!, guest!, voidKind!, selection!]);
      if (name !== "fluorite")
        await expect(
          page.locator(`[data-knowledge-record="adopted:${prefix}fcc-${name}"]`),
        ).toBeVisible();
      await expect(page.locator(".knowledge-detail")).toContainText("数値検証は未実施");
      await expect(page.getByRole("button", { name: "対応する対称性関係を見る" })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.locator(".knowledge-detail").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `test-results/${label}-occupation-${name}.png` });
      await page.getByRole("button", { name: "読み方・出典", exact: true }).click();
    }
    await page.locator("#extractionCandidate").selectOption(prefix + "zns-diamond");
    await expect(page.getByTestId("candidate-decision")).toContainText("現在の判断：保留");
    await expect(page.getByRole("button", { name: "採用した関係をDerivationで見る" })).toHaveCount(
      0,
    );
    expect(errors).toEqual([]);
  });
}
