"use client";

import { useMemo, useState } from "react";
import type { Gamme, Modele } from "@/lib/pro/catalog";
import { calculerNet, type OptionsCalcul } from "@/lib/pro/pricing/engine";

const fmt = (n: number | null | undefined) =>
  n === null || n === undefined || Number.isNaN(n)
    ? "—"
    : Math.round(n).toLocaleString("fr-BE") + " €";

export default function Calculateur({
  gammes,
  margeVisible,
}: {
  gammes: Gamme[];
  margeVisible: boolean;
}) {
  const [gammeKey, setGammeKey] = useState<string | null>(null);
  const [subKey, setSubKey] = useState<string | null>(null);
  const [modelIdx, setModelIdx] = useState<number | null>(null);
  const [mode, setMode] = useState<"stock" | "config">("stock");
  const [stockSel, setStockSel] = useState(0);
  const [opts, setOpts] = useState<OptionsCalcul>({ mfguide: false, chargeur: false });
  const [brutInput, setBrutInput] = useState("");
  const [retailInput, setRetailInput] = useState("");

  const gamme = gammes.find((g) => g.key === gammeKey) || null;
  const onlyOneSub = !!gamme && gamme.sousNiveaux.length === 1;
  const sub = gamme
    ? gamme.sousNiveaux.find((s) => s.key === subKey) || (onlyOneSub ? gamme.sousNiveaux[0] : null)
    : null;
  const model: Modele | null = sub && modelIdx !== null ? sub.modeles[modelIdx] : null;

  const stockCount = (mo: Modele) => mo.stock.length;
  const subStock = (s: { modeles: Modele[] }) => s.modeles.reduce((a, mo) => a + stockCount(mo), 0);
  const gammeStock = (g: Gamme) => g.sousNiveaux.reduce((a, s) => a + subStock(s), 0);

  const resetInputs = () => {
    setOpts({ mfguide: false, chargeur: false });
    setBrutInput("");
    setRetailInput("");
  };
  const back = (lvl: "gamme" | "sub" | "model") => {
    resetInputs();
    if (lvl === "gamme") { setGammeKey(null); setSubKey(null); setModelIdx(null); }
    if (lvl === "sub") { setSubKey(null); setModelIdx(null); }
    if (lvl === "model") { setModelIdx(null); }
  };
  const pickGamme = (g: Gamme) => {
    back("gamme");
    setGammeKey(g.key);
    if (g.sousNiveaux.length === 1) setSubKey(g.sousNiveaux[0].key);
  };
  const pickModel = (i: number, mo: Modele) => {
    resetInputs();
    setModelIdx(i);
    setStockSel(0);
    setMode(mo.stock.length > 0 ? "stock" : "config");
    setBrutInput(mo.brutIndicatif != null ? String(mo.brutIndicatif) : "");
  };

  const machineSel =
    model && mode === "stock" && model.stock.length ? model.stock[stockSel] : null;
  // Machine de démo (« sur demande ») : pas de prix → saisie manuelle du prix négocié.
  const saisieBrut = mode === "config" || (machineSel != null && machineSel.prixBrut == null);
  const activeBrut = !model
    ? 0
    : machineSel && machineSel.prixBrut != null
      ? machineSel.prixBrut
      : parseFloat(brutInput) || 0;
  const activePo = machineSel?.po ?? null;

  const calc = useMemo(() => {
    if (!model || activeBrut <= 0) return { net: 0, lignes: [] as ReturnType<typeof calculerNet>["lignes"] };
    const r = calculerNet(activeBrut, model.etapes, opts);
    return { net: r.net, lignes: r.lignes.filter((l) => !l.ignoree) };
  }, [model, activeBrut, opts]);

  const retail = model ? (model.prixRetailMf ?? (parseFloat(retailInput) || null)) : null;
  const marge = retail !== null && activeBrut > 0 ? retail - calc.net : null;
  const conditionnels = model ? model.etapes.filter((e) => e.conditionnel) : [];

  return (
    <div className="mf-root">
      <style>{`
        .mf-root { --red:#C71121; --ink:#1c1d1f; --steel:#5F6062; --line:#dcdcdb; --bg:#f2f3f4; --mute:#848689; --green:#1a8a3f; --greenbg:#e8f6ec;
          font-family:'Barlow Semi Condensed','Inter',system-ui,sans-serif; color:var(--ink); }
        .mf-root .wrap { max-width:560px; margin:0 auto; }
        .mf-root .brand { font-weight:700; letter-spacing:.06em; font-size:13px; color:var(--steel); }
        .mf-root .brand b { color:var(--red); }
        .mf-root .title { font-weight:700; font-size:30px; line-height:.95; margin:2px 0 16px; }
        .mf-root .crumb { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:14px; font-size:13px; }
        .mf-root .crumb button { background:#fff; border:1px solid var(--line); color:var(--ink); padding:6px 11px; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px; }
        .mf-root .crumb .sep { color:var(--mute); }
        .mf-root .crumb .here { color:var(--mute); padding:6px 2px; }
        .mf-root .lbl { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--mute); margin:0 0 10px 2px; }
        .mf-root .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .mf-root .gcard { text-align:left; background:#fff; border:1px solid var(--line); border-radius:13px; padding:15px 14px; cursor:pointer; transition:.12s; }
        .mf-root .gcard:hover { border-color:var(--red); transform:translateY(-1px); }
        .mf-root .gcard .rank { font-size:11px; color:var(--mute); font-weight:600; }
        .mf-root .gcard .gn { font-weight:700; font-size:24px; line-height:1; }
        .mf-root .gcard .gd { font-size:11px; color:var(--steel); margin-top:6px; line-height:1.3; }
        .mf-root .stk { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--green); background:var(--greenbg); border-radius:6px; padding:3px 8px; margin-top:9px; }
        .mf-root .stk .dot { width:6px; height:6px; border-radius:99px; background:var(--green); }
        .mf-root .stk0 { display:inline-block; font-size:11px; font-weight:600; color:var(--mute); margin-top:9px; }
        .mf-root .list { display:flex; flex-direction:column; gap:8px; }
        .mf-root .row { display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid var(--line); border-radius:11px; padding:13px 15px; cursor:pointer; transition:.12s; }
        .mf-root .row:hover { border-color:var(--red); }
        .mf-root .row .rn { font-weight:700; font-size:18px; }
        .mf-root .row .rmeta { display:flex; gap:9px; align-items:center; }
        .mf-root .chev { color:var(--mute); font-size:18px; }
        .mf-root .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:16px; margin-bottom:14px; }
        .mf-root .mname { font-weight:700; font-size:26px; }
        .mf-root .mpath { font-size:12px; color:var(--mute); margin-top:2px; }
        .mf-root .tabs { display:flex; gap:6px; margin:14px 0; }
        .mf-root .tab { flex:1; padding:11px 8px; border:1px solid var(--line); border-radius:9px; background:#fff; cursor:pointer; font-weight:600; font-size:14px; color:var(--steel); }
        .mf-root .tab.on { background:var(--ink); color:#fff; border-color:var(--ink); }
        .mf-root .tab:disabled { opacity:.4; cursor:not-allowed; }
        .mf-root .mrow { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 13px; border:1px solid var(--line); border-radius:10px; cursor:pointer; margin-bottom:8px; }
        .mf-root .mrow.on { border-color:var(--red); background:#fff5f5; }
        .mf-root .mrow .mc { font-size:13px; line-height:1.35; }
        .mf-root .mrow .mc b { font-size:14px; }
        .mf-root .mrow .po { font-size:11px; font-weight:600; color:var(--steel); background:#f1f3f5; border-radius:6px; padding:3px 8px; white-space:nowrap; }
        .mf-root input { width:100%; font-family:inherit; font-size:16px; padding:11px 12px; border:1px solid var(--line); border-radius:9px; background:#fff; color:var(--ink); }
        .mf-root input:focus { outline:2px solid var(--red); outline-offset:1px; border-color:transparent; }
        .mf-root .opts { display:flex; flex-direction:column; gap:9px; }
        .mf-root .opt { display:flex; align-items:center; gap:11px; padding:11px 12px; border:1px solid var(--line); border-radius:9px; cursor:pointer; }
        .mf-root .opt.on { border-color:var(--red); background:#fff5f5; }
        .mf-root .opt input { width:18px; height:18px; accent-color:var(--red); margin:0; }
        .mf-root .opt .ot { font-size:14px; font-weight:500; }
        .mf-root .opt .oamt { margin-left:auto; font-size:13px; font-weight:600; color:var(--steel); }
        .mf-root .ticket { background:#fff; border:1px solid var(--line); border-radius:14px; overflow:hidden; margin-bottom:14px; }
        .mf-root .trow { display:flex; align-items:center; justify-content:space-between; padding:11px 16px; border-bottom:1px solid var(--line); font-size:14px; }
        .mf-root .trow .tr { display:flex; gap:14px; align-items:baseline; }
        .mf-root .trow .cut { color:var(--red); font-weight:600; font-variant-numeric:tabular-nums; }
        .mf-root .trow .sub { color:var(--mute); font-size:12.5px; font-variant-numeric:tabular-nums; min-width:84px; text-align:right; }
        .mf-root .trow.brut { background:#f8f9fa; }
        .mf-root .trow.brut .tl { font-weight:600; }
        .mf-root .trow.brut .amt { font-weight:700; font-size:16px; font-variant-numeric:tabular-nums; }
        .mf-root .result { background:var(--ink); color:#fff; border-radius:14px; padding:18px; }
        .mf-root .rrow { display:flex; align-items:center; justify-content:space-between; }
        .mf-root .rrow + .rrow { margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,.13); }
        .mf-root .rk { font-size:12px; text-transform:uppercase; letter-spacing:.07em; color:#aeb4ba; }
        .mf-root .rk small { display:block; text-transform:none; letter-spacing:0; color:#7f868d; font-size:11px; margin-top:2px; }
        .mf-root .rv { font-weight:700; font-variant-numeric:tabular-nums; }
        .mf-root .rv.net { font-size:34px; line-height:1; }
        .mf-root .rv.retail { font-size:22px; }
        .mf-root .rv.marge { font-size:22px; color:#56d364; }
        .mf-root .rv.red { color:#ff5a6e; }
        .mf-root .mfbadge { display:inline-block; font-size:10px; font-weight:700; letter-spacing:.05em; color:#fff; background:var(--red); border-radius:5px; padding:2px 7px; margin-left:8px; }
      `}</style>

      <div className="wrap">
        <div className="brand"><b>AGRISEM</b> · MASSEY FERGUSON</div>
        <h1 className="title">Calcul remises</h1>

        <div className="crumb">
          <button onClick={() => back("gamme")}>Gammes</button>
          {gamme && (
            <>
              <span className="sep">›</span>
              {model || (sub && !onlyOneSub) ? (
                <button onClick={() => back("sub")}>{gamme.label}</button>
              ) : (
                <span className="here">{gamme.label}</span>
              )}
            </>
          )}
          {gamme && sub && !onlyOneSub && (model ? (
            <>
              <span className="sep">›</span>
              <button onClick={() => back("model")}>{sub.label}</button>
            </>
          ) : (
            <>
              <span className="sep">›</span>
              <span className="here">{sub.label}</span>
            </>
          ))}
          {model && (
            <>
              <span className="sep">›</span>
              <span className="here">{model.nom}</span>
            </>
          )}
        </div>

        {/* Niveau 1 — Gammes */}
        {!gamme && (
          <>
            <div className="lbl">Choisir une gamme</div>
            <div className="grid">
              {gammes.map((g, i) => {
                const n = gammeStock(g);
                return (
                  <button key={g.key} className="gcard" onClick={() => pickGamme(g)}>
                    <div className="rank">{i + 1}.</div>
                    <div className="gn">{g.label}</div>
                    <div className="gd">{g.desc}</div>
                    {n > 0 ? (
                      <span className="stk"><span className="dot" />{n} en stock</span>
                    ) : (
                      <span className="stk0">Sur commande</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Niveau 2 — Transmission / sous-série */}
        {gamme && !sub && (
          <>
            <div className="lbl">{gamme.labelSousNiveau}</div>
            <div className="list">
              {gamme.sousNiveaux.map((s) => {
                const n = subStock(s);
                return (
                  <div key={s.key} className="row" onClick={() => setSubKey(s.key)}>
                    <span className="rn">{s.label}</span>
                    <span className="rmeta">
                      {n > 0 ? (
                        <span className="stk" style={{ margin: 0 }}><span className="dot" />{n}</span>
                      ) : (
                        <span className="stk0" style={{ margin: 0 }}>commande</span>
                      )}
                      <span className="chev">›</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Niveau 3 — Modèles */}
        {gamme && sub && !model && (
          <>
            <div className="lbl">Modèle {sub.label ? `· ${sub.label}` : ""}</div>
            <div className="list">
              {sub.modeles.map((mo, i) => {
                const n = stockCount(mo);
                return (
                  <div key={i} className="row" onClick={() => pickModel(i, mo)}>
                    <span className="rn">{mo.nom}</span>
                    <span className="rmeta">
                      {n > 0 ? (
                        <span className="stk" style={{ margin: 0 }}><span className="dot" />{n} en stock</span>
                      ) : (
                        <span className="stk0" style={{ margin: 0 }}>Sur commande</span>
                      )}
                      <span className="chev">›</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Fiche modèle */}
        {model && sub && gamme && (
          <>
            <div className="card">
              <div>
                <div className="mname">{model.nom}</div>
                <div className="mpath">{gamme.label}{sub.label ? ` · ${sub.label}` : ""}</div>
              </div>

              <div className="tabs">
                <button
                  className={`tab ${mode === "stock" ? "on" : ""}`}
                  disabled={model.stock.length === 0}
                  onClick={() => setMode("stock")}
                >
                  En stock{model.stock.length ? ` (${model.stock.length})` : ""}
                </button>
                <button
                  className={`tab ${mode === "config" ? "on" : ""}`}
                  onClick={() => setMode("config")}
                >
                  Configurer en neuf
                </button>
              </div>

              {mode === "stock" && model.stock.length > 0 && (
                <div>
                  {model.stock.map((mc, i) => (
                    <div key={i} className={`mrow ${stockSel === i ? "on" : ""}`} onClick={() => setStockSel(i)}>
                      <span className="mc"><b>{mc.prixBrut != null ? fmt(mc.prixBrut) : "Sur demande"}</b><br />{mc.config}</span>
                      {mc.po && <span className="po">PO {mc.po}</span>}
                    </div>
                  ))}
                </div>
              )}

              {saisieBrut && (
                <div style={mode === "stock" ? { marginTop: 10 } : undefined}>
                  <div className="lbl">
                    {mode === "config" ? "Prix brut" : "Prix négocié (démo)"}{" "}
                    {mode === "config" && model.brutIndicatif != null && (
                      <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--mute)" }}>
                        (indicatif — ajustable)
                      </span>
                    )}
                  </div>
                  <input
                    inputMode="numeric"
                    placeholder="ex. 158 000"
                    value={brutInput}
                    onChange={(e) => setBrutInput(e.target.value.replace(/[^\d.]/g, ""))}
                  />
                </div>
              )}
            </div>

            {conditionnels.length > 0 && (
              <div className="card">
                <div className="lbl">Options équipées</div>
                <div className="opts">
                  {conditionnels.map((e) => {
                    const cond = e.conditionnel as "mfguide" | "chargeur";
                    return (
                      <label key={cond} className={`opt ${opts[cond] ? "on" : ""}`}>
                        <input
                          type="checkbox"
                          checked={!!opts[cond]}
                          onChange={(ev) => setOpts({ ...opts, [cond]: ev.target.checked })}
                        />
                        <span className="ot">{e.label}</span>
                        <span className="oamt">− {fmt(e.valeur)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {activeBrut > 0 ? (
              <>
                <div className="ticket">
                  <div className="trow brut">
                    <span className="tl">Prix brut{activePo ? ` · PO ${activePo}` : ""}</span>
                    <span className="amt">{fmt(activeBrut)}</span>
                  </div>
                  {calc.lignes.map((l, i) => (
                    <div className="trow" key={i}>
                      <span className="tl">{l.label}</span>
                      <span className="tr">
                        <span className="cut">
                          {l.type === "pct" ? `− ${l.valeur} %` : `− ${fmt(l.valeur)}`}
                        </span>
                        <span className="sub">{fmt(l.sousTotal)}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="result">
                  <div className="rrow">
                    <span className="rk">Prix net concessionnaire<small>votre prix d&apos;achat</small></span>
                    <span className="rv net">{fmt(calc.net)}</span>
                  </div>
                  <div className="rrow">
                    <span className="rk">
                      Prix net retail
                      {model.prixRetailMf != null && <span className="mfbadge">PRIX MF</span>}
                      <small>{model.prixRetailMf != null ? "fourni par Matermaco" : "à saisir"}</small>
                    </span>
                    {model.prixRetailMf != null ? (
                      <span className="rv retail">{fmt(model.prixRetailMf)}</span>
                    ) : (
                      <input
                        style={{ width: 130, textAlign: "right" }}
                        inputMode="numeric"
                        placeholder="prix client"
                        value={retailInput}
                        onChange={(e) => setRetailInput(e.target.value.replace(/[^\d.]/g, ""))}
                      />
                    )}
                  </div>
                  {margeVisible && marge !== null && (
                    <div className="rrow">
                      <span className="rk">Marge concessionnaire</span>
                      <span className={`rv ${marge < 0 ? "red" : "marge"}`}>{fmt(marge)}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="card" style={{ textAlign: "center", color: "var(--steel)", fontSize: 14 }}>
                Entrez le prix brut pour lancer le calcul.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
