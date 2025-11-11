// 数据集（示例 30 句）
const DEMO_SENTENCES = [
  {
    "id": "s1",
    "text": "where do you usually have lunch",
    "audio": "assets/s1.mp3"
  },
  {
    "id": "s2",
    "text": "the restaurant of our company",
    "audio": "assets/s2.mp3"
  },
  {
    "id": "s3",
    "text": "take your temperature",
    "audio": "assets/s3.mp3"
  },
  {
    "id": "s4",
    "text": "oh man 39 degrees",
    "audio": "assets/s4.mp3"
  },
  {
    "id": "s5",
    "text": "did you cook this dish",
    "audio": "assets/s5.mp3"
  },
  {
    "id": "s6",
    "text": "yes what about its taste is it good",
    "audio": "assets/s6.mp3"
  },
  {
    "id": "s7",
    "text": "she often hides behind her mother when there is a stranger",
    "audio": "assets/s7.mp3"
  },
  {
    "id": "s8",
    "text": "I was a shy girl like her when I was young",
    "audio": "assets/s8.mp3"
  },
  {
    "id": "s9",
    "text": "are there many foreign students in your school",
    "audio": "assets/s9.mp3"
  },
  {
    "id": "s10",
    "text": "yes there are",
    "audio": "assets/s10.mp3"
  },
  {
    "id": "s11",
    "text": "what did you take as your major at college",
    "audio": "assets/s11.mp3"
  },
  {
    "id": "s12",
    "text": "my major is economics",
    "audio": "assets/s12.mp3"
  },
  {
    "id": "s13",
    "text": "why don't you go",
    "audio": "assets/s13.mp3"
  },
  {
    "id": "s14",
    "text": "they are young it is unsuitable for me",
    "audio": "assets/s14.mp3"
  },
  {
    "id": "s15",
    "text": "I am 52 years old this year",
    "audio": "assets/s15.mp3"
  },
  {
    "id": "s16",
    "text": "I am 52 too",
    "audio": "assets/s16.mp3"
  },
  {
    "id": "s17",
    "text": "how to write your name",
    "audio": "assets/s17.mp3"
  },
  {
    "id": "s18",
    "text": "like this",
    "audio": "assets/s18.mp3"
  },
  {
    "id": "s19",
    "text": "let's eat out today",
    "audio": "assets/s19.mp3"
  },
  {
    "id": "s20",
    "text": "that good let's go to that new restaurant",
    "audio": "assets/s20.mp3"
  },
  {
    "id": "s21",
    "text": "I study in Canada and have a work",
    "audio": "assets/s21.mp3"
  },
  {
    "id": "s22",
    "text": "are tuition fees and living expenses very high in there",
    "audio": "assets/s22.mp3"
  },
  {
    "id": "s23",
    "text": "his number was noted in this paper and you can contact him",
    "audio": "assets/s23.mp3"
  },
  {
    "id": "s24",
    "text": "when do you run every morning",
    "audio": "assets/s24.mp3"
  },
  {
    "id": "s25",
    "text": "I'm going on a run at 6 in about a half an hour",
    "audio": "assets/s25.mp3"
  },
  {
    "id": "s26",
    "text": "he enjoys studying very much",
    "audio": "assets/s26.mp3"
  },
  {
    "id": "s27",
    "text": "so he gets good grades",
    "audio": "assets/s27.mp3"
  },
  {
    "id": "s28",
    "text": "is it cold in winter in Osaka",
    "audio": "assets/s28.mp3"
  },
  {
    "id": "s29",
    "text": "same here",
    "audio": "assets/s29.mp3"
  },
  {
    "id": "s30",
    "text": "will you take part in the activity tomorrow",
    "audio": "assets/s30.mp3"
  }
];
let SENTENCES = [];

let idx = -1;
let currentStart = null;
let todayDone = 0;
let reviewSet = new Set();
const sessionId = new Date().toISOString().slice(0,10);
const storeKey = `ds50_${sessionId}`;

const audioEl = document.getElementById("audio");
const rateEl = document.getElementById("rate");
const inputEl = document.getElementById("input");
const progressEl = document.getElementById("progress");
const werEl = document.getElementById("wer");
const wpmEl = document.getElementById("wpm");
const diffEl = document.getElementById("diff");
const promptEl = document.getElementById("prompt");
const reviewBox = document.getElementById("reviewWords");
const addToReviewEl = document.getElementById("addToReview");
const saveHint = document.getElementById("saveHint");

