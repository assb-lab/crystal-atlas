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
    assert page.evaluate('window.atlasDiagnostics().nodes') == 291
    assert page.evaluate('window.atlasDiagnostics().models') == 291
    expect(page.locator('#nodeLayer .node')).to_have_count(16)
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
    page.locator('#labAxisControls [data-view-direction="b"]').click()
    expect(page.locator('#labcanvas')).to_have_attribute('data-direction', 'b')
    page.locator('#labReset').click()
    expect(page.locator('#labcanvas')).to_have_attribute('data-direction', '')
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
    expect(page.locator('.comparisonmodel canvas')).to_have_count(2)
    page.keyboard.press('Escape')
    expect(page.locator('#modalBackdrop')).to_be_hidden()
    page.locator('#routesBtn').click()
    expect(page.locator('.routecard')).to_have_count(16)
    page.locator('#closeModal').click()
    page.locator('[data-tab="guide"]').click()
    expect(page.locator('.sourcecard')).to_have_count(32)
    with page.expect_download() as result:
        page.locator('#exportBtn').click()
    exported = json.loads(Path(result.value.path()).read_text())
    assert len(exported['nodes']) == 291 and len(exported['edges']) == 365
    assert exported['models']['defectfluorite']['kind'] == 'average'
    page.locator('[data-tab="explore"]').click()
    page.locator('[data-family="fcc"]').click()
    expect(page.locator('#map')).to_be_visible()
    page.locator('#search').fill('BaAl4')
    page.locator('[data-searchnode="baal4"]').click()
    page.locator('#inspector [data-relation="e66"]').click()
    expect(page.locator('#inspector a.refchip').first).to_have_attribute('href', 'https://doi.org/10.1515/znb-2021-0022')
    page.locator('[data-comparepair="baal4,thcr2si2"]').click()
    expect(page.locator('.comparisonrelations article').first).to_contain_text('4d・4e')
    page.keyboard.press('Escape')
    assert not errors, errors


def exercise_expanded_catalog(page):
    page.locator('#search').fill('Ba3SrTa2O9')
    page.locator('[data-searchnode="bast"]').click()
    expect(page.locator('#inspector canvas')).to_be_visible()
    expect(page.locator('#inspector h2')).to_contain_text('1:2 規則型')
    page.locator('#search').fill('KMgF3')
    page.locator('[data-searchnode="kmgf3"]').click()
    page.locator('#inspector [data-source="G"][data-page="185"]').click()
    expect(page.locator('#sourcePage-G')).to_contain_text('PDF 196ページ')
    expect(page.locator('#source-G h3')).to_contain_text('Pergamon Press, Oxford, 1969')
    page.locator('[data-tab="explore"]').click()
    page.locator('#search').fill('CaWO4')
    page.locator('[data-searchnode="scheelite"]').click()
    page.locator('#inspector [data-source="GI"][data-page="107"]').click()
    expect(page.locator('#sourcePage-GI')).to_contain_text('PDF 111ページ')
    expect(page.locator('#source-GI h3')).to_contain_text('Structure and Properties of Inorganic Solids')
    page.locator('[data-tab="explore"]').click()


def exercise_framework_comparison(page):
    page.locator('#search').fill('Li6PS5Cl')
    page.locator('[data-searchnode="argy-cl"]').click()
    expect(page.locator('#inspector .modelcaption').first).to_contain_text('平均構造')
    page.locator('#inspector .modeldetails summary').click()
    expect(page.locator('#inspector .modelsites')).to_contain_text('48h')
    expect(page.locator('#inspector .modelsites')).to_contain_text('Li 1/2 / 空孔 1/2')
    page.locator('#search').fill('FAU')
    page.locator('[data-searchnode="zeo-fau"]').click()
    expect(page.locator('#inspector')).to_contain_text('IZA-SCの理想化SiO₂骨格')
    page.locator('#inspector [data-relation="breadth-zeo-lta-zeo-fau"]').click()
    page.locator('[data-comparepair="zeo-lta,zeo-fau"]').click()
    expect(page.locator('.comparisonmodel canvas')).to_have_count(2)
    expect(page.locator('.comparisonrelations article').first).to_contain_text('LTAの8員環とFAUの12員環')
    page.keyboard.press('Escape')


