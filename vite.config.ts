import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins, type Plugin } from "vite-plus";
import { knowledgeAssets } from "./scripts/knowledge-assets.ts";

/**
 * `vp build --mode standalone` writes dist/crystal-atlas.html: one file with the JS and CSS
 * inlined, so it opens by double-click (file://) with no server. The normal build runs first
 * and owns the rest of dist/, so this mode only adds that file.
 */
function standaloneHtml(): Plugin {
  let standalone = false;
  return {
    name: "crystal-atlas:standalone-html",
    apply: "build",
    enforce: "post",
    config(_, env) {
      standalone = env.mode === "standalone";
      return standalone ? { build: { emptyOutDir: false, cssCodeSplit: false } } : undefined;
    },
    generateBundle(_, bundle) {
      if (!standalone) return;
      const page = bundle["index.html"];
      if (!page || page.type !== "asset") throw new Error("index.html was not emitted");
      let html = String(page.source);
      for (const [name, item] of Object.entries(bundle)) {
        if (item.type === "chunk") {
          if (!item.isEntry)
            throw new Error(`Unexpected split chunk ${name}; standalone needs one entry chunk`);
          const tag = new RegExp(
            `<script type="module"[^>]*src="[^"]*${escapeRe(item.fileName)}"[^>]*></script>`,
          );
          if (!tag.test(html)) throw new Error(`Entry script tag for ${name} not found`);
          const code = item.code.replace(/<\/script/gi, "<\\/script");
          html = html.replace(tag, () => `<script type="module">\n${code}\n</script>`);
          delete bundle[name];
        } else if (name.endsWith(".css")) {
          const tag = new RegExp(
            `<link rel="stylesheet"[^>]*href="[^"]*${escapeRe(item.fileName)}"[^>]*>`,
          );
          if (!tag.test(html)) throw new Error(`Stylesheet tag for ${name} not found`);
          html = html.replace(tag, () => `<style>\n${String(item.source)}\n</style>`);
          delete bundle[name];
        }
      }
      if (/(?:src|href)="[^"]*assets\//.test(html))
        throw new Error("Standalone HTML still references assets/");
      delete bundle["index.html"];
      this.emitFile({ type: "asset", fileName: "crystal-atlas.html", source: html });
    },
  };
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default defineConfig({
  // Relative asset URLs, so dist/ works from any sub-path (e.g. GitHub Pages).
  base: "./",
  server: { port: 4173 },
  preview: { port: 4174 },
  fmt: {},
  lint: {
    plugins: ["react", "typescript", "oxc"],
    ignorePatterns: ["dist/**", "playwright-report/**", "test-results/**"],
    rules: {
      "react/rules-of-hooks": "error",
      "react/only-export-components": ["warn", { allowConstantExport: true }],
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
  plugins: lazyPlugins(() => [react(), knowledgeAssets(), standaloneHtml()]),
});
