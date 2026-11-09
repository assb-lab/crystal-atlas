import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

for (const [label, url] of Object.entries({
  modular: "/",
  standalone: pathToFileURL(resolve("dist/crystal-atlas.html")).href,
})) {
  test(`${label}: one WASM snapshot serves Family, Derivation, Symmetry and evidence`, async ({
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
    await expect(page.locator('[data-atlas-mode="derivation"]')).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.locator(".knowledge-atlas > details > summary").click();
    await expect(
      page.getByTestId("knowledge-ready").or(page.getByRole("alert")).first(),
    ).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page.locator('[data-knowledge-record="relation:e1"]').click();
    await expect(page.locator(".knowledge-detail")).toContainText("アニオンccp骨格の八面体空隙");
    await expect(
      page.locator('.knowledge-detail [data-source="M06"][data-page="196"]'),
    ).toBeVisible();
    await page.locator('[data-knowledge-record="derivation:e6"]').click();
    await page.getByRole("button", { name: "対応する対称性関係を見る" }).click();
    await expect(page.locator('[data-atlas-mode="symmetry"]')).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.locator('[data-knowledge-record="relation:e6"]').click();
    await expect(page.locator(".knowledge-detail")).toContainText("群–部分群関係は文献確認済み");
    await expect(page.locator(".knowledge-detail")).toContainText("機械検証は未実施");
    await page.locator('[data-atlas-mode="family"]').click();
    await expect(page.locator("#knowledgeFocus")).toBeEnabled();
    await page.locator("#knowledgeFocus").selectOption("pyrochlore");
    await page.locator('[data-knowledge-record="collection:pyro-alpha:pyrochlore"]').click();
    await expect(page.locator(".knowledge-detail .refchips")).toBeVisible();
    await page.screenshot({ path: `test-results/${label}-knowledge-desktop.png` });
    await page.locator("#knowledgeFocus").selectOption("family:fcc");
    await expect(page.locator(".knowledge-records button")).not.toHaveCount(0);
    await expect(page.locator("#knowledgeFocus")).toHaveValue("family:fcc");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-atlas-mode="symmetry"]').click();
    await expect(page.getByTestId("knowledge-ready")).toBeVisible();
    await page.locator("#knowledgeFocus").selectOption("fcc");
    await page.locator('[data-knowledge-record="relation:e6"]').click();
    await expect(page.locator(".knowledge-detail")).toContainText("群–部分群関係は文献確認済み");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/${label}-knowledge-mobile.png` });
    expect(errors).toEqual([]);
    // Reopening must restore the distributed snapshot, independent of browser persistence.
    await page.reload();
    await page.locator('[data-atlas-mode="family"]').click();
    await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
  });
}

test("a damaged distributed snapshot shows an error and can be retried", async ({ page }) => {
  await page.route("**/knowledge/atlas.lbdb", (route) =>
    route.fulfill({ body: "damaged", contentType: "application/octet-stream" }),
  );
  await page.goto("/");
  await page.locator('[data-atlas-mode="family"]').click();
  await expect(page.getByRole("alert")).toContainText("サイズが一致しません");
  await expect(page.getByTestId("knowledge-ready")).toHaveCount(0);
  await page.unroute("**/knowledge/atlas.lbdb");
  await page.getByRole("button", { name: "再試行" }).click();
  await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("alert")).toHaveCount(0);
});