def exercise_search_axes_and_flows(page, label):
    page.locator('[data-tab="guide"]').click()
    page.keyboard.press('Meta+k')
    expect(page.locator('#globalSearch')).to_be_visible()
    expect(page.locator('#globalResults button')).to_have_count(291)
    page.locator('#globalQuery').fill('Li2PbO3')
    expect(page.locator('#globalResults button').first).to_contain_text('Li₂PbO₃')
    page.keyboard.press('ArrowDown')
    page.keyboard.press('Enter')
    expect(page.locator('#globalSearch')).not_to_be_visible()
    assert page.evaluate('window.atlasDiagnostics().selected') == 'li2pbo3'
    canvas = page.locator('#inspector canvas')
    page.locator('#inspector [data-view-direction="a"]').click()
    expect(canvas).to_have_attribute('data-direction', 'a')
    a_view = canvas.evaluate('canvas => canvas.toDataURL()')
    page.locator('#inspector [data-view-direction="a*"]').click()
    assert canvas.evaluate('canvas => canvas.toDataURL()') != a_view
    page.locator('#inspector [data-view-direction="a-"]').click()
    expect(canvas).to_have_attribute('data-direction', 'a-')
    page.locator('#inspector [data-reset-view]').click()
    expect(canvas).to_have_attribute('data-direction', '')
    for flow in ['lattices', 'fourfcc', 'coloring', 'rocksalt', 'nias', 'blocks', 'layered', 'iridates']:
        page.locator('#sourceFlow').select_option(flow)
        assert page.locator('#nodeLayer .node').count() > 0
        assert page.locator('#edgeLayer .edge[marker-end]').count() > 0
        assert page.locator('#nodeLayer [textLength], #nodeLayer [lengthAdjust]').count() == 0
    page.locator('#sourceFlow').select_option('rocksalt')
    page.screenshot(path=str(OUT / f'{label}-okamoto-flow.png'), full_page=True)
    page.locator('[data-family="ion-ox"]').click()
    title = page.locator('[data-node="nzp"] .nodelabel.title')
    expect(title).to_have_text('NaZr₂(PO₄)₃ (NZP)')
    assert title.evaluate("el => getComputedStyle(el).textOverflow") == 'ellipsis'
    page.screenshot(path=str(OUT / f'{label}-natural-type.png'), full_page=True)
    page.keyboard.press('Control+k')
    expect(page.locator('#globalQuery')).to_be_focused()
    page.keyboard.press('Escape')
    expect(page.locator('#globalSearch')).not_to_be_visible()
    expect(page.locator('#globalResults button')).to_have_count(0)



def exercise_classifications(page, label):
    page.locator('[data-tab="explore"]').click()
    page.locator('#classification').select_option('perov-a-order')
    assert page.evaluate('window.atlasDiagnostics().collection') == 'perov-a-order'
    expect(page.locator('#nodeLayer [data-node="camntio6"]')).to_have_count(1)
    page.locator('#nodeLayer [data-node="camntio6"]').dispatch_event('click')
    expect(page.locator('#inspector')).to_contain_text('1:1')
    expect(page.locator('#inspector')).to_contain_text('a⁺a⁺c⁻')
    expect(page.locator('#inspector .modelcaption').last).to_contain_text('293 K')
    page.screenshot(path=str(OUT / f'{label}-a-site-order.png'), full_page=True)
    page.locator('#classification').select_option('glazer')
    page.locator('#classificationInfo summary').click()
    expect(page.locator('#classificationInfo tbody tr')).to_have_count(15)
    expect(page.locator('#classificationInfo')).to_contain_text('P4₂/nmc')
    assert page.locator('#graphStage').bounding_box()['height'] >= 300
    page.screenshot(path=str(OUT / f'{label}-glazer.png'), full_page=True)
    page.locator('#classification').select_option('delmas')
    page.locator('#classificationInfo summary').click()
    expect(page.locator('#classificationInfo tbody tr')).to_have_count(10)
    page.locator('#classificationInfo [data-jump="licoo2-o4"]').click()
    assert page.evaluate('window.atlasDiagnostics().collection') == 'delmas'
    expect(page.locator('#inspector h2')).to_have_text('O4 · LiCoO₂')
    expect(page.locator('#inspector')).to_contain_text('プロトタイプ')
    page.screenshot(path=str(OUT / f'{label}-delmas.png'), full_page=True)
    for collection in ['honeycomb','honey-lithium','pyrochlores','pyro-beta','galasso','galasso-11']:
        page.locator('#classification').select_option(collection)
        assert page.evaluate('window.atlasDiagnostics().collection') == collection
        assert page.locator('#nodeLayer .node').count() > 0
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    page.screenshot(path=str(OUT / f'{label}-galasso.png'), full_page=True)
    page.locator('#classification').select_option('perovskites')
    positions=page.locator('#nodeLayer .node').evaluate_all(
        "nodes => nodes.map(n => { const m=n.transform.baseVal.consolidate().matrix; return [m.e,m.f]; })")
    rows={}
    for x,y in positions:
        rows.setdefault(y,[]).append(x)
    assert max(map(len,rows.values())) <= 3
    assert max(x for x,y in positions)-min(x for x,y in positions) <= 510
    page.locator('#readMap').click()
    assert float(page.locator('#zoomText').inner_text().strip('%')) >= 60
    page.locator('#mapDown').click()
    page.locator('#mapUp').click()
    page.locator('#fitMap').click()
    page.locator('#readMap').click()
    page.screenshot(path=str(OUT / f'{label}-bounded-map.png'), full_page=True)
    page.keyboard.press('Meta+k')
    page.locator('#globalQuery').fill('CaMnTi2O6')
    expect(page.locator('#globalResults button')).to_have_count(2)
    page.keyboard.press('Escape')


