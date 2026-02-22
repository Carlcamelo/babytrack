import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════
   BABYTRACK v5 — Fixed & Complete
   ═══════════════════════════════════════ */

const FAMILY_ROLES = [
  { id: "papa", l: "Papá", e: "👨" }, { id: "mama", l: "Mamá", e: "👩" },
  { id: "abuela", l: "Abuela", e: "👵" }, { id: "abuelo", l: "Abuelo", e: "👴" },
  { id: "tia", l: "Tía/Tío", e: "🧑" }, { id: "nanny", l: "Niñera", e: "👤" },
  { id: "other", l: "Otro", e: "👤" },
];
const TASK_CATS = [
  { id: "medical", l: "Cita médica", e: "🏥", c: "#EF4444" },
  { id: "vaccine", l: "Vacuna", e: "💉", c: "#8B5CF6" },
  { id: "medicine", l: "Medicamento", e: "💊", c: "#F59E0B" },
  { id: "shopping", l: "Compras", e: "🛒", c: "#10B981" },
  { id: "feeding", l: "Alimentación", e: "🍼", c: "#F9A8D4" },
  { id: "general", l: "General", e: "📋", c: "#6B7280" },
];
const TASK_REPEAT = [{ id: "once", l: "Una vez" },{ id: "daily", l: "Diario" },{ id: "weekly", l: "Semanal" },{ id: "monthly", l: "Mensual" }];

const PERMS_LIST = [
  { id: "reg_feed", l: "Registrar alimentación", cat: "🍼" },
  { id: "reg_diaper", l: "Registrar pañales", cat: "🧷" },
  { id: "reg_sleep", l: "Registrar sueño", cat: "😴" },
  { id: "reg_temp", l: "Registrar temperatura", cat: "🌡️" },
  { id: "reg_growth", l: "Registrar peso/talla", cat: "📏" },
  { id: "view_history", l: "Ver historial completo", cat: "📊" },
  { id: "view_today", l: "Ver resumen del día", cat: "📋" },
  { id: "view_milestones", l: "Ver hitos", cat: "🌟" },
  { id: "use_ai", l: "Usar asistente IA", cat: "🤖" },
  { id: "ask_questions", l: "Hacer preguntas al pediatra", cat: "❓" },
  { id: "view_questions", l: "Ver historial de preguntas", cat: "📝" },
  { id: "export_data", l: "Exportar datos", cat: "📥" },
  { id: "manage_family", l: "Gestionar familia", cat: "👨‍👩‍👧" },
];
const ROLE_DEFAULTS = {
  admin: PERMS_LIST.map(p => p.id),
  cuidador: ["reg_feed", "reg_diaper", "reg_sleep", "reg_temp", "view_today", "view_milestones", "use_ai", "ask_questions", "view_questions"],
  observador: ["view_today", "view_milestones", "view_questions"],
};
const ROLES = [
  { id: "admin", l: "Admin", e: "👑" },
  { id: "cuidador", l: "Cuidador", e: "🤲" },
  { id: "observador", l: "Observador", e: "👀" },
];
const FT = [{ id: "nursing", l: "Pecho directo", e: "🤱", c: "#F9A8D4" }, { id: "pumped", l: "Leche extraída", e: "🥛", c: "#93C5FD" }, { id: "formula", l: "Fórmula", e: "🫧", c: "#7DD3FC" }, { id: "mixed", l: "Mixta", e: "🔄", c: "#C4B5FD" }];
// Oz estimadas por minuto de lactancia activa (estudios de transferencia de leche, por rango de edad)
const NURSING_RATE = { "0-3 meses": 0.13, "3-6 meses": 0.16, "6-9 meses": 0.19, "9-12 meses": 0.20 };
const estimateNursingOz = (sessions, ageRange) => {
  const rate = NURSING_RATE[ageRange] || 0.16;
  const totalMin = sessions.reduce((s, x) => s + x.minutes, 0);
  return Math.round(totalMin * rate * 10) / 10;
};
const DTP = [{ id: "pee", l: "Pipí", e: "💧", c: "#7DD3FC" }, { id: "poo", l: "Popó", e: "💩", c: "#FDBA74" }, { id: "both", l: "Ambos", e: "✨", c: "#A78BFA" }];
const PCL = [{ id: "yellow", l: "Amarillo", h: "#FBBF24" }, { id: "green", l: "Verde", h: "#34D399" }, { id: "brown", l: "Café", h: "#A16207" }, { id: "dark", l: "Oscuro", h: "#44403C" }];
const PCN = [{ id: "liquid", l: "Líquida" }, { id: "soft", l: "Blanda" }, { id: "normal", l: "Normal" }, { id: "hard", l: "Dura" }];
const ALL_MS = {
  "0-3 meses": [
    { id: "lifts_head", l: "Levanta la cabeza", e: "💪", m: 1, info: "Boca abajo levanta brevemente la cabeza. Practica tummy time 2-3 min." },
    { id: "focus", l: "Enfoca objetos cercanos", e: "👀", m: 1, info: "Enfoca a 20-30cm. Normal que ojos se crucen." },
    { id: "social_smile", l: "Sonrisa social", e: "😊", m: 2, info: "Primera sonrisa en respuesta a tu cara." },
    { id: "coos", l: "Gorjeos y sonidos", e: "🗣️", m: 2, info: "Sonidos suaves. Respóndele para estimular." },
    { id: "follows_180", l: "Sigue objetos 180°", e: "🔄", m: 3, info: "Sigue un objeto de lado a lado." },
    { id: "head_ctrl", l: "Cabeza firme", e: "💪", m: 3, info: "Cargado vertical mantiene cabeza estable." },
  ],
  "3-6 meses": [
    { id: "grabs", l: "Agarra objetos", e: "🤲", m: 4, info: "Extiende la mano y agarra juguetes." },
    { id: "rolls_f", l: "Se voltea", e: "🔄", m: 4, info: "Primer giro. ¡Nunca solo en superficies altas!" },
    { id: "laughs", l: "Ríe a carcajadas", e: "😂", m: 4, info: "Risa social, desarrollo emocional saludable." },
    { id: "recog", l: "Reconoce padres", e: "👨‍👩‍👧", m: 4, info: "Preferencia clara por caras familiares." },
    { id: "reaches", l: "Estira brazos", e: "🙌", m: 5, info: "Quiere que la carguen." },
    { id: "sits_s", l: "Se sienta con apoyo", e: "🪑", m: 5, info: "Con cojines o tus manos." },
    { id: "babbles", l: "Balbucea", e: "👄", m: 6, info: "Ba-ba, da-da. Repítelos." },
    { id: "solid_int", l: "Interés en sólidos", e: "🥄", m: 6, info: "Mira tu comida, consulta pediatra." },
  ],
  "6-9 meses": [
    { id: "sits_a", l: "Se sienta solo", e: "🪑", m: 7, info: "Sin apoyo." },
    { id: "pincer_e", l: "Pinza temprana", e: "🤏", m: 7, info: "Pulgar e índice." },
    { id: "stranger", l: "Ansiedad extraños", e: "😰", m: 8, info: "Normal y saludable." },
    { id: "crawls", l: "Gatea", e: "🐛", m: 8, info: "Todo estilo es normal." },
    { id: "pulls", l: "Se para agarrándose", e: "🧗", m: 9, info: "Asegura muebles." },
    { id: "waves", l: "Dice adiós", e: "👋", m: 9, info: "Imitación social." },
  ],
  "9-12 meses": [
    { id: "mama_m", l: "Mamá/papá con significado", e: "❤️", m: 10, info: "¡Sabe quién es quién!" },
    { id: "cruises", l: "Camina con muebles", e: "🚶", m: 10, info: "Pre-caminar." },
    { id: "points", l: "Señala con dedo", e: "👆", m: 11, info: "Comunicación intencional." },
    { id: "steps", l: "Primeros pasos", e: "🚶‍♂️", m: 12, info: "9-18 meses es normal." },
    { id: "words", l: "2-3 palabras", e: "💬", m: 12, info: "Entiende mucho más." },
  ],
};
const REC = [
  { id: "feed", l: "Alimentación", e: "🍼", c: "#F9A8D4", d: "Leche", p: "reg_feed" },
  { id: "diaper", l: "Pañal", e: "🧷", c: "#7DD3FC", d: "Pipí/popó", p: "reg_diaper" },
  { id: "sleep", l: "Sueño", e: "😴", c: "#C4B5FD", d: "Cronómetro", p: "reg_sleep" },
  { id: "temp", l: "Temperatura", e: "🌡️", c: "#FCA5A5", d: "Fiebre", p: "reg_temp" },
  { id: "growth", l: "Peso/Talla", e: "📏", c: "#6EE7B7", d: "Crecimiento", p: "reg_growth" },
];
const TIPS = ["24-32oz al día para 3-6 meses.", "Bebés duermen 12-16h total.", "Deposiciones cambian de color, es normal.", "Contacto piel a piel sigue siendo beneficioso.", "Menos de 6 pañales mojados → pediatra.", "Duplican peso al nacer ~4-5 meses.", "Hablarle estimula lenguaje.", "Temp normal: 36.1-37.2°C.", "A los 4 meses se voltean — ¡cuidado!", "Llanto = comunicación.", "Cluster feeding es normal en brotes.", "Cada bebé tiene su ritmo."];

// Age-based goals (AAP/OMS references)
const GOALS = {
  "0-3 meses": { ozMin: 16, ozMax: 24, ozLabel: "16-24oz", sleepMin: 14, sleepMax: 17, sleepLabel: "14-17h", naps: "4-5 siestas", wetMin: 6, wetMax: 10, wetLabel: "6-10", pooFreq: "3-4/día o más", pooNote: "Normal: frecuente y líquido" },
  "3-6 meses": { ozMin: 24, ozMax: 32, ozLabel: "24-32oz", sleepMin: 12, sleepMax: 16, sleepLabel: "12-16h", naps: "3-4 siestas", wetMin: 6, wetMax: 8, wetLabel: "6-8", pooFreq: "1-3/día", pooNote: "Normal: puede espaciarse" },
  "6-9 meses": { ozMin: 24, ozMax: 32, ozLabel: "24-32oz", sleepMin: 12, sleepMax: 15, sleepLabel: "12-15h", naps: "2-3 siestas", wetMin: 4, wetMax: 6, wetLabel: "4-6", pooFreq: "1-2/día", pooNote: "Cambia con sólidos" },
  "9-12 meses": { ozMin: 16, ozMax: 24, ozLabel: "16-24oz", sleepMin: 12, sleepMax: 14, sleepLabel: "12-14h", naps: "2 siestas", wetMin: 4, wetMax: 6, wetLabel: "4-6", pooFreq: "1-2/día", pooNote: "Más consistente" },
};
const QQS = ["¿Va bien hoy?", "¿Cuántas oz al día?", "¿Pañales normales?", "¿Duerme suficiente?", "¿Temperatura ok?", "¿Peso va bien?", "¿Qué hitos vienen?", "Resumen del día", "¿Algo preocupante?", "Tips para dormir", "¿Cuándo sólidos?", "¿Normal regurgitar?"];

