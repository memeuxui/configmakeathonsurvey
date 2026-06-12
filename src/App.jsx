import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────
// ⚙️  SUPABASE CONFIG — reemplazá con tus datos reales
//     Variables de entorno para producción:
//     VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
// ─────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://mprtuwrqbkcabrwydzlk.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcnR1d3JxYmtjYWJyd3lkemxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDIyNjksImV4cCI6MjA5NjgxODI2OX0.9Ap5Nt1BJicTaTe4_xvP8Yn8g9Spn5Xv_wteerf1W4A";
const INSIGHT_PASS  = "meme2024";             // contraseña para insights privados

const isConfigured  = SUPABASE_URL !== "TU_SUPABASE_URL";

// ─────────────────────────────────────────────────────────
// 🌐 TRANSLATIONS
// ─────────────────────────────────────────────────────────
const T = {
  es: {
    lang: "es",
    nav: { home:"inicio", results:"resultados", insights:"✏️" },
    home: {
      tag1:"investigación", tag2:"encuesta",
      title1:"¿Cómo afecta el ", titleBold:"uso del celular", title2:" en reuniones sociales?",
      hashtag:"#configmakeathon",
      stat1v:"~3 min", stat1l:"DURACIÓN",
      stat2v:"100%",   stat2l:"ANÓNIMO",
      stat3v:"~20",    stat3l:"PREGUNTAS",
      cta:"Responder encuesta →",
      ctaResults:"Ver resultados 📊",
      preview:"⚠️ Preview mode — usando almacenamiento local.",
    },
    survey: { continue:"Continuar →", back:"←", send:"Enviar respuestas →", optional:"Opcional" },
    thanks: { title:"¡Gracias!", body:"{tr.thanks.body}", back:"Volver al inicio" },
    results: {
      tag2:"resultados", loading:"Cargando resultados…", empty:"Todavía no hay respuestas.",
      title1:"¿Cómo afecta el ", titleBold:"uso del celular", title2:" en reuniones sociales?",
      resp:"respuesta", resps:"respuestas", recibida:"recibida", recibidas:"recibidas",
      tabCharts:"📊 gráficos", tabOpen:"💬 abiertas",
      noAnswers:"Sin respuestas todavía",
    },
    insightLogin: { title:"Agregar insights", sub:"Acceso privado de la investigadora", placeholder:"Código de acceso", btn:"Ingresar", wrong:"Código incorrecto" },
    insights: {
      tag:"privado", tag2:"mis insights", saved:"guardado ✓",
      title:"Panel privado", sub:"Solo lo ves vos.",
      tabInsights:"✏️ insights", tabResponses:"🗑️ respuestas",
      noInsight:"Sin insight todavía", edit:"Editar ✏️", add:"+ Agregar insight",
      save:"Guardar", saving:"Guardando…", cancel:"Cancelar",
      loading:"Cargando…", noResps:"No hay respuestas todavía.",
      confirm:"Confirmar borrar", deleting:"Borrando…", cancelDel:"Cancelar",
      response:"Respuesta",
    },
    sections: { reuniones:"reuniones", juegos:"juegos de mesa", cerrar:"para cerrar" },
    questions: [
      { id:"edad", text:"¿Cuántos años tenés?", options:["13–17","18–24","25–34","35–44","45–54","55 o más"] },
      { id:"genero", text:"¿Con qué género te identificás?", options:["Femenino","Masculino","No binario","Prefiero no decirlo"] },
      { id:"frecuencia_reuniones", text:"¿Con qué frecuencia te reunís en persona con amigos, familiares o compañeros?", options:["Más de una vez a la semana","Una vez a la semana","Cada 15 días","Una vez al mes"] },
      { id:"otros_usan_celu", text:"Notás cuando alguien se pone a usar el celular?", options:["Sí, mucho","Sí, pero poco","No lo usan","No lo he notado"], hint:null },
      { id:"molestia_nivel", text:"¿Qué tan molesto te resulta?", options:["Muy molesto","Me molesta poco","Me da igual","No me molesta"] },
      { id:"molestia_razon", text:"¿Por qué te molesta o te llama la atención?", hint:"Podés elegir más de una opción", options:["Corta la conversación y la dinámica del grupo","Termina contagiando a los demás","Se pierde la gracia de estar juntos","Genera tensión o incomodidad","La persona se desconecta del momento","No me molesta / no aplica"] },
      { id:"molestia_situacion", text:"¿Recordás alguna situación donde el celular arruinó un momento compartido?", hint:"Opcional — podés ser tan breve o detallado/a como quieras", placeholder:"Contanos si querés…" },
      { id:"yo_uso_celu", text:"¿Vos qué tanto usás el celular en reuniones sociales?", labelMin:"Nada", labelMax:"Mucho" },
      { id:"por_que_uso", text:"¿Por qué lo usás en reuniones?", hint:"Podés elegir más de una opción", options:["Me aburro en la reunión","Me siento incómodo/a o con malestar","Todos están en el celular, así que yo también","Tengo que atender algo de trabajo","Estoy esperando un mensaje importante","Las redes son más entretenidas en ese momento"] },
      { id:"que_frenaria_uso", text:"¿Qué debería pasar para que no uses el celular en una reunión?", hint:"Opcional", placeholder:"Escribí lo que se te ocurra…" },
      { id:"frecuencia_juegos", text:"¿Con qué frecuencia jugás juegos de mesa?", options:["Una vez a la semana o más","Dos veces al mes","Una vez al mes","Menos de una vez al mes","Nunca o casi nunca"] },
      { id:"con_quien_juega", text:"¿Con quién jugás habitualmente?", hint:"Podés elegir más de una opción", options:["Con amigos","Con familia","Con mi pareja","Con compañeros de trabajo o estudio","Con personas que conocí jugando"] },
      { id:"tipo_juegos", text:"¿Qué tipo de juegos de mesa preferís?", hint:"Podés elegir más de una opción", options:["Party games y juegos grupales (Uno, Exploding Kittens, Codenames)","Juegos de estrategia (Catan, Carcassonne, Ticket to Ride)","Juegos de rol o narrativos (D&D, Dixit)","Juegos de trivia o conocimiento general","Juegos clásicos (ajedrez, damas, dominó)","Juegos de cartas"] },
      { id:"por_que_juega", text:"¿Por qué jugás juegos de mesa?", hint:"Podés elegir más de una opción", options:["Para divertirme y reírme con otros","Para competir y ganar","Para pasar el tiempo en reuniones","Para desconectarme de las pantallas","Para fortalecer el vínculo con otras personas","Porque me gustan el desafío mental y la estrategia"] },
      { id:"celu_jugando", text:"¿Jugás desde el celular con otras personas presentes?", hint:"Podés elegir más de una opción", options:["Sí, jugamos todos juntos en el mismo lugar con nuestros celus","Sí, pero de forma remota (cada uno en su casa)","A veces, dependiendo del juego","No, prefiero los juegos de mesa físicos","No juego desde el celular"] },
      { id:"celu_en_partida", text:"Durante una partida, ¿notás que alguien usa el celular?", options:["Sí, todo el tiempo","Sí, bastante seguido","A veces, pero no siempre","Rara vez","No, nunca lo noté"] },
      { id:"celu_afecta_juego", text:"¿Cómo afecta al juego?", hint:"Podés elegir más de una opción", options:["Hay que recordarle su turno constantemente","Corta el ritmo y la dinámica de la partida","Termina contagiando a los demás jugadores","Se pierde la gracia de jugar juntos","Genera tensión o incomodidad en el grupo","No me afecta"] },
      { id:"reaccion_grupo", text:"¿Cómo reaccionó el grupo cuando alguien usó el celular durante una partida?", hint:"Opcional", placeholder:"Contanos si querés…" },
      { id:"barreras", text:"¿Alguna vez dejaste de reunirte o de jugar por alguna de estas razones?", hint:"Podés elegir más de una opción", options:["Era difícil reunir a todos en el mismo lugar","Explicar las reglas llevaba demasiado tiempo","No teníamos el juego o la actividad a mano","Había que instalar una app y no todos querían","La propuesta no le interesó a alguien del grupo","No, nunca me pasó esto"] },
      { id:"apertura", text:"Si pudieras arrancar una actividad grupal en menos de 30 segundos, sin instalar nada, ¿la probarías?", options:["Sí, sin dudarlo","Probablemente sí","Depende de qué sea","Probablemente no","No, prefiero las actividades tradicionales"] },
    ],
  },
  en: {
    lang: "en",
    nav: { home:"home", results:"results", insights:"✏️" },
    home: {
      tag1:"research", tag2:"survey",
      title1:"How does ", titleBold:"phone use", title2:" affect social gatherings?",
      hashtag:"#configmakeathon",
      stat1v:"~3 min", stat1l:"DURATION",
      stat2v:"100%",   stat2l:"ANONYMOUS",
      stat3v:"~20",    stat3l:"QUESTIONS",
      cta:"Take the survey →",
      ctaResults:"View results 📊",
      preview:"⚠️ Preview mode — using local storage.",
    },
    survey: { continue:"Continue →", back:"←", send:"Submit answers →", optional:"Optional" },
    thanks: { title:"Thank you!", body:"Your answers are anonymous and help me a lot with this research. ✨", back:"Back to home" },
    results: {
      tag2:"results", loading:"Loading results…", empty:"No responses yet.",
      title1:"How does ", titleBold:"phone use", title2:" affect social gatherings?",
      resp:"response", resps:"responses", recibida:"received", recibidas:"received",
      tabCharts:"📊 charts", tabOpen:"💬 open answers",
      noAnswers:"No answers yet",
    },
    insightLogin: { title:"Add insights", sub:"Private researcher access", placeholder:"Access code", btn:"Enter", wrong:"Incorrect code" },
    insights: {
      tag:"private", tag2:"my insights", saved:"saved ✓",
      title:"Private panel", sub:"Only you can see this.",
      tabInsights:"✏️ insights", tabResponses:"🗑️ responses",
      noInsight:"No insight yet", edit:"Edit ✏️", add:"+ Add insight",
      save:"Save", saving:"Saving…", cancel:"Cancel",
      loading:"Loading…", noResps:"No responses yet.",
      confirm:"Confirm delete", deleting:"Deleting…", cancelDel:"Cancel",
      response:"Response",
    },
    sections: { reuniones:"social gatherings", juegos:"board games", cerrar:"to wrap up" },
    questions: [
      { id:"edad", text:"How old are you?", options:["13–17","18–24","25–34","35–44","45–54","55 or older"] },
      { id:"genero", text:"Which gender do you identify with?", options:["Female","Male","Non-binary","Prefer not to say"] },
      { id:"frecuencia_reuniones", text:"How often do you meet in person with friends, family or colleagues?", options:["More than once a week","Once a week","Every two weeks","Once a month"] },
      { id:"otros_usan_celu", text:"Do you notice when someone starts using their phone?", options:["Yes, a lot","Yes, a little","They don't use it","I haven't noticed"], hint:null },
      { id:"molestia_nivel", text:"How much does it bother you?", options:["Very much","A little","Doesn't matter","Not at all"] },
      { id:"molestia_razon", text:"Why does it bother or catch your attention?", hint:"You can choose more than one option", options:["It breaks the conversation flow","It spreads to everyone else","The point of being together is lost","It creates tension or discomfort","The person disconnects from the moment","It doesn't bother me / not applicable"] },
      { id:"molestia_situacion", text:"Do you remember a situation where a phone ruined a shared moment?", hint:"Optional — as brief or detailed as you like", placeholder:"Tell us if you want…" },
      { id:"yo_uso_celu", text:"How much do you use your phone at social gatherings?", labelMin:"Not at all", labelMax:"A lot" },
      { id:"por_que_uso", text:"Why do you use it at gatherings?", hint:"You can choose more than one option", options:["I get bored","I feel uncomfortable","Everyone else is on their phone too","I need to check something for work","I'm waiting for an important message","Social media is more entertaining"] },
      { id:"que_frenaria_uso", text:"What would have to happen for you not to use your phone at a gathering?", hint:"Optional", placeholder:"Write whatever comes to mind…" },
      { id:"frecuencia_juegos", text:"How often do you play board games?", options:["Once a week or more","Twice a month","Once a month","Less than once a month","Never or almost never"] },
      { id:"con_quien_juega", text:"Who do you usually play with?", hint:"You can choose more than one option", options:["Friends","Family","My partner","Work or study colleagues","People I met through gaming"] },
      { id:"tipo_juegos", text:"What type of board games do you prefer?", hint:"You can choose more than one option", options:["Party games (Uno, Exploding Kittens, Codenames)","Strategy games (Catan, Carcassonne, Ticket to Ride)","Role-playing or narrative games (D&D, Dixit)","Trivia or general knowledge games","Classic games (chess, checkers, dominoes)","Card games"] },
      { id:"por_que_juega", text:"Why do you play board games?", hint:"You can choose more than one option", options:["To have fun and laugh with others","To compete and win","To pass the time at gatherings","To disconnect from screens","To strengthen bonds with others","Because I enjoy mental challenges and strategy"] },
      { id:"celu_jugando", text:"Do you play games on your phone with others present?", hint:"You can choose more than one option", options:["Yes, we all play together in the same place","Yes, but remotely (each at their own home)","Sometimes, depending on the game","No, I prefer physical board games","I don't play on my phone"] },
      { id:"celu_en_partida", text:"During a game, do you notice anyone using their phone?", options:["Yes, all the time","Yes, quite often","Sometimes, but not always","Rarely","No, never noticed"] },
      { id:"celu_afecta_juego", text:"How does it affect the game?", hint:"You can choose more than one option", options:["You have to remind them of their turn","It breaks the rhythm of the game","It spreads to other players","The fun of playing together is lost","It creates tension or discomfort","It doesn't affect me"] },
      { id:"reaccion_grupo", text:"How did the group react when someone used their phone during a game?", hint:"Optional", placeholder:"Tell us if you want…" },
      { id:"barreras", text:"Have you ever stopped meeting up or playing for any of these reasons?", hint:"You can choose more than one option", options:["It was hard to get everyone together","Explaining the rules took too long","We didn't have the game or activity available","Everyone had to install an app and some didn't want to","Someone in the group wasn't interested","No, this has never happened to me"] },
      { id:"apertura", text:"If you could start a group activity in under 30 seconds, without installing anything, would you try it?", options:["Yes, without a doubt","Probably yes","Depends on what it is","Probably not","No, I prefer traditional activities"] },
    ],
  },
};


