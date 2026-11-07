/** Copy the static app and make a dependency-free, file://-safe HTML bundle. */
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = resolve(root, 'dist');
await mkdir(out, { recursive: true });
for (const name of ['index.html', 'src', 'styles']) {
  await cp(resolve(root, name), resolve(out, name), { recursive: true });
}

// This app uses named imports/exports only. This is deliberately not a general
// JavaScript bundler: unsupported module syntax fails instead of being dropped.
const visited = new Set();
const visiting = new Set();
const chunks = [];
async function visit(filename) {
  if (visited.has(filename)) return;
  if (visiting.has(filename)) throw new Error(`Circular import: ${filename}`);
  visiting.add(filename);
  let code = await readFile(filename, 'utf8');
  const pattern = /^import\s+\{[^}]*\}\s+from\s+["'](\.[^"']+)["'];?\s*$/gm;
  for (const match of code.matchAll(pattern)) {
    const dep = resolve(dirname(filename), match[1]);
    if (!dep.startsWith(resolve(root, 'src') + sep)) {
      throw new Error(`Import outside src: ${match[1]}`);
    }
    await visit(dep);
  }
  code = code.replace(pattern, '').replace(/^export\s+(?=(?:const|let|function|class)\b)/gm, '');
  if (/^\s*(?:import|export)\b/m.test(code)) {
    throw new Error(`Unsupported module syntax: ${filename}`);
  }
  chunks.push(`// ${relative(root, filename)}\n${code}`);
  visiting.delete(filename);
  visited.add(filename);
}
await visit(resolve(root, 'src/main.js'));
const script = `(() => {\n'use strict';\n${chunks.join('\n\n')}\n})();`;
new vm.Script(script); // Detect syntax errors and duplicate bindings before writing.
const css = await readFile(resolve(root, 'styles/main.css'), 'utf8');
let html = await readFile(resolve(root, 'index.html'), 'utf8');
html = html
  .replace('<link rel="stylesheet" href="./styles/main.css">', () => `<style>\n${css}\n</style>`)
  .replace(/<script type="module" src="\.\/src\/main\.js">\s*<\/script>/, () =>
    `<script>\n${script.replace(/<\/script/gi, '<\\/script')}\n</script>`);
if (html.includes('src="./src/main.js"')) throw new Error('Entry point was not inlined');
await writeFile(resolve(out, 'crystal-atlas.html'), html, 'utf8');
console.log('Built dist/index.html and dist/crystal-atlas.html');
