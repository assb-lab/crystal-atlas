import { expect, type Page } from "@playwright/test";
export async function pickEntity(page: Page, id: string) {
  if (await page.locator(".atlas-workspace").isVisible()) {
    const search = page.locator("#atlasEntitySearch");
    if (!(await search.isVisible())) await page.locator(".atlas-browse-toggle").click();
    await search.fill(id);
    await page.locator(`[data-atlas-entity="${id}"]`).click();
    await expect(page.getByTestId("atlas-focus")).toHaveAttribute("data-entity-id", id);
  } else await page.locator("#knowledgeFocus").selectOption(id);
}
export async function chooseScheme(page: Page, id: string) {
  const item = page.locator(`[data-atlas-scheme="${id}"]`);
  if (!(await item.isVisible())) await page.locator(".atlas-browse-toggle").click();
  await item.click();
  await expect(page.getByTestId("scheme-ready")).toHaveAttribute("data-scheme", id);
}
export async function openModelContext(page: Page) {
  const details = page
    .locator(".atlas-inspector > details")
    .filter({ has: page.locator("summary", { hasText: "構造の説明・模型の由来" }) });
  if ((await details.getAttribute("open")) === null) await details.locator("summary").click();
}