// ── Supabase helpers (REST API — sin SDK) ─────────────────
const sb = {
  headers: {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
  },
  async insert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...this.headers, Prefer: "return=minimal" },
      body: JSON.stringify(data),
    });
    return r.ok;
  },
  async select(table, query = "") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${query}`, {
      headers: this.headers,
    });
    return r.ok ? r.json() : [];
  },
  async upsert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...this.headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(data),
    });
    return r.ok;
  },
  async delete(table, id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { ...this.headers, Prefer: "return=minimal" },
    });
    if (!r.ok) { const e = await r.text(); console.error("Delete error:", r.status, e); }
    return r.ok;
  },
};

// ── Fallback: window.storage (preview en Claude) ──────────
const local = {
  async saveResp(a) {
    try { await window.storage.set(`r_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, JSON.stringify(a), true); return true; } catch { return false; }
  },
  async loadResps() {
    try {
      const l = await window.storage.list("r_", true);
      const o = [];
      for (const k of (l?.keys || [])) { try { const r = await window.storage.get(k, true); if (r?.value) o.push(JSON.parse(r.value)); } catch {} }
      return o;
    } catch { return []; }
  },
  async saveInsights(d) { try { await window.storage.set("insights_v3", JSON.stringify(d)); return true; } catch { return false; } },
  async loadInsights() { try { const r = await window.storage.get("insights_v3"); return r ? JSON.parse(r.value) : {}; } catch { return {}; } },
};

