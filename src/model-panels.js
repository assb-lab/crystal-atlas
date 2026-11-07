import { esc, frac } from "./utils.js";
import { CrystalView, modelColor } from "./viewer.js";

const MODEL_KINDS = {
    prototype: 'プロトタイプ座標',
    literature: '文献の構造データ',
    average: '平均構造',
    computed: '計算緩和構造',
    schematic: '理想化した模型',
};

const VIEW_DIRECTIONS = [
    ['a', 'b', 'c'],
    ['a*', 'b*', 'c*'],
    ['a-', 'b-', 'c-'],
];
const directionLabel = direction => direction.endsWith('-') ? `−${direction[0]}` : direction;

export function viewDirectionControls() {
    return VIEW_DIRECTIONS.map((directions, i) => `<div role="group" aria-label="${['実格子', '逆格子', '反対側'][i]}">
        ${directions.map(direction => `<button type="button" class="small" data-view-direction="${direction}" title="${directionLabel(direction)}方向から見る">${directionLabel(direction)}</button>`).join('')}
    </div>`).join('');
}

function siteRows(model) {
    if (model.groups) return model.groups.map((group, site) => ({ ...group, site }));
    const rows = new Map();
    for (const { site, el } of model.atoms) rows.set(site, { site, occupants: { [el]: 1 } });
    return [...rows.values()];
}

function occupancyText(occupants) {
    const entries = Object.entries(occupants);
    const vacancy = 1 - entries.reduce((total, [, value]) => total + value, 0);
    if (vacancy > 1e-8) entries.push(['空孔', vacancy]);
    return entries.map(([el, value]) => `${el}${value === 1 ? '' : ` ${frac(value)}`}`).join(' / ');
}

export function modelPanelHTML(node, model, comparison = false) {
    const kind = model.kind ?? 'schematic';
    const source = model.source;
    const metric = model.parameters?.map(value => Number(value.toFixed(4)));
    const rows = siteRows(model).map(({ site, wyckoff, occupants }) => `
        <label class="modelsite"><input type="checkbox" data-modelsite="${site}" checked>
        <i class="sitedot" style="background:${modelColor(site, model)}"></i>
        <span>${wyckoff ? `<b>${esc(wyckoff)}</b> ` : ''}${esc(occupancyText(occupants))}${model.colors ? ` · ${site + 1}` : ''}</span></label>`).join('');
    return `<section class="crystalpanel${comparison ? ' comparisonmodel' : ''}">
        ${comparison ? `<h3>${esc(node.name)}</h3><p class="muted smalltext">${esc(node.formula)}</p>` : ''}
        <div class="inspectmodel"><canvas tabindex="0" aria-label="${esc(node.name)}の単位胞。ドラッグまたは矢印キーで回転"></canvas></div>
        <div class="axiscontrols" role="group" aria-label="単位胞の投影方向">
            ${viewDirectionControls()}
            ${comparison ? '' : '<button type="button" class="small flat" data-reset-view>視点を戻す</button>'}
        </div>
        <div class="modelcaption"><span class="badge">${MODEL_KINDS[kind]}</span>${model.spaceGroup ? ` <span class="mono">No. ${model.spaceGroup}</span>` : ''}</div>
        ${!comparison ? '<p class="modelcaption">ドラッグ・矢印キーで回転 ／ ホイール・ピンチで拡大</p>' : ''}
        ${model.note ? `<p class="modelcaption">${esc(model.note)}</p>` : ''}
        <details class="modeldetails">
            <summary>サイトと座標の出典</summary>
            ${metric ? `<p class="modelmetric mono">a, b, c = ${metric.slice(0, 3).join(', ')} ${kind === 'schematic' ? '（相対値）' : 'Å'}<br>α, β, γ = ${metric.slice(3).join('°, ')}°</p>` : ''}
            <div class="modelsites">${rows}</div>
            ${source ? `<p class="modelcaption">${source.url ? `<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.label)} ↗</a>` : esc(source.label)}</p>` : ''}
        </details>
    </section>`;
}

export function mountModelPanel(panel, model, options) {
    const view = new CrystalView(panel.querySelector('canvas'), false, options);
    view.set(model);
    panel.querySelector('.axiscontrols').addEventListener('click', event => {
        const control = event.target.closest('button');
        if (control?.dataset.viewDirection) view.lookAlong(control.dataset.viewDirection);
        if (control?.hasAttribute('data-reset-view')) view.reset();
    });
    panel.querySelector('.modelsites').addEventListener('change', event => {
        const control = event.target;
        view.visible[Number(control.dataset.modelsite)] = control.checked;
        view.draw();
    });
    return view;
}