document.getElementById("btnNext").addEventListener("click", nextSentence);
document.getElementById("btnPrev").addEventListener("click", prevSentence);
document.getElementById("btnSubmit").addEventListener("click", submitAttempt);
document.getElementById("btnReveal").addEventListener("click", () => showDiff(true));
document.getElementById("btnRetry").addEventListener("click", () => { audioEl.currentTime = 0; audioEl.play(); });
document.getElementById("btnSave").addEventListener("click", saveLocal);
document.getElementById("btnExportJson").addEventListener("click", exportJson);
document.getElementById("btnExportCsv").addEventListener("click", exportCsv);
rateEl.addEventListener("change", () => audioEl.playbackRate = Number(rateEl.value));

audioEl.playbackRate = Number(rateEl.value);
window.addEventListener('load', async () => {
  const btnNext = document.getElementById("btnNext");
  if (btnNext) btnNext.disabled = true;
  const promptElTmp = document.getElementById("prompt");
  if (promptElTmp) promptElTmp.textContent = "正在加载句库，请稍候…";
  await initSentences();
  if (promptElTmp) promptElTmp.textContent = "点击“下一句”开始";
  loadLocal();
  renderProgress();
  renderReview();
  if (btnNext) btnNext.disabled = false;
  // 刷新一次趋势图，确保图表在初次加载时就绪
  try { if (typeof refreshCharts === 'function') refreshCharts(); } catch (_) {}
});

async function initSentences() {
  try {
    const res = await fetch('assets/sentences.json?v=' + new Date().toISOString().slice(0,10));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const arr = await res.json();
    if (!Array.isArray(arr) || !arr.length) throw new Error('empty');
    SENTENCES = arr;
    console.log('[DictationSprint] loaded external sentences.json:', SENTENCES.length);
  } catch (e) {
    // fallback to built-in demo sentences
    if (typeof DEMO_SENTENCES !== 'undefined' && Array.isArray(DEMO_SENTENCES) && DEMO_SENTENCES.length) {
      SENTENCES = DEMO_SENTENCES;
      console.warn('[DictationSprint] fallback to DEMO_SENTENCES due to:', e);
    } else {
      SENTENCES = [];
      console.error('[DictationSprint] no sentences available:', e);
    }
  }
}