// ── Data layer (usa Supabase si está configurado) ──────────
const db = {
  async saveResponse(answers) {
    if (isConfigured) return sb.insert("responses", { data: answers });
    return local.saveResp(answers);
  },
  async loadResponses() {
    if (isConfigured) {
      const rows = await sb.select("responses", "&order=created_at.desc");
      return Array.isArray(rows) ? rows.map(r => r.data) : [];
    }
    return local.loadResps();
  },
  async saveInsights(insights) {
    if (isConfigured) return sb.upsert("insights", { id: "main", content: JSON.stringify(insights) });
    return local.saveInsights(insights);
  },
  async loadInsights() {
    if (isConfigured) {
      const rows = await sb.select("insights", "&id=eq.main");
      return rows?.[0]?.content ? JSON.parse(rows[0].content) : {};
    }
    return local.loadInsights();
  },
  async loadResponsesWithIds() {
    if (isConfigured) {
      const rows = await sb.select("responses", "&order=created_at.desc");
      return Array.isArray(rows) ? rows : [];
    }
    return [];
  },
  async deleteResponse(id) {
    if (isConfigured) return sb.delete("responses", id);
    return false;
  },
};

// ─────────────────────────────────────────────────────────
// 🎨 TOKENS — meme.uxui dark aesthetic (Figma-matched)
// ─────────────────────────────────────────────────────────
const C = {
  bg:      "#07111C",
  card:    "#0D1B26",
  card2:   "#122030",
  border:  "rgba(255,255,255,0.07)",
  borderS: "rgba(255,255,255,0.12)",
  ink:     "#FFFFFF",
  sub:     "rgba(255,255,255,0.45)",
  primary: "#168AB2",
  pink:    "#168AB2",
  cyan:    "#168AB2",
  green:   "#7FE547",
  yellow:  "#FFE14D",
  violet:  "#8B5CF6",
  orange:  "#FF6B2B",
};

const SECTION_COLORS = {
  "reuniones":     C.primary,
  "juegos de mesa": C.cyan,
  "para cerrar":   C.violet,
};

