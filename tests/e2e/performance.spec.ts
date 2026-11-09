import { pickEntity } from "./workspace-helpers.ts";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { readFile, stat, writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
for (const format of ["modular", "standalone"] as const)
  for (const slow of [false, true])
    test(`${format}: measured lazy DB initialization ${slow ? "with 4x main CPU and 16Mbps main network" : "at baseline"}`, async ({
      page,
      context,
    }, testInfo) => {
      test.setTimeout(90000);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const requests: string[] = [];
      page.on("request", (r) => requests.push(r.url()));
      const cdp = await context.newCDPSession(page);
      if (slow) {
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        if (format === "modular")
          await cdp.send("Network.emulateNetworkConditions", {
            offline: false,
            latency: 80,
            downloadThroughput: 2_000_000,
            uploadThroughput: 1_000_000,
          });
      }
      if (format === "standalone") await context.setOffline(true);
      const nav = Date.now();
      await page.goto(
        format === "modular" ? "/" : pathToFileURL(resolve("dist/crystal-atlas.html")).href,
      );
      await expect(page.locator("#openSearch")).toBeVisible();
      const shellMs = Date.now() - nav;
      expect(requests.some((r) => r.includes("knowledge/"))).toBe(false);
      expect(
        await page.evaluate(() => performance.getEntriesByName("atlas.db.initialize").length),
      ).toBe(0);
      const start = Date.now();
      await page.locator('[data-atlas-mode="family"]').click();
      await expect(page.getByTestId("knowledge-ready")).toBeVisible({ timeout: 70000 });
      await expect(page.getByTestId("family-content")).toContainText("この構造はどこに属する", {
        timeout: 30000,
      });
      const readyMs = Date.now() - start;
      await pickEntity(page, "perov");
      await expect(
        page.getByTestId("family-content").getByRole("heading", { level: 3 }),
      ).toContainText("立方ペロブスカイト");
      const entries = await page.evaluate(() => ({
        initialization: performance.getEntriesByName("atlas.db.initialize").map((e) => e.duration),
        queries: performance.getEntriesByName("atlas.db.query").map((e) => e.duration),
      }));
      const manifest = JSON.parse(await readFile("dist/knowledge/manifest.json", "utf8"));
      const files = {
        database: (await stat(resolve("dist/knowledge", manifest.files.database))).size,
        worker: (await stat(resolve("dist/knowledge", manifest.files.worker))).size,
        standalone: (await stat("dist/crystal-atlas.html")).size,
      };
      const resources = await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .filter((e) => e.name.includes("knowledge/"))
          .map((e) => {
            const r = e as PerformanceResourceTiming;
            return {
              file: new URL(r.name).pathname.split("/").at(-1),
              duration: r.duration,
              encodedBodySize: r.encodedBodySize,
              decodedBodySize: r.decodedBodySize,
              transferSize: r.transferSize,
            };
          }),
      );
      const result = {
        format,
        browser: context.browser()?.version(),
        resources,
        slow,
        shellMs,
        readyMs,
        ...entries,
        bytes: files,
        limits:
          "CDP emulates the page target; Worker CPU/network throttling inheritance and real low-memory/mobile hardware are not established.",
      };
      await writeFile(testInfo.outputPath("measurements.json"), JSON.stringify(result, null, 2));
      await testInfo.attach("measurements", {
        body: JSON.stringify(result, null, 2),
        contentType: "application/json",
      });
      expect(entries.initialization).toHaveLength(1);
      expect(entries.queries.length).toBeGreaterThan(0);
      expect(files.standalone).toBeLessThan(10_000_000);
      expect(errors).toEqual([]);
      await cdp.detach();
    });
