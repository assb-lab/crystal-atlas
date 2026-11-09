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
    const assets: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/knowledge/")) assets.push(new URL(request.url()).pathname);
    });
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
    await expect(page.locator(".knowledge-detail")).toContainText("既存記述からの操作注釈");
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
    if (label === "modular") {
      expect(assets.some((name) => /atlas\.[a-f0-9]{64}\.lbdb$/.test(name))).toBe(true);
      expect(assets.some((name) => /lbug\.[a-f0-9]{64}\.js$/.test(name))).toBe(true);
      expect(assets.some((name) => /lbug_wasm_worker\.[a-f0-9]{64}\.js$/.test(name))).toBe(true);
    }
    await page.locator('[data-atlas-mode="derivation"]').click();
    await page.locator(".knowledge-atlas > details > summary").click();
    await expect(page.locator("#knowledgeFocus")).toBeEnabled();
    await page.locator("#knowledgeFocus").selectOption("nacoo2-p2");
    await expect(page.locator('section[aria-label="比較関係"]')).toBeVisible();
    await expect(page.locator(".knowledge-detail")).toContainText("構造の比較です");
    await expect(page.locator(".knowledge-detail .refchips")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/${label}-knowledge-comparison-mobile.png` });
  });
}

test("a damaged distributed snapshot shows an error and can be retried", async ({ page }) => {
  await page.route("**/knowledge/atlas.*.lbdb", (route) =>
    route.fulfill({ body: "damaged", contentType: "application/octet-stream" }),
  );
  await page.goto("/");
  await page.locator('[data-atlas-mode="family"]').click();
  await expect(page.getByRole("alert")).toContainText("サイズが一致しません");
  await expect(page.getByTestId("knowledge-ready")).toHaveCount(0);
  await page.unroute("**/knowledge/atlas.*.lbdb");
  await page.getByRole("button", { name: "再試行" }).click();
  await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("other Atlas selections preserve the hidden derivation lens and selection", async ({
  page,
}) => {
  await page.goto("/");
  const index = page.locator('[data-packing-index="pyro-alpha"]');
  await index.evaluate((el) => {
    for (let parent = el.parentElement; parent; parent = parent.parentElement)
      if (parent instanceof HTMLDetailsElement) parent.open = true;
  });
  await index.click();
  await page.locator('[data-packing-node="pyrochlore"] > [role="button"]').first().press("Enter");
  const before = await page.evaluate(() => window.packingDiagnostics!());
  await page.locator('[data-atlas-mode="family"]').click();
  await expect(page.locator("#knowledgeFocus")).toBeEnabled({ timeout: 30000 });
  await page.locator("#knowledgeFocus").selectOption("nacoo2-p2");
  await expect(page.getByTestId("knowledge-ready")).toBeVisible();
  await page.locator('[data-atlas-mode="symmetry"]').click();
  await expect(page.locator("#knowledgeFocus")).toBeEnabled();
  await page.locator("#knowledgeFocus").selectOption("fcc");
  await expect(page.getByTestId("knowledge-ready")).toBeVisible();
  await page.locator('[data-atlas-mode="derivation"]').click();
  const after = await page.evaluate(() => window.packingDiagnostics!());
  for (const key of ["lens", "focus", "selected", "shownIds", "groups"])
    expect(after[key]).toEqual(before[key]);
});

test("a Worker stopped after successful initialization can be recreated by retry", async ({
  page,
}) => {
  test.setTimeout(45000);
  await page.goto("/");
  await page.locator('[data-atlas-mode="family"]').click();
  await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.knowledge-detail [role="status"]')).toHaveCount(0);
  const worker = page.workers()[0]!;
  await worker.evaluate("setTimeout(() => self.close(), 0)");
  await expect.poll(() => page.workers().length).toBe(0);
  await page.locator("#knowledgeFocus").selectOption("nacl");
  await expect(page.getByRole("alert")).toContainText("照会が応答しません", { timeout: 12000 });
  await page.getByRole("button", { name: "再試行" }).click();
  await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(page.workers()).toHaveLength(1);
  await expect(page.locator("#knowledgeFocus")).toHaveValue("nacl");
});
