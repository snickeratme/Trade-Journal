import { useState, useMemo, useRef } from "react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#181818", surface:"#202020", surface2:"#272727", surface3:"#2f2f2f",
  border:"#2c2c2c", borderLight:"#383838",
  text:"#e6e6e8", textMuted:"#888890", textDim:"#4a4a52",
  green:"#4caf7d", greenDim:"#152318",
  red:"#d95f5f",   redDim:"#2a1414",
  amber:"#c8922a", amberDim:"#2a1f0a",
  gray:"#6a6a72",  grayDim:"#222224",
};

const OUTCOME = {
  win:  { label:"Win",    color:C.green, dim:C.greenDim, border:C.green },
  loss: { label:"Loss",   color:C.red,   dim:C.redDim,   border:C.red   },
  be:   { label:"BE",     color:C.amber, dim:C.amberDim, border:C.amber },
  faded:{ label:"Faded",  color:C.gray,  dim:C.grayDim,  border:C.gray  },
};

const ICT_TAGS = {
  "PD Arrays":["FVG","IFVG","OB","RB","BB","Breaker","Mitigation"],
  Sessions:   ["London Open","NY Open","NY PM","Asia","Overnight"],
  AMD:        ["Accumulation","Manipulation","Distribution"],
  Concepts:   ["OTE","STDV","SMT","MSS","BOS","CHoCH","Sweep","NWOG","NDOG"],
  Bias:       ["Bullish","Bearish","Neutral"],
};

const SYMBOLS = ["NQ","ES","GC","MNQ","MES","MGC"];

const MOODS = [
  { key:"elated",   emoji:"😄", label:"Extremely Happy" },
  { key:"good",     emoji:"🙂", label:"Good"            },
  { key:"neutral",  emoji:"😐", label:"Neutral"         },
  { key:"annoyed",  emoji:"😤", label:"Annoyed"         },
  { key:"upset",    emoji:"😠", label:"Angry"           },
  { key:"furious",  emoji:"🤬", label:"Extremely Angry" },
];

const LABEL = { fontSize:11, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:C.textMuted, display:"block", marginBottom:6 };
const INPUT  = { width:"100%", background:C.surface2, border:`1px solid ${C.border}`, borderRadius:7, padding:"10px 12px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function useImageUpload(onImage) {
  const ref = useRef();
  const trigger = () => ref.current?.click();
  const handle = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => onImage(ev.target.result);
    reader.readAsDataURL(file);
  };
  return { ref, trigger, handle };
}

function ImageUploadBox({ image, onImage, label="Upload Screenshot" }) {
  const { ref, trigger, handle } = useImageUpload(onImage);
  return (
    <div>
      <input type="file" accept="image/*" ref={ref} onChange={handle} style={{ display:"none" }} />
      {image ? (
        <div style={{ position:"relative" }}>
          <img src={image} alt="chart" style={{ width:"100%", borderRadius:8, border:`1px solid ${C.border}`, display:"block" }} />
          <button onClick={trigger} style={{ position:"absolute", top:8, right:8, padding:"4px 10px", borderRadius:6, background:`${C.bg}cc`, border:`1px solid ${C.border}`, color:C.textMuted, cursor:"pointer", fontSize:11 }}>Replace</button>
        </div>
      ) : (
        <button onClick={trigger} style={{ width:"100%", padding:"20px", borderRadius:8, background:C.bg, border:`1px dashed ${C.border}`, color:C.textDim, cursor:"pointer", fontSize:13, textAlign:"center" }}>{label}</button>
      )}
    </div>
  );
}

function OutcomePip({ result }) {
  return <div style={{ width:4, height:34, borderRadius:2, background:OUTCOME[result]?.color||C.gray, flexShrink:0 }} />;
}
function OutcomeBadge({ result }) {
  const cfg = OUTCOME[result]||OUTCOME.faded;
  return <span style={{ background:cfg.dim, color:cfg.color, border:`1px solid ${cfg.border}22`, padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:700, letterSpacing:"0.05em", fontFamily:"monospace" }}>{cfg.label}</span>;
}
function SideBadge({ side }) {
  return <span style={{ background:side==="Long"?C.greenDim:C.redDim, color:side==="Long"?C.green:C.red, padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:700, fontFamily:"monospace" }}>{side}</span>;
}
function TagPill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"3px 9px", borderRadius:5, cursor:"pointer", fontSize:12, fontWeight:600,
      background:active?C.surface3:C.bg, border:`1px solid ${active?C.borderLight:C.border}`,
      color:active?C.text:C.textMuted, transition:"all 0.1s",
    }}>{children}</button>
  );
}
function Section({ title, children, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden", marginBottom:10 }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 18px", background:"transparent", border:"none", cursor:"pointer", color:C.text }}>
        <span style={{ fontSize:12, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.textMuted }}>{title}</span>
        <span style={{ color:C.textDim, fontSize:14, transition:"transform 0.2s", transform:open?"rotate(90deg)":"none" }}>›</span>
      </button>
      {open && <div style={{ padding:"0 18px 18px" }}>{children}</div>}
    </div>
  );
}
function StatCard({ label, value, sub, color=C.text, children }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 18px" }}>
      <div style={{ color:C.textMuted, fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:7 }}>{label}</div>
      <div style={{ color, fontSize:24, fontWeight:700, fontFamily:"monospace", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ color:C.textDim, fontSize:11, marginTop:5 }}>{sub}</div>}
      {children}
    </div>
  );
}

// ─── CALC ─────────────────────────────────────────────────────────────────────
function calcPnl(t) {
  if (!t.entry || !t.exit || t.result==="faded") return { pnl:0, rMultiple:0 };
  const diff = t.side==="Long" ? t.exit-t.entry : t.entry-t.exit;
  const tickVal = t.symbol==="MNQ"?2 : t.symbol==="MES"?12.5 : t.symbol==="MGC"?10 : t.symbol==="NQ"?20 : t.symbol==="ES"?50 : t.symbol==="GC"?100 : 20;
  const pnl = diff * tickVal * (t.contracts||1);
  const riskPts = Math.abs(t.entry - t.exit);
  const rMultiple = riskPts>0 ? parseFloat((diff/riskPts).toFixed(2)) : 0;
  return { pnl:parseFloat(pnl.toFixed(2)), rMultiple };
}