// ─────────────────────────────────────────────────────────
// 📋 QUESTIONS
// ─────────────────────────────────────────────────────────
const Q = [
  { id:"edad", section:null, type:"single", text:"¿Cuántos años tenés?",
    options:["13–17","18–24","25–34","35–44","45–54","55 o más"] },
  { id:"genero", section:null, type:"single", text:"¿Con qué género te identificás?",
    options:["Femenino","Masculino","No binario","Prefiero no decirlo"] },
  { id:"frecuencia_reuniones", section:"reuniones", type:"single",
    text:"¿Con qué frecuencia te reunís en persona con amigos, familiares o compañeros?",
    options:["Más de una vez a la semana","Una vez a la semana","Cada 15 días","Una vez al mes"] },
  { id:"otros_usan_celu", section:null, type:"single",
    text:"Notás cuando alguien se pone a usar el celular?",
    options:["Sí, mucho","Sí, pero poco","No lo usan","No lo he notado"],
    logic:a=>(a==="No lo usan"||a==="No lo he notado")?"yo_uso_celu":"molestia_nivel" },
  { id:"molestia_nivel", section:null, type:"single", text:"¿Qué tan molesto te resulta?",
    options:["Muy molesto","Me molesta poco","Me da igual","No me molesta"] },
  { id:"molestia_razon", section:null, type:"multi",
    text:"¿Por qué te molesta o te llama la atención?",
    hint:"Podés elegir más de una opción",
    options:["Corta la conversación y la dinámica del grupo","Termina contagiando a los demás","Se pierde la gracia de estar juntos","Genera tensión o incomodidad","La persona se desconecta del momento","No me molesta / no aplica"] },
  { id:"molestia_situacion", section:null, type:"open", optional:true,
    text:"¿Recordás alguna situación donde el celular arruinó un momento compartido?",
    hint:"Opcional", placeholder:"Contanos si querés…" },
  { id:"yo_uso_celu", section:null, type:"scale",
    text:"¿Vos qué tanto usás el celular en reuniones sociales?",
    labelMin:"Nada", labelMax:"Mucho",
    logic:a=>a>=4?"por_que_uso":"frecuencia_juegos" },
  { id:"por_que_uso", section:null, type:"multi", text:"¿Por qué lo usás en reuniones?",
    hint:"Podés elegir más de una opción",
    options:["Me aburro en la reunión","Me siento incómodo/a o con malestar","Todos están en el celular, así que yo también","Tengo que atender algo de trabajo","Estoy esperando un mensaje importante","Las redes son más entretenidas en ese momento"] },
  { id:"que_frenaria_uso", section:null, type:"open", optional:true,
    text:"¿Qué debería pasar para que no uses el celular en una reunión?",
    hint:"Opcional", placeholder:"Escribí lo que se te ocurra…" },
  { id:"frecuencia_juegos", section:"juegos de mesa", type:"single",
    text:"¿Con qué frecuencia jugás juegos de mesa?",
    options:["Una vez a la semana o más","Dos veces al mes","Una vez al mes","Menos de una vez al mes","Nunca o casi nunca"],
    logic:a=>a==="Nunca o casi nunca"?"barreras":"con_quien_juega" },
  { id:"con_quien_juega", section:null, type:"multi", text:"¿Con quién jugás habitualmente?",
    hint:"Podés elegir más de una opción",
    options:["Con amigos","Con familia","Con mi pareja","Con compañeros de trabajo o estudio","Con personas que conocí jugando"] },
  { id:"tipo_juegos", section:null, type:"multi", text:"¿Qué tipo de juegos de mesa preferís?",
    hint:"Podés elegir más de una opción",
    options:["Party games y juegos grupales (Uno, Exploding Kittens, Codenames)","Juegos de estrategia (Catan, Carcassonne, Ticket to Ride)","Juegos de rol o narrativos (D&D, Dixit)","Juegos de trivia o conocimiento general","Juegos clásicos (ajedrez, damas, dominó)","Juegos de cartas"] },
  { id:"por_que_juega", section:null, type:"multi", text:"¿Por qué jugás juegos de mesa?",
    hint:"Podés elegir más de una opción",
    options:["Para divertirme y reírme con otros","Para competir y ganar","Para pasar el tiempo en reuniones","Para desconectarme de las pantallas","Para fortalecer el vínculo con otras personas","Porque me gustan el desafío mental y la estrategia"] },
  { id:"celu_jugando", section:null, type:"multi", text:"¿Jugás desde el celular con otras personas presentes?",
    hint:"Podés elegir más de una opción",
    options:["Sí, jugamos todos juntos en el mismo lugar con nuestros celus","Sí, pero de forma remota (cada uno en su casa)","A veces, dependiendo del juego","No, prefiero los juegos de mesa físicos","No juego desde el celular"] },
  { id:"celu_en_partida", section:null, type:"single",
    text:"Durante una partida, ¿notás que alguien usa el celular?",
    options:["Sí, todo el tiempo","Sí, bastante seguido","A veces, pero no siempre","Rara vez","No, nunca lo noté"],
    logic:a=>a==="No, nunca lo noté"?"barreras":"celu_afecta_juego" },
  { id:"celu_afecta_juego", section:null, type:"multi", text:"¿Cómo afecta al juego?",
    hint:"Podés elegir más de una opción",
    options:["Hay que recordarle su turno constantemente","Corta el ritmo y la dinámica de la partida","Termina contagiando a los demás jugadores","Se pierde la gracia de jugar juntos","Genera tensión o incomodidad en el grupo","No me afecta"] },
  { id:"reaccion_grupo", section:null, type:"open", optional:true,
    text:"¿Cómo reaccionó el grupo cuando alguien usó el celular durante una partida?",
    hint:"Opcional", placeholder:"Contanos si querés…" },
  { id:"barreras", section:"para cerrar", type:"multi",
    text:"¿Alguna vez dejaste de reunirte o de jugar por alguna de estas razones?",
    hint:"Podés elegir más de una opción",
    options:["Era difícil reunir a todos en el mismo lugar","Explicar las reglas llevaba demasiado tiempo","No teníamos el juego o la actividad a mano","Había que instalar una app y no todos querían","La propuesta no le interesó a alguien del grupo","No, nunca me pasó esto"] },
  { id:"apertura", section:null, type:"single",
    text:"Si pudieras arrancar una actividad grupal en menos de 30 segundos, sin instalar nada, ¿la probarías?",
    options:["Sí, sin dudarlo","Probablemente sí","Depende de qué sea","Probablemente no","No, prefiero las actividades tradicionales"] },
];

function buildFlow(answers) {
  const ids = Q.map(q=>q.id); const flow=[]; let i=0;
  while(i<Q.length){ const q=Q[i]; flow.push(q.id);
    const a=answers[q.id];
    if(q.logic&&a!==undefined){const ni=ids.indexOf(q.logic(a));if(ni!==-1){i=ni;continue;}} i++; }
  return flow;
}

// ─────────────────────────────────────────────────────────
// 🧩 SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────
function Pill({ color, filled, children, weight }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      background: filled ? color : "transparent",
      color: filled ? "#07111C" : color,
      border: `1.5px solid ${color}`,
      padding:"4px 12px", borderRadius:99,
      fontSize:11, fontWeight: weight || 700, letterSpacing:"0.04em", textTransform:"lowercase",
    }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, bg, color, disabled, fullWidth, outline, small }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onPointerDown={()=>setPressed(true)}
      onPointerUp={()=>setPressed(false)}
      onPointerLeave={()=>setPressed(false)}
      style={{
        padding: small ? "8px 16px" : "16px 20px",
        background: disabled ? "rgba(255,255,255,0.06)" : outline ? "transparent" : bg,
        color: disabled ? "rgba(255,255,255,0.25)" : color,
        border: "none",
        borderRadius: 14, fontSize: small ? 13 : 16, fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer", fontFamily:"inherit",
        width: fullWidth ? "100%" : "auto", lineHeight: 1.2,
        transform: pressed && !disabled ? "scale(0.97)" : "scale(1)",
        transition: "transform .1s, background .15s",
        letterSpacing: "-0.2px",
      }}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// 🏠 APP ROOT