const calcAge = (bd) => {
  if (!bd) return null;
  try {
    // T12:00:00 evita que la fecha se interprete como UTC medianoche
    // y quede un día antes en zonas UTC-X (ej. Bogotá UTC-5)
    const b = new Date(bd + 'T12:00:00');
    const now = new Date();
    let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
    let days = now.getDate() - b.getDate();
    if (days < 0) {
      months--;
      // Días del mes anterior al mes actual
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    return { months: Math.max(0, months), days: Math.max(0, days) };
  } catch { return null; }
};
const ageToRange = (bd) => {
  const a = calcAge(bd); if (!a) return null;
  if (a.months < 3) return "0-3 meses";
  if (a.months < 6) return "3-6 meses";
  if (a.months < 9) return "6-9 meses";
  return "9-12 meses";
};
const fmtAge = (bd) => {
  const a = calcAge(bd); if (!a) return "";
  if (a.months === 0) return `${a.days} día${a.days !== 1 ? "s" : ""}`;
  if (a.months < 12) return `${a.months} mes${a.months !== 1 ? "es" : ""}${a.days > 0 ? ` y ${a.days} día${a.days !== 1 ? "s" : ""}` : ""}`;
  const y = Math.floor(a.months / 12); const rm = a.months % 12;
  return `${y} año${y > 1 ? "s" : ""}${rm ? ` y ${rm} mes${rm > 1 ? "es" : ""}` : ""}`;
};
const fmt = d => { try { return new Date(d).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
const fD = d => { try { return new Date(d).toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" }); } catch { return ""; } };
const rel = d => { try { const m = Math.floor((Date.now() - new Date(d)) / 6e4); if (m < 1) return "Ahora"; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`; } catch { return ""; } };
const fSec = s => { const m = Math.floor(s / 60); return `${m}:${(s % 60).toString().padStart(2, "0")}`; };
const gc = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const fDShort = d => { try { return new Date(d).toLocaleDateString("es", { day: "numeric", month: "short" }); } catch { return ""; } };
const isToday = d => { try { return new Date(d).toDateString() === new Date().toDateString(); } catch { return false; } };
const isPastDate = d => { try { const t = new Date(d); t.setHours(23,59); return t < new Date() && !isToday(d); } catch { return false; } };

// Single prefix for all keys — v8 fresh start

export default function BabyTrack({ auth, data }) {
  // auth = { user, profile, signOut, updateProfile }
  // data = { baby, entries, tasks, milestones, questions, aiMessages, members, invitations, ...actions }
  const [ready, setReady] = useState(true);
  const [ob, setOb] = useState(!!data.baby);
  const [obS, setObS] = useState(0);
  const [dark, setDark] = useState(false);
  const [view, setView] = useState("home");
  const [sub, setSub] = useState(null);
  const [prof, setProf] = useState(data.baby ? { name: data.baby.name, ageRange: data.baby.age_range || "3-6 meses", gender: data.baby.gender || "female", birthDate: data.baby.birth_date || "" } : { name: "", ageRange: "3-6 meses", gender: "female", birthDate: "" });
  const [photo, setPhoto] = useState(data.baby?.photo_url || null);
  // Entries come from Supabase via data prop — mapped to local format
  const mapEntry = e => ({ id: e.id, type: e.type, ts: e.recorded_at, by: e.recorded_by, ...e.data });
  const [ent, setEnt] = useState((data.entries || []).map(mapEntry));
  const [qs, setQs] = useState((data.questions || []).map(q => ({ id: q.id, text: q.text, status: q.status, by: q.asked_by, ts: q.created_at })));
  const [msDone, setMsDone] = useState((data.milestones || []).map(m => ({ id: m.milestone_id, at: m.achieved_at, dbId: m.id })));
  const [aiMsgs, setAiMsgs] = useState((data.aiMessages || []).map(m => ({ role: m.role, text: m.text })));
  const [aiIn, setAiIn] = useState("");
  const [aiL, setAiL] = useState(false);
  const [nq, setNq] = useState("");
  const [ok, setOk] = useState(false);
  const [okM, setOkM] = useState("");
  const [rem, setRem] = useState([]);
  const [mem, setMem] = useState((data.members||[]).map(m=>({id:m.id,name:m.name,role:m.app_role,familyRole:m.family_role,perms:m.perms||ROLE_DEFAULTS[m.app_role]||[],at:m.created_at})));
  const [inv, setInv] = useState((data.invitations||[]).map(i=>({id:i.id,code:i.code,name:i.name,role:i.role,perms:i.perms||[],status:i.status})));
  const [cu, setCu] = useState({name:auth.profile?.name||"Yo",role:auth.profile?.app_role||"admin",perms:auth.profile?.perms||ROLE_DEFAULTS.admin,familyRole:auth.profile?.family_role||"papa"});
  const [showRemF, setShowRemF] = useState(false);
  const [remTxt, setRemTxt] = useState("");
  const [remTm, setRemTm] = useState("");
  const [tasks, setTasks] = useState((data.tasks||[]).map(t=>({id:t.id,title:t.title,date:t.date,time:t.time,cat:t.category,assignee:t.assignee,repeat:t.repeat,notes:t.notes,done:t.done,doneAt:t.done_at,by:t.created_by})));
  const [tF_show, setTFShow] = useState(false);
  const [tF_title, setTFTitle] = useState("");
  const [tF_date, setTFDate] = useState("");
  const [tF_time, setTFTime] = useState("");
  const [tF_cat, setTFCat] = useState("general");
  const [tF_assign, setTFAssign] = useState("");
  const [tF_repeat, setTFRepeat] = useState("once");
  const [tF_notes, setTFNotes] = useState("");
  const [taskTab, setTaskTab] = useState("pending");
  const [quickM, setQuickM] = useState(false);
  const [msD, setMsD] = useState(null);
  const [slpA, setSlpA] = useState(() => { try { const v = localStorage.getItem('bt_slpA'); return v ? JSON.parse(v) : null; } catch { return null; } });
  const [slpE, setSlpE] = useState(0);
  const [joinCode, setJoinCode] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [invR, setInvR] = useState("cuidador");
  const [invN, setInvN] = useState("");
  const [invPerms, setInvPerms] = useState([...ROLE_DEFAULTS.cuidador]);
  const [invStep, setInvStep] = useState(0); // 0=form, 1=perms, 2=done
  const [editM, setEditM] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOx, setCropOx] = useState(0);
  const [cropOy, setCropOy] = useState(0);
  const cropCanvasRef = useRef(null);
  const chatRef = useRef(null);
  const fileRef = useRef(null);
  const [fSubtype, setFSubtype] = useState("formula"); // nursing | pumped | formula | mixed
  const [fOz, setFOz] = useState(4);
  const [fNo, setFNo] = useState("");
  const [fTs, setFTs] = useState("");
  const [nursingActive, setNursingActive] = useState(() => { try { const v = localStorage.getItem('bt_nursingActive'); return v ? JSON.parse(v) : null; } catch { return null; } });
  const [nursingSessions, setNursingSessions] = useState(() => { try { const v = localStorage.getItem('bt_nursingSessions'); return v ? JSON.parse(v) : []; } catch { return []; } });
  const [nursingElapsed, setNursingElapsed] = useState(0); // segundos
  const [dTy, setDTy] = useState("pee");
  const [pCo, setPCo] = useState("yellow");
  const [pCn, setPCn] = useState("normal");
  const [tmp, setTmp] = useState(36.5);
  const [wK, setWK] = useState("");
  const [hC, setHC] = useState("");
  const [gDate, setGDate] = useState("");

  // AUTO-SAVE to Supabase when profile changes
  useEffect(() => {
    if (prof.birthDate) {
      const r = ageToRange(prof.birthDate);
      if (r && r !== prof.ageRange) { setProf(p => ({ ...p, ageRange: r })); return; }
    }
    // Save baby profile to Supabase
    if (ob && data.saveBaby) {
      data.saveBaby({ name: prof.name, gender: prof.gender, birth_date: prof.birthDate || null, age_range: prof.ageRange, photo_url: photo });
    }
  }, [prof, photo]);

  // Sleep timer
  useEffect(() => {
    if (!slpA) { setSlpE(0); return; }
    const iv = setInterval(() => setSlpE(Math.floor((Date.now() - new Date(slpA.at)) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [slpA]);

  // Nursing timer
  useEffect(() => {
    if (!nursingActive) { setNursingElapsed(0); return; }
    const iv = setInterval(() => setNursingElapsed(Math.floor((Date.now() - new Date(nursingActive.startedAt)) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [nursingActive]);

  // Persist timers to localStorage so they survive page refresh / closing browser
  useEffect(() => {
    if (slpA) localStorage.setItem('bt_slpA', JSON.stringify(slpA));
    else localStorage.removeItem('bt_slpA');
  }, [slpA]);
  useEffect(() => {
    if (nursingActive) localStorage.setItem('bt_nursingActive', JSON.stringify(nursingActive));
    else localStorage.removeItem('bt_nursingActive');
  }, [nursingActive]);
  useEffect(() => {
    if (nursingSessions.length > 0) localStorage.setItem('bt_nursingSessions', JSON.stringify(nursingSessions));
    else localStorage.removeItem('bt_nursingSessions');
  }, [nursingSessions]);

  useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMsgs, aiL]);

  // Actualizar ob si data.baby llega después de unirse a una familia con código
  useEffect(() => { if (data.baby && !ob) setOb(true); }, [data.baby]);

  // Helpers
  const hp = p => cu.perms?.includes(p) || cu.role === "admin";
  const milestones = ALL_MS[prof.ageRange] || ALL_MS["3-6 meses"];
  const goals = GOALS[prof.ageRange] || GOALS["3-6 meses"];
  const today = new Date().toDateString();
  const tE = ent.filter(e => { try { return new Date(e.ts).toDateString() === today; } catch { return false; } });

  // FEEDING stats
  const tF = tE.filter(e => e.type === "feed");
  const tOz = Math.round(tF.reduce((s, e) => s + (e.oz || 0), 0) * 10) / 10;
  const feedPct = Math.min(100, Math.round((tOz / goals.ozMin) * 100));
  const feedStatus = tOz >= goals.ozMin ? "ok" : tOz >= goals.ozMin * 0.6 ? "warn" : "low";
  const lF = [...ent].filter(e => e.type === "feed").pop();
  const l7 = ent.filter(e => { try { return Date.now() - new Date(e.ts) < 7 * 864e5; } catch { return false; } });
  const a7 = l7.filter(e => e.type === "feed").length ? Math.round(l7.filter(e => e.type === "feed").reduce((s, e) => s + (e.oz || 0), 0) / 7 * 10) / 10 : 0;
  // Último pecho usado (para indicator de siguiente toma)
  const lastNursingEntry = [...ent].filter(e => e.type === "feed" && (e.subtype === "nursing" || e.subtype === "mixed" || e.feedType === "breast")).pop();
  const lastBreastUsed = lastNursingEntry?.lastBreast || null;
  const nextBreast = lastBreastUsed === "left" ? "right" : lastBreastUsed === "right" ? "left" : null;
  const nursingToday = tF.filter(e => e.subtype === "nursing" || e.subtype === "mixed" || e.feedType === "breast").length;

  // SLEEP stats
  const tSl = tE.filter(e => e.type === "sleep");
  const tSlMin = tSl.reduce((s, e) => s + (e.duration || 0), 0);
  const tSlH = Math.round(tSlMin / 6) / 10; // hours with 1 decimal
  const sleepGoalH = goals.sleepMin;
  const sleepPct = Math.min(100, Math.round((tSlH / sleepGoalH) * 100));
  const sleepStatus = tSlH >= sleepGoalH ? "ok" : tSlH >= sleepGoalH * 0.5 ? "warn" : "low";
  const hoursLeft = Math.max(0, Math.round((sleepGoalH - tSlH) * 10) / 10);
  const hr = new Date().getHours();
  const sleepTip = tSlH >= sleepGoalH ? "¡Meta cumplida! 🎉" : hr < 14 ? `Necesita ${hoursLeft}h más (siestas + noche)` : hr < 19 ? `Faltan ${hoursLeft}h — necesita buena noche` : `Necesita ~${hoursLeft}h de noche`;

  // DIAPER stats
  const tD = tE.filter(e => e.type === "diaper").length;
  const tWet = tE.filter(e => e.type === "diaper" && (e.diaperType === "pee" || e.diaperType === "both")).length;
  const tPoo = tE.filter(e => e.type === "diaper" && (e.diaperType === "poo" || e.diaperType === "both")).length;
  const wetPct = Math.min(100, Math.round((tWet / goals.wetMin) * 100));
  const wetStatus = tWet >= goals.wetMin ? "ok" : tWet >= goals.wetMin * 0.5 ? "warn" : "low";

  // OTHER
  const lG = [...ent].filter(e => e.type === "growth").pop();
  const lT = [...ent].filter(e => e.type === "temp").pop();
  const tipDay = TIPS[Math.floor(Date.now() / 864e5) % TIPS.length];

  // Tasks computed
  const pendingTasks = tasks.filter(t => !t.done).sort((a, b) => (a.date || "9").localeCompare(b.date || "9"));
  const todayTasks = pendingTasks.filter(t => t.date && isToday(t.date));
  const overdueTasks = pendingTasks.filter(t => t.date && isPastDate(t.date));
  const myTasks = pendingTasks.filter(t => !t.assignee || t.assignee === cu.name);
  const doneTasks = tasks.filter(t => t.done);

  // SMART ALERTS — time-aware, data-aware
  const alerts = [];
  const isNewProfile = ent.length < 3;          // perfil recién creado, sin historial
  const hasFedToday  = tF.length > 0;           // registró al menos 1 toma hoy
  const hasDiaperToday = tD > 0;                // registró al menos 1 pañal hoy
  const hasSleepToday  = tSl.length > 0 || !!slpA; // registró o hay siesta activa
  const activeHours = Math.max(0, hr - 7);      // horas transcurridas desde las 7am

  if (!isNewProfile) {
    // 1. Tiempo sin comer — activo solo si hay historial de tomas
    //    (lF apunta a la última toma de TODA la historia, no solo hoy)
    if (lF) {
      try {
        const hSince = (Date.now() - new Date(lF.ts)) / 36e5;
        if (hSince >= 4) alerts.push({ t: "warn", m: `🍼 ${Math.floor(hSince)}h sin comer` });
      } catch {}
    }

    // 2. Oz bajas — solo si: ya registró tomas hoy Y pasó la tarde (hr > 14)
    if (hasFedToday && hr > 14 && tOz < goals.ozMin * 0.4) {
      alerts.push({ t: "warn", m: `🍼 Solo ${tOz}oz — meta: ${goals.ozLabel}` });
    }

    // 3. Sin siestas — solo si: registró algo de sueño hoy (o lo intenta) Y pasó el mediodía
    if (hasSleepToday && hr > 13 && tSlH < 1 && !slpA) {
      alerts.push({ t: "warn", m: `😴 Sin siestas hoy — meta: ${goals.naps}` });
    }

    // 4. Sueño muy bajo — solo si: hay datos de sueño hoy Y es tarde
    if (hasSleepToday && hr > 18 && tSlH < sleepGoalH * 0.3) {
      alerts.push({ t: "warn", m: `😴 Solo ${tSlH}h de ${sleepGoalH}h meta` });
    }

    // 5. Pocos pañales mojados — solo si: registró pañales hoy Y es tarde
    //    Proporcional: esperamos goals.wetMin en 16h de día → 1 cada ~2.5h
    const expectedWetByNow = Math.floor(activeHours / 2.5);
    if (hasDiaperToday && hr > 14 && tWet < Math.min(3, Math.max(1, expectedWetByNow * 0.5))) {
      alerts.push({ t: "warn", m: `🧷 Solo ${tWet} pipí — meta: ${goals.wetLabel}/día` });
    }

    // 6. Pañales peligrosamente bajos — posible deshidratación
    //    Solo si: registró pañales hoy Y es noche
    if (hasDiaperToday && hr > 18 && tWet < Math.ceil(goals.wetMin * 0.4)) {
      alerts.push({ t: "danger", m: `🧷 ${tWet} mojados — puede indicar deshidratación` });
    }
  }

  // Temperatura y tareas vencidas: siempre aplican sin importar hora ni historial
  if (lT?.temp >= 38) alerts.push({ t: "danger", m: `🌡️ Temp: ${lT.temp}°C — fiebre` });
  if (overdueTasks.length > 0) alerts.push({ t: "warn", m: `📌 ${overdueTasks.length} tarea(s) vencida(s)` });

  const criticalAlerts = alerts.filter(a => a.t === "danger");
  const softAlerts = alerts.filter(a => a.t === "warn");

  // DAILY SCORE (0-100)
  const feedScore = Math.min(30, Math.round((tOz / goals.ozMin) * 30)); // 0-30
  const sleepScore = Math.min(30, Math.round((tSlH / sleepGoalH) * 30)); // 0-30
  const wetScore = Math.min(20, Math.round((tWet / goals.wetMin) * 20)); // 0-20
  const tempScore = (!lT || lT.temp < 37.5) ? 10 : lT.temp < 38 ? 5 : 0; // 0-10
  const alertPenalty = Math.min(10, alerts.filter(a => a.t === "danger").length * 5 + alerts.filter(a => a.t === "warn").length * 2); // penalty
  const dailyScore = Math.max(0, Math.min(100, feedScore + sleepScore + wetScore + tempScore - alertPenalty));
  const scoreColor = dailyScore >= 80 ? "#10B981" : dailyScore >= 60 ? "#F59E0B" : dailyScore >= 40 ? "#F97316" : "#EF4444";
  const scoreEmoji = dailyScore >= 80 ? "🌟" : dailyScore >= 60 ? "👍" : dailyScore >= 40 ? "⚠️" : "😟";
  const scoreLabel = dailyScore >= 80 ? "¡Excelente día!" : dailyScore >= 60 ? "Va bien" : dailyScore >= 40 ? "Puede mejorar" : "Necesita atención";
  const hasData = tF.length > 0 || tSl.length > 0 || tD > 0;

  const flash = m => { setOkM(m); setOk(true); setTimeout(() => { setOk(false); setSub(null); if (view !== "family" && view !== "reminders") setView("home"); }, 900); };
  const gTs = c => { try { return c ? new Date(c).toISOString() : new Date().toISOString(); } catch { return new Date().toISOString(); } };

  const startNursingBreast = breast => {
    if (nursingActive) {
      const minutes = Math.max(1, Math.floor(nursingElapsed / 60));
      setNursingSessions(p => [...p, { breast: nursingActive.breast, minutes }]);
    }
    setNursingActive({ breast, startedAt: new Date().toISOString() });
  };
  const resetNursingState = () => { setNursingActive(null); setNursingSessions([]); setNursingElapsed(0); };
  const addFeed = () => {
    let entryData = {};
    if (fSubtype === "nursing" || fSubtype === "mixed") {
      let sessions = [...nursingSessions];
      if (nursingActive) {
        const minutes = Math.max(1, Math.floor(nursingElapsed / 60));
        sessions = [...sessions, { breast: nursingActive.breast, minutes }];
      }
      if (sessions.length === 0 && fSubtype === "nursing") return;
      const estimatedOz = estimateNursingOz(sessions, prof.ageRange);
      const lastBreast = sessions.length ? sessions[sessions.length - 1].breast : null;
      if (fSubtype === "nursing") {
        entryData = { feedType: "nursing", subtype: "nursing", sessions, estimatedOz, lastBreast, oz: estimatedOz };
      } else {
        const total = Math.round((estimatedOz + fOz) * 10) / 10;
        entryData = { feedType: "mixed", subtype: "mixed", sessions, estimatedNursingOz: estimatedOz, supplementOz: fOz, lastBreast, oz: total };
      }
    } else if (fSubtype === "pumped") {
      entryData = { feedType: "pumped", subtype: "pumped", oz: fOz };
    } else {
      entryData = { feedType: "formula", subtype: "formula", oz: fOz };
    }
    const entry = { id: Date.now(), type: "feed", ...entryData, notes: fNo, by: cu.name, ts: gTs(fTs) };
    setEnt(p => [...p, entry]);
    data.addEntry({ type: "feed", data: entryData, by: cu.name, ts: gTs(fTs) });
    setFOz(4); setFNo(""); setFTs("");
    resetNursingState();
    flash("Toma ✓");
  };
  const addDiaper = () => { const d = { diaperType: dTy, ...(dTy !== "pee" ? { pooColor: pCo, pooCon: pCn } : {}) }; const entry = { id: Date.now(), type: "diaper", ...d, by: cu.name, ts: gTs() }; setEnt(p => [...p, entry]); data.addEntry({ type: "diaper", data: d, by: cu.name }); flash("Pañal ✓"); };
  const startSlp = ty => setSlpA({ type: ty, at: new Date().toISOString() });
  const stopSlp = () => { if (!slpA) return; const dur = Math.floor((Date.now() - new Date(slpA.at)) / 6e4); const entry = { id: Date.now(), type: "sleep", sleepType: slpA.type, duration: dur, by: cu.name, ts: slpA.at }; setEnt(p => [...p, entry]); data.addEntry({ type: "sleep", data: { sleepType: slpA.type, duration: dur }, by: cu.name, ts: slpA.at }); setSlpA(null); flash(`${dur}min ✓`); };
  const addTemp = () => { const entry = { id: Date.now(), type: "temp", temp: tmp, by: cu.name, ts: gTs() }; setEnt(p => [...p, entry]); data.addEntry({ type: "temp", data: { temp: tmp }, by: cu.name }); flash("Temp ✓"); };
  const addGrowth = () => { const entry = { id: Date.now(), type: "growth", weight: wK ? +wK : null, height: hC ? +hC : null, by: cu.name, ts: gTs(gDate || null) }; setEnt(p => [...p, entry]); data.addEntry({ type: "growth", data: { weight: wK ? +wK : null, height: hC ? +hC : null }, by: cu.name, ts: gTs(gDate || null) }); setWK(""); setHC(""); setGDate(""); flash("Medidas ✓"); };
  const delE = id => { setEnt(p => p.filter(e => e.id !== id)); data.deleteEntry(id); };
  const togMs = id => { setMsDone(p => p.find(m => m.id === id) ? p.filter(m => m.id !== id) : [...p, { id, at: new Date().toISOString() }]); data.toggleMilestone(id); };
  const addQ = () => { if (!nq.trim()) return; setQs(p => [...p, { id: Date.now(), text: nq, status: "pending", by: cu.name, ts: new Date().toISOString() }]); data.addQuestion(nq, cu.name); setNq(""); };
  const togQ = id => { setQs(p => p.map(q => q.id === id ? { ...q, status: q.status === "pending" ? "done" : "pending" } : q)); data.toggleQuestion(id); };
  const delQ = id => { setQs(p => p.filter(q => q.id !== id)); data.deleteQuestion(id); };
  const addRem = () => { if (!remTxt.trim()) return; setRem(p => [...p, { id: Date.now(), text: remTxt, time: remTm, done: false }]); setRemTxt(""); setRemTm(""); setShowRemF(false); };
  // Task actions
  const addTask = () => { if (!tF_title.trim()) return; const t = { id: Date.now(), title: tF_title, date: tF_date, time: tF_time, cat: tF_cat, assignee: tF_assign || cu.name, repeat: tF_repeat, notes: tF_notes, done: false, by: cu.name, createdAt: new Date().toISOString() }; setTasks(p => [...p, t]); data.addTask({ title: tF_title, date: tF_date || null, time: tF_time, category: tF_cat, assignee: tF_assign || cu.name, repeat: tF_repeat, notes: tF_notes, created_by: cu.name }); setTFTitle(""); setTFDate(""); setTFTime(""); setTFCat("general"); setTFAssign(""); setTFRepeat("once"); setTFNotes(""); setTFShow(false); };
  const togTask = id => { setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : null } : t)); data.toggleTask(id); };
  const delTask = id => { setTasks(p => p.filter(t => t.id !== id)); data.deleteTask(id); };
  const createInv = async () => { if (!invN.trim()) return; const result = await data.createInvitation({ name: invN, role: invR, perms: invPerms }); if (result) setInv(p => [...p, { id: result.id, code: result.code, name: invN, role: invR, perms: [...invPerms], status: "pending" }]); setInvN(""); setInvPerms([...ROLE_DEFAULTS.cuidador]); setInvStep(0); };
  const acceptInv = id => { const i = inv.find(x => x.id === id); if (!i) return; setMem(p => [...p, { id: Date.now(), name: i.name, role: i.role, perms: i.perms, at: new Date().toISOString() }]); setInv(p => p.map(x => x.id === id ? { ...x, status: "done" } : x)); };
  const remMem = id => setMem(p => p.filter(m => m.id !== id));
  const updMemP = (id, pid) => { setMem(p => p.map(m => m.id === id ? { ...m, perms: m.perms.includes(pid) ? m.perms.filter(x => x !== pid) : [...m.perms, pid] } : m)); if (editM?.id === id) setEditM(prev => ({ ...prev, perms: prev.perms.includes(pid) ? prev.perms.filter(x => x !== pid) : [...prev.perms, pid] })); };
  const switchU = (r, n) => setCu({ name: n, role: r, perms: ROLE_DEFAULTS[r] });

  const handlePhoto = e => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { if (typeof ev.target?.result === "string") { setCropSrc(ev.target.result); setCropScale(1); setCropOx(0); setCropOy(0); } };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };
  const saveCrop = () => {
    if (!cropSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const sz = 200; canvas.width = sz; canvas.height = sz;
      const ctx = canvas.getContext("2d");
      const cover = Math.max(sz / img.width, sz / img.height);
      const iw = img.width * cover * cropScale;
      const ih = img.height * cover * cropScale;
      const dx = (sz - iw) / 2 + (cropOx / 50) * (iw - sz) * -0.5;
      const dy = (sz - ih) / 2 + (cropOy / 50) * (ih - sz) * -0.5;
      ctx.beginPath(); ctx.arc(sz / 2, sz / 2, sz / 2, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(img, dx, dy, iw, ih);
      setPhoto(canvas.toDataURL("image/jpeg", 0.8));
      setCropSrc(null);
    };
    img.src = cropSrc;
  };

  const finOb = async () => { setOb(true); await data.saveBaby({ name: prof.name, gender: prof.gender, birth_date: prof.birthDate || null, age_range: prof.ageRange, photo_url: photo }); await auth.updateProfile({ name: cu.name, family_role: cu.familyRole }); setMem([{ id: Date.now(), name: cu.name, role: "admin", familyRole: cu.familyRole, perms: ROLE_DEFAULTS.admin, at: new Date().toISOString() }]); };
  const resetAll = async () => { if (confirm("¿Cerrar sesión?")) { await auth.signOut(); } };

  const exportCSV = () => {
    const h = "Fecha,Hora,Tipo,Detalle,Valor,Por\n";
    const rows = ent.map(e => {
      let d = "", v = "";
      if (e.type === "feed") {
        const sub = e.subtype || e.feedType;
        const totalMin = (e.sessions || []).reduce((s, x) => s + x.minutes, 0);
        if (sub === "nursing" || sub === "breast") { d = "Pecho directo"; v = `~${e.estimatedOz || e.oz || 0}oz (est.) ${totalMin}min`; }
        else if (sub === "pumped") { d = "Leche extraída"; v = `${e.oz}oz`; }
        else if (sub === "mixed") { d = "Mixta"; v = `${e.oz}oz (pecho+fórmula)`; }
        else { d = "Fórmula"; v = `${e.oz || 0}oz`; }
      }
      else if (e.type === "diaper") { d = DTP.find(x => x.id === e.diaperType)?.l || ""; }
      else if (e.type === "sleep") { d = e.sleepType === "nap" ? "Siesta" : "Noche"; v = (e.duration || "?") + "min"; }
      else if (e.type === "temp") { v = e.temp + "°C"; }
      else if (e.type === "growth") { v = `${e.weight ? e.weight + "kg" : ""}${e.height ? " " + e.height + "cm" : ""}`; }
      return `${fD(e.ts)},${fmt(e.ts)},${REC.find(r => r.id === e.type)?.l || ""},${d},${v},${e.by || ""}`;
    }).join("\n");
    const b = new Blob([h + rows], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `babytrack-${prof.name || "data"}.csv`; a.click();
  };

  const askAI = async ov => {
    const msg = ov || aiIn; if (!msg.trim()) return; if (!ov) setAiIn("");
    setAiMsgs(p => [...p, { role: "user", text: msg }]); setAiL(true); data.addAiMessage("user", msg);

    const systemPrompt = `Eres un asistente clínicamente prudente especializado en desarrollo infantil 0-12 meses.

CONTEXTO DEL BEBE:
- Nombre: Ele
- Nacimiento: 2025-09-22T07:15:00 (Bogota)
- Parto vaginal, sin complicaciones
- Vacunas al dia
- Padre: Carlos, alta involucración, necesita datos exactos y evidencia

MEMORIA:
- Regresion de sueno 4 meses (semana 16-18)
- Episodio febril evaluado en urgencias (viral, evolucion favorable)
- Consolidacion post-regresion desde semana 18
- Patron sueno: estabilidad progresiva, trigger comun: sobreestimulacion
- Miedo principal: SMSL (riesgo muy bajo por edad creciente)

EVIDENCIA BASE:
- SMSL: pico 1-4 meses, factores protectores: boca arriba, superficie firme, evitar sobrecalentamiento, vacunas al dia
- Fiebre >3 meses: evaluar si >=38C, urgencias si >=39C persistente + dificultad respiratoria/letargo/deshidratacion
- Sueno 4 meses: reorganizacion neurologica normal, dura 2-6 semanas
- Formula: desechar tras 1h si inicio toma, refrigerada sin tocar hasta 24h

REGLAS:
1. Siempre calcular edad exacta desde fecha de nacimiento
2. Usar rangos, nunca prometer fechas exactas de eventos biologicos
3. Diferenciar lo que sabemos del bebe vs evidencia general
4. Dar: edad actual, que pasa fisiologicamente, que hacer hoy, que esperar, senales de urgencia
5. Nunca inventar porcentajes ni minimizar fiebre en lactantes
6. Tono: profesional, calmado, basado en evidencia, sin dramatizar ni invalidar emociones
7. Responder en espanol, conciso (max 200 palabras)

DATOS DE HOY:
Quien pregunta: ${cu.name} (${FAMILY_ROLES.find(r => r.id === cu.familyRole)?.l || "cuidador"}).
Tomas: ${tF.length} (${tOz}oz total, ${nursingToday} pecho + ${tF.length - nursingToday} fórmula/extraída, meta: ${goals.ozLabel}).
Pañales: ${tD} (${tWet} mojados / ${tPoo} popó, meta: ${goals.wetLabel}).
Sueño: ${tSlH}h (meta: ${goals.sleepLabel}). Promedio 7d: ${a7}oz/día.${nextBreast ? ` Próx. toma → pecho ${nextBreast === "left" ? "izquierdo" : "derecho"}.` : ""}
${lG ? `Peso: ${lG.weight}kg, Talla: ${lG.height}cm.` : ""}${lT ? ` Temp: ${lT.temp}°C.` : ""}
Score: ${dailyScore}/100 (🍼${feedScore}/30 😴${sleepScore}/30 🧷${wetScore}/20 🌡️${tempScore}/10).
Preguntas al pediatra: [${qs.filter(q => q.status === "pending").map(q => q.text).join("; ")}]
Tareas pendientes: [${pendingTasks.slice(0, 5).map(t => `${t.title} (${t.date || "?"}, ${t.assignee})`).join("; ")}]
Hitos alcanzados: [${msDone.map(m => milestones.find(x => x.id === m.id)?.l).filter(Boolean).join(", ")}]
Últimas 20 entradas: ${JSON.stringify(ent.slice(-20))}`;

    const contents = [
      ...aiMsgs.slice(-20).map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })),
      { role: "user", parts: [{ text: msg }] },
    ];

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: systemPrompt }] } }) }
      );
      const data2 = await res.json();
      if (!res.ok || data2.error) {
        console.log("[Gemini error]", data2.error || data2);
        const errMsg = data2.error?.message || `HTTP ${res.status}`;
        setAiMsgs(p => [...p, { role: "assistant", text: `⚠️ Error Gemini: ${errMsg}` }]);
      } else {
        const aiText = data2.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
        setAiMsgs(p => [...p, { role: "assistant", text: aiText }]);
        data.addAiMessage("assistant", aiText);
      }
    } catch (e) {
      console.log("[Gemini fetch error]", e);
      setAiMsgs(p => [...p, { role: "assistant", text: "⚠️ Sin conexión." }]);
    }
    setAiL(false);
  };

  // ── THEME ──
  const T = dark
    ? { bg: "#0C0C12", card: "#16161F", text: "#EEEAE5", soft: "#7A7686", accent: "#FF7A50", accentL: "#251A14", border: "#252530", ok: "#10B981", glass: "rgba(22,22,31,0.88)" }
    : { bg: "#FAFAF7", card: "#FFFFFF", text: "#1C1917", soft: "#78716C", accent: "#E36F47", accentL: "#FEF0EB", border: "#EDEBE6", ok: "#10B981", glass: "rgba(255,255,255,0.88)" };
  const CS = { background: T.card, borderRadius: 20, padding: 16, border: `1px solid ${T.border}` };

  // ── LIQUID GLASS helpers ──
  const glShadow = dark
    ? "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)"
    : "0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.92)";
  const glBorder = dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.8)";
  const glBlur = { backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" };
  const GL = (bg, radius = 20) => ({ ...glBlur, background: bg, border: glBorder, boxShadow: glShadow, borderRadius: radius });

  const Av = ({ sz = 40 }) => photo
    ? <div style={{ width: sz, height: sz, borderRadius: sz * 0.35, overflow: "hidden", flexShrink: 0 }}><img src={photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /></div>
    : <div style={{ width: sz, height: sz, borderRadius: sz * 0.35, background: T.accentL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: sz * 0.5, flexShrink: 0 }}>{prof.gender === "female" ? "👧" : "👦"}</div>;

  // ── LOADING ──
  if (!ready) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "'Nunito',system-ui" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 48, animation: "float 2s ease infinite" }}>👶</div><p style={{ color: "#999", marginTop: 12, fontSize: 14 }}>Cargando...</p></div>
    </div>
  );

  // ── CSS ──
  const css = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}input,textarea,button,select{font-family:inherit;color:inherit}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
@keyframes dotP{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes gradMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(227,111,71,0.3)}50%{box-shadow:0 0 40px rgba(227,111,71,0.6)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
button{-webkit-tap-highlight-color:transparent;transition:transform 0.1s}button:active{transform:scale(0.96)}
html,body{background:${T.bg};margin:0;padding:0;min-height:100%}`;

  // ══ CROP MODAL (slider-only, no drag issues) ══
  const cropModal = cropSrc ? (
    <div style={{ position: "fixed", inset: 0, zIndex: 3e3, background: "rgba(0,0,0,0.94)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <p style={{ color: "#fff", fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Ajusta la foto</p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 16 }}>Usa los controles para encuadrar</p>
      <div style={{ width: 200, height: 200, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(255,255,255,0.2)", background: "#111", position: "relative" }}>
        <img src={cropSrc} alt="" draggable={false} style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(calc(-50% + ${cropOx}px), calc(-50% + ${cropOy}px)) scale(${cropScale})`, minWidth: 200, minHeight: 200, width: "auto", height: "auto", maxWidth: "none", maxHeight: "none", pointerEvents: "none" }} />
      </div>
      <div style={{ width: "100%", maxWidth: 260, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ color: "#fff", fontSize: 11, width: 30 }}>Zoom</span>
          <input type="range" min="1" max="3" step="0.05" value={cropScale} onChange={e => setCropScale(+e.target.value)} style={{ flex: 1, accentColor: T.accent }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ color: "#fff", fontSize: 11, width: 30 }}>← →</span>
          <input type="range" min="-60" max="60" step="1" value={cropOx} onChange={e => setCropOx(+e.target.value)} style={{ flex: 1, accentColor: T.accent }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#fff", fontSize: 11, width: 30 }}>↑ ↓</span>
          <input type="range" min="-60" max="60" step="1" value={cropOy} onChange={e => setCropOy(+e.target.value)} style={{ flex: 1, accentColor: T.accent }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={() => setCropSrc(null)} style={{ padding: "12px 24px", borderRadius: 16, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Cancelar</button>
        <button onClick={saveCrop} style={{ padding: "12px 24px", borderRadius: 16, background: `linear-gradient(135deg,${T.accent},#D4623C)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Guardar ✓</button>
      </div>
    </div>
  ) : null;

  // ══ ONBOARDING ══
  if (!ob) return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: dark ? "linear-gradient(-45deg,#1A1020,#0F1A2A,#1A1525,#0A1520)" : "linear-gradient(-45deg,#FEF0EB,#DBEAFE,#FDE8F0,#E0E7FF)", backgroundSize: "400% 400%", animation: "gradMove 8s ease infinite", fontFamily: "'Nunito',system-ui", color: T.text, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <style>{css}</style>
      {cropModal}
      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>{[0, 1, 2].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= obS ? T.accent : "rgba(128,128,128,0.3)", transition: "background 0.3s" }} />)}</div>

      {obS === 0 && <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontSize: 80, marginBottom: 12, animation: "float 3s ease infinite" }}>👶</div>
        <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>BabyTrack</h1>
        <p style={{ fontSize: 14, color: T.accent, fontWeight: 700, marginBottom: 28 }}>Tracking inteligente para tu bebé</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 28 }}>
          {[{ e: "🍼", x: "Tomas" }, { e: "😴", x: "Sueño" }, { e: "🧷", x: "Pañales" }, { e: "🤖", x: "IA" }, { e: "👨‍👩‍👧", x: "Familia" }, { e: "🌟", x: "Hitos" }].map((f, i) =>
            <div key={i} style={{ background: T.card + "CC", backdropFilter: "blur(8px)", borderRadius: 16, padding: "14px 8px", textAlign: "center", border: `1px solid ${T.border}55` }}>
              <span style={{ fontSize: 24, display: "block", marginBottom: 2 }}>{f.e}</span><span style={{ fontSize: 11, fontWeight: 700 }}>{f.x}</span></div>)}
        </div>
        <button onClick={() => setObS(1)} style={{ width: "100%", padding: 18, borderRadius: 22, background: `linear-gradient(135deg,${T.accent},#D4623C)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 800, boxShadow: "0 8px 32px rgba(227,111,71,0.4)", animation: "glow 3s ease infinite", marginBottom: 12 }}>Comenzar →</button>

        {/* Unirse a familia existente con código */}
        {!showJoin ? (
          <button onClick={() => setShowJoin(true)} style={{ width: "100%", padding: 14, borderRadius: 18, background: "transparent", border: `2px solid ${T.border}`, cursor: "pointer", fontSize: 14, fontWeight: 700, color: T.soft }}>
            🎟 Unirme a una familia existente
          </button>
        ) : (
          <div style={{ background: T.card + "CC", backdropFilter: "blur(8px)", borderRadius: 20, padding: 18, border: `1.5px solid ${T.accent}44`, animation: "fadeUp 0.3s ease" }}>
            <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, textAlign: "center" }}>👨‍👩‍👧 Código de invitación</p>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6}
              style={{ width: "100%", padding: "16px", borderRadius: 16, border: `2px solid ${T.accent}`, fontSize: 26, outline: "none", fontWeight: 900, background: T.card, marginBottom: 10, textAlign: "center", letterSpacing: 10 }} />
            {joinErr && <p style={{ fontSize: 12, color: "#EF4444", fontWeight: 700, textAlign: "center", marginBottom: 8 }}>{joinErr}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setShowJoin(false); setJoinCode(""); setJoinErr(""); }} style={{ flex: 1, padding: 13, borderRadius: 14, background: "transparent", border: `1.5px solid ${T.border}`, cursor: "pointer", fontSize: 14, fontWeight: 700, color: T.soft }}>Cancelar</button>
              <button disabled={joinCode.length < 4 || joinLoading} onClick={async () => {
                if (joinCode.length < 4) return;
                setJoinLoading(true); setJoinErr("");
                const result = await auth.joinFamily(joinCode);
                if (result?.error) { setJoinErr(result.error === "Código no válido" ? "Código inválido o ya utilizado" : result.error); }
                setJoinLoading(false);
              }} style={{ flex: 2, padding: 13, borderRadius: 14, background: joinCode.length >= 4 ? `linear-gradient(135deg,${T.accent},#D4623C)` : T.border, color: "#fff", border: "none", cursor: joinCode.length >= 4 ? "pointer" : "default", fontSize: 15, fontWeight: 800 }}>
                {joinLoading ? "..." : "Unirme →"}
              </button>
            </div>
          </div>
        )}
      </div>}

      {obS === 1 && <div style={{ animation: "fadeUp 0.4s ease" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Sobre tu bebé</h2>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div onClick={() => fileRef.current?.click()} style={{ cursor: "pointer", display: "inline-block", position: "relative" }}>
            {photo ? <img src={photo} style={{ width: 80, height: 80, borderRadius: 28, objectFit: "cover", border: `3px solid ${T.accent}` }} alt="" />
              : <div style={{ width: 80, height: 80, borderRadius: 28, background: T.card + "CC", border: `3px dashed rgba(128,128,128,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📷</div>}
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>+</div>
          </div>
          <p style={{ fontSize: 11, color: T.soft, marginTop: 4 }}>Foto (opcional)</p>
        </div>
        <input value={prof.name} onChange={e => setProf(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del bebé" autoFocus style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: `2px solid ${T.border}`, fontSize: 18, outline: "none", fontWeight: 700, background: T.card + "DD", marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          {[{ id: "female", l: "Niña", e: "👧" }, { id: "male", l: "Niño", e: "👦" }].map(g =>
            <button key={g.id} onClick={() => setProf(p => ({ ...p, gender: g.id }))} style={{ flex: 1, padding: 14, borderRadius: 16, cursor: "pointer", background: prof.gender === g.id ? T.accentL : T.card + "DD", border: `2px solid ${prof.gender === g.id ? T.accent : T.border}`, fontSize: 15, fontWeight: 700, textAlign: "center" }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 2 }}>{g.e}</span>{g.l}</button>)}
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Fecha de nacimiento</p>
        <input type="date" value={prof.birthDate} onChange={e => setProf(p => ({ ...p, birthDate: e.target.value }))} style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: `2px solid ${T.border}`, fontSize: 16, outline: "none", fontWeight: 700, background: T.card + "DD", marginBottom: 8 }} />
        {prof.birthDate && <div style={{ background: T.card + "CC", backdropFilter: "blur(8px)", borderRadius: 14, padding: "10px 14px", marginBottom: 14, border: `1px solid ${T.accent}44` }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>🎂 {fmtAge(prof.birthDate)}</p>
          <p style={{ fontSize: 12, color: T.soft }}>Rango: {ageToRange(prof.birthDate) || "—"}</p></div>}
        {!prof.birthDate && <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: T.soft, marginBottom: 8 }}>O selecciona un rango aproximado:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["0-3 meses", "3-6 meses", "6-9 meses", "9-12 meses"].map(a =>
              <button key={a} onClick={() => setProf(p => ({ ...p, ageRange: a }))} style={{ padding: 12, borderRadius: 14, cursor: "pointer", background: prof.ageRange === a ? T.accentL : T.card + "DD", border: `2px solid ${prof.ageRange === a ? T.accent : T.border}`, fontSize: 13, fontWeight: prof.ageRange === a ? 800 : 600, color: prof.ageRange === a ? T.accent : T.text }}>{a}</button>)}</div></div>}
        <button onClick={() => setObS(2)} style={{ width: "100%", padding: 16, borderRadius: 20, background: `linear-gradient(135deg,${T.accent},#D4623C)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 17, fontWeight: 800 }}>Siguiente →</button>
      </div>}

      {obS === 2 && <div style={{ animation: "fadeUp 0.4s ease" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>¿Quién eres tú?</h2>
        <p style={{ fontSize: 13, color: T.soft, marginBottom: 14 }}>Tu nombre aparece en cada registro</p>
        <input value={cu.name === "Yo" ? "" : cu.name} onChange={e => setCu(p => ({ ...p, name: e.target.value || "Yo" }))} placeholder="Tu nombre" autoFocus style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: `2px solid ${T.border}`, fontSize: 18, outline: "none", fontWeight: 700, background: T.card + "DD", marginBottom: 14 }} />
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Tu rol en la familia</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {FAMILY_ROLES.map(r => <button key={r.id} onClick={() => setCu(p => ({ ...p, familyRole: r.id }))} style={{ padding: "8px 12px", borderRadius: 12, cursor: "pointer", background: cu.familyRole === r.id ? T.accentL : T.card + "DD", border: `2px solid ${cu.familyRole === r.id ? T.accent : T.border}`, fontSize: 13, fontWeight: cu.familyRole === r.id ? 800 : 600 }}>
            <span style={{ marginRight: 4 }}>{r.e}</span>{r.l}</button>)}</div>
        <button onClick={finOb} disabled={!prof.name.trim()} style={{ width: "100%", padding: 18, borderRadius: 22, background: prof.name.trim() ? `linear-gradient(135deg,${T.accent},#D4623C)` : "#999", color: "#fff", border: "none", cursor: prof.name.trim() ? "pointer" : "default", fontSize: 18, fontWeight: 800 }}>¡Empezar! 🎉</button>
      </div>}
    </div>
  );

  // ══ MAIN ══
  const Bk = ({ fn }) => <button onClick={fn} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, flexShrink: 0, color: T.text, fontWeight: 700 }}>← <span style={{ fontSize: 12 }}>Volver</span></button>;
  const SL = ({ children }) => <p style={{ fontSize: 11, fontWeight: 800, color: T.soft, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>{children}</p>;

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: dark ? T.bg : "linear-gradient(-45deg,#FEF0EB,#DBEAFE,#FDE8F0,#E0E7FF)", backgroundSize: dark ? undefined : "400% 400%", animation: dark ? undefined : "gradMove 14s ease infinite", fontFamily: "'Nunito',system-ui", color: T.text, position: "relative", transition: "background 0.3s" }}>
      <style>{css}</style>
      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />

      {ok && <div style={{ position: "fixed", inset: 0, zIndex: 2e3, display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "rgba(12,12,18,0.95)" : "rgba(250,250,247,0.95)", backdropFilter: "blur(8px)", animation: "scaleIn 0.3s ease" }}>
        <div style={{ textAlign: "center" }}><div style={{ width: 70, height: 70, borderRadius: "50%", background: T.ok, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28, color: "#fff" }}>✓</div><p style={{ fontSize: 17, fontWeight: 800 }}>{okM}</p></div></div>}

      {/* CROP MODAL */}
      {cropModal}

      {/* HOME */}
      {view === "home" && !sub && <div style={{ padding: "14px 16px 100px", animation: "fadeUp 0.4s ease" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => hp("manage_family") && fileRef.current?.click()} style={{ cursor: hp("manage_family") ? "pointer" : "default" }}><Av sz={46} /></div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900 }}>{prof.name || "Mi Bebé"}</h1>
              {prof.birthDate && <p style={{ fontSize: 13, color: T.accent, fontWeight: 700 }}>{fmtAge(prof.birthDate)}</p>}
              <p style={{ fontSize: 11, color: T.soft }}>{FAMILY_ROLES.find(r => r.id === cu.familyRole)?.e} {cu.name}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => setDark(!dark)} style={{ ...GL(dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.65)", 13), width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>{dark ? "☀️" : "🌙"}</button>
            {hp("manage_family") && <button onClick={() => setView("profile")} style={{ ...GL(dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.65)", 13), width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>⚙️</button>}
          </div>
        </div>

        {/* Sleep timer banner — glass overlay */}
        {slpA && <div onClick={() => setSub("sleep")} style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.92),rgba(109,40,217,0.92))", ...glBlur, borderRadius: 22, padding: "14px 16px", marginBottom: 12, cursor: "pointer", animation: "pulse 2s ease infinite", border: "1px solid rgba(196,181,253,0.35)", boxShadow: "0 8px 32px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><p style={{ fontSize: 11, color: "#E9D5FF", fontWeight: 700 }}>{slpA.type === "nap" ? "💤 SIESTA" : "🌙 NOCHE"} EN CURSO</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{fSec(slpE)}</p></div>
            <div style={{ padding: "10px 16px", borderRadius: 14, background: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 800, fontSize: 13, border: "1px solid rgba(255,255,255,0.25)" }}>Detener</div>
          </div>
        </div>}

        {/* Nursing timer banner — glass overlay */}
        {nursingActive && <div style={{ background: "linear-gradient(135deg,rgba(236,72,153,0.92),rgba(190,24,93,0.92))", ...glBlur, borderRadius: 22, padding: "14px 16px", marginBottom: 12, animation: "pulse 2s ease infinite", border: "1px solid rgba(252,207,232,0.35)", boxShadow: "0 8px 32px rgba(236,72,153,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 11, color: "#FCE7F3", fontWeight: 700 }}>{nursingActive.breast === "left" ? "🫲 IZQUIERDO" : "🫱 DERECHO"} EN CURSO</p>
              <p style={{ fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{fSec(nursingElapsed)}</p>
              <p style={{ fontSize: 12, color: "#FCE7F3", marginTop: 2 }}>~{estimateNursingOz([...nursingSessions, { breast: nursingActive.breast, minutes: Math.max(1, Math.floor(nursingElapsed / 60)) }], prof.ageRange)} oz estimado</p>
            </div>
            <button onClick={() => setSub("feed")} style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Ver detalle →</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => startNursingBreast(nursingActive.breast === "left" ? "right" : "left")} style={{ flex: 1, padding: "11px 8px", borderRadius: 14, background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              Cambiar a {nursingActive.breast === "left" ? "🫱 Derecho" : "🫲 Izquierdo"}
            </button>
            <button onClick={() => {
              const minutes = Math.max(1, Math.floor(nursingElapsed / 60));
              const finalSessions = [...nursingSessions, { breast: nursingActive.breast, minutes }];
              const estimatedOz = estimateNursingOz(finalSessions, prof.ageRange);
              const lastBreast = nursingActive.breast;
              const entryData = { feedType: "nursing", subtype: "nursing", sessions: finalSessions, estimatedOz, lastBreast, oz: estimatedOz };
              setEnt(p => [...p, { id: Date.now(), type: "feed", ...entryData, notes: "", by: cu.name, ts: new Date().toISOString() }]);
              data.addEntry({ type: "feed", data: entryData, by: cu.name, ts: new Date().toISOString() });
              resetNursingState(); setFOz(4); setFNo(""); setFTs("");
              flash("Toma ✓");
            }} style={{ flex: 1, padding: "11px 8px", borderRadius: 14, background: "rgba(255,255,255,0.92)", color: "#BE185D", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
              ⏹ Guardar
            </button>
          </div>
        </div>}

        {/* Critical alerts — glass red */}
        {criticalAlerts.map((a, i) => <div key={i} style={{ ...GL(dark ? "rgba(239,68,68,0.12)" : "rgba(254,226,226,0.75)", 16), padding: "12px 14px", marginBottom: 6, border: "1.5px solid rgba(239,68,68,0.28)", boxShadow: "0 4px 16px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#EF4444", flex: 1 }}>{a.m}</p>
        </div>)}

        {/* Soft alerts — collapsible, glass amber */}
        {softAlerts.length > 0 && <div style={{ marginBottom: 12 }}>
          <button onClick={() => setAlertsOpen(p => !p)} style={{ ...GL(dark ? "rgba(245,158,11,0.08)" : "rgba(255,251,235,0.78)", 14), width: "100%", padding: "11px 14px", border: "1px solid rgba(245,158,11,0.3)", boxShadow: "0 4px 16px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginBottom: alertsOpen ? 6 : 0 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#D97706", flex: 1, textAlign: "left" }}>{softAlerts.length} aviso{softAlerts.length !== 1 ? "s" : ""}</p>
            <span style={{ fontSize: 14, color: T.soft }}>{alertsOpen ? "▲" : "▼"}</span>
          </button>
          {alertsOpen && softAlerts.map((a, i) => <div key={i} onClick={() => { if (a.m.includes("tarea")) setView("tasks"); }} style={{ ...GL(dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.65)", 12), padding: "9px 14px", marginBottom: 4, border: "1px solid rgba(245,158,11,0.18)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#D97706", flex: 1 }}>{a.m}</p>
            <span style={{ fontSize: 11, color: T.soft }}>›</span>
          </div>)}
        </div>}

        {/* Última toma — hero card glass orange */}
        <div onClick={() => setSub("feed")} style={{ ...GL(dark ? "rgba(249,115,22,0.1)" : "rgba(255,247,237,0.82)", 26), padding: "18px 20px", marginBottom: 10, cursor: "pointer", border: `1.5px solid ${dark ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.85)"}`, boxShadow: dark ? "0 8px 32px rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.07)" : `0 8px 32px rgba(227,111,71,0.12), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.95)` }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: T.accent, marginBottom: 6, letterSpacing: 0.5 }}>🍼 ÚLTIMA TOMA</p>
          {lF ? <>
            <p style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>{lF.estimatedOz ? "~" : ""}{lF.oz}<span style={{ fontSize: 18, fontWeight: 600, color: T.soft }}>oz</span></p>
            <p style={{ fontSize: 14, color: T.soft, fontWeight: 600 }}>{rel(lF.ts)} · {fmt(lF.ts)}</p>
            {nextBreast && <p style={{ fontSize: 13, fontWeight: 800, color: "#F472B6", marginTop: 6 }}>Próxima: {nextBreast === "left" ? "🫲 Izquierdo" : "🫱 Derecho"}</p>}
          </> : <p style={{ fontSize: 18, fontWeight: 700, color: T.soft }}>Sin registros — toca para registrar</p>}
        </div>

        {/* Resumen del día — 3 tinted glass cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div style={{ ...GL(dark ? "rgba(249,168,212,0.08)" : "rgba(253,242,248,0.75)", 18), padding: "14px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 900, color: feedStatus === "ok" ? T.ok : feedStatus === "warn" ? "#F59E0B" : T.text, lineHeight: 1 }}>{tOz}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.soft, marginTop: 3 }}>oz hoy</p>
            <p style={{ fontSize: 10, color: T.soft }}>{goals.ozLabel}</p>
          </div>
          <div style={{ ...GL(dark ? "rgba(125,211,252,0.07)" : "rgba(239,246,255,0.75)", 18), padding: "14px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 900, color: wetStatus === "ok" ? T.ok : wetStatus === "warn" ? "#F59E0B" : T.text, lineHeight: 1 }}>{tWet}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.soft, marginTop: 3 }}>💧 pipí</p>
            <p style={{ fontSize: 10, color: T.soft }}>{goals.wetLabel}</p>
          </div>
          <div style={{ ...GL(dark ? "rgba(196,181,253,0.08)" : "rgba(245,243,255,0.75)", 18), padding: "14px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 900, color: sleepStatus === "ok" ? T.ok : sleepStatus === "warn" ? "#F59E0B" : T.text, lineHeight: 1 }}>{tSlH}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.soft, marginTop: 3 }}>h sueño</p>
            <p style={{ fontSize: 10, color: T.soft }}>{goals.sleepLabel}</p>
          </div>
        </div>

        {/* Registrar — glass tinted per category */}
        <p style={{ fontSize: 12, fontWeight: 800, color: T.soft, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Registrar</p>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {REC.filter(r => hp(r.p)).map(r => (
            <button key={r.id} onClick={() => setSub(r.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 4px", borderRadius: 20, background: r.c + (dark ? "18" : "30"), backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${r.c}${dark ? "30" : "55"}`, boxShadow: dark ? `0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)` : `0 4px 16px ${r.c}22, 0 2px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.85)`, cursor: "pointer" }}>
              <span style={{ fontSize: 26 }}>{r.e}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.text }}>{r.l}</span>
            </button>
          ))}
        </div>

        {/* Tareas de hoy — glass white */}
        {(todayTasks.length > 0 || overdueTasks.length > 0) && <div style={{ ...GL(dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.68)", 20), padding: "14px 16px", marginBottom: 10, cursor: "pointer" }} onClick={() => setView("tasks")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 800 }}>📌 Tareas de hoy</p>
            <span style={{ fontSize: 12, color: T.accent, fontWeight: 700 }}>ver todas →</span>
          </div>
          {[...overdueTasks, ...todayTasks].slice(0, 3).map(t => { const cat = TASK_CATS.find(c => c.id === t.cat); return (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}` }}>
              <span style={{ fontSize: 18 }}>{cat?.e || "📋"}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</p>
                <p style={{ fontSize: 11, color: t.date && isPastDate(t.date) ? "#EF4444" : T.soft }}>{t.date ? fDShort(t.date) : "Sin fecha"}{t.time ? ` ${t.time}` : ""}</p>
              </div>
            </div>
          );})}
        </div>}

        {/* Grid de navegación — glass white */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {hp("view_milestones") && <button onClick={() => setView("milestones")} style={{ ...GL(dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)", 22), padding: "16px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
            <span style={{ fontSize: 26 }}>🌟</span>
            <div><p style={{ fontSize: 14, fontWeight: 800 }}>Hitos</p><p style={{ fontSize: 11, color: T.soft }}>{msDone.length}/{milestones.length}</p></div>
          </button>}
          {hp("manage_family") && <button onClick={() => setView("family")} style={{ ...GL(dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)", 22), padding: "16px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
            <span style={{ fontSize: 26 }}>👨‍👩‍👧</span>
            <div><p style={{ fontSize: 14, fontWeight: 800 }}>Familia</p><p style={{ fontSize: 11, color: T.soft }}>{mem.length} miembro{mem.length !== 1 ? "s" : ""}</p></div>
          </button>}
          <button onClick={() => setView("tasks")} style={{ ...GL(dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)", 22), padding: "16px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
            <span style={{ fontSize: 26 }}>📌</span>
            <div><p style={{ fontSize: 14, fontWeight: 800 }}>Tareas</p><p style={{ fontSize: 11, color: T.soft }}>{pendingTasks.length} pendiente{pendingTasks.length !== 1 ? "s" : ""}</p></div>
          </button>
          {hp("use_ai") && <button onClick={() => setView("ai")} style={{ ...GL(dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)", 22), padding: "16px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
            <span style={{ fontSize: 26 }}>🤖</span>
            <div><p style={{ fontSize: 14, fontWeight: 800 }}>IA</p><p style={{ fontSize: 11, color: T.soft }}>Asistente</p></div>
          </button>}
        </div>

        {qs.filter(q => q.status === "pending").length > 0 && hp("view_questions") && <button onClick={() => setView("questions")} style={{ ...GL(dark ? "rgba(245,158,11,0.07)" : "rgba(255,251,235,0.78)", 14), width: "100%", padding: "12px 14px", border: "1px solid rgba(245,158,11,0.28)", boxShadow: "0 4px 16px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.7)", cursor: "pointer", textAlign: "left" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#D97706" }}>📋 {qs.filter(q => q.status === "pending").length} pregunta(s) para el pediatra</p>
        </button>}
      </div>}

      {/* FEED */}
      {sub === "feed" && <div style={{ padding: "14px 16px 40px", animation: "fadeUp 0.3s ease", background: dark ? "linear-gradient(180deg,#1A1015 0%,#0C0C12 100%)" : "linear-gradient(180deg,#FEF0EB 0%,#FAFAF7 30%)", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><Bk fn={() => setSub(null)} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>🍼 Alimentación</h2></div>

        {/* Tipo de toma */}
        <SL>Tipo de toma</SL>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 20 }}>
          {FT.map(x => <button key={x.id} onClick={() => { setFSubtype(x.id); resetNursingState(); }} style={{ padding: "14px 4px", borderRadius: 16, cursor: "pointer", background: fSubtype === x.id ? x.c + (dark ? "28" : "20") : T.card, textAlign: "center", border: `2px solid ${fSubtype === x.id ? x.c : T.border}` }}>
            <span style={{ fontSize: 24, display: "block", marginBottom: 2 }}>{x.e}</span>
            <span style={{ fontSize: 12, fontWeight: fSubtype === x.id ? 800 : 600 }}>{x.l}</span>
          </button>)}
        </div>

        {/* ── PECHO DIRECTO ── */}
        {(fSubtype === "nursing" || fSubtype === "mixed") && <>
          <SL>{fSubtype === "mixed" ? "Pecho (parte 1)" : "Cronómetro por pecho"}</SL>
          {!nursingActive ? (
            <>
              <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
                {[{ id: "left", l: "Izquierdo", e: "🫲" }, { id: "right", l: "Derecho", e: "🫱" }].map(b => (
                  <button key={b.id} onClick={() => startNursingBreast(b.id)} style={{ flex: 1, padding: "20px 10px", borderRadius: 18, cursor: "pointer", background: `linear-gradient(135deg,#F9A8D4,#F472B6)`, textAlign: "center", border: "none", color: "#fff", boxShadow: "0 4px 14px #F472B633" }}>
                    <span style={{ fontSize: 28, display: "block", marginBottom: 4 }}>{b.e}</span>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>Iniciar {b.l}</span>
                  </button>
                ))}
              </div>
              {nursingSessions.length > 0 && (() => {
                const totalMin = nursingSessions.reduce((s, x) => s + x.minutes, 0);
                const estOz = estimateNursingOz(nursingSessions, prof.ageRange);
                return (
                  <div style={{ ...CS, marginBottom: 14, padding: "14px 16px", borderLeft: `3px solid #F472B6` }}>
                    <p style={{ fontSize: 11, color: T.soft, marginBottom: 6 }}>
                      {nursingSessions.map(s => `${s.breast === "left" ? "🫲 Izq" : "🫱 Der"} ${s.minutes}min`).join("  +  ")}
                    </p>
                    <p style={{ fontSize: 20, fontWeight: 900, color: "#F472B6" }}>
                      ~{estOz} oz <span style={{ fontSize: 12, fontWeight: 600, color: T.soft }}>estimado ({totalMin} min)</span>
                    </p>
                    <p style={{ fontSize: 10, color: T.soft, marginTop: 4 }}>
                      Tasa {NURSING_RATE[prof.ageRange] || 0.16} oz/min · {prof.ageRange}
                    </p>
                  </div>
                );
              })()}
            </>
          ) : (
            <>
              <div style={{ textAlign: "center", padding: "18px 0 12px", position: "relative" }}>
                <p style={{ fontSize: 12, color: "#F472B6", fontWeight: 700, marginBottom: 4 }}>
                  {nursingActive.breast === "left" ? "🫲 Pecho izquierdo" : "🫱 Pecho derecho"}
                </p>
                <p style={{ fontSize: 56, fontWeight: 900, color: "#F472B6", letterSpacing: -2, lineHeight: 1 }}>{fSec(nursingElapsed)}</p>
                {nursingSessions.length > 0 && (
                  <p style={{ fontSize: 11, color: T.soft, marginTop: 6 }}>
                    Antes: {nursingSessions.map(s => `${s.breast === "left" ? "Izq" : "Der"} ${s.minutes}min`).join(" + ")}
                  </p>
                )}
              </div>
              {/* Live estimated oz */}
              {(() => {
                const curMin = Math.max(1, Math.floor(nursingElapsed / 60));
                const all = [...nursingSessions, { breast: nursingActive.breast, minutes: curMin }];
                return (
                  <div style={{ textAlign: "center", marginBottom: 14 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: "#F472B6" }}>~{estimateNursingOz(all, prof.ageRange)} oz estimado</p>
                  </div>
                );
              })()}
              <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
                <button onClick={() => startNursingBreast(nursingActive.breast === "left" ? "right" : "left")} style={{ flex: 1, padding: "13px", borderRadius: 16, background: T.accentL, border: `1.5px solid ${T.border}`, cursor: "pointer", fontSize: 13, fontWeight: 700, color: T.accent }}>
                  Cambiar a {nursingActive.breast === "left" ? "🫱 Derecho" : "🫲 Izquierdo"}
                </button>
                <button onClick={() => { const min = Math.max(1, Math.floor(nursingElapsed / 60)); setNursingSessions(p => [...p, { breast: nursingActive.breast, minutes: min }]); setNursingActive(null); }} style={{ flex: 1, padding: "13px", borderRadius: 16, background: "#F9A8D4", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, color: "#9D174D" }}>
                  ⏹ Detener
                </button>
              </div>
            </>
          )}
        </>}

        {/* ── SUPLEMENTO (MIXTA) / LECHE EXTRAÍDA / FÓRMULA ── */}
        {(fSubtype === "pumped" || fSubtype === "formula" || fSubtype === "mixed") && <>
          <SL>{fSubtype === "mixed" ? "Suplemento de fórmula (oz)" : fSubtype === "pumped" ? "Leche extraída (oz)" : "Onzas"}</SL>
          <div style={{ ...CS, textAlign: "center", marginBottom: 10, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <button onClick={() => setFOz(Math.max(0.5, fOz - 0.5))} style={{ width: 48, height: 48, borderRadius: 16, background: T.accentL, border: "none", fontSize: 22, cursor: "pointer", fontWeight: 800, color: T.accent }}>−</button>
              <div><span style={{ fontSize: 48, fontWeight: 900, color: T.accent }}>{fOz}</span><p style={{ fontSize: 12, color: T.soft }}>oz</p></div>
              <button onClick={() => setFOz(fOz + 0.5)} style={{ width: 48, height: 48, borderRadius: 16, background: T.accentL, border: "none", fontSize: 22, cursor: "pointer", fontWeight: 800, color: T.accent }}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(o => <button key={o} onClick={() => setFOz(o)} style={{ padding: "7px 13px", borderRadius: 11, background: fOz === o ? T.accent : T.card, color: fOz === o ? "#fff" : T.soft, border: `1.5px solid ${fOz === o ? T.accent : T.border}`, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{o}oz</button>)}
          </div>
          {/* Total estimado para mixta */}
          {fSubtype === "mixed" && nursingSessions.length > 0 && (() => {
            const estNursing = estimateNursingOz(nursingSessions, prof.ageRange);
            return (
              <div style={{ ...CS, marginBottom: 14, padding: "12px 16px", background: dark ? "#1A1228" : "#F5F3FF" }}>
                <p style={{ fontSize: 11, color: T.soft, marginBottom: 2 }}>Total estimado de la toma</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#8B5CF6" }}>~{Math.round((estNursing + fOz) * 10) / 10} oz</p>
                <p style={{ fontSize: 10, color: T.soft }}>🤱 ~{estNursing} oz pecho + 🫧 {fOz} oz fórmula</p>
              </div>
            );
          })()}
        </>}

        {/* Hora y notas */}
        {fSubtype !== "nursing" && <><SL>Hora (vacío = ahora)</SL><input type="datetime-local" value={fTs} onChange={e => setFTs(e.target.value)} style={{ width: "100%", padding: 11, borderRadius: 14, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 13, outline: "none", marginBottom: 10 }} /></>}
        <SL>Notas</SL><textarea value={fNo} onChange={e => setFNo(e.target.value)} placeholder="Opcional..." style={{ width: "100%", padding: 11, borderRadius: 14, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 13, resize: "none", height: 50, outline: "none" }} />

        <button onClick={addFeed} disabled={fSubtype === "nursing" && nursingSessions.length === 0 && !nursingActive} style={{ width: "100%", padding: 15, borderRadius: 20, background: (fSubtype === "nursing" && nursingSessions.length === 0 && !nursingActive) ? T.border : `linear-gradient(135deg,${T.accent},#D4623C)`, color: "#fff", border: "none", cursor: (fSubtype === "nursing" && nursingSessions.length === 0 && !nursingActive) ? "default" : "pointer", fontSize: 16, fontWeight: 800, marginTop: 16, boxShadow: "0 8px 24px rgba(227,111,71,0.3)" }}>
          {fSubtype === "nursing" && nursingActive ? "⏹ Detener y Guardar" : "Guardar ✓"}
        </button>
      </div>}

      {/* DIAPER */}
      {sub === "diaper" && <div style={{ padding: "14px 16px 40px", animation: "fadeUp 0.3s ease", background: dark ? "linear-gradient(180deg,#0F1520 0%,#0C0C12 100%)" : "linear-gradient(180deg,#DBEAFE 0%,#FAFAF7 30%)", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><Bk fn={() => setSub(null)} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>🧷 Pañal</h2></div>
        <SL>Tipo</SL><div style={{ display: "flex", gap: 7, marginBottom: 18 }}>{DTP.map(x => <button key={x.id} onClick={() => setDTy(x.id)} style={{ flex: 1, padding: "16px 4px", borderRadius: 16, cursor: "pointer", background: dTy === x.id ? x.c + (dark ? "28" : "20") : T.card, textAlign: "center", border: `2px solid ${dTy === x.id ? x.c : T.border}` }}><span style={{ fontSize: 28, display: "block", marginBottom: 2 }}>{x.e}</span><span style={{ fontSize: 13, fontWeight: dTy === x.id ? 800 : 600 }}>{x.l}</span></button>)}</div>
        {dTy !== "pee" && <><SL>Color</SL><div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>{PCL.map(c => <button key={c.id} onClick={() => setPCo(c.id)} style={{ padding: "7px 12px", borderRadius: 11, cursor: "pointer", background: pCo === c.id ? c.h + "20" : T.card, border: `2px solid ${pCo === c.id ? c.h : T.border}`, display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 14, height: 14, borderRadius: 4, background: c.h }} /><span style={{ fontSize: 12, fontWeight: 700 }}>{c.l}</span></button>)}</div>
          <SL>Consistencia</SL><div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>{PCN.map(c => <button key={c.id} onClick={() => setPCn(c.id)} style={{ padding: "7px 14px", borderRadius: 11, cursor: "pointer", background: pCn === c.id ? T.accent : T.card, color: pCn === c.id ? "#fff" : T.text, border: `1.5px solid ${pCn === c.id ? T.accent : T.border}`, fontSize: 12, fontWeight: 700 }}>{c.l}</button>)}</div></>}
        <button onClick={addDiaper} style={{ width: "100%", padding: 15, borderRadius: 20, background: "linear-gradient(135deg,#60A5FA,#3B82F6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 800 }}>Guardar ✓</button></div>}

      {/* SLEEP */}
      {sub === "sleep" && <div style={{ padding: "14px 16px 40px", animation: "fadeUp 0.3s ease", background: dark ? "linear-gradient(180deg,#14101E 0%,#0C0C12 100%)" : "linear-gradient(180deg,#EDE9FE 0%,#FAFAF7 30%)", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><Bk fn={() => setSub(null)} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>😴 Sueño</h2></div>
        {!slpA ? <><p style={{ fontSize: 13, color: T.soft, textAlign: "center", marginBottom: 20 }}>Toca cuando se duerma</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>{[{ id: "nap", l: "Siesta", e: "💤", c: "#A78BFA" }, { id: "night", l: "Noche", e: "🌙", c: "#6366F1" }].map(x =>
            <button key={x.id} onClick={() => startSlp(x.id)} style={{ flex: 1, padding: "26px 10px", borderRadius: 22, cursor: "pointer", background: `linear-gradient(135deg,${x.c},${x.c}CC)`, textAlign: "center", border: "none", color: "#fff", boxShadow: `0 8px 24px ${x.c}44` }}>
              <span style={{ fontSize: 36, display: "block", marginBottom: 6 }}>{x.e}</span><span style={{ fontSize: 15, fontWeight: 800 }}>Iniciar {x.l}</span></button>)}</div>
          <SL>Registro rápido</SL><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{[15, 30, 45, 60, 90, 120].map(m => <button key={m} onClick={() => { setEnt(p => [...p, { id: Date.now(), type: "sleep", sleepType: "nap", duration: m, by: cu.name, ts: new Date().toISOString() }]); flash(`${m}min ✓`); }} style={{ padding: "9px 14px", borderRadius: 12, background: T.card, border: `1.5px solid ${T.border}`, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{m >= 60 ? `${m / 60}h` : `${m}min`}</button>)}</div>
        </> : <><div style={{ textAlign: "center", padding: "20px 0", marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: T.soft }}>{slpA.type === "nap" ? "💤 Siesta" : "🌙 Noche"}</p>
          <p style={{ fontSize: 60, fontWeight: 900, color: T.accent, letterSpacing: -2 }}>{fSec(slpE)}</p>
          <p style={{ fontSize: 12, color: T.soft }}>Desde {fmt(slpA.at)}</p></div>
          <button onClick={stopSlp} style={{ width: "100%", padding: 16, borderRadius: 22, background: "linear-gradient(135deg,#EF4444,#DC2626)", color: "#fff", border: "none", cursor: "pointer", fontSize: 17, fontWeight: 800 }}>⏹ Detener y Guardar</button></>}</div>}

      {/* TEMP */}
      {sub === "temp" && <div style={{ padding: "14px 16px 40px", animation: "fadeUp 0.3s ease", background: dark ? "linear-gradient(180deg,#1A1010 0%,#0C0C12 100%)" : "linear-gradient(180deg,#FEE2E2 0%,#FAFAF7 30%)", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><Bk fn={() => setSub(null)} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>🌡️ Temperatura</h2></div>
        <div style={{ ...CS, textAlign: "center", padding: 24, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <button onClick={() => setTmp(Math.max(34, +(tmp - 0.1).toFixed(1)))} style={{ width: 48, height: 48, borderRadius: 16, background: "#7DD3FC" + (dark ? "18" : "20"), border: "none", fontSize: 20, cursor: "pointer", fontWeight: 800, color: "#3B82F6" }}>−</button>
            <div><span style={{ fontSize: 48, fontWeight: 900, color: tmp >= 38 ? "#EF4444" : tmp >= 37.5 ? "#F59E0B" : T.text }}>{tmp.toFixed(1)}</span><p style={{ fontSize: 13, color: T.soft }}>°C</p></div>
            <button onClick={() => setTmp(+(tmp + 0.1).toFixed(1))} style={{ width: 48, height: 48, borderRadius: 16, background: "#FCA5A5" + (dark ? "18" : "20"), border: "none", fontSize: 20, cursor: "pointer", fontWeight: 800, color: "#EF4444" }}>+</button></div>
          {tmp >= 38 && <p style={{ marginTop: 12, fontSize: 12, color: "#EF4444", fontWeight: 700, background: dark ? "#2D0F0F" : "#FEE2E2", padding: "8px 10px", borderRadius: 10 }}>⚠️ Fiebre — pediatra</p>}</div>
        <button onClick={addTemp} style={{ width: "100%", padding: 15, borderRadius: 20, background: "linear-gradient(135deg,#F87171,#EF4444)", color: "#fff", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 800 }}>Guardar ✓</button></div>}

      {/* GROWTH */}
      {sub === "growth" && <div style={{ padding: "14px 16px 40px", animation: "fadeUp 0.3s ease", background: dark ? "linear-gradient(180deg,#101A15 0%,#0C0C12 100%)" : "linear-gradient(180deg,#D1FAE5 0%,#FAFAF7 30%)", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><Bk fn={() => setSub(null)} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>📏 Peso y Talla</h2></div>
        <SL>Peso (kg)</SL><input type="number" step="0.1" value={wK} onChange={e => setWK(e.target.value)} placeholder="6.2" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 20, outline: "none", marginBottom: 14, fontWeight: 700, textAlign: "center" }} />
        <SL>Talla (cm)</SL><input type="number" step="0.1" value={hC} onChange={e => setHC(e.target.value)} placeholder="62" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 20, outline: "none", marginBottom: 14, fontWeight: 700, textAlign: "center" }} />
        <SL>Fecha de medición (vacío = hoy)</SL><input type="date" value={gDate} onChange={e => setGDate(e.target.value)} style={{ width: "100%", padding: 11, borderRadius: 14, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 13, outline: "none", marginBottom: 16 }} />
        <button onClick={addGrowth} disabled={!wK && !hC} style={{ width: "100%", padding: 15, borderRadius: 20, background: (wK || hC) ? "linear-gradient(135deg,#34D399,#10B981)" : T.border, color: "#fff", border: "none", cursor: (wK || hC) ? "pointer" : "default", fontSize: 16, fontWeight: 800 }}>Guardar ✓</button></div>}

      {/* HISTORY */}
      {view === "history" && !sub && <div style={{ padding: "14px 16px 100px", animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><h2 style={{ fontSize: 19, fontWeight: 900 }}>📊 Historial</h2>
          {ent.length > 0 && hp("export_data") && <button onClick={exportCSV} style={{ padding: "5px 10px", borderRadius: 10, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>📥 CSV</button>}</div>
        {ent.length === 0 ? <div style={{ textAlign: "center", padding: "50px 20px", color: T.soft }}><p style={{ fontSize: 40 }}>📝</p><p style={{ fontWeight: 700, marginTop: 8 }}>Sin registros</p></div>
          : [...ent].reverse().map((e, i) => { const rt = REC.find(r => r.id === e.type) || {}; let d = "";
            if (e.type === "feed") {
              const sub = e.subtype || e.feedType;
              const totalMin = (e.sessions || []).reduce((s, x) => s + x.minutes, 0);
              if (sub === "nursing" || sub === "breast") d = `🤱 Pecho · ~${e.estimatedOz || e.oz || 0}oz (est.) · ${totalMin}min`;
              else if (sub === "pumped") d = `🥛 Extraída · ${e.oz}oz`;
              else if (sub === "mixed") d = `🔄 Mixta · ${e.oz}oz${totalMin ? ` · ${totalMin}min pecho` : ""}`;
              else d = `🫧 Fórmula · ${e.oz || 0}oz`;
            }
            else if (e.type === "diaper") d = DTP.find(x => x.id === e.diaperType)?.l || "";
            else if (e.type === "sleep") d = `${e.sleepType === "nap" ? "Siesta" : "Noche"} · ${e.duration || "?"}min`;
            else if (e.type === "temp") d = `${e.temp}°C${e.temp >= 38 ? " ⚠️" : ""}`;
            else if (e.type === "growth") d = `${e.weight ? e.weight + "kg" : ""}${e.height ? " · " + e.height + "cm" : ""}`;
            return <div key={e.id} style={{ ...CS, marginBottom: 4, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 34, height: 34, borderRadius: 11, background: (rt.c || "#ddd") + (dark ? "15" : "12"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{rt.e}</div>
                <div><p style={{ fontSize: 12, fontWeight: 700 }}>{d}</p><p style={{ fontSize: 10, color: T.soft }}>{fD(e.ts)} · {fmt(e.ts)}{e.by ? ` · ${e.by}` : ""}</p></div></div>
              {hp("manage_family") && <button onClick={() => delE(e.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.soft, padding: 3 }}>✕</button>}</div>; })}</div>}

      {/* MILESTONES */}
      {view === "milestones" && !msD && <div style={{ padding: "14px 16px 100px", animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><Bk fn={() => setView("home")} /><div><h2 style={{ fontSize: 19, fontWeight: 900 }}>🌟 Hitos ({prof.ageRange})</h2><p style={{ fontSize: 11, color: T.soft }}>{msDone.length}/{milestones.length}</p></div></div>
        <div style={{ height: 7, borderRadius: 4, background: T.border, marginBottom: 16, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 4, width: `${milestones.length ? (msDone.filter(m => milestones.find(x => x.id === m.id)).length / milestones.length) * 100 : 0}%`, background: `linear-gradient(90deg,#FDE68A,${T.ok})`, transition: "width 0.5s" }} /></div>
        {milestones.map(m => { const dn = msDone.find(x => x.id === m.id); return (
          <div key={m.id} style={{ ...CS, width: "100%", marginBottom: 5, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => togMs(m.id)} style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, border: `2px solid ${dn ? T.ok : T.border}`, background: dn ? T.ok + "20" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.ok, fontWeight: 800, cursor: "pointer" }}>{dn ? "✓" : ""}</button>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setMsD(m)}><p style={{ fontSize: 13, fontWeight: 700 }}>{m.e} {m.l}</p><p style={{ fontSize: 10, color: T.soft }}>~{m.m}m · info →</p></div>
            {dn && <p style={{ fontSize: 10, color: T.ok, fontWeight: 700 }}>{fD(dn.at)}</p>}</div>); })}</div>}

      {msD && <div style={{ padding: "14px 16px 100px", animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><Bk fn={() => setMsD(null)} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>Detalle</h2></div>
        <div style={{ ...CS, padding: 20, textAlign: "center", marginBottom: 14 }}><span style={{ fontSize: 44 }}>{msD.e}</span><h3 style={{ fontSize: 18, fontWeight: 900, marginTop: 8 }}>{msD.l}</h3><p style={{ fontSize: 12, color: T.accent, fontWeight: 700 }}>~{msD.m} meses</p>
          {msDone.find(x => x.id === msD.id) && <p style={{ fontSize: 11, color: T.ok, fontWeight: 700, marginTop: 4 }}>✓ {fD(msDone.find(x => x.id === msD.id).at)}</p>}</div>
        <div style={{ ...CS, padding: 16 }}><p style={{ fontSize: 13, lineHeight: 1.6 }}>{msD.info}</p></div>
        <button onClick={() => { togMs(msD.id); setMsD(null); }} style={{ width: "100%", padding: 14, borderRadius: 18, background: msDone.find(x => x.id === msD.id) ? T.border : `linear-gradient(135deg,${T.ok},#059669)`, color: msDone.find(x => x.id === msD.id) ? T.text : "#fff", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 800, marginTop: 14 }}>{msDone.find(x => x.id === msD.id) ? "Desmarcar" : "Alcanzado ✓"}</button></div>}

      {/* FAMILY */}
      {view === "family" && !editM && <div style={{ padding: "14px 16px 100px", animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><Bk fn={() => { setView("home"); setInvStep(0); }} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>👨‍👩‍👧 Familia</h2></div>
        <SL>Miembros</SL>
        {mem.map(m => <div key={m.id} style={{ ...CS, marginBottom: 5, padding: "11px 12px", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, background: T.accentL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{ROLES.find(r => r.id === m.role)?.e || "👤"}</div>
          <div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</p><p style={{ fontSize: 10, color: T.soft }}>{ROLES.find(r => r.id === m.role)?.l} · {m.perms?.length || 0} permisos</p></div>
          {m.role !== "admin" && <><button onClick={() => setEditM(m)} style={{ padding: "4px 8px", borderRadius: 8, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 10, fontWeight: 700, color: T.soft }}>✏️</button>
            <button onClick={() => remMem(m.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#EF4444", padding: 2 }}>✕</button></>}</div>)}

        {inv.filter(i => i.status === "pending").length > 0 && <><SL>Pendientes</SL>{inv.filter(i => i.status === "pending").map(x => <div key={x.id} style={{ ...CS, marginBottom: 5, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📩</span><div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 700 }}>{x.name}</p><p style={{ fontSize: 10, color: T.soft }}>Código: <strong>{x.code}</strong></p></div>
          </div>)}</>}

        <div style={{ ...CS, padding: 14, marginTop: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>➕ Invitar familiar</p>

          {invStep === 0 && <>
            <input value={invN} onChange={e => setInvN(e.target.value)} placeholder="Nombre (ej: Abuela Rosa)" style={{ width: "100%", padding: 11, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 13, outline: "none", marginBottom: 8 }} />
            <SL>Rol base</SL>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>{ROLES.filter(r => r.id !== "admin").map(r => <button key={r.id} onClick={() => { setInvR(r.id); setInvPerms([...ROLE_DEFAULTS[r.id]]); }} style={{ flex: 1, padding: "8px 4px", borderRadius: 12, cursor: "pointer", background: invR === r.id ? T.accentL : T.card, border: `2px solid ${invR === r.id ? T.accent : T.border}`, textAlign: "center" }}><span style={{ fontSize: 18, display: "block" }}>{r.e}</span><span style={{ fontSize: 10, fontWeight: 700 }}>{r.l}</span></button>)}</div>
            <button onClick={() => { if (invN.trim()) setInvStep(1); }} disabled={!invN.trim()} style={{ width: "100%", padding: 12, borderRadius: 14, background: invN.trim() ? T.accent : T.border, color: "#fff", border: "none", cursor: invN.trim() ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>Configurar permisos →</button>
          </>}

          {invStep === 1 && <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <button onClick={() => setInvStep(0)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: T.text }}>←</button>
              <div><p style={{ fontSize: 13, fontWeight: 700 }}>{invN}</p><p style={{ fontSize: 10, color: T.soft }}>{ROLES.find(r => r.id === invR)?.e} {ROLES.find(r => r.id === invR)?.l}</p></div>
            </div>
            <p style={{ fontSize: 11, color: T.soft, marginBottom: 8 }}>Elige qué puede hacer:</p>
            {PERMS_LIST.map(p => { const on = invPerms.includes(p.id); return (
              <button key={p.id} onClick={() => setInvPerms(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} style={{ width: "100%", marginBottom: 3, padding: "8px 10px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", border: `1.5px solid ${on ? T.ok + "55" : T.border}`, background: on ? T.ok + "08" : T.card }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${on ? T.ok : T.border}`, background: on ? T.ok + "22" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.ok, fontWeight: 800, flexShrink: 0 }}>{on ? "✓" : ""}</div>
                <span style={{ fontSize: 14 }}>{p.cat}</span><p style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{p.l}</p></button>); })}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button onClick={() => setInvPerms([...ROLE_DEFAULTS[invR]])} style={{ flex: 1, padding: 10, borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Reset defaults</button>
              <button onClick={() => { createInv(); setInvStep(2); }} style={{ flex: 2, padding: 10, borderRadius: 12, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Generar invitación 📤</button>
            </div>
          </>}

          {invStep === 2 && <>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>✅</p>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>¡Invitación creada!</p>
              <p style={{ fontSize: 12, color: T.soft, marginBottom: 12 }}>Comparte el código por WhatsApp</p>
              {inv.length > 0 && <div style={{ background: T.accentL, borderRadius: 14, padding: "12px 16px", display: "inline-block", marginBottom: 12 }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: T.accent, letterSpacing: 4 }}>{inv[inv.length - 1]?.code}</p>
              </div>}
              <br />
              <button onClick={() => setInvStep(0)} style={{ padding: "10px 24px", borderRadius: 14, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Invitar a otro</button>
            </div>
          </>}
        </div>

      </div>}

      {/* EDIT PERMS */}
      {editM && <div style={{ padding: "14px 16px 100px", animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><Bk fn={() => setEditM(null)} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>Permisos: {editM.name}</h2></div>
        <p style={{ fontSize: 12, color: T.soft, marginBottom: 12 }}>Elige qué puede hacer en la app</p>
        {PERMS_LIST.map(p => { const on = editM.perms?.includes(p.id); return (
          <button key={p.id} onClick={() => updMemP(editM.id, p.id)} style={{ ...CS, width: "100%", marginBottom: 4, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: `1.5px solid ${on ? T.ok + "55" : T.border}`, background: on ? T.ok + "08" : T.card }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${on ? T.ok : T.border}`, background: on ? T.ok + "22" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.ok, fontWeight: 800 }}>{on ? "✓" : ""}</div>
            <span style={{ fontSize: 16 }}>{p.cat}</span><p style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{p.l}</p></button>); })}
        <button onClick={() => setEditM(null)} style={{ width: "100%", padding: 14, borderRadius: 18, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 800, marginTop: 12 }}>Listo ✓</button></div>}

      {/* TASKS */}
      {view === "tasks" && <div style={{ padding: "14px 16px 100px", animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><Bk fn={() => setView("home")} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>📌 Tareas</h2></div>

        {!tF_show ? <button onClick={() => setTFShow(true)} style={{ width: "100%", padding: 12, borderRadius: 14, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>+ Nueva tarea</button>
          : <div style={{ ...CS, padding: 14, marginBottom: 12 }}>
            <input value={tF_title} onChange={e => setTFTitle(e.target.value)} placeholder="Título (ej: Vacuna 6 meses)" style={{ width: "100%", padding: 10, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 13, outline: "none", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <div style={{ flex: 1 }}><SL>Fecha</SL><input type="date" value={tF_date} onChange={e => setTFDate(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 10, border: `1px solid ${T.border}`, background: T.card, fontSize: 12, outline: "none" }} /></div>
              <div style={{ flex: 1 }}><SL>Hora</SL><input type="time" value={tF_time} onChange={e => setTFTime(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 10, border: `1px solid ${T.border}`, background: T.card, fontSize: 12, outline: "none" }} /></div></div>
            <SL>Categoría</SL>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>{TASK_CATS.map(c => <button key={c.id} onClick={() => setTFCat(c.id)} style={{ padding: "5px 10px", borderRadius: 10, cursor: "pointer", background: tF_cat === c.id ? c.c + "20" : T.card, border: `1.5px solid ${tF_cat === c.id ? c.c : T.border}`, fontSize: 11, fontWeight: tF_cat === c.id ? 800 : 600 }}>{c.e} {c.l}</button>)}</div>
            <SL>Asignar a</SL>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {mem.map(m => <button key={m.id} onClick={() => setTFAssign(m.name)} style={{ padding: "5px 10px", borderRadius: 10, cursor: "pointer", background: tF_assign === m.name ? T.accentL : T.card, border: `1.5px solid ${tF_assign === m.name ? T.accent : T.border}`, fontSize: 11, fontWeight: tF_assign === m.name ? 800 : 600 }}>{m.name}</button>)}
              {mem.length === 0 && <p style={{ fontSize: 11, color: T.soft }}>Se asigna a ti</p>}</div>
            <SL>Repetir</SL>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>{TASK_REPEAT.map(r => <button key={r.id} onClick={() => setTFRepeat(r.id)} style={{ padding: "5px 10px", borderRadius: 10, cursor: "pointer", background: tF_repeat === r.id ? T.accentL : T.card, border: `1.5px solid ${tF_repeat === r.id ? T.accent : T.border}`, fontSize: 11, fontWeight: tF_repeat === r.id ? 800 : 600 }}>{r.l}</button>)}</div>
            <textarea value={tF_notes} onChange={e => setTFNotes(e.target.value)} placeholder="Notas (opcional)" style={{ width: "100%", padding: 8, borderRadius: 10, border: `1px solid ${T.border}`, background: T.card, fontSize: 12, resize: "none", height: 40, outline: "none", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setTFShow(false)} style={{ flex: 1, padding: 10, borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Cancelar</button>
              <button onClick={addTask} disabled={!tF_title.trim()} style={{ flex: 2, padding: 10, borderRadius: 12, background: tF_title.trim() ? T.accent : T.border, color: "#fff", border: "none", cursor: tF_title.trim() ? "pointer" : "default", fontSize: 12, fontWeight: 700 }}>Guardar</button></div></div>}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>{[{ id: "pending", l: `Pendientes (${pendingTasks.length})` }, { id: "done", l: `Completadas (${doneTasks.length})` }].map(t =>
          <button key={t.id} onClick={() => setTaskTab(t.id)} style={{ flex: 1, padding: "8px 6px", borderRadius: 12, cursor: "pointer", background: taskTab === t.id ? T.accent : T.card, color: taskTab === t.id ? "#fff" : T.text, border: `1.5px solid ${taskTab === t.id ? T.accent : T.border}`, fontSize: 11, fontWeight: 700 }}>{t.l}</button>)}</div>

        {overdueTasks.length > 0 && taskTab === "pending" && <><SL>⚠️ Vencidas</SL>
          {overdueTasks.map(t => { const cat = TASK_CATS.find(c => c.id === t.cat); return (
            <div key={t.id} style={{ ...CS, marginBottom: 4, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, border: `1.5px solid #EF444433` }}>
              <button onClick={() => togTask(t.id)} style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${T.accent}`, background: "transparent", cursor: "pointer", flexShrink: 0 }} />
              <div style={{ flex: 1 }}><p style={{ fontSize: 12, fontWeight: 700 }}>{cat?.e} {t.title}</p>
                <p style={{ fontSize: 10, color: "#EF4444", fontWeight: 700 }}>{fDShort(t.date)}{t.time ? ` ${t.time}` : ""} · {t.assignee}</p></div>
              <button onClick={() => delTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.soft }}>✕</button></div>); })}</>}

        {taskTab === "pending" && pendingTasks.filter(t => !t.date || (!isPastDate(t.date))).length > 0 && <>
          {todayTasks.length > 0 && <SL>📅 Hoy</SL>}
          {todayTasks.map(t => { const cat = TASK_CATS.find(c => c.id === t.cat); return (
            <div key={t.id} style={{ ...CS, marginBottom: 4, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => togTask(t.id)} style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${cat?.c || T.accent}`, background: "transparent", cursor: "pointer", flexShrink: 0 }} />
              <div style={{ flex: 1 }}><p style={{ fontSize: 12, fontWeight: 700 }}>{cat?.e} {t.title}</p>
                <p style={{ fontSize: 10, color: T.soft }}>{t.time || "Todo el día"} · {t.assignee}{t.repeat !== "once" ? ` · 🔁${TASK_REPEAT.find(r => r.id === t.repeat)?.l}` : ""}</p>
                {t.notes && <p style={{ fontSize: 10, color: T.soft, fontStyle: "italic" }}>{t.notes}</p>}</div>
              <button onClick={() => delTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.soft }}>✕</button></div>); })}

          {pendingTasks.filter(t => t.date && !isToday(t.date) && !isPastDate(t.date)).length > 0 && <SL>📆 Próximas</SL>}
          {pendingTasks.filter(t => t.date && !isToday(t.date) && !isPastDate(t.date)).map(t => { const cat = TASK_CATS.find(c => c.id === t.cat); return (
            <div key={t.id} style={{ ...CS, marginBottom: 4, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => togTask(t.id)} style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${T.border}`, background: "transparent", cursor: "pointer", flexShrink: 0 }} />
              <div style={{ flex: 1 }}><p style={{ fontSize: 12, fontWeight: 700 }}>{cat?.e} {t.title}</p>
                <p style={{ fontSize: 10, color: T.soft }}>{fDShort(t.date)}{t.time ? ` ${t.time}` : ""} · {t.assignee}</p></div>
              <button onClick={() => delTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.soft }}>✕</button></div>); })}

          {pendingTasks.filter(t => !t.date).length > 0 && <SL>📋 Sin fecha</SL>}
          {pendingTasks.filter(t => !t.date).map(t => { const cat = TASK_CATS.find(c => c.id === t.cat); return (
            <div key={t.id} style={{ ...CS, marginBottom: 4, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => togTask(t.id)} style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${T.border}`, background: "transparent", cursor: "pointer", flexShrink: 0 }} />
              <div style={{ flex: 1 }}><p style={{ fontSize: 12, fontWeight: 700 }}>{cat?.e} {t.title}</p>
                <p style={{ fontSize: 10, color: T.soft }}>{t.assignee}</p></div>
              <button onClick={() => delTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.soft }}>✕</button></div>); })}</>}

        {taskTab === "done" && doneTasks.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", color: T.soft }}><p style={{ fontSize: 40 }}>✅</p><p style={{ fontWeight: 700, marginTop: 8 }}>Sin completadas</p></div>}
        {taskTab === "done" && doneTasks.map(t => { const cat = TASK_CATS.find(c => c.id === t.cat); return (
          <div key={t.id} style={{ ...CS, marginBottom: 4, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, opacity: 0.5 }}>
            <div onClick={() => togTask(t.id)} style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${T.ok}`, background: T.ok + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.ok, cursor: "pointer" }}>✓</div>
            <div style={{ flex: 1 }}><p style={{ fontSize: 12, textDecoration: "line-through" }}>{cat?.e} {t.title}</p>
              <p style={{ fontSize: 10, color: T.soft }}>{t.doneAt ? fDShort(t.doneAt) : ""} · {t.assignee}</p></div>
            <button onClick={() => delTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.soft }}>✕</button></div>); })}
      </div>}

      {/* AI */}
      {view === "ai" && !sub && hp("use_ai") && <>
        <div style={{ padding: "12px 16px 0", animation: "fadeUp 0.3s ease", display: "flex", flexDirection: "column", height: "calc(100dvh - 68px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 34, height: 34, borderRadius: 12, background: "linear-gradient(135deg,#C4B5FD,#818CF8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
              <div><p style={{ fontSize: 15, fontWeight: 900 }}>Asistente IA</p><p style={{ fontSize: 10, color: T.soft }}>{aiMsgs.length} msgs</p></div></div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setQuickM(!quickM)} style={{ padding: "4px 7px", borderRadius: 8, background: quickM ? T.accent : T.card, color: quickM ? "#fff" : T.soft, border: `1px solid ${quickM ? T.accent : T.border}`, cursor: "pointer", fontSize: 10, fontWeight: 700 }}>⚡</button>
              {aiMsgs.length > 0 && <button onClick={() => { setAiMsgs([]); data.clearAiMessages(); }} style={{ padding: "4px 7px", borderRadius: 8, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 10, color: T.soft }}>🗑️</button>}</div></div>
          {/* Mensajes — scroll independiente, paddingBottom para que no queden detrás del input fijo */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 150, display: "flex", flexDirection: "column", gap: 6 }}>
            {aiMsgs.length === 0 && <div style={{ textAlign: "center", padding: "14px 6px" }}><p style={{ fontSize: 30, marginBottom: 6 }}>💬</p><p style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Pregunta sobre {prof.name || "tu bebé"}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>{(quickM ? QQS : QQS.slice(0, 6)).map((q, i) => <button key={i} onClick={() => { if (quickM) askAI(q); else setAiIn(q); }} style={{ padding: "6px 10px", borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, fontSize: 11, color: T.soft, cursor: "pointer" }}>{q}</button>)}</div></div>}
            {aiMsgs.map((m, i) => <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", animation: "fadeUp 0.15s ease" }}><div style={{ padding: "8px 12px", borderRadius: 16, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", background: m.role === "user" ? `linear-gradient(135deg,${T.accent},#D4623C)` : T.card, color: m.role === "user" ? "#fff" : T.text, border: m.role === "user" ? "none" : `1px solid ${T.border}`, borderBottomRightRadius: m.role === "user" ? 4 : 16, borderBottomLeftRadius: m.role === "user" ? 16 : 4 }}>{m.text}</div></div>)}
            {aiL && <div style={{ alignSelf: "flex-start", padding: "10px 14px", background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, display: "flex", gap: 4 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, animation: `dotP 1.4s ease ${i * 0.2}s infinite` }} />)}</div>}
            <div ref={chatRef} /></div>
        </div>
        {/* Input fijo justo encima del nav flotante (nav: bottom 16px + ~62px alto = 78px) */}
        <div style={{ position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "0 16px", zIndex: 50 }}>
          {quickM && aiMsgs.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingBottom: 4 }}>{QQS.slice(0, 4).map((q, i) => <button key={i} onClick={() => askAI(q)} style={{ padding: "4px 8px", borderRadius: 10, background: T.card, border: `1px solid ${T.border}`, fontSize: 10, color: T.soft, cursor: "pointer" }}>{q}</button>)}</div>}
          <div style={{ padding: "8px 0 10px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 6, background: T.bg }}>
            <input value={aiIn} onChange={e => setAiIn(e.target.value)} onKeyDown={e => e.key === "Enter" && askAI()} placeholder="Pregunta..." style={{ flex: 1, padding: "11px 14px", borderRadius: 16, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 13, outline: "none" }} />
            <button onClick={() => askAI()} disabled={aiL || !aiIn.trim()} style={{ width: 42, height: 42, borderRadius: 14, background: aiIn.trim() ? T.accent : T.border, border: "none", cursor: aiIn.trim() ? "pointer" : "default", color: "#fff", fontSize: 16 }}>↑</button>
          </div>
        </div>
      </>}

      {/* QUESTIONS */}
      {view === "questions" && !sub && <div style={{ padding: "14px 16px 100px", animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><Bk fn={() => setView("home")} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>📋 Preguntas</h2></div>
        {hp("ask_questions") && <div style={{ display: "flex", gap: 6, marginBottom: 14 }}><input value={nq} onChange={e => setNq(e.target.value)} onKeyDown={e => e.key === "Enter" && addQ()} placeholder="Nueva pregunta..." style={{ flex: 1, padding: "11px 14px", borderRadius: 14, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 13, outline: "none" }} />
          <button onClick={addQ} style={{ width: 42, height: 42, borderRadius: 14, background: T.accent, border: "none", cursor: "pointer", color: "#fff", fontSize: 18 }}>+</button></div>}
        {hp("view_questions") && qs.filter(q => q.status === "pending").length > 0 && <><SL>Pendientes</SL>
          {qs.filter(q => q.status === "pending").map(q => <div key={q.id} style={{ ...CS, marginBottom: 4, padding: "9px 11px", display: "flex", alignItems: "center", gap: 8 }}>
            {hp("ask_questions") && <button onClick={() => togQ(q.id)} style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: `2px solid ${T.accent}`, background: "transparent", cursor: "pointer" }} />}
            <div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 600 }}>{q.text}</p><p style={{ fontSize: 10, color: T.soft }}>{q.by ? `Por ${q.by}` : ""}{q.ts ? ` · ${fD(q.ts)}` : ""}</p></div>
            {hp("ask_questions") && <button onClick={() => delQ(q.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.soft }}>✕</button>}</div>)}</>}
        {hp("view_questions") && qs.filter(q => q.status === "done").length > 0 && <><SL>Respondidas</SL>
          {qs.filter(q => q.status === "done").map(q => <div key={q.id} style={{ ...CS, marginBottom: 4, padding: "9px 11px", display: "flex", alignItems: "center", gap: 8, opacity: 0.4 }}>
            {hp("ask_questions") && <div onClick={() => togQ(q.id)} style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${T.ok}`, background: T.ok + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.ok, cursor: "pointer" }}>✓</div>}
            <div style={{ flex: 1 }}><p style={{ fontSize: 13, textDecoration: "line-through" }}>{q.text}</p><p style={{ fontSize: 10, color: T.soft }}>{q.by ? `Por ${q.by}` : ""}</p></div></div>)}</>}
        {!hp("view_questions") && !hp("ask_questions") && <div style={{ textAlign: "center", padding: "40px 20px", color: T.soft }}><p style={{ fontSize: 14 }}>No tienes acceso a preguntas</p></div>}
      </div>}

      {/* PROFILE */}
      {view === "profile" && !sub && hp("manage_family") && <div style={{ padding: "14px 16px 100px", animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><Bk fn={() => setView("home")} /><h2 style={{ fontSize: 19, fontWeight: 900 }}>⚙️ Perfil</h2></div>
        <div style={{ ...CS, padding: 18, marginBottom: 10, textAlign: "center" }}>
          <div onClick={() => fileRef.current?.click()} style={{ cursor: "pointer", display: "inline-block", position: "relative", marginBottom: 8 }}><Av sz={64} />
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>✏️</div></div>
          <br /><input value={prof.name} onChange={e => setProf(p => ({ ...p, name: e.target.value }))} style={{ fontSize: 20, fontWeight: 900, border: "none", borderBottom: `2px solid ${T.accent}`, outline: "none", background: "transparent", textAlign: "center", width: "80%", padding: "2px 0" }} /></div>
        <div style={{ ...CS, padding: 14, marginBottom: 8 }}><SL>Fecha de nacimiento</SL>
          <input type="date" value={prof.birthDate || ""} onChange={e => setProf(p => ({ ...p, birthDate: e.target.value }))} style={{ width: "100%", padding: 11, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 14, outline: "none", fontWeight: 700, marginBottom: 6 }} />
          {prof.birthDate && <p style={{ fontSize: 13, color: T.accent, fontWeight: 700 }}>🎂 {fmtAge(prof.birthDate)} · {prof.ageRange}</p>}
          {!prof.birthDate && <><p style={{ fontSize: 11, color: T.soft, marginBottom: 6 }}>O rango manual:</p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {["0-3 meses", "3-6 meses", "6-9 meses", "9-12 meses"].map(a => <button key={a} onClick={() => setProf(p => ({ ...p, ageRange: a }))} style={{ padding: 10, borderRadius: 12, cursor: "pointer", background: prof.ageRange === a ? T.accentL : T.card, border: `2px solid ${prof.ageRange === a ? T.accent : T.border}`, fontSize: 12, fontWeight: prof.ageRange === a ? 800 : 600, color: prof.ageRange === a ? T.accent : T.text }}>{a}</button>)}</div></>}</div>
        <div style={{ ...CS, padding: 14, marginBottom: 8 }}><SL>Tema</SL><button onClick={() => setDark(!dark)} style={{ width: "100%", padding: 11, borderRadius: 12, background: T.card, border: `1.5px solid ${T.border}`, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{dark ? "☀️ Claro" : "🌙 Oscuro"}</button></div>
        {hp("export_data") && <div style={{ ...CS, padding: 14, marginBottom: 8 }}><SL>Exportar</SL><button onClick={exportCSV} style={{ width: "100%", padding: 11, borderRadius: 12, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>📥 CSV ({ent.length} registros)</button></div>}
        <div style={{ ...CS, padding: 14 }}><SL>Datos</SL><p style={{ fontSize: 12, color: T.soft, marginBottom: 6 }}>📊 {ent.length} registros · 📋 {qs.length} preguntas · 🌟 {msDone.length} hitos · 💬 {aiMsgs.length} IA · 👥 {mem.length} miembros</p>
          <button onClick={resetAll} style={{ width: "100%", padding: 10, borderRadius: 12, background: dark ? "#2D0F0F" : "#FEE2E2", color: "#EF4444", border: `1px solid ${dark ? "#441111" : "#FECACA"}`, cursor: "pointer", fontSize: 12, fontWeight: 700, marginTop: 6 }}>Borrar todo y reiniciar</button></div>
      </div>}

      {/* NAV */}
      {!sub && !msD && !editM && (() => {
        const NAV = [
          { id: "home",      i: "🏠", b: 0,                                                              show: true },
          { id: "history",   i: "📊", b: 0,                                                              show: hp("view_history") },
          { id: "ai",        i: "🤖", b: 0,                                                              show: hp("use_ai") },
          { id: "tasks",     i: "📌", b: pendingTasks.length,                                            show: true },
          { id: "questions", i: "📋", b: qs.filter(q => q.status === "pending").length,                 show: hp("view_questions") || hp("ask_questions") },
        ].filter(x => x.show);
        const activeI = NAV.findIndex(x => x.id === view);
        const n = NAV.length;
        return (
          <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 398, backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", background: dark ? "rgba(15,10,6,0.78)" : "rgba(255,255,255,0.58)", border: dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.88)", boxShadow: dark ? "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)" : "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)", borderRadius: 30, display: "flex", alignItems: "center", padding: "6px 4px", zIndex: 100 }}>
            {/* pill indicator */}
            {activeI >= 0 && <div style={{ position: "absolute", width: `calc(${100 / n}% - 8px)`, height: 50, borderRadius: 22, background: dark ? "rgba(227,111,71,0.22)" : "rgba(227,111,71,0.14)", border: dark ? "1px solid rgba(227,111,71,0.32)" : "1px solid rgba(227,111,71,0.24)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: dark ? "inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.9)", left: `calc(${(activeI / n) * 100}% + 4px)`, top: "50%", transform: "translateY(-50%)", transition: "left 0.35s cubic-bezier(0.34,1.56,0.64,1)", pointerEvents: "none" }} />}
            {NAV.map(x => (
              <button key={x.id} onClick={() => { setView(x.id); setSub(null); }} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 4px", position: "relative", zIndex: 1 }}>
                {x.b > 0 && <div style={{ position: "absolute", top: 6, right: "calc(50% - 18px)", minWidth: 15, height: 15, borderRadius: 8, background: T.accent, color: "#fff", fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{x.b}</div>}
                <span style={{ fontSize: 26, display: "block", transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s", transform: view === x.id ? "scale(1.2)" : "scale(0.95)", opacity: view === x.id ? 1 : 0.42 }}>{x.i}</span>
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
