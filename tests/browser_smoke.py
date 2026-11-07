"""Optional browser regression: pip install playwright; playwright install chromium."""
import json
import os
import shutil
import subprocess
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'test-results'
OUT.mkdir(exist_ok=True)
PORT = int(os.environ.get('ATLAS_TEST_PORT', '4178'))
URL = f'http://127.0.0.1:{PORT}'


def exercise(page, url):
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    if os.environ.get('ATLAS_TEST_IN_MEMORY') == '1':
        if url.startswith('file:'):
            page.set_content((ROOT / 'dist/crystal-atlas.html').read_text())
        else:
            # Environments that disallow all URL navigation can still test native
            # ES modules through local Blob URLs. Only import paths are replaced.
            import re
            html = (ROOT / 'index.html').read_text()
            html = html.replace('<link rel="stylesheet" href="./styles/main.css">',
                                '<style>' + (ROOT / 'styles/main.css').read_text() + '</style>')
            html = re.sub(r'<script type="module"[^>]*>\s*</script>', '', html)
            page.set_content(html)
            modules = {p.relative_to(ROOT).as_posix(): p.read_text() for p in (ROOT / 'src').rglob('*.js')}
            page.evaluate(r"""async (modules) => {
                const urls = new Map();
                function load(path) {
                    if (urls.has(path)) return urls.get(path);
                    const code = modules[path].replace(/from\s+["'](\.[^"']+)["']/g, (_, rel) => {
                        const resolved = new URL(rel, 'https://atlas.invalid/' + path).pathname.slice(1);
                        return 'from ' + JSON.stringify(load(resolved));
                    });
                    const url = URL.createObjectURL(new Blob([code], {type:'text/javascript'}));
                    urls.set(path, url);
                    return url;
                }
                await import(load('src/main.js'));
            }""", modules)
    else:
        page.goto(url)
    page.wait_for_function('typeof window.atlasDiagnostics === "function"')
    assert page.evaluate('window.atlasDiagnostics().nodes') == 56
    expect(page.locator('#nodeLayer .node')).to_have_count(10)
    page.locator('#search').fill('L21')
    page.locator('[data-searchnode="heusler"]').click()
    assert page.evaluate('window.atlasDiagnostics().selected') == 'heusler'
    expect(page.locator('#inspector h2')).to_have_text('フルホイスラー型')
    page.locator('#strictFilter').check()
    assert page.locator('#edgeLayer .edge').count() > 0
    page.locator('#strictFilter').uncheck()
    page.locator('#listMode').click()
    expect(page.locator('#listView')).to_be_visible()
    page.locator('#mapMode').click()
    page.locator('[data-openlab="heusler"]').click()
    expect(page.locator('#lab')).to_be_visible()
    expect(page.locator('#siteLegend .sitecard')).to_have_count(4)
    page.locator('[data-labpreset="half"]').click()
    expect(page.locator('#labCount')).to_contain_text('12 原子')
    page.locator('[data-sub="0"]').uncheck()
    expect(page.locator('#siteLegend .sitecard.off')).to_have_count(1)
    page.locator('#labLabels').check()
    page.locator('#labReset').click()
    page.locator('[data-occpreset="corundum"]').click()
    expect(page.locator('#octaValue')).to_have_text('2/3')
    page.locator('#tetraSlider').evaluate("el => { el.value = '0.25'; }")
    page.locator('#tetraSlider').dispatch_event('input')
    expect(page.locator('#tetraValue')).to_have_text('1/4')
    page.locator('[data-tab="explore"]').click()
    page.locator('[data-compare="heusler"]').click()
    page.locator('#search').fill('MgAgAs')
    page.locator('[data-searchnode="half"]').click()
    page.locator('[data-compare="half"]').click()
    page.locator('#compareOpen').click()
    expect(page.locator('.comparetable')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.locator('#modalBackdrop')).to_be_hidden()
    page.locator('#routesBtn').click()
    expect(page.locator('.routecard')).to_have_count(6)
    page.locator('#closeModal').click()
    page.locator('[data-tab="guide"]').click()
    expect(page.locator('.sourcecard')).to_have_count(5)
    with page.expect_download() as result:
        page.locator('#exportBtn').click()
    exported = json.loads(Path(result.value.path()).read_text())
    assert len(exported['nodes']) == 56 and len(exported['edges']) == 62
    page.locator('[data-tab="explore"]').click()
    page.locator('[data-family="fcc"]').click()
    expect(page.locator('#map')).to_be_visible()
    assert not errors, errors


def main():
    subprocess.run(['node', 'scripts/build.mjs'], cwd=ROOT, check=True)
    server = subprocess.Popen(['node', 'scripts/serve.mjs', '--port', str(PORT)], cwd=ROOT,
                              stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    try:
        for _ in range(100):
            if server.poll() is not None:
                raise RuntimeError(server.stderr.read().decode())
            try:
                with urllib.request.urlopen(URL, timeout=0.25):
                    break
            except OSError:
                time.sleep(0.05)
        else:
            raise RuntimeError('Local test server did not start')
        with sync_playwright() as p:
            executable = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
            browser = p.chromium.launch(headless=True, **({'executable_path': executable} if executable else {}))
            for label, target in [('modular', URL), ('standalone', (ROOT / 'dist/crystal-atlas.html').as_uri())]:
                page = browser.new_page(viewport={'width': 1440, 'height': 1050}, accept_downloads=True)
                exercise(page, target)
                page.screenshot(path=str(OUT / f'{label}-desktop.png'), full_page=True)
                page.locator('[data-tab="lab"]').click()
                page.screenshot(path=str(OUT / f'{label}-lab.png'), full_page=True)
                page.set_viewport_size({'width': 390, 'height': 844})
                page.locator('[data-tab="explore"]').click()
                page.screenshot(path=str(OUT / f'{label}-mobile.png'), full_page=True)
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                page.close()
                print(f'{label}: desktop/mobile interactions passed')
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)


if __name__ == '__main__':
    main()