// ─── BLANK TEMPLATES ──────────────────────────────────────────────────────────
function blankTrade() {
  return { id:Date.now()+Math.random(), symbol:"NQ", side:"Long", result:"win", entry:"", exit:"", tp:"", sl:"", drawdown:"", contracts:1, tags:[], notes:"", screenshotExec:null, screenshotHTF:null, accountType:"live" };
}
function blankDay(date) {
  return {
    id:Date.now(), date,
    premarket:  { hasNews:false, newsText:"", notes:"", screenshot:null },
    trades:     [],
    postmarket: { mood:"", customRules:[], rulesFollowed:[], notes:"" },
  };
}

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────
const SAMPLE_DAYS = [
  {
    id:1, date:"2025-06-16",
    premarket:{ hasNews:false, newsText:"", notes:"Price in weekly FVG. Asia swept lows and closed back above. NY open targeting 21600 NWOG as draw on liquidity. Clean macro calendar.", screenshot:null },
    trades:[
      { id:10, symbol:"NQ", side:"Long", result:"win", entry:21480.25, exit:21538.50, tp:21545, sl:21462, drawdown:8, contracts:2, tags:["FVG","NY Open","Manipulation","OTE","Bullish"], notes:"Clean FVG fill into OTE. NY open sweep of Asia high triggered long.", screenshotExec:null, screenshotHTF:null, accountType:"live" },
      { id:11, symbol:"ES", side:"Short", result:"faded", entry:5542.00, exit:5528.75, tp:5520, sl:5550, drawdown:"", contracts:1, tags:["OB","SMT","Bearish"], notes:"SMT divergence was valid — skipped because already managing NQ. Would've been 1.5R.", screenshotExec:null, screenshotHTF:null, accountType:"funded" },
    ],
    postmarket:{ mood:"good", customRules:["Wait for MSS before entry","Size down on news days","No trades after 11am EST"], rulesFollowed:["Wait for MSS before entry","No trades after 11am EST"], notes:"Solid execution on the NQ. Faded the ES deliberately — not a mistake." },
  },
  {
    id:2, date:"2025-06-17",
    premarket:{ hasNews:true, newsText:"FOMC Minutes 2pm EST — avoid trading 30min before/after", notes:"Overnight consolidated at highs. Manipulation expected on London open then reversal. Draw at 21320 lows. High-risk day sizing down.", screenshot:null },
    trades:[
      { id:20, symbol:"NQ", side:"Long", result:"loss", entry:21390.00, exit:21372.25, tp:21430, sl:21370, drawdown:0, contracts:1, tags:["MSS","NY Open","Accumulation"], notes:"Entered before MSS candle closed. Discipline error.", screenshotExec:null, screenshotHTF:null, accountType:"funded" },
      { id:21, symbol:"NQ", side:"Short", result:"be", entry:21580.00, exit:21580.00, tp:21540, sl:21600, drawdown:12, contracts:2, tags:["OB","Distribution","Bearish"], notes:"Moved SL to BE after 0.5R. Stopped on wick. Execution acceptable.", screenshotExec:null, screenshotHTF:null, accountType:"live" },
    ],
    postmarket:{ mood:"neutral", customRules:["Wait for MSS before entry","Size down on news days","No trades after 11am EST"], rulesFollowed:["Size down on news days"], notes:"Mixed day. Process failure on trade 1. Mental game held." },
  },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]             = useState("dashboard");
  const [days, setDays]             = useState(SAMPLE_DAYS);
  const [activeDay, setActiveDay]   = useState(null);
  const [isNew, setIsNew]           = useState(false);
  const [toast, setToast]           = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [monthlyGoal, setMonthlyGoal] = useState(5000);
  const [goalInput, setGoalInput]     = useState("5000");
  const [editingGoal, setEditingGoal] = useState(false);
  // live/funded split goals — stored per account type
  const [livePnlOverride, setLivePnlOverride]     = useState(null); // null = auto from trades
  const [fundedPnlOverride, setFundedPnlOverride] = useState(null);
  const now = new Date();
  const [calYear, setCalYear]   = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  // global custom rules (shared across all days as a pool)
  const [globalRules, setGlobalRules] = useState(["Wait for MSS before entry","Size down on news days","No trades after 11am EST"]);
  const [newRuleInput, setNewRuleInput] = useState("");

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),2500); };

  const SIDEBAR_W = 200;

  // ── Aggregate stats (monthly) ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const mStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

    const allTrades   = days.flatMap(d=>d.trades);
    const monthDays   = days.filter(d=>d.date.startsWith(mStr));
    const monthTrades = monthDays.flatMap(d=>d.trades);
    const todayTrades = days.filter(d=>d.date===todayStr).flatMap(d=>d.trades);

    const executed   = monthTrades.filter(t=>t.result!=="faded");
    const wins       = monthTrades.filter(t=>t.result==="win");
    const losses     = monthTrades.filter(t=>t.result==="loss");

    const totalPnl   = executed.reduce((s,t)=>s+calcPnl(t).pnl,0);
    const livePnl    = executed.filter(t=>t.accountType==="live").reduce((s,t)=>s+calcPnl(t).pnl,0);
    const fundedPnl  = executed.filter(t=>t.accountType==="funded").reduce((s,t)=>s+calcPnl(t).pnl,0);
    const todayPnl   = todayTrades.filter(t=>t.result!=="faded").reduce((s,t)=>s+calcPnl(t).pnl,0);
    const todayCount = todayTrades.length;

    const grossWin   = wins.reduce((s,t)=>s+calcPnl(t).pnl,0);
    const grossLoss  = Math.abs(losses.reduce((s,t)=>s+calcPnl(t).pnl,0));
    const profitFactor = grossLoss>0 ? (grossWin/grossLoss).toFixed(2) : grossWin>0 ? "∞" : "—";

    const totalRR    = executed.reduce((s,t)=>s+calcPnl(t).rMultiple,0).toFixed(2);
    const winRate    = (wins.length+losses.length)>0 ? (wins.length/(wins.length+losses.length)*100).toFixed(1) : "0.0";

    const monthPnl = totalPnl;
    return { totalPnl, livePnl, fundedPnl, todayPnl, todayCount, winRate, profitFactor, totalRR, monthPnl, wins:wins.length, losses:losses.length };
  }, [days]);

  // ── Day helpers ───────────────────────────────────────────────────────────
  const openDay = (day, fresh=false) => { setActiveDay(JSON.parse(JSON.stringify(day))); setIsNew(fresh); setView("day"); };
  const newDay  = () => openDay(blankDay(new Date().toISOString().split("T")[0]), true);
  const saveDay = () => {
    // ensure customRules pool is synced to global
    const d = { ...activeDay };
    if(isNew) setDays(ds=>[d,...ds].sort((a,b)=>b.date.localeCompare(a.date)));
    else      setDays(ds=>ds.map(x=>x.id===d.id?d:x));
    showToast("Day saved");
    setView("dashboard"); setActiveDay(null);
  };
  const deleteDay = (id) => { setDays(ds=>ds.filter(d=>d.id!==id)); showToast("Day deleted"); setView("dashboard"); setActiveDay(null); };

  const patchPre  = p => setActiveDay(d=>({...d, premarket:{...d.premarket,...p}}));
  const patchPost = p => setActiveDay(d=>({...d, postmarket:{...d.postmarket,...p}}));
  const setTrades = fn => setActiveDay(d=>({...d, trades:fn(d.trades)}));

  const addTrade = () => setTrades(ts=>[...ts, blankTrade()]);
  const patchTrade  = (id,p) => setTrades(ts=>ts.map(t=>t.id===id?{...t,...p}:t));
  const removeTrade = id     => setTrades(ts=>ts.filter(t=>t.id!==id));
  const toggleTradeTag = (id,tag) => {
    const t = activeDay.trades.find(x=>x.id===id);
    patchTrade(id,{ tags: t.tags.includes(tag)?t.tags.filter(x=>x!==tag):[...t.tags,tag] });
  };
  const toggleRule = rule => {
    const rf = activeDay.postmarket.rulesFollowed;
    patchPost({ rulesFollowed: rf.includes(rule)?rf.filter(r=>r!==rule):[...rf,rule] });
  };
  const addGlobalRule = () => {
    const r = newRuleInput.trim(); if(!r) return;
    setGlobalRules(rs=>[...rs,r]);
    // also add to active day's pool if editing
    if(activeDay) patchPost({ customRules:[...(activeDay.postmarket.customRules||[]),r] });
    setNewRuleInput("");
  };

  const GRADE_COLOR = { "A+":C.green,"A":C.green,"B":C.amber,"C":C.amber,"D":C.red,"F":C.red };
  const sortedDays = [...days].sort((a,b)=>b.date.localeCompare(a.date));

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter','Segoe UI',sans-serif", fontSize:14, display:"flex" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:toast.type==="error"?C.redDim:C.surface2, border:`1px solid ${toast.type==="error"?C.red:C.borderLight}`, color:toast.type==="error"?C.red:C.text, padding:"10px 18px", borderRadius:8, fontWeight:600, fontSize:13 }}>{toast.msg}</div>
      )}

      {/* ── SIDEBAR ── */}
      <div style={{ position:"fixed", left:0, top:0, bottom:0, width:sidebarOpen?SIDEBAR_W:48, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", transition:"width 0.22s ease", overflow:"hidden", zIndex:100 }}>

        {/* Toggle button */}
        <button onClick={()=>setSidebarOpen(o=>!o)} style={{ position:"absolute", top:14, right:10, background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.textMuted, cursor:"pointer", fontSize:14, width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, zIndex:10 }}>
          {sidebarOpen ? "‹" : "›"}
        </button>

        {/* Logo */}
        <div style={{ padding:"18px 14px 14px", borderBottom:`1px solid ${C.border}`, minHeight:60, display:"flex", alignItems:"center" }}>
          {sidebarOpen ? (
            <div>
              <div style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>Sebfutures Journal</div>
              <div style={{ fontSize:10, color:C.textDim, marginTop:2, letterSpacing:"0.04em" }}>FUTURES</div>
            </div>
          ) : (
            <div style={{ fontSize:14, fontWeight:800, color:C.textMuted }}>SF</div>
          )}
        </div>

        {/* Nav */}
        {sidebarOpen && (
          <>
            <nav style={{ padding:"10px 8px", flex:1 }}>
              {[{id:"dashboard",label:"Dashboard"},{id:"journal",label:"Journal"}].map(n=>(
                <button key={n.id} onClick={()=>{setView(n.id);setActiveDay(null);}} style={{
                  display:"flex", alignItems:"center", width:"100%", padding:"9px 11px", borderRadius:7, marginBottom:2,
                  background:view===n.id&&!activeDay?C.surface2:"transparent",
                  border:`1px solid ${view===n.id&&!activeDay?C.borderLight:"transparent"}`,
                  color:view===n.id&&!activeDay?C.text:C.textMuted,
                  cursor:"pointer", textAlign:"left", fontSize:13, fontWeight:view===n.id&&!activeDay?600:400,
                }}>{n.label}</button>
              ))}
              <button onClick={newDay} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 11px", borderRadius:7, marginTop:6, background:C.surface2, border:`1px solid ${C.border}`, color:C.textMuted, cursor:"pointer", textAlign:"left", fontSize:13 }}>
                <span style={{ fontSize:15 }}>+</span> New Day Entry
              </button>
            </nav>

            {/* Quick stats */}
            <div style={{ padding:"14px 14px", borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:9, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>This Month</div>
              {[
                { label:"Win Rate", val:`${stats.winRate}%`,             color:parseFloat(stats.winRate)>=50?C.green:C.red   },
                { label:"PF",       val:stats.profitFactor,              color:parseFloat(stats.profitFactor)>=1.5?C.green:parseFloat(stats.profitFactor)>=1?C.amber:C.red },
                { label:"Net P&L",  val:`$${stats.totalPnl.toFixed(0)}`, color:stats.totalPnl>=0?C.green:C.red               },
              ].map(s=>(
                <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <span style={{ color:C.textMuted, fontSize:12 }}>{s.label}</span>
                  <span style={{ color:s.color, fontSize:12, fontFamily:"monospace", fontWeight:700 }}>{s.val}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Collapsed icon nav */}
        {!sidebarOpen && (
          <nav style={{ padding:"10px 6px", flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, marginTop:8 }}>
            {[{id:"dashboard",icon:"▪"},{id:"journal",icon:"≡"}].map(n=>(
              <button key={n.id} onClick={()=>{setView(n.id);setActiveDay(null);}} title={n.id} style={{ width:34, height:34, borderRadius:7, background:view===n.id&&!activeDay?C.surface2:"transparent", border:`1px solid ${view===n.id&&!activeDay?C.borderLight:"transparent"}`, color:view===n.id&&!activeDay?C.text:C.textMuted, cursor:"pointer", fontSize:16 }}>{n.icon}</button>
            ))}
            <button onClick={newDay} title="New Day" style={{ width:34, height:34, borderRadius:7, background:C.surface2, border:`1px solid ${C.border}`, color:C.textMuted, cursor:"pointer", fontSize:16, marginTop:4 }}>+</button>
          </nav>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ marginLeft:sidebarOpen?SIDEBAR_W:48, padding:"28px 32px", minHeight:"100vh", flex:1, transition:"margin-left 0.22s ease", boxSizing:"border-box" }}>

        {/* ════ DASHBOARD ════ */}
        {view==="dashboard" && !activeDay && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontSize:20, fontWeight:700, margin:0, letterSpacing:"-0.02em" }}>Dashboard</h1>
              <div style={{ color:C.textMuted, fontSize:12, marginTop:3 }}>{days.length} trading days · {new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
            </div>

            {/* ── STATS ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:16 }}>
              {/* Total P&L with live/funded split */}
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 18px" }}>
                <div style={{ color:C.textMuted, fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:7 }}>Total P&L</div>
                <div style={{ color:stats.totalPnl>=0?C.green:C.red, fontSize:24, fontWeight:700, fontFamily:"monospace", lineHeight:1 }}>${stats.totalPnl.toFixed(2)}</div>
                <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:3 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ color:C.textDim, fontSize:10 }}>Live</span>
                    <span style={{ color:stats.livePnl>=0?C.green:C.red, fontSize:11, fontFamily:"monospace", fontWeight:600 }}>${stats.livePnl.toFixed(2)}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ color:C.textDim, fontSize:10 }}>Funded</span>
                    <span style={{ color:stats.fundedPnl>=0?C.green:C.red, fontSize:11, fontFamily:"monospace", fontWeight:600 }}>${stats.fundedPnl.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Today P&L */}
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 18px" }}>
                <div style={{ color:C.textMuted, fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:7 }}>Today's P&L</div>
                <div style={{ color:stats.todayPnl>0?C.green:stats.todayPnl<0?C.red:C.textMuted, fontSize:24, fontWeight:700, fontFamily:"monospace", lineHeight:1 }}>${stats.todayPnl.toFixed(2)}</div>
                <div style={{ color:C.textDim, fontSize:11, marginTop:5 }}>{stats.todayCount} trade{stats.todayCount!==1?"s":""} today</div>
              </div>

              {/* Win Rate */}
              <StatCard label="Win Rate" value={`${stats.winRate}%`} sub={`${stats.wins}W · ${stats.losses}L`} color={parseFloat(stats.winRate)>=50?C.green:C.amber} />

              {/* Profit Factor */}
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 18px" }}>
                <div style={{ color:C.textMuted, fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:7 }}>Profit Factor</div>
                <div style={{ color:parseFloat(stats.profitFactor)>=1.5?C.green:parseFloat(stats.profitFactor)>=1?C.amber:C.red, fontSize:24, fontWeight:700, fontFamily:"monospace", lineHeight:1 }}>{stats.profitFactor}</div>
              </div>

              {/* Total RR */}
              <StatCard label="Total RR" value={`${stats.totalRR}R`} sub="this month" color={parseFloat(stats.totalRR)>=0?C.green:C.red} />
            </div>

            {/* ── QUOTE ── */}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"18px 22px", marginBottom:16, display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{ fontSize:28, color:C.textDim, lineHeight:1, flexShrink:0, marginTop:2 }}>"</div>
              <div>
                <div style={{ fontSize:14, color:C.text, lineHeight:1.7, fontStyle:"italic" }}>The goal of a successful trader is to make the best trades. Money is secondary. If you understand that, then you will understand that process matters more than outcome.</div>
                <div style={{ fontSize:11, color:C.textDim, marginTop:8, fontWeight:600, letterSpacing:"0.05em" }}>— LINDA RASCHKE</div>
              </div>
            </div>

            {/* ── MILESTONE ── */}
            {(()=>{
              const pct  = monthlyGoal>0 ? Math.min((stats.monthPnl/monthlyGoal)*100,100) : 0;
              const rem  = Math.max(monthlyGoal-stats.monthPnl,0);
              const over = stats.monthPnl>monthlyGoal;
              return (
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20, marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:C.textMuted, letterSpacing:"0.07em", textTransform:"uppercase" }}>Monthly Goal</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {editingGoal ? (
                        <>
                          <span style={{ color:C.textDim, fontSize:13 }}>$</span>
                          <input autoFocus value={goalInput} onChange={e=>setGoalInput(e.target.value.replace(/\D/g,""))}
                            onBlur={()=>{const v=parseFloat(goalInput);if(v>0)setMonthlyGoal(v);setEditingGoal(false);}}
                            onKeyDown={e=>{if(e.key==="Enter"){const v=parseFloat(goalInput);if(v>0)setMonthlyGoal(v);setEditingGoal(false);}}}
                            style={{ width:90, background:C.surface2, border:`1px solid ${C.borderLight}`, borderRadius:6, padding:"4px 8px", color:C.text, fontSize:13, outline:"none", fontFamily:"monospace" }} />
                        </>
                      ) : (
                        <button onClick={()=>{setGoalInput(String(monthlyGoal));setEditingGoal(true);}} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", color:C.textMuted, cursor:"pointer", fontSize:12 }}>Goal: ${monthlyGoal.toLocaleString()} · Edit</button>
                      )}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:26, fontWeight:800, fontFamily:"monospace", color:over?C.green:C.text }}>${stats.monthPnl.toFixed(2)}</span>
                    <span style={{ fontSize:13, color:C.textDim }}>of ${monthlyGoal.toLocaleString()} goal</span>
                    {over && <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>🎯 Goal reached</span>}
                  </div>
                  <div style={{ height:8, background:C.border, borderRadius:4, overflow:"hidden", marginBottom:8 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:over?C.green:pct>=75?C.amber:C.textDim, borderRadius:4, transition:"width 0.5s ease" }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:C.textDim }}>{pct.toFixed(1)}% complete</span>
                    {!over && <span style={{ fontSize:11, color:C.textDim }}>${rem.toFixed(2)} remaining</span>}
                  </div>
                </div>
              );
            })()}

            {/* ── TRADE CALENDAR ── */}
            {(()=>{
              const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
              const DOW    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
              const firstDay    = new Date(calYear,calMonth,1).getDay();
              const daysInMonth = new Date(calYear,calMonth+1,0).getDate();
              const isCurrentMo = calYear===now.getFullYear()&&calMonth===now.getMonth();
              const prevMo = ()=>{ if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); };
              const nextMo = ()=>{ if(!isCurrentMo){ if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); }};

              const mStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}`;
              const dayMap = {};
              days.filter(d=>d.date.startsWith(mStr)).forEach(d=>{
                const dn  = parseInt(d.date.split("-")[2]);
                const pnl = d.trades.filter(t=>t.result!=="faded").reduce((s,t)=>s+calcPnl(t).pnl,0);
                const wins   = d.trades.filter(t=>t.result==="win").length;
                const losses = d.trades.filter(t=>t.result==="loss").length;
                dayMap[dn] = { pnl, wins, losses, grade:d.postmarket.grade, obj:d };
              });

              const cells = [];
              for(let i=0;i<firstDay;i++) cells.push(null);
              for(let i=1;i<=daysInMonth;i++) cells.push(i);

              return (
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:C.textMuted, letterSpacing:"0.07em", textTransform:"uppercase" }}>Trade Calendar</div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <button onClick={prevMo} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", color:C.textMuted, cursor:"pointer", fontSize:13 }}>‹</button>
                      <span style={{ fontSize:13, fontWeight:600, color:C.text, minWidth:130, textAlign:"center" }}>{MONTHS[calMonth]} {calYear}</span>
                      <button onClick={nextMo} disabled={isCurrentMo} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", color:isCurrentMo?C.textDim:C.textMuted, cursor:isCurrentMo?"not-allowed":"pointer", fontSize:13, opacity:isCurrentMo?0.4:1 }}>›</button>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
                    {DOW.map(d=><div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:"0.06em", padding:"4px 0" }}>{d}</div>)}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
                    {cells.map((dn,i)=>{
                      if(!dn) return <div key={`e${i}`} />;
                      const entry    = dayMap[dn];
                      const isToday  = isCurrentMo && dn===now.getDate();
                      const isWeekend= (i%7===0||i%7===6);
                      const pnlColor = entry?(entry.pnl>0?C.green:entry.pnl<0?C.red:C.amber):null;
                      return (
                        <div key={dn} onClick={()=>{ if(entry) openDay(entry.obj); }} style={{
                          minHeight:62, borderRadius:8, padding:"7px 8px",
                          background:entry?C.surface2:C.bg,
                          border:`1px solid ${isToday?C.borderLight:C.border}`,
                          cursor:entry?"pointer":"default", position:"relative", boxSizing:"border-box",
                          opacity:isWeekend&&!entry?0.35:1,
                        }}>
                          <div style={{ fontSize:11, fontWeight:isToday?700:400, color:isToday?C.text:C.textDim, marginBottom:4 }}>{dn}</div>
                          {entry && (
                            <>
                              <div style={{ fontSize:11, fontWeight:700, fontFamily:"monospace", color:pnlColor, lineHeight:1.2 }}>{entry.pnl>=0?"+":""}${Math.abs(entry.pnl).toFixed(0)}</div>
                              <div style={{ display:"flex", gap:3, marginTop:4, flexWrap:"wrap" }}>
                                {Array(entry.wins).fill(0).map((_,j)=><div key={`w${j}`} style={{ width:5,height:5,borderRadius:"50%",background:C.green }} />)}
                                {Array(entry.losses).fill(0).map((_,j)=><div key={`l${j}`} style={{ width:5,height:5,borderRadius:"50%",background:C.red }} />)}
                              </div>
                              {entry.grade && <div style={{ position:"absolute", top:6, right:7, fontSize:10, fontWeight:800, color:GRADE_COLOR[entry.grade]||C.textDim }}>{entry.grade}</div>}
                            </>
                          )}
                          {isToday&&!entry && <div style={{ width:5,height:5,borderRadius:"50%",background:C.textDim,margin:"2px auto 0" }} />}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display:"flex", gap:16, marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
                    {[{c:C.green,l:"Win day"},{c:C.red,l:"Loss day"},{c:C.amber,l:"Breakeven"}].map(x=>(
                      <div key={x.l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:8,height:8,borderRadius:"50%",background:x.c }} />
                        <span style={{ fontSize:11, color:C.textDim }}>{x.l}</span>
                      </div>
                    ))}
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:8,height:8,borderRadius:2,background:C.surface3,border:`1px solid ${C.border}` }} />
                      <span style={{ fontSize:11, color:C.textDim }}>Has entry — click to open</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ════ JOURNAL LIST ════ */}
        {view==="journal" && !activeDay && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <h1 style={{ fontSize:20, fontWeight:700, margin:0, letterSpacing:"-0.02em" }}>Journal</h1>
                <div style={{ color:C.textMuted, fontSize:12, marginTop:3 }}>{days.length} trading days</div>
              </div>
              <button onClick={newDay} style={{ padding:"9px 18px", borderRadius:8, background:C.surface2, border:`1px solid ${C.border}`, color:C.text, cursor:"pointer", fontSize:13, fontWeight:600 }}>+ New Day Entry</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {sortedDays.map(d=>{
                const dayPnl  = d.trades.filter(t=>t.result!=="faded").reduce((s,t)=>s+calcPnl(t).pnl,0);
                const dayWins = d.trades.filter(t=>t.result==="win").length;
                const dayLoss = d.trades.filter(t=>t.result==="loss").length;
                return (
                  <div key={d.id} onClick={()=>openDay(d)} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:4, height:38, borderRadius:2, background:dayPnl>0?C.green:dayPnl<0?C.red:C.gray, flexShrink:0 }} />
                    <div style={{ width:88, fontFamily:"monospace", fontSize:13, color:C.textMuted }}>{d.date}</div>
                    {d.premarket.hasNews && <span style={{ background:C.redDim, color:C.red, border:`1px solid ${C.red}33`, borderRadius:4, fontSize:10, fontWeight:700, padding:"2px 6px" }}>NEWS</span>}
                    <div style={{ flex:1, fontSize:12, color:C.textDim }}>{d.premarket.notes?d.premarket.notes.slice(0,80)+"…":"No notes"}</div>
                    <div style={{ display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
                      <span style={{ color:C.textDim, fontSize:12 }}>{d.trades.length} trades · {dayWins}W {dayLoss}L</span>
                      <span style={{ fontFamily:"monospace", fontWeight:700, color:dayPnl>=0?C.green:C.red, minWidth:72, textAlign:"right" }}>{dayPnl>=0?"+":""}${dayPnl.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
              {days.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:C.textDim }}>No days logged yet.</div>}
            </div>
          </div>
        )}

        {/* ════ DAY EDITOR ════ */}
        {activeDay && (
          <div style={{ maxWidth:840 }}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <button onClick={()=>{setActiveDay(null);setView("journal");}} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:7, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>← Back</button>
                <input type="date" value={activeDay.date} onChange={e=>setActiveDay(d=>({...d,date:e.target.value}))}
                  style={{ background:"transparent", border:"none", outline:"none", fontSize:20, fontWeight:700, color:C.text, letterSpacing:"-0.02em", cursor:"pointer" }} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>deleteDay(activeDay.id)} style={{ padding:"8px 14px", borderRadius:7, background:C.redDim, border:`1px solid ${C.red}33`, color:C.red, cursor:"pointer", fontSize:13, fontWeight:600 }}>Delete</button>
                <button onClick={saveDay} style={{ padding:"8px 20px", borderRadius:7, background:C.surface3, border:`1px solid ${C.borderLight}`, color:C.text, cursor:"pointer", fontSize:13, fontWeight:700 }}>Save Day</button>
              </div>
            </div>

            {/* ── PRE-MARKET ── */}
            <Section title="Pre-Market Analysis">
              {/* News toggle — top */}
              <div style={{ marginBottom:16, padding:"12px 14px", background:C.bg, borderRadius:8, border:`1px solid ${activeDay.premarket.hasNews?C.red+"44":C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <button onClick={()=>patchPre({hasNews:!activeDay.premarket.hasNews})} style={{
                    display:"flex", alignItems:"center", gap:8, background:"transparent", border:"none", cursor:"pointer", padding:0,
                  }}>
                    <div style={{ width:18, height:18, borderRadius:4, border:`1px solid ${activeDay.premarket.hasNews?C.red:C.textDim}`, background:activeDay.premarket.hasNews?C.red:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, color:C.bg, fontWeight:900, transition:"all 0.15s" }}>{activeDay.premarket.hasNews?"✓":""}</div>
                    <span style={{ fontSize:13, fontWeight:600, color:activeDay.premarket.hasNews?C.red:C.textMuted }}>📰 Red Folder News Today</span>
                  </button>
                </div>
                {activeDay.premarket.hasNews && (
                  <input value={activeDay.premarket.newsText||""} onChange={e=>patchPre({newsText:e.target.value})}
                    placeholder="What's the news? e.g. FOMC Minutes 2pm EST, CPI 8:30am EST..."
                    style={{ ...INPUT, marginTop:10, background:C.surface2 }} />
                )}
              </div>

              {/* Screenshot first */}
              <div style={{ marginBottom:14 }}>
                <label style={LABEL}>Chart Screenshot</label>
                <ImageUploadBox image={activeDay.premarket.screenshot} onImage={img=>patchPre({screenshot:img})} label="Upload pre-market chart" />
              </div>

              {/* Analysis notes */}
              <div>
                <label style={LABEL}>Analysis Notes</label>
                <textarea value={activeDay.premarket.notes} onChange={e=>patchPre({notes:e.target.value})}
                  placeholder="HTF narrative, draw on liquidity targets, key PD arrays, session plan..."
                  rows={5} style={{ ...INPUT, resize:"vertical", lineHeight:1.65 }} />
              </div>
            </Section>

            {/* ── TRADES ── */}
            <Section title={`Trades (${activeDay.trades.length})`}>
              {activeDay.trades.map((t,ti)=>{
                const isFaded = t.result==="faded";
                const prev    = (t.entry&&t.exit) ? calcPnl({...t,entry:parseFloat(t.entry),exit:parseFloat(t.exit)}) : null;
                return (
                  <div key={t.id} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, padding:16, marginBottom:10 }}>
                    {/* Trade header */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:C.textDim, letterSpacing:"0.06em" }}>TRADE {ti+1}</span>
                      <button onClick={()=>removeTrade(t.id)} style={{ background:"transparent", border:"none", color:C.textDim, cursor:"pointer", fontSize:12 }}>✕ Remove</button>
                    </div>

                    {/* Outcome */}
                    <div style={{ marginBottom:12 }}>
                      <label style={LABEL}>Outcome</label>
                      <div style={{ display:"flex", gap:7 }}>
                        {Object.entries(OUTCOME).map(([key,cfg])=>(
                          <button key={key} onClick={()=>patchTrade(t.id,{result:key})} style={{
                            flex:1, padding:"8px 4px", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:700,
                            background:t.result===key?cfg.dim:C.surface2,
                            border:`1px solid ${t.result===key?cfg.border:C.border}`,
                            color:t.result===key?cfg.color:C.textMuted,
                          }}>{cfg.label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Account type */}
                    <div style={{ marginBottom:12 }}>
                      <label style={LABEL}>Account</label>
                      <div style={{ display:"flex", gap:7 }}>
                        {["live","funded"].map(a=>(
                          <button key={a} onClick={()=>patchTrade(t.id,{accountType:a})} style={{
                            flex:1, padding:"8px", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:600,
                            background:t.accountType===a?C.surface3:C.surface2,
                            border:`1px solid ${t.accountType===a?C.borderLight:C.border}`,
                            color:t.accountType===a?C.text:C.textMuted,
                          }}>{a.charAt(0).toUpperCase()+a.slice(1)}</button>
                        ))}
                      </div>
                    </div>

                    {/* Symbol / Side / Contracts */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
                      <div>
                        <label style={LABEL}>Symbol</label>
                        <select value={t.symbol} onChange={e=>patchTrade(t.id,{symbol:e.target.value})} style={INPUT}>
                          {SYMBOLS.map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={LABEL}>Direction</label>
                        <div style={{ display:"flex", gap:7 }}>
                          {["Long","Short"].map(s=>(
                            <button key={s} onClick={()=>patchTrade(t.id,{side:s})} style={{
                              flex:1, padding:"10px 4px", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:700,
                              background:t.side===s?(s==="Long"?C.greenDim:C.redDim):C.surface2,
                              border:`1px solid ${t.side===s?(s==="Long"?C.green:C.red):C.border}`,
                              color:t.side===s?(s==="Long"?C.green:C.red):C.textMuted,
                            }}>{s}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={LABEL}>Contracts</label>
                        <input type="number" value={t.contracts} min={1} onChange={e=>patchTrade(t.id,{contracts:parseInt(e.target.value)||1})} style={INPUT} />
                      </div>
                    </div>

                    {/* Entry / Exit / TP / SL / Drawdown */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                      <div>
                        <label style={LABEL}>Entry Price{isFaded&&<span style={{ color:C.textDim, textTransform:"none", letterSpacing:0 }}> — hypothetical</span>}</label>
                        <input type="number" step="0.25" value={t.entry} onChange={e=>patchTrade(t.id,{entry:e.target.value})} placeholder="21480.25" style={INPUT} />
                      </div>
                      <div>
                        <label style={LABEL}>Exit Price{isFaded&&<span style={{ color:C.textDim, textTransform:"none", letterSpacing:0 }}> — hypothetical</span>}</label>
                        <input type="number" step="0.25" value={t.exit} onChange={e=>patchTrade(t.id,{exit:e.target.value})} placeholder="21538.50" style={INPUT} />
                      </div>
                      <div>
                        <label style={LABEL}>Take Profit (planned)</label>
                        <input type="number" step="0.25" value={t.tp||""} onChange={e=>patchTrade(t.id,{tp:e.target.value})} placeholder="21545.00" style={INPUT} />
                      </div>
                      <div>
                        <label style={LABEL}>Stop Loss (planned)</label>
                        <input type="number" step="0.25" value={t.sl||""} onChange={e=>patchTrade(t.id,{sl:e.target.value})} placeholder="21462.00" style={INPUT} />
                      </div>
                      <div>
                        <label style={LABEL}>Drawdown (pts){!isFaded&&<span style={{ color:C.textDim, textTransform:"none", letterSpacing:0 }}> — before reversal</span>}</label>
                        <input type="number" step="0.25" value={t.drawdown||""} onChange={e=>patchTrade(t.id,{drawdown:e.target.value})} placeholder="leave blank if didn't play out" style={INPUT} />
                      </div>
                    </div>

                    {/* P&L preview */}
                    {prev && t.entry && t.exit && (
                      <div style={{ background:prev.pnl>=0?C.greenDim:C.redDim, border:`1px solid ${prev.pnl>=0?C.green:C.red}33`, borderRadius:7, padding:"10px 14px", marginBottom:12, display:"flex", gap:24 }}>
                        <div>
                          <div style={{ fontSize:10, color:C.textDim, marginBottom:2 }}>{isFaded?"Missed P&L":"Estimated P&L"}</div>
                          <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:16, color:prev.pnl>=0?C.green:C.red }}>{prev.pnl>=0?"+":""}${prev.pnl}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:C.textDim, marginBottom:2 }}>R-Multiple</div>
                          <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:16, color:prev.pnl>=0?C.green:C.red }}>{prev.rMultiple}R</div>
                        </div>
                      </div>
                    )}

                    {/* ICT Tags */}
                    <div style={{ marginBottom:12 }}>
                      <label style={LABEL}>ICT Confluences</label>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {Object.entries(ICT_TAGS).map(([grp,tags])=>(
                          <div key={grp}>
                            <div style={{ fontSize:10, color:C.textDim, marginBottom:5, fontWeight:600 }}>{grp}</div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                              {tags.map(tag=><TagPill key={tag} active={t.tags.includes(tag)} onClick={()=>toggleTradeTag(t.id,tag)}>{tag}</TagPill>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trade notes */}
                    <div style={{ marginBottom:14 }}>
                      <label style={LABEL}>Trade Notes</label>
                      <textarea value={t.notes} onChange={e=>patchTrade(t.id,{notes:e.target.value})}
                        placeholder={isFaded?"Why did you fade it? What would the entry/target/stop have been?":"Entry reasoning, execution quality, what you'd do differently..."}
                        rows={3} style={{ ...INPUT, resize:"vertical", lineHeight:1.65 }} />
                    </div>

                    {/* Dual screenshots */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div>
                        <label style={LABEL}>Execution Chart</label>
                        <ImageUploadBox image={t.screenshotExec} onImage={img=>patchTrade(t.id,{screenshotExec:img})} label="Upload execution screenshot" />
                      </div>
                      <div>
                        <label style={LABEL}>HTF Context Chart</label>
                        <ImageUploadBox image={t.screenshotHTF} onImage={img=>patchTrade(t.id,{screenshotHTF:img})} label="Upload HTF context" />
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={addTrade} style={{ width:"100%", padding:"11px", borderRadius:8, background:"transparent", border:`1px dashed ${C.border}`, color:C.textMuted, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                + Add Trade
              </button>
            </Section>

            {/* ── POST-MARKET ── */}
            <Section title="Post-Market Review">
              {/* Mood */}
              <div style={{ marginBottom:18 }}>
                <label style={LABEL}>How do you feel after today?</label>
                <div style={{ display:"flex", gap:7 }}>
                  {MOODS.map(m=>{
                    const active = activeDay.postmarket.mood===m.key;
                    return (
                      <button key={m.key} onClick={()=>patchPost({mood:m.key})} title={m.label} style={{
                        flex:1, padding:"10px 4px", borderRadius:8, cursor:"pointer", fontSize:20,
                        background:active?C.surface3:C.surface2,
                        border:`1px solid ${active?C.borderLight:C.border}`,
                        display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                      }}>
                        <span>{m.emoji}</span>
                        <span style={{ fontSize:9, color:active?C.textMuted:C.textDim, fontWeight:600, letterSpacing:"0.03em", textAlign:"center", lineHeight:1.2 }}>{m.label.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rules checklist */}
              <div style={{ marginBottom:18 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <label style={{ ...LABEL, marginBottom:0 }}>Rules Followed</label>
                </div>
                {/* Add rule input */}
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  <input value={newRuleInput} onChange={e=>setNewRuleInput(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter") addGlobalRule(); }}
                    placeholder="Add a custom rule... (press Enter)"
                    style={{ ...INPUT, flex:1 }} />
                  <button onClick={addGlobalRule} style={{ padding:"10px 16px", borderRadius:7, background:C.surface3, border:`1px solid ${C.borderLight}`, color:C.text, cursor:"pointer", fontSize:13, fontWeight:600, flexShrink:0 }}>Add</button>
                </div>
                {globalRules.length===0 ? (
                  <div style={{ color:C.textDim, fontSize:13, padding:"12px 0" }}>No rules added yet. Type a rule above and press Enter.</div>
                ) : (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {globalRules.map(rule=>{
                      const checked = activeDay.postmarket.rulesFollowed.includes(rule);
                      return (
                        <div key={rule} style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <button onClick={()=>toggleRule(rule)} style={{
                            flex:1, display:"flex", alignItems:"center", gap:9, padding:"9px 12px", borderRadius:7, cursor:"pointer", textAlign:"left",
                            background:checked?C.greenDim:C.surface2,
                            border:`1px solid ${checked?C.green+"44":C.border}`,
                            color:checked?C.green:C.textMuted,
                            fontSize:12, fontWeight:checked?600:400,
                          }}>
                            <span style={{ width:14, height:14, borderRadius:3, border:`1px solid ${checked?C.green:C.textDim}`, background:checked?C.green:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:9, color:C.bg, fontWeight:900 }}>{checked?"✓":""}</span>
                            {rule}
                          </button>
                          <button onClick={()=>{ setGlobalRules(rs=>rs.filter(r=>r!==rule)); patchPost({rulesFollowed:activeDay.postmarket.rulesFollowed.filter(r=>r!==rule)}); }}
                            style={{ background:"transparent", border:"none", color:C.textDim, cursor:"pointer", fontSize:13, padding:"4px 6px", flexShrink:0 }} title="Remove rule">✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Review notes */}
              <div>
                <label style={LABEL}>Review Notes</label>
                <textarea value={activeDay.postmarket.notes} onChange={e=>patchPost({notes:e.target.value})}
                  placeholder="What went well? What didn't? Execution quality, emotional state, lessons learned. What will you do differently tomorrow?"
                  rows={5} style={{ ...INPUT, resize:"vertical", lineHeight:1.65 }} />
              </div>
            </Section>

            {/* Save */}
            <div style={{ display:"flex", gap:10, paddingTop:6, paddingBottom:40 }}>
              <button onClick={saveDay} style={{ padding:"11px 26px", borderRadius:8, background:C.surface3, border:`1px solid ${C.borderLight}`, color:C.text, cursor:"pointer", fontSize:14, fontWeight:700 }}>Save Day</button>
              <button onClick={()=>{setActiveDay(null);setView("journal");}} style={{ padding:"11px 18px", borderRadius:8, background:"transparent", border:`1px solid ${C.border}`, color:C.textMuted, cursor:"pointer", fontSize:14 }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