function nextSentence() { if (idx < SENTENCES.length - 1) idx++; loadSentence(); }
function prevSentence() { if (idx > 0) idx--; loadSentence(); }
function loadSentence() { const s = SENTENCES[idx]; if (!s) return; audioEl.src = s.audio; inputEl.value = ""; diffEl.innerHTML = ""; promptEl.textContent = `第 ${idx+1} 句，专注聆听…`; currentStart = Date.now(); audioEl.play(); }
function submitAttempt() {
  const s = SENTENCES[idx];
  if (!s) return;
  const hyp = normalize(inputEl.value);
  const ref = normalize(s.text);
  const t = (Date.now() - (currentStart || Date.now())) / 60000;
  const ops = alignWords(ref.split(" "), hyp.split(" "));
  const {wer, wpm, wrongWords} = scoreFromOps(ops, ref.split(" "), hyp.split(" "), t);
  showDiff(false, ops, ref.split(" "), hyp.split(" "));
  werEl.textContent = wer.toFixed(2);
  wpmEl.textContent = Number.isFinite(wpm) ? wpm.toFixed(1) : "—";
  if (addToReviewEl.checked) wrongWords.forEach(w => reviewSet.add(w.toLowerCase()));
  todayDone = Math.max(todayDone, idx+1);
  renderProgress();
  renderReview();
  persistAttempt({ sId: s.id, ref: s.text, hyp: inputEl.value, ms: Date.now(), tmin: t, wer, wpm, ops });
}
function showDiff(revealOnly=false, ops=null, refWords=null, hypWords=null) {
  const s = SENTENCES[idx]; if (!s) return;
  if (revealOnly) {
    diffEl.innerHTML = s.text.split(" ").map(w => `<span class="token ok">${escapeHtml(w)}</span>`).join(" ");
    return;
  }
  const parts = [];
  let i=0, j=0;
  for (const op of ops) {
    if (op === "M") { parts.push(token(refWords[i], "ok")); i++; j++; }
    else if (op === "S") { parts.push(token(hypWords[j], "sub")); i++; j++; }
    else if (op === "D") { parts.push(token(refWords[i], "del")); i++; }
    else if (op === "I") { parts.push(token(hypWords[j], "ins")); j++; }
  }
  diffEl.innerHTML = parts.join(" ");
}
function renderProgress() { progressEl.textContent = `${Math.min(todayDone,10)}/10`; }
function renderReview() { reviewBox.innerHTML = Array.from(reviewSet).map(w => `<span class="chip">${escapeHtml(w)}</span>`).join(""); }
function saveLocal() {
  const data = JSON.parse(localStorage.getItem(storeKey) || "{}");
  data.review = Array.from(reviewSet);
  localStorage.setItem(storeKey, JSON.stringify(data));
  saveHint.textContent = "已保存到本地。";
  setTimeout(()=> saveHint.textContent="", 1500);
}
function loadLocal() {
  const raw = localStorage.getItem(storeKey);
  if (!raw) return;
  const data = JSON.parse(raw);
  if (Array.isArray(data.review)) reviewSet = new Set(data.review);
  if (Array.isArray(data.log)) todayDone = Math.min(data.log.length, 10);
}
function persistAttempt(entry) {
  const raw = localStorage.getItem(storeKey);
  const data = raw ? JSON.parse(raw) : {};
  if (!Array.isArray(data.log)) data.log = [];
  data.log.push(entry);
  localStorage.setItem(storeKey, JSON.stringify(data));
}
function exportJson() {
  const data = JSON.parse(localStorage.getItem(storeKey) || "{}");
  download(`${sessionId}.json`, JSON.stringify(data, null, 2));
}
function exportCsv() {
  const data = JSON.parse(localStorage.getItem(storeKey) || "{}");
  const rows = [["session","sid","ms","tmin","wer","wpm","ref","hyp","ops"]];
  (data.log||[]).forEach(r=>{
    rows.push([sessionId, r.sId, r.ms, r.tmin, r.wer, r.wpm, quote(r.ref), quote(r.hyp), quote((r.ops||[]).join(""))]);
  });
  const csv = rows.map(r=>r.join(",")).join("\n");
  download(`${sessionId}.csv`, csv);
}
function normalize(s) { return s.trim().replace(/[“”"']/g,"").replace(/[.,!?;:()]/g,"").replace(/\s+/g," ").toLowerCase(); }
function alignWords(ref, hyp) {
  const n = ref.length, m = hyp.length;
  const dp = Array.from({length:n+1}, ()=> Array(m+1).fill(0));
  const bt = Array.from({length:n+1}, ()=> Array(m+1).fill(null));
  for (let i=1;i<=n;i++){ dp[i][0]=i; bt[i][0]="D"; }
  for (let j=1;j<=m;j++){ dp[0][j]=j; bt[0][j]="I"; }
  for (let i=1;i<=n;i++){
    for (let j=1;j<=m;j++){
      const costSub = dp[i-1][j-1] + (ref[i-1]===hyp[j-1] ? 0 : 1);
      const costDel = dp[i-1][j] + 1;
      const costIns = dp[i][j-1] + 1;
      const best = Math.min(costSub, costDel, costIns);
      dp[i][j] = best;
      if (best === costSub) bt[i][j] = (ref[i-1]===hyp[j-1]) ? "M" : "S";
      else if (best === costDel) bt[i][j] = "D";
      else bt[i][j] = "I";
    }
  }
  const ops = [];
  let i=n, j=m;
  while (i>0 || j>0) {
    const op = bt[i][j];
    ops.unshift(op);
    if (op==="M"||op==="S"){ i--; j--; }
    else if (op==="D"){ i--; }
    else if (op==="I"){ j--; }
  }
  return ops;
}
function scoreFromOps(ops, ref, hyp, tmin) {
  let i=0,j=0, S=0,D=0,I=0;
  const wrong = [];
  for (const op of ops) {
    if (op==="M"){ i++; j++; }
    else if (op==="S"){ wrong.push(hyp[j]); S++; i++; j++; }
    else if (op==="D"){ wrong.push(ref[i]); D++; i++; }
    else if (op==="I"){ wrong.push(hyp[j]); I++; j++; }
  }
  const N = ref.length || 1;
  const wer = (S+D+I)/N;
  const wpm = tmin>0 ? (hyp.length / tmin) : NaN;
  return { wer, wpm, wrongWords: wrong };
}
function token(w, cls) { return `<span class="token ${cls}">${escapeHtml(w)}</span>`; }
function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]||m)); }
function quote(s){ return '"' + String(s).replace(/"/g,'""') + '"'; }
function download(name, content) {
  const blob = content instanceof Blob ? content : new Blob([content], {type: "text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ======= 评测导入 =======
document.getElementById("btnImportAssess").addEventListener("click", importAssess);
document.getElementById("btnRefreshCharts").addEventListener("click", refreshCharts);
window.addEventListener("load", refreshCharts);

async function importAssess() {
  const preEl = document.getElementById("preFile");
  const postEl = document.getElementById("postFile");
  const statsEl = document.getElementById("assessStats");
  const preFile = preEl.files && preEl.files[0];
  const postFile = postEl.files && postEl.files[0];
  if (!preFile || !postFile) { statsEl.textContent = "请同时选择前测与后测文件（JSON 或 CSV）。"; return; }
  try {
    const preData = await readAssessFile(preFile);
    const postData = await readAssessFile(postFile);
    const preMetrics = summarizeAssess(preData);
    const postMetrics = summarizeAssess(postData);
    const deltaWER = (postMetrics.medianWER - preMetrics.medianWER);
    const deltaWPM = (postMetrics.medianWPM - preMetrics.medianWPM);
    const sign = (x)=> x>0?"+":"";
    statsEl.classList.remove("muted");
    statsEl.innerHTML = [
      `前测 n=${preMetrics.n}，WER 中位数 ${preMetrics.medianWER.toFixed(2)}，WPM 中位数 ${preMetrics.medianWPM.toFixed(1)}`,
      `后测 n=${postMetrics.n}，WER 中位数 ${postMetrics.medianWER.toFixed(2)}，WPM 中位数 ${postMetrics.medianWPM.toFixed(1)}`,
      `变化：WER ${sign(deltaWER)}${deltaWER.toFixed(2)}（越低越好），WPM ${sign(deltaWPM)}${deltaWPM.toFixed(1)}（越高越好）`
    ].join("<br/>");
  } catch (e) {
    statsEl.textContent = "导入失败：" + (e.message || e);
  }
}
function readFileAsText(file) {
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(r.result);
    r.onerror = reject;
    r.readAsText(file, "utf-8");
  });
}
async function readAssessFile(file) {
  const text = await readFileAsText(file);
  try {
    const data = JSON.parse(text);
    if (data && Array.isArray(data.log)) return data.log;
    if (Array.isArray(data)) return data;
  } catch (_){}
  return parseCSV(text);
}
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map(h=>h.trim().replace(/^\"|\"$/g,""));
  const rows = [];
  for (let i=1;i<lines.length;i++){
    const cells = []; let cur="", inq=false;
    for (let ch of lines[i]){ if (ch === '"'){ inq=!inq; cur+=ch; } else if (ch === "," && !inq){ cells.push(cur); cur=""; } else { cur+=ch; } }
    cells.push(cur);
    const obj = {};
    headers.forEach((h,idx)=>{ obj[h] = (cells[idx]||"").replace(/^\"|\"$/g,""); });
    rows.push(obj);
  }
  return rows;
}
function summarizeAssess(rows) {
  const wers = []; const wpms = [];
  for (const r of rows) {
    let wer = parseFloat(r.wer); let wpm = parseFloat(r.wpm);
    if (!isFinite(wer)) { const ops=(r.ops||"").toString(); const S=(ops.match(/S/g)||[]).length; const D=(ops.match(/D/g)||[]).length; const I=(ops.match(/I/g)||[]).length; const N=Math.max(1,(r.ref||"").toString().trim().split(/\s+/).filter(Boolean).length); wer=(S+D+I)/N; }
    if (!isFinite(wpm)) { const tmin=parseFloat(r.tmin); const hyp=(r.hyp||"").toString().trim().split(/\s+/).filter(Boolean); wpm=(isFinite(tmin)&&tmin>0)? (hyp.length/tmin): NaN; }
    if (isFinite(wer)) wers.push(wer);
    if (isFinite(wpm)) wpms.push(wpm);
  }
  return { n: rows.length, medianWER: arrMedian(wers), medianWPM: arrMedian(wpms) };
}
function arrMedian(a){ if(!a||!a.length) return NaN; const s=a.slice().sort((x,y)=>x-y); const m=Math.floor(s.length/2); return s.length%2? s[m]: (s[m-1]+s[m])/2; }

// ======= 曲线与范围 =======
let chartRange = 7;
const rangeTabs = document.getElementById("rangeTabs");
if (rangeTabs) {
  rangeTabs.addEventListener("click", (e)=>{
    const btn = e.target.closest(".seg");
    if (!btn) return;
    [...rangeTabs.querySelectorAll(".seg")].forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    chartRange = parseInt(btn.dataset.range || "7", 10);
    refreshCharts();
  });
}
function refreshCharts(){
  const daily = collectDailyMedians().slice(-chartRange);
  const labels = daily.map(d=>d.date);
  const wers = daily.map(d=>d.wer);
  const wpms = daily.map(d=>d.wpm);
  const r_wer = rollingMedian(wers, Math.min(chartRange, 7));
  const r_wpm = rollingMedian(wpms, Math.min(chartRange, 7));
  drawLineChart(document.getElementById("chartWER"), labels, r_wer, `${chartRange}日窗口内的滑动中位 WER（越低越好）`);
  drawLineChart(document.getElementById("chartWPM"), labels, r_wpm, `${chartRange}日窗口内的滑动中位 WPM（越高越好）`);
}
function collectDailyMedians(){
  const days = [];
  for (let i=0; i<localStorage.length; i++){
    const k = localStorage.key(i);
    if (!/^ds50_\d{4}-\d{2}-\d{2}$/.test(k)) continue;
    try {
      const v = JSON.parse(localStorage.getItem(k) || "{}");
      const logs = Array.isArray(v.log) ? v.log : [];
      const wers = [], wpms = [];
      for (const r of logs) { if (isFinite(r.wer)) wers.push(Number(r.wer)); if (isFinite(r.wpm)) wpms.push(Number(r.wpm)); }
      if (wers.length || wpms.length) {
        const date = k.slice(5);
        const wer = wers.length? arrMedian(wers): NaN;
        const wpm = wpms.length? arrMedian(wpms): NaN;
        days.push({date, wer, wpm});
      }
    } catch (_){}
  }
  days.sort((a,b)=> a.date.localeCompare(b.date));
  return days.slice(-30);
}
function rollingMedian(arr, win){
  const out = [];
  for (let i=0;i<arr.length;i++){
    const start = Math.max(0, i - win + 1);
    const window = arr.slice(start, i+1).filter(x=>isFinite(x));
    out.push(window.length? arrMedian(window): NaN);
  }
  return out;
}
function drawLineChart(canvas, labels, data, title){
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  const pad = {l:48, r:12, t:24, b:28};
  ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillStyle = "#1f2937"; ctx.fillText(title, pad.l, pad.t-6);
  const nums = data.filter(x=>isFinite(x));
  const yMin = nums.length? Math.min(...nums): 0;
  const yMax = nums.length? Math.max(...nums): 1;
  const range = (yMax - yMin) || 1;
  const y0 = pad.t, y1 = H - pad.b, x0 = pad.l, x1 = W - pad.r;
  ctx.strokeStyle = "#e5e7eb"; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.stroke();
  ctx.fillStyle = "#6b7280"; ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  for (let t=0;t<=4;t++){
    const v = yMin + range * t/4; const y = y1 - (y1 - y0) * t/4;
    ctx.strokeStyle = "#f3f4f6"; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.fillText(v.toFixed(2), 4, y+4);
  }
  const n = labels.length, maxTicks = 8;
  for (let i=0;i<n;i++){
    if (n<=maxTicks || i % Math.ceil(n / maxTicks) === 0){
      const x = x0 + (x1 - x0) * (i / Math.max(1, n-1));
      ctx.fillText(labels[i].slice(5), x-16, H-8);
    }
  }
  ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2; ctx.beginPath();
  for (let i=0;i<n;i++){
    const v = data[i];
    const x = x0 + (x1 - x0) * (i / Math.max(1, n-1));
    const y = isFinite(v) ? (y1 - ( (v - yMin) / range ) * (y1 - y0)) : null;
    if (y===null) continue;
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke(); ctx.fillStyle = "#2563eb";
  for (let i=0;i<n;i++){
    const v = data[i]; if (!isFinite(v)) continue;
    const x = x0 + (x1 - x0) * (i / Math.max(1, n-1));
    const y = y1 - ( (v - yMin) / range ) * (y1 - y0);
    ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill();
  }
}

// ======= 日期范围导出/合并 & 归档 =======
document.getElementById("btnExportRangeJson").addEventListener("click", ()=> exportRangeJson());
document.getElementById("btnExportRangeCsv").addEventListener("click", ()=> exportRangeCsv());
document.getElementById("btnArchiveRange").addEventListener("click", ()=> archiveRange());
function setRangeHint(msg){ const el = document.getElementById("rangeHint"); if (el) el.textContent = msg; }
function collectRange(){
  let start = (document.getElementById("rangeStart")?.value || "").trim();
  let end = (document.getElementById("rangeEnd")?.value || "").trim();
  const keys = []; for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if (/^ds50_\d{4}-\d{2}-\d{2}$/.test(k)) keys.push(k); }
  keys.sort(); if (!start && keys.length) start = keys[0].slice(5); if (!end && keys.length) end = keys[keys.length-1].slice(5);
  const sessions = []; const merged = [];
  for (const k of keys){ const date = k.slice(5); if (date < start || date > end) continue;
    try { const v = JSON.parse(localStorage.getItem(k) || "{}"); const logs = Array.isArray(v.log)? v.log: [];
      sessions.push({ session: date, count: logs.length });
      logs.forEach(r=> merged.push({ session: date, sId: r.sId, ms: r.ms, tmin: r.tmin, wer: r.wer, wpm: r.wpm, ref: r.ref, hyp: r.hyp, ops: r.ops }));
    } catch(_){}
  }
  return { start, end, sessions, merged };
}
function exportRangeJson(){
  const {start, end, sessions, merged} = collectRange();
  if (!sessions.length) { setRangeHint("所选范围内没有数据。"); return; }
  const payload = { range: { start, end }, sessions, merged };
  download(`ds50_${start}_to_${end}.json`, JSON.stringify(payload, null, 2));
  setRangeHint(`已导出 JSON：${sessions.length} 个会话，共 ${merged.length} 条尝试。`);
}
function exportRangeCsv(){
  const {start, end, sessions, merged} = collectRange();
  if (!sessions.length) { setRangeHint("所选范围内没有数据。"); return; }
  const rows = [["session","sid","ms","tmin","wer","wpm","ref","hyp","ops"]];
  merged.forEach(r=> rows.push([r.session, r.sId, r.ms, r.tmin, r.wer, r.wpm, quote(r.ref||""), quote(r.hyp||""), quote((r.ops||[]).join? r.ops.join("") : (r.ops||"")) ]));
  const csv = rows.map(r=>r.join(",")).join("\n");
  download(`ds50_${start}_to_${end}.csv`, csv);
  setRangeHint(`已导出 CSV：${sessions.length} 个会话，共 ${merged.length} 条尝试。`);
}
function archiveRange(){
  const {start, end, sessions, merged} = collectRange();
  if (!sessions.length) { setRangeHint("所选范围内没有可归档的数据。"); return; }
  const ok = confirm(`将归档并删除 ${sessions.length} 个会话（${start} 至 ${end}），共 ${merged.length} 条尝试。是否继续？此操作不可撤销。`);
  if (!ok) return;
  const payload = { archived_at: new Date().toISOString(), range: { start, end }, sessions, merged };
  download(`ds50_archive_${start}_to_${end}.json`, JSON.stringify(payload, null, 2));
  let removed = 0; const keys = [];
  for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if (/^ds50_\d{4}-\d{2}-\d{2}$/.test(k)) keys.push(k); }
  keys.sort(); for (const k of keys){ const date = k.slice(5); if (date >= start && date <= end) { localStorage.removeItem(k); removed++; } }
  setRangeHint(`已归档并清理 ${removed} 个会话。建议点“刷新曲线”。`);
  refreshCharts();
}

// ======= 错词清单导出 & 复训集生成 =======
document.getElementById("btnExportReviewCsv").addEventListener("click", ()=> exportReviewCsv());
document.getElementById("btnGenerateReviewSet").addEventListener("click", ()=> generateReviewSet());

function exportReviewCsv(){
  const agg = aggregateWrongWordsTop(100);
  if (!agg.length) { alert("没有可用的错词记录。"); return; }
  const rows = [["word","count","last_seen","example_sentence","cloze_sentence"]];
  agg.slice(0,50).forEach(e=>{ rows.push([e.word, String(e.count), e.lastDate||"", quote(e.example||""), quote(makeCloze(e.example||"", e.word))]); });
  const csv = rows.map(r=>r.join(",")).join("\n");
  const stamp = new Date().toISOString().slice(0,10).replace(/-/g,"");
  download(`ds50_review_words_${stamp}.csv`, csv);
}
function generateReviewSet(){
  const entries = aggregateWrongWordsTop(50);
  if (!entries.length) { alert("没有可用的错词记录，先完成几次训练再试。"); return; }
  const N = 20;
  const today = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const dataset = [];
  const templates = [
    "Please confirm {w} before we submit the final report.",
    "We discussed {w} in detail after the break.",
    "You can improve by practicing {w} every day.",
    "The article mentions {w} several times in the conclusion.",
    "Pay attention to how {w} connects the two ideas.",
    "She carefully checked {w} before sending the email.",
    "Our results depend on {w} as a key factor.",
    "Good habits make {w} easier to remember over time.",
    "The instructor highlighted {w} at the beginning.",
    "Do not skip {w} when the pace increases.",
    "I completely forgot {w} during the meeting yesterday.",
    "Please spell {w} correctly in this sentence today.",
    "Focus on the word {w} during this dictation practice.",
    "We often confuse {w} in fast speech and writing.",
    "Listen carefully; the target word today is {w}.",
    "Use {w} in a short and clear message for practice.",
    "Type the phrase with {w} and check your accuracy.",
    "In daily tasks we frequently rely on {w}.",
    "The recording mentions {w} near the end.",
    "Repeat the line and notice {w} between pauses."
  ];
  for (let i=0;i<N;i++){
    const word = entries[i % entries.length].word;
    const t = templates[i % templates.length];
    const text = t.replace("{w}", word);
    const id = `r${String(i+1).padStart(2,"0")}`;
    const audio = `assets/review_${today}_${String(i+1).padStart(2,"0")}.mp3`;
    dataset.push({ id, text, audio });
  }
  download(`review_set_${today}.json`, JSON.stringify(dataset, null, 2));
  const rows = [["id","text","audio"]].concat(dataset.map(d=>[d.id, quote(d.text), d.audio]));
  download(`review_set_${today}.csv`, rows.map(r=>r.join(",")).join("\n"));
  const manifest = dataset.map(d=>d.audio).join("\n") + "\n\n说明：以上为占位音频清单；请按文件名录制或配音后放入 app/assets/ 目录。建议 44.1kHz、单声道、4–8 秒。";
  download(`review_set_${today}_audio_manifest.txt`, manifest);
}
function aggregateWrongWordsTop(topN){
  const agg = new Map();
  const keys = []; for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if (/^ds50_\d{4}-\d{2}-\d{2}$/.test(k)) keys.push(k); }
  keys.sort();
  for (const k of keys){
    const date = k.slice(5);
    try {
      const v = JSON.parse(localStorage.getItem(k) || "{}");
      const logs = Array.isArray(v.log) ? v.log : [];
      for (const r of logs){
        const refRaw = (r.ref||"").toString();
        const hypRaw = (r.hyp||"").toString();
        const ref = normalize(refRaw).split(" ").filter(Boolean);
        const hyp = normalize(hypRaw).split(" ").filter(Boolean);
        let ops = r.ops; if (!Array.isArray(ops) || !ops.length) ops = alignWords(ref, hyp);
        let i=0, j=0;
        for (const op of ops){
          if (op==="M"){ i++; j++; }
          else if (op==="S"){ note((hyp[j]||"").toLowerCase(), date, refRaw); i++; j++; }
          else if (op==="D"){ note((ref[i]||"").toLowerCase(), date, refRaw); i++; }
          else if (op==="I"){ note((hyp[j]||"").toLowerCase(), date, refRaw); j++; }
        }
      }
    } catch(_){}
  }
  const entries = Array.from(agg.entries()).map(([word, info])=>({word, count:info.count, lastDate:info.lastDate, example:info.ref||""}));
  entries.sort((a,b)=> b.count - a.count || a.word.localeCompare(b.word));
  return entries.slice(0, topN);
  function note(w, date, ref){ if(!w) return; const cur = agg.get(w)||{count:0,lastDate:"",ref:""}; cur.count++; cur.lastDate = date>cur.lastDate? date: cur.lastDate; if(!cur.ref) cur.ref = ref; agg.set(w, cur); }
}
function makeCloze(sentence, target){
  if (!sentence || !target) return sentence||"";
  const re = new RegExp(`\b${escapeRegExp(target)}\b`, "i");
  return sentence.replace(re, "_____");
}
function escapeRegExp(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