def exercise_model_comparison(page, label):
    page.locator('#search').fill('defect fluorite')
    page.locator('[data-searchnode="defectfluorite"]').click()
    expect(page.locator('#inspector .modelcaption').first).to_contain_text('平均構造')
    page.locator('#inspector .modeldetails summary').click()
    expect(page.locator('#inspector .modelsites')).to_contain_text('O 7/8 / 空孔 1/8')
    page.locator('#inspector [data-relation="e37"]').click()
    page.locator('[data-comparepair="pyrochlore,defectfluorite"]').click()
    canvas = page.locator('.comparisonmodel canvas')
    expect(canvas).to_have_count(2)
    read_pixels = 'canvases => canvases.map(canvas => canvas.toDataURL())'
    initial = canvas.evaluate_all(read_pixels)
    page.locator('.comparisonmodel').first.locator('[data-view-direction="c*"]').click()
    for i in range(2):
        expect(canvas.nth(i)).to_have_attribute('data-direction', 'c*')
    page.locator('#compareReset').click()
    assert canvas.evaluate_all(read_pixels) == initial
    canvas.first.press('ArrowRight')
    rotated = canvas.evaluate_all(read_pixels)
    assert all(a != b for a, b in zip(initial, rotated))
    page.locator('#compareReset').click()
    assert canvas.evaluate_all(read_pixels) == initial
    expect(page.locator('.comparisonrelations article').first).to_contain_text('局所の配列を平均化')
    page.locator('.comparisonmodel').last.locator('summary').click()
    initial = canvas.last.evaluate('canvas => canvas.toDataURL()')
    page.locator('.comparisonmodel').last.get_by_label('8c O 7/8 / 空孔 1/8').uncheck()
    assert canvas.last.evaluate('canvas => canvas.toDataURL()') != initial
    page.locator('.comparisonmodel').last.get_by_label('8c O 7/8 / 空孔 1/8').check()
    expect(page.locator('#toast')).to_be_hidden()
    page.locator('.modal').evaluate('element => { element.scrollTop = 0; }')
    page.screenshot(path=str(OUT / f'{label}-comparison.png'))
    page.keyboard.press('Escape')
    expect(page.locator('#modalBackdrop')).to_be_hidden()


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
                page_errors = []
                page.on('pageerror', lambda e: page_errors.append(str(e)))
                exercise(page, target)
                exercise_expanded_catalog(page)
                exercise_framework_comparison(page)
                exercise_search_axes_and_flows(page, label)
                exercise_classifications(page, label)
                exercise_model_comparison(page, label)
                page.screenshot(path=str(OUT / f'{label}-desktop.png'), full_page=True)
                page.locator('[data-tab="lab"]').click()
                page.screenshot(path=str(OUT / f'{label}-lab.png'), full_page=True)
                page.set_viewport_size({'width': 390, 'height': 844})
                page.locator('[data-tab="explore"]').click()
                page.locator('#openSearch').click()
                expect(page.locator('#globalResults button')).to_have_count(291)
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                page.keyboard.press('Escape')
                exercise_classifications(page, f'{label}-mobile')
                exercise_model_comparison(page, f'{label}-mobile')
                page.screenshot(path=str(OUT / f'{label}-mobile.png'), full_page=True)
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                assert not page_errors, page_errors
                page.close()
                print(f'{label}: desktop/mobile interactions passed')
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)


if __name__ == '__main__':
    main()
