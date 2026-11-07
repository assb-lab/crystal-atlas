import { useEffect, useRef, useState } from "react";
import { DATA } from "../../data/atlas.ts";
import { KINDS } from "../../data/presets.ts";
import { prefersReducedMotion, useAtlas } from "../../store.ts";
import type { KindId, Source } from "../../types.ts";
import { RefChips } from "../RefChips.tsx";

export function Guide() {
  const { state } = useAtlas();
  return (
    <section id="guide" className="tabpage" hidden={state.tab !== "guide"}>
      <div className="pageintro">
        <div>
          <div className="eyebrow">Reading the atlas</div>
          <h2>一本の「系統樹」だけに、押し込まない。</h2>
          <p>
            このアトラスは構造間の関係グラフです。対称性、充填、空孔、積層という複数の見方を、関係の種類を明示して重ねています。
          </p>
        </div>
      </div>
      <div className="guidegrid">
        <div className="panel">
          <div className="panelbody">
            <h3>群–部分群の矢印</h3>
            <p>
              確認済みの矢印は文献に示された関係を抜き出したものです。完全なBärnighausen
              treeには、空間群だけでなく、基底変換・原点・Wyckoff位置の対応が必要です。本版では転記した範囲と未転記の範囲を詳細欄に明記します。
            </p>
            <GuideItem symbol="t" title="translationengleiche">
              並進部分群を保ち、点群が小さくなる。例：ダイヤモンド → 閃亜鉛鉱の t2。
            </GuideItem>
            <GuideItem symbol="k" title="klassengleiche">
              結晶類を保ち、並進対称性が減る。慣用セルの辺が同じでも、F→Pなどで原始胞は大きくなる。
            </GuideItem>
            <GuideItem symbol="i" title="isomorphic">
              同型部分群。この例では空間群型が同じでも、c軸3倍によりルチル →
              トリルチルで対称性が減る。
            </GuideItem>
            <RefChips
              refs={[
                { s: "M06", p: 216, sec: "§18.3" },
                { s: "M13", p: 4, sec: "§1.2" },
                { s: "M06", p: 21, sec: "§3.3" },
              ]}
              style={{ marginTop: 12 }}
            />
          </div>
        </div>
        <div className="panel">
          <div className="panelbody">
            <h3>幾何学的な関係の矢印</h3>
            <div id="guideKinds">
              {(Object.entries(KINDS) as [KindId, (typeof KINDS)[KindId]][])
                .filter(([id]) => id !== "symmetry")
                .map(([id, k]) => (
                  <div className="guideitem" key={id}>
                    <strong style={{ color: k.color }}>{k.name}</strong>
                    <div>{k.meaning}</div>
                  </div>
                ))}
            </div>
            <p className="note warn" style={{ marginTop: 14 }}>
              空間群記号が同じでも、原子位置・並進周期・結合は同じとは限りません。占有率が同じでも、骨格やサイトの選び方が異なれば別の構造になります。
            </p>
          </div>
        </div>
        <div className="panel">
          <div className="panelbody">
            <h3>この版に含めたもの</h3>
            <p>
              {`${DATA.nodes.length}構造を単位胞で表示し、${DATA.edges.length}件の関係を出典付きで比較できます。固体電解質、リン酸塩・ケイ酸塩、ゼオライト、トンネル酸化物、混合アニオン化合物までを比較できます。`}
            </p>
            <p style={{ marginTop: 12 }}>
              空間群は具体的な構造・相・理想模型に対応します。資料中の範囲を越えて全ての同組成・同族物質に一般化せず、値を転記していない箇所は結晶系や構造族の記述にとどめています。
            </p>
          </div>
        </div>
        <div className="panel">
          <div className="panelbody">
            <h3>単位胞と座標の出典</h3>
            <p>
              各単位胞に座標の種類を表示します。「サイトと座標の出典」を開くと、格子定数、Wyckoff位置、元素・空孔の占有率、座標資料を確認できます。
            </p>
            <p style={{ marginTop: 12 }}>
              比較画面では両方の単位胞を同じ向きに回転できます。異なるセル設定の軸やサイトを対応づける場合は、関係カードの基底・原点とWyckoff位置を参照してください。
            </p>
          </div>
        </div>
      </div>
      <div className="bibliography">
        <h2 style={{ fontSize: 20, margin: "26px 3px 10px" }}>参考資料とページ対応</h2>
        <p className="blocknote" style={{ margin: "0 3px 16px" }}>
          ページはまず書籍・論文の印刷ページを示し、PDF上のページ番号を併記しています。添付書籍の本文・画像はこのHTMLに再配布していません。お手元のPDFを関連付けると、出典ボタンから該当ページを開けます。関連付けはブラウザ内だけで処理し、外部へアップロードしません。
        </p>
        <div id="sources">
          {Object.entries(DATA.sources).map(([id, s]) => (
            <SourceCard key={id} id={id} source={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GuideItem({
  symbol,
  title,
  children,
}: {
  symbol: string;
  title: string;
  children: string;
}) {
  return (
    <div className="guideitem">
      <div className="symbol">{symbol}</div>
      <div>
        <strong>{title}</strong>
        <br />
        {children}
      </div>
    </div>
  );
}

function SourceCard({ id, source: s }: { id: string; source: Source }) {
  const { state, dispatch } = useAtlas();
  const card = useRef<HTMLElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const pdf = state.pdfs[id];
  const focus = state.sourceFocus?.id === id ? state.sourceFocus : null;

  useEffect(() => {
    if (focus)
      card.current?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
  }, [focus]);

  const associate = (f: File | undefined) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      dispatch({ type: "toast", msg: "PDFファイルを選択してください。" });
      return;
    }
    if (pdf) URL.revokeObjectURL(pdf);
    setFileName(f.name);
    dispatch({ type: "pdf", id, url: URL.createObjectURL(f) });
    dispatch({ type: "toast", msg: "PDFをこのページ内で関連付けました。" });
  };

  return (
    <article className="sourcecard" id={`source-${id}`} ref={card}>
      <div className="sourceid">[{id}]</div>
      <div>
        <h3>{s.citation ?? s.title}</h3>
        {!s.citation && (
          <p>
            {s.author} · {s.year}
            <br />
            {s.edition}
          </p>
        )}
        <p>{s.coverage}</p>
        <div id={`sourcePage-${id}`} className="sourcepage" hidden={!focus}>
          {focus &&
            (pdf ? (
              <>
                PDF {focus.pdfPage}ページを開く準備ができました。{" "}
                <a href={`${pdf}#page=${focus.pdfPage}`} target="_blank" rel="noopener">
                  該当箇所を開く ↗
                </a>
              </>
            ) : (
              `参照箇所：印刷 p.${focus.page} ／ PDF ${focus.pdfPage}ページ。下のボタンでPDFを関連付けると、このページを開けます。`
            ))}
        </div>
      </div>
      <div className="sourceactions">
        {s.article && (
          <a href={s.article} target="_blank" rel="noopener">
            ウェブ資料 ↗
          </a>
        )}
        {s.url && (
          <a href={s.url} target="_blank" rel="noopener">
            公開PDFを開く ↗
          </a>
        )}
        {s.filename && (
          <>
            <button data-pdf={id} onClick={() => file.current?.click()}>
              お手元のPDFを関連付ける
            </button>
            <input
              ref={file}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(ev) => associate(ev.target.files?.[0])}
            />
            <span className="muted smalltext" style={pdf ? { color: "#8fddbf" } : undefined}>
              {pdf ? `関連付け済み：${fileName ?? ""}` : "未関連付け · ローカル処理"}
            </span>
          </>
        )}
      </div>
    </article>
  );
}