// ─────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [lang, setLang] = useState("es");
  const tr = T[lang];
  const [resps, setResps] = useState([]);
  const [loadingR, setLoadingR] = useState(false);
  const [iCode, setICode] = useState("");
  const [iErr, setIErr] = useState(false);
  const [insights, setInsights] = useState({});

  const goResults = async () => {
    setScreen("results"); setLoadingR(true);
    setResps(await db.loadResponses()); setLoadingR(false);
  };
  const goInsights = async () => {
    if (iCode === INSIGHT_PASS) {
      setIErr(false); setInsights(await db.loadInsights()); setScreen("insights");
    } else setIErr(true);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Schibsted Grotesk','Inter',system-ui,sans-serif", WebkitFontSmoothing:"antialiased", color:C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;500;600;700;800;900&family=Schibsted+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        @keyframes popIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        textarea,input { font-family:inherit; }
        ::-webkit-scrollbar { width:0; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:20, background:"rgba(12,11,20,0.85)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.04)", padding:"13px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:0 }}>
          {screen==="results" || screen==="insightLogin" || screen==="insights"
            ? <><Pill color={C.primary} filled weight={600}>investigación</Pill><Pill color={C.primary} weight={300}>resultados</Pill></>
            : <span style={{ width:7, height:7, borderRadius:"50%", background:C.primary, display:"inline-block", alignSelf:"center" }}/>
          }
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Language switcher */}
          <button onClick={()=>setLang(lang==="es"?"en":"es")}
            style={{ fontSize:13, fontWeight:700, color:C.primary, background:C.primary+"22", border:"none", borderRadius:20, padding:"6px 14px", cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.05em" }}>
            {lang==="es" ? "EN" : "ES"}
          </button>
          {screen!=="home" && <Btn small outline color={C.sub} onClick={()=>setScreen("home")}>{tr.nav.home}</Btn>}
          {screen==="results" && <Btn small outline color={C.violet} onClick={()=>setScreen("insightLogin")}>{tr.nav.insights}</Btn>}
          {screen!=="results" && screen!=="home" && <Btn small outline color={C.sub} onClick={goResults}>{tr.nav.results}</Btn>}
        </div>
      </nav>

      {screen==="home"         && <HomeScreen onSurvey={()=>setScreen("survey")} onResults={goResults} tr={tr}/>}
      {screen==="survey"       && <SurveyView onDone={async a=>{await db.saveResponse(a);setScreen("thanks");}} tr={tr}/>}
      {screen==="thanks"       && <ThanksScreen onBack={()=>setScreen("home")} tr={tr}/>}
      {screen==="results"      && <ResultsView resps={resps} loading={loadingR} tr={tr}/>}
      {screen==="insightLogin" && <InsightLogin code={iCode} setCode={setICode} err={iErr} onGo={goInsights} tr={tr}/>}
      {screen==="insights"     && <InsightsView insights={insights} setInsights={setInsights} tr={tr}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 🏠 HOME
// ─────────────────────────────────────────────────────────
function HomeScreen({ onSurvey, onResults, tr }) {
  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"32px 20px 80px", animation:"slideUp .3s ease" }}>

      {/* Hero card */}
      <div style={{ background:C.card, border:"none", borderRadius:24, padding:"28px 24px", marginBottom:14 }}>
        <div style={{ display:"flex", gap:0, flexWrap:"wrap", marginBottom:20 }}>
          <Pill color={C.primary} filled weight={600}>{tr.home.tag1}</Pill>
          <Pill color={C.primary} weight={300}>{tr.home.tag2}</Pill>
        </div>
        <h1 style={{ fontSize:36, fontWeight:300, lineHeight:1.15, margin:"0 0 10px", letterSpacing:"-0.5px", color:C.ink, fontFamily:"'Lexend Deca',sans-serif" }}>
          {tr.home.title1}<strong style={{ fontWeight:600 }}>{tr.home.titleBold}</strong>{tr.home.title2}
        </h1>
        <p style={{ fontSize:14, color:C.sub, margin:0, fontWeight:500 }}>{tr.home.hashtag}</p>
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
        {[[tr.home.stat1v,tr.home.stat1l],[tr.home.stat2v,tr.home.stat2l],[tr.home.stat3v,tr.home.stat3l]].map(([v,l])=>(
          <div key={l} style={{ background:C.card, border:"none", borderRadius:16, padding:"18px 10px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, color:C.ink, letterSpacing:"-0.5px" }}>{v}</div>
            <div style={{ fontSize:10, fontWeight:600, color:C.sub, marginTop:4, letterSpacing:"0.08em" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <Btn onClick={onSurvey} bg={C.primary} color="#fff" fullWidth>{tr.home.cta}</Btn>
        <Btn onClick={onResults} outline color={C.sub} fullWidth>{tr.home.ctaResults}</Btn>
      </div>

      {!isConfigured && (
        <div style={{ marginTop:20, padding:"12px 16px", background:"rgba(255,227,77,0.08)", border:`1px solid ${C.yellow}44`, borderRadius:12 }}>
          <p style={{ fontSize:12, color:C.yellow, margin:0, fontWeight:600 }}>
            {tr.home.preview}
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 📝 SURVEY
// ─────────────────────────────────────────────────────────
function SurveyView({ onDone, tr }) {
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [pending, setPending] = useState(false);
  const latestAnswers = useRef(answers);
  useEffect(()=>{ latestAnswers.current = answers; }, [answers]);

  const flow  = buildFlow(answers);
  const qid   = flow[idx];
  const q     = Q.find(x=>x.id===qid);
  const tq    = q ? (tr.questions.find(x=>x.id===q.id)||{}) : {};
  const ans   = answers[qid];
  const total = flow.length;
  const SCOLS = { [tr.sections.reuniones]:C.primary, [tr.sections.juegos]:C.cyan, [tr.sections.cerrar]:C.violet };
  const sectionLabel = q?.section ? tr.sections[Object.keys(SECTION_COLORS).find(k=>k===q.section)] : null;
  const ac    = q?.section ? (SECTION_COLORS[q.section]||C.primary) : C.primary;

  const canNext = () => {
    if (!q) return false;
    if (q.optional || q.type==="open") return true;
    if (q.type==="multi") return (ans||[]).length > 0;
    return ans !== undefined && ans !== null && ans !== "";
  };

  const advance = (overrideAnswers) => {
    const a = overrideAnswers || latestAnswers.current;
    const f = buildFlow(a);
    setAnimKey(k=>k+1);
    if (idx < f.length - 1) setIdx(idx + 1);
    else onDone(a);
  };

  const goBack = () => { if (idx>0) { setAnimKey(k=>k+1); setIdx(idx-1); } };
  const set    = v => setAnswers(p => ({ ...p, [qid]:v }));

  const selectAuto = v => {
    if (pending) return;
    const newAns = { ...latestAnswers.current, [qid]:v };
    set(v); setPending(true);
    setTimeout(()=>{ setPending(false); advance(newAns); }, 380);
  };

  if (!q) return null;
  const isManual = q.type==="multi" || q.type==="open";

  return (
    <div style={{ maxWidth:480, margin:"0 auto", paddingBottom: isManual ? 100 : 32 }}>

      {/* Progress */}
      <div style={{ height:3, background:C.card }}>
        <div style={{ height:3, background:ac, width:`${((idx+1)/total)*100}%`, transition:"width .35s ease" }}/>
      </div>

      {/* Top bar */}
      <div style={{ padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        {q.section ? <Pill color={ac} filled>{sectionLabel||q.section}</Pill> : <span/>}
        <span style={{ fontSize:12, fontWeight:800, color:C.sub }}>{idx+1} / {total}</span>
      </div>

      {/* Question */}
      <div key={`${qid}_${animKey}`} style={{ padding:"8px 20px 0", animation:"popIn .22s ease" }}>

        {/* Ghost number */}
        <div style={{ position:"relative", marginBottom:6 }}>
          <span style={{ position:"absolute", top:-14, left:-4, fontSize:100, fontWeight:900, color:ac, opacity:.07, lineHeight:1, userSelect:"none", pointerEvents:"none", zIndex:0 }}>
            {String(idx+1).padStart(2,"0")}
          </span>
          <h2 style={{ position:"relative", zIndex:1, fontSize:22, fontWeight:800, color:C.ink, lineHeight:1.3, margin:0, paddingTop:10, letterSpacing:"-0.5px", fontFamily:"'Lexend Deca',sans-serif" }}>
            {tq.text||q.text}
          </h2>
        </div>

        {(tq.hint||q.hint)  && <p style={{ fontSize:13, color:C.sub, margin:"6px 0 18px", fontWeight:500 }}>{tq.hint||q.hint}</p>}
        {!(tq.hint||q.hint) && <div style={{ height:18 }}/>}

        {/* SINGLE — auto-advance */}
        {q.type==="single" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {(tq.options||q.options).map((o,oi) => {
              const sel = ans===(q.options?.[oi]||o);
              const displayO = o;
              const valueO = q.options?.[oi]||o;
              return (
                <button key={oi} onClick={()=>selectAuto(valueO)} disabled={pending}
                  style={{ padding:"16px 18px", border:"none", borderRadius:14, background: sel ? ac : C.card, color: sel ? (ac===C.cyan||ac===C.yellow||ac===C.green ? "#0C0B14" : "#fff") : C.ink, fontSize:15, textAlign:"left", cursor:pending?"default":"pointer", fontWeight:sel?800:500, transition:"all .18s", lineHeight:1.3, minHeight:54, fontFamily:"inherit" }}>
                  {displayO}
                </button>
              );
            })}
            {idx>0 && <button onClick={goBack} style={{ marginTop:4, padding:"13px", border:"none", borderRadius:14, background:"transparent", color:C.sub, fontSize:14, cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>← Atrás</button>}
          </div>
        )}

        {/* SCALE — auto-advance */}
        {q.type==="scale" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:10 }}>
              {[1,2,3,4,5].map(n => {
                const sel = ans===n;
                return (
                  <button key={n} onClick={()=>selectAuto(n)} disabled={pending}
                    style={{ flex:1, height:68, border:"none", borderRadius:14, background:sel ? ac : C.card, color:sel ? (ac===C.cyan ? "#0C0B14" : "#fff") : C.ink, fontSize:26, fontWeight:900, cursor:pending?"default":"pointer", transition:"all .18s", fontFamily:"inherit" }}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:700, color:C.sub, padding:"0 2px" }}>
              <span>{tq.labelMin||q.labelMin}</span><span>{tq.labelMax||q.labelMax}</span>
            </div>
            {idx>0 && <button onClick={goBack} style={{ marginTop:12, width:"100%", padding:"12px", border:"none", borderRadius:14, background:"transparent", color:C.sub, fontSize:14, cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>← Atrás</button>}
          </div>
        )}

        {/* MULTI — botón continuar */}
        {q.type==="multi" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {(tq.options||q.options).map((o,oi) => {
              const valueO = q.options?.[oi]||o;
              const sel = (ans||[]).includes(valueO);
              return (
                <button key={oi} onClick={()=>{ const c=ans||[]; set(sel?c.filter(x=>x!==valueO):[...c,valueO]); }}
                  style={{ padding:"16px 18px", border:"none", borderRadius:14, background:sel ? ac : C.card, color:sel ? (ac===C.cyan ? "#0C0B14" : "#fff") : C.ink, fontSize:15, textAlign:"left", cursor:"pointer", transition:"all .18s", lineHeight:1.3, minHeight:54, display:"flex", alignItems:"center", gap:12, fontFamily:"inherit" }}>
                  <span style={{ width:22, height:22, border:`1.5px solid ${sel ? "rgba(255,255,255,0.6)" : C.borderS}`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {sel && <span style={{ fontSize:13, fontWeight:900 }}>✓</span>}
                  </span>
                  <span style={{ fontWeight:sel?800:500 }}>{o}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* OPEN — botón continuar */}
        {q.type==="open" && (
          <textarea placeholder={tq.placeholder||q.placeholder} value={ans||""} onChange={e=>set(e.target.value)} rows={5}
            style={{ width:"100%", padding:"16px", border:`1.5px solid ${(ans&&ans.length>0) ? ac : "transparent"}`, borderRadius:14, fontSize:15, color:C.ink, background:C.card, outline:"none", resize:"none", lineHeight:1.6, transition:"border-color .15s" }}/>
        )}
      </div>

      {/* Fixed nav — solo multi y open */}
      {isManual && (
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:C.bg, borderTop:"none", padding:"14px 20px", display:"flex", gap:10, zIndex:10 }}>
          {idx>0 && (
            <button onClick={goBack} style={{ padding:"16px 18px", border:"none", borderRadius:14, background:"transparent", color:C.sub, fontSize:18, cursor:"pointer", fontFamily:"inherit", fontWeight:800, lineHeight:1, flexShrink:0 }}>←</button>
          )}
          <Btn onClick={()=>advance()} disabled={!canNext()} bg={ac} color={ac===C.cyan?"#0C0B14":"#fff"} fullWidth>
            {idx===total-1 ? tr.survey.send : tr.survey.continue}
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ✅ THANKS
// ─────────────────────────────────────────────────────────
function ThanksScreen({ onBack, tr }) {
  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"40px 20px", animation:"slideUp .3s ease" }}>
      <div style={{ background:C.card, border:"none", borderRadius:24, padding:"40px 28px", textAlign:"center", marginBottom:14, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:C.green }}/>
        <div style={{ fontSize:56, marginBottom:16 }}>🙌</div>
        <h2 style={{ fontSize:32, fontWeight:900, margin:"0 0 12px", letterSpacing:"-1px" }}>{tr.thanks.title}</h2>
        <p style={{ fontSize:15, color:C.sub, lineHeight:1.65, margin:0 }}>
          {tr.thanks.body}
        </p>
      </div>
      <Btn onClick={onBack} bg={C.primary} color="#fff" fullWidth>{tr.thanks.back}</Btn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 📊 RESULTS
// ─────────────────────────────────────────────────────────
function ResultsView({ resps, loading, tr }) {
  const [open, setOpen]   = useState(null);
  const [tab, setTab]     = useState("charts");

  if (loading) return <div style={{ textAlign:"center", padding:80, color:C.sub, fontWeight:700 }}>{tr.results.loading}</div>;
  if (!resps.length) return (
    <div style={{ maxWidth:480, margin:"40px auto", padding:"0 20px", textAlign:"center" }}>
      <div style={{ background:C.card, border:"none", borderRadius:20, padding:48 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
        <p style={{ color:C.sub, fontSize:16, fontWeight:700, margin:0 }}>{tr.results.empty}</p>
      </div>
    </div>
  );

  const stats = buildStats(resps);

  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:"24px 20px 80px", animation:"slideUp .3s ease" }}>

      {/* Header */}
      <div style={{ background:C.card, border:"none", borderRadius:20, padding:"22px 22px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${C.primary},${C.violet},${C.cyan})` }}/>
        <div style={{ paddingTop:8 }}>
          <h2 style={{ fontSize:20, fontWeight:300, margin:"0 0 6px", letterSpacing:"-0.3px", fontFamily:"'Lexend Deca',sans-serif" }}>{tr.results.title1}<strong style={{ fontWeight:600 }}>{tr.results.titleBold}</strong>{tr.results.title2}</h2>
          <p style={{ fontSize:13, color:C.sub, margin:0, fontWeight:500 }}>{resps.length} {resps.length!==1?tr.results.resps:tr.results.resp} {resps.length!==1?tr.results.recibidas:tr.results.recibida}</p>
        </div>
        <div style={{ background:C.primary, color:"#fff", padding:"12px 18px", borderRadius:14, fontSize:30, fontWeight:900, flexShrink:0 }}>
          {resps.length}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["charts",tr.results.tabCharts],["open",tr.results.tabOpen]].map(([t,l]) => (
          <button key={t} onClick={()=>setTab(t)}
            style={{ flex:1, padding:"12px", border:`1.5px solid ${tab===t ? C.primary : "transparent"}`, borderRadius:12, background: tab===t ? C.primary+"22" : "transparent", color: tab===t ? C.primary : C.sub, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
            {l}
          </button>
        ))}
      </div>

      {tab==="charts" && Q.filter(q=>q.type!=="open").map(q => {
        const s  = stats[q.id];
        if (!s || s.total===0) return null;
        const ac = q.section ? (SECTION_COLORS[q.section]||C.primary) : C.primary;
        const sLabel = q.section ? tr.sections[Object.keys(SECTION_COLORS).find(k=>k===q.section)] : null;
        const isOpen = open===q.id;
        return (
          <div key={q.id} style={{ marginBottom:8, border:"none", borderRadius:16, background:C.card, overflow:"hidden" }}>
            <button onClick={()=>setOpen(isOpen?null:q.id)}
              style={{ width:"100%", padding:"16px 18px", background:"none", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"flex-start", textAlign:"left", gap:12, fontFamily:"inherit" }}>
              <div style={{ flex:1 }}>
                {q.section && <div style={{ marginBottom:8 }}><Pill color={ac} filled>{q.section}</Pill></div>}
                <div style={{ fontSize:14, fontWeight:600, color:C.ink, lineHeight:1.35 }}>{q.text}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, paddingTop:2 }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.sub, background:C.card2, padding:"2px 8px", borderRadius:20, border:"none" }}>{s.total}</span>
                <span style={{ color:C.sub, fontSize:11, fontWeight:800 }}>{isOpen?"▲":"▼"}</span>
              </div>
            </button>
            {isOpen && (
              <div style={{ padding:"4px 18px 20px", borderTop:"none" }}>
                <div style={{ height:12 }}/>
                {q.type==="scale" ? <ScaleChart data={s} color={ac}/> : <BarChart data={s} color={ac}/>}
              </div>
            )}
          </div>
        );
      })}

      {tab==="open" && Q.filter(q=>q.type==="open").map(q => {
        const answers = resps.map(r=>r[q.id]).filter(a=>a&&a.trim());
        return (
          <div key={q.id} style={{ marginBottom:12, border:"none", borderRadius:16, background:C.card, padding:"18px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:14, lineHeight:1.35 }}>{tr.questions.find(tq=>tq.id===q.id)?.text||q.text}</div>
            {answers.length===0
              ? <p style={{ fontSize:13, color:C.sub, fontStyle:"italic", margin:0 }}>{tr.results.noAnswers}</p>
              : answers.map((a,i) => (
                <div key={i} style={{ padding:"12px 14px", background:C.card2, borderRadius:10, fontSize:14, color:C.sub, lineHeight:1.6, marginBottom:8, borderLeft:`3px solid ${C.primary}` }}>
                  "{a}"
                </div>
              ))
            }
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 🔒 INSIGHT LOGIN
// ─────────────────────────────────────────────────────────
function InsightLogin({ code, setCode, err, onGo, tr }) {
  return (
    <div style={{ maxWidth:360, margin:"0 auto", padding:"40px 20px", animation:"slideUp .3s ease" }}>
      <div style={{ background:C.card, border:"none", borderRadius:24, padding:"32px 24px", textAlign:"center", marginBottom:14, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:C.violet }}/>
        <div style={{ fontSize:44, marginBottom:16, marginTop:8 }}>✏️</div>
        <h2 style={{ fontSize:24, fontWeight:900, margin:"0 0 6px", letterSpacing:"-0.5px" }}>{tr.insightLogin.title}</h2>
        <p style={{ fontSize:13, color:C.sub, margin:0 }}>{tr.insightLogin.sub}</p>
      </div>
      <input type="password" placeholder={tr.insightLogin.placeholder} value={code}
        onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onGo()}
        style={{ width:"100%", padding:"16px", border:`1.5px solid ${err?"#FF4444":"transparent"}`, borderRadius:14, fontSize:16, outline:"none", background:C.card, color:C.ink, marginBottom:8 }}/>
      {err && <p style={{ fontSize:13, color:"#FF4444", marginBottom:8, fontWeight:700 }}>{tr.insightLogin.wrong}</p>}
      <Btn onClick={onGo} bg={C.violet} color="#fff" fullWidth>{tr.insightLogin.btn}</Btn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 📝 INSIGHTS
// ─────────────────────────────────────────────────────────
function InsightsView({ insights, setInsights, tr }) {
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [draft, setDraft]         = useState("");
  const [tab, setTab]             = useState("insights"); // insights | responses
  const [allResps, setAllResps]   = useState([]);
  const [loadingR, setLoadingR]   = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const loadResps = async () => {
    setLoadingR(true);
    const rows = await db.loadResponsesWithIds();
    setAllResps(rows);
    setLoadingR(false);
  };

  useEffect(() => { if (tab === "responses") loadResps(); }, [tab]);

  const startEdit = (id, curr) => { setEditing(id); setDraft(curr||""); };
  const doSave = async () => {
    const updated = { ...insights, [editing]:draft };
    setInsights(updated); setSaving(true);
    await db.saveInsights(updated);
    setSaving(false); setSaved(true); setEditing(null);
    setTimeout(()=>setSaved(false), 2000);
  };

  const doDelete = async (id) => {
    setDeleting(id);
    await db.deleteResponse(id);
    setAllResps(prev => prev.filter(r => r.id !== id));
    setDeleting(null); setConfirmDel(null);
  };

  return (
    <div style={{ maxWidth:560, margin:"0 auto", padding:"24px 20px 80px", animation:"slideUp .3s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
          <Pill color={C.violet} filled>privado</Pill>
          {saved && <Pill color={C.green} filled>guardado ✓</Pill>}
        </div>
        <h2 style={{ fontSize:26, fontWeight:900, margin:0, letterSpacing:"-0.6px" }}>{tr.insights.title}</h2>
        <p style={{ fontSize:13, color:C.sub, margin:"4px 0 0", fontWeight:500 }}>{tr.insights.sub}</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {[["insights",tr.insights.tabInsights],["responses",tr.insights.tabResponses]].map(([t,l]) => (
          <button key={t} onClick={()=>setTab(t)}
            style={{ flex:1, padding:"12px", border:`1.5px solid ${tab===t ? C.violet : "transparent"}`, borderRadius:12, background:tab===t ? C.violet+"22" : "transparent", color:tab===t ? C.violet : C.sub, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Respuestas con borrar */}
      {tab === "responses" && (
        <div>
          {loadingR && <p style={{ color:C.sub, textAlign:"center", padding:40 }}>{tr.insights.loading}</p>}
          {!loadingR && allResps.length === 0 && <p style={{ color:C.sub, textAlign:"center", padding:40 }}>{tr.insights.noResps}</p>}
          {!loadingR && allResps.map((r, i) => (
            <div key={r.id} style={{ marginBottom:10, border:`1px solid ${confirmDel===r.id ? "#FF4444" : "transparent"}`, borderRadius:14, background:C.card, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.sub }}>{tr.insights.response} #{allResps.length - i}</span>
                <span style={{ fontSize:11, color:C.sub }}>{new Date(r.created_at).toLocaleDateString("es-AR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</span>
              </div>
              <div style={{ fontSize:13, color:C.sub, marginBottom:10, lineHeight:1.4 }}>
                {Object.entries(r.data||{}).slice(0,3).map(([k,v]) => (
                  <div key={k}><span style={{ color:C.ink, fontWeight:600 }}>{k}:</span> {Array.isArray(v) ? v.join(", ") : String(v)}</div>
                ))}
                {Object.keys(r.data||{}).length > 3 && <div style={{ color:C.violet, fontSize:12, marginTop:4 }}>+{Object.keys(r.data).length - 3} preguntas más</div>}
              </div>
              {confirmDel === r.id ? (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>doDelete(r.id)} disabled={deleting===r.id}
                    style={{ flex:1, padding:"10px", background:"#FF4444", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                    {deleting===r.id ? "Borrando…" : "Confirmar borrar"}
                  </button>
                  <button onClick={()=>setConfirmDel(null)}
                    style={{ padding:"10px 14px", border:"none", borderRadius:10, background:"transparent", color:C.sub, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button onClick={()=>setConfirmDel(r.id)}
                  style={{ fontSize:12, fontWeight:700, color:"#FF4444", background:"transparent", border:`1px solid #FF444433`, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Insights por pregunta */}
      {tab === "insights" && <div>

      {Q.map(q => {
        const hasInsight = insights[q.id]?.trim();
        const isEditing  = editing===q.id;
        const ac = q.section ? (SECTION_COLORS[q.section]||C.violet) : C.violet;
        return (
          <div key={q.id} style={{ marginBottom:8, border:`1px solid ${isEditing ? C.violet : "transparent"}`, borderRadius:16, background:C.card, padding:"16px 18px", transition:"border-color .15s" }}>
            {q.section && <div style={{ marginBottom:8 }}><Pill color={ac} filled>{q.section}</Pill></div>}
            <p style={{ fontSize:14, fontWeight:600, color:C.ink, margin:"0 0 12px", lineHeight:1.35 }}>{q.text}</p>
            {isEditing ? (
              <div>
                <textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={4} autoFocus
                  placeholder="Escribí tu observación…"
                  style={{ width:"100%", padding:"14px", border:`1.5px solid ${C.violet}`, borderRadius:10, fontSize:14, color:C.ink, background:C.card2, outline:"none", resize:"none", lineHeight:1.5, marginBottom:10 }}/>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn onClick={doSave} disabled={saving} bg={C.violet} color="#fff" fullWidth>{saving?tr.insights.saving:tr.insights.save}</Btn>
                  <button onClick={()=>setEditing(null)} style={{ padding:"16px", border:"none", borderRadius:12, background:"transparent", color:C.sub, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                </div>
              </div>
            ) : (
              <div>
                {hasInsight
                  ? <div style={{ padding:"12px 14px", background:C.violet+"22", borderRadius:10, borderLeft:`3px solid ${C.violet}`, fontSize:14, color:C.sub, lineHeight:1.5, marginBottom:10 }}>{insights[q.id]}</div>
                  : <p style={{ fontSize:13, color:C.sub, fontStyle:"italic", margin:"0 0 10px" }}>Sin insight todavía</p>}
                <button onClick={()=>startEdit(q.id, insights[q.id])}
                  style={{ fontSize:13, fontWeight:700, color:C.violet, background:"transparent", border:`1px solid ${C.violet}44`, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontFamily:"inherit" }}>
                  {hasInsight?tr.insights.edit:tr.insights.add}
                </button>
              </div>
            )}
          </div>
        );
      })}
      </div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 📊 CHART COMPONENTS
// ─────────────────────────────────────────────────────────
function BarChart({ data, color }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {Object.entries(data.counts).sort((a,b)=>b[1]-a[1]).map(([opt, count]) => {
        const pct = data.total>0 ? Math.round((count/data.total)*100) : 0;
        return (
          <div key={opt}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, gap:8 }}>
              <span style={{ fontSize:13, fontWeight:500, color:C.sub, flex:1, lineHeight:1.3 }}>{opt}</span>
              <span style={{ fontSize:14, fontWeight:900, color, flexShrink:0 }}>{pct}%</span>
            </div>
            <div style={{ height:6, background:C.card2, borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:6, background:color, borderRadius:99, width:`${pct}%`, transition:"width .45s ease" }}/>
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.25)", marginTop:3 }}>{count} resp.</div>
          </div>
        );
      })}
    </div>
  );
}

function ScaleChart({ data, color }) {
  const avg = data.total>0 ? (Object.entries(data.counts).reduce((s,[k,v])=>s+Number(k)*v,0)/data.total).toFixed(1) : "–";
  const maxC = Math.max(...Object.values(data.counts), 1);
  return (
    <div>
      <div style={{ display:"flex", gap:10, alignItems:"flex-end", height:80, marginBottom:14 }}>
        {[1,2,3,4,5].map(n => {
          const count = data.counts[n]||0;
          const h = Math.max(Math.round((count/maxC)*60), count>0 ? 4 : 0);
          return (
            <div key={n} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.sub }}>{count}</span>
              <div style={{ width:"100%", height:h, background:color, borderRadius:"6px 6px 0 0", minHeight:count>0?4:0 }}/>
              <span style={{ fontSize:15, fontWeight:900, color:C.ink }}>{n}</span>
            </div>
          );
        })}
      </div>
      <div style={{ background:color+"22", border:`1px solid ${color}44`, borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:13, fontWeight:600, color:C.sub }}>Promedio</span>
        <span style={{ fontSize:26, fontWeight:900, color }}>{avg}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 📐 STATS BUILDER
// ─────────────────────────────────────────────────────────
function buildStats(resps) {
  const s = {};
  Q.forEach(q => {
    s[q.id] = { total:0, counts:{} };
    if (q.type==="scale") [1,2,3,4,5].forEach(n=>(s[q.id].counts[n]=0));
    else (q.options||[]).forEach(o=>(s[q.id].counts[o]=0));
  });
  resps.forEach(r => {
    Q.forEach(q => {
      const v = r[q.id];
      if (v===undefined||v===null||v==="") return;
      s[q.id].total++;
      if (q.type==="multi") (v||[]).forEach(x=>{ if(s[q.id].counts[x]!==undefined) s[q.id].counts[x]++; });
      else if (q.type!=="open") { if(s[q.id].counts[v]!==undefined) s[q.id].counts[v]++; }
    });
  });
  return s;
}
