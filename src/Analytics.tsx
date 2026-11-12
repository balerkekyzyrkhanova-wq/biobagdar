import {useEffect, useState} from 'react';
import {collection, doc, getDocs, query, setDoc, serverTimestamp, where} from 'firebase/firestore';
import {db} from './firebase';
import {Stat, TOPICS, level, LEVEL_TEXT, LEVEL_COLOR, topicStats, overall} from './analytics';
import {vTitle, fmtDate} from './Olympiad';

const card: any = {border: '1px solid var(--bd)', borderRadius: 14, padding: 14, margin: '10px 0', background: 'var(--card)'};

export function Bars({stats}: {stats: Stat[]}) {
  if (!stats.length) return <div className="mu">Данных пока нет: решите хотя бы один вариант в тренажёре.</div>;
  return <div>{stats.map(s => { const lv = level(s); return <div key={s.id} style={{margin: '8px 0'}}>
    <div className="bar"><span>{s.name}</span><span><b>{s.pct} %</b> <span className="tag" style={{background: LEVEL_COLOR[lv], color: '#fff'}}>{LEVEL_TEXT[lv]}</span></span></div>
    <div style={{background: 'var(--bd)', borderRadius: 8, height: 10, overflow: 'hidden'}}><div style={{width: s.pct + '%', height: '100%', background: LEVEL_COLOR[lv]}}/></div>
    <div className="mu">заданий по теме: {s.n}</div></div>; })}</div>;
}

export function Advice({stats}: {stats: Stat[]}) {
  const weak = stats.filter(s => ['weak', 'mid'].includes(level(s))).slice(0, 3), good = stats.filter(s => level(s) === 'good');
  if (!stats.length) return null;
  return <div>{weak.length ? <><h3>Что подтянуть</h3>{weak.map(s => <div key={s.id} className="warn" style={{margin: '6px 0'}}><b>{s.name}</b> ({s.pct} %). {TOPICS[s.id].tip}</div>)}</>
    : <div className="warn">Слабых тем не видно. Решай новые варианты, чтобы проверить себя на других заданиях.</div>}
    {good.length > 0 && <div className="mu" style={{marginTop: 6}}>Сильные стороны: {good.map(s => s.name).join('; ')}.</div>}
    <div className="mu" style={{marginTop: 6}}>Это автоматический разбор по результатам вариантов. Темы с малым числом заданий (меньше 3) оцениваются осторожно.</div></div>;
}

// Блок для ученика
export function MyAnalysis({stats, note}: any) {
  return <div className="card"><h3>🧭 Мой анализ по темам</h3>
    {note?.text && <div className="warn" style={{borderColor: 'var(--g)'}}><b>Рекомендации учителя{note.source === 'ai' ? ' (подготовлены с помощью ИИ и проверены учителем)' : ''}:</b><div style={{whiteSpace: 'pre-line', marginTop: 4}}>{note.text}</div></div>}
    <Bars stats={stats}/><Advice stats={stats}/></div>;
}

const AI_KEY = 'bb_ai_key';
async function askClaude(key: string, summary: any) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {method: 'POST', headers: {'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'},
    body: JSON.stringify({model: 'claude-sonnet-5-5', max_tokens: 900,
      system: 'Ты помощник учителя биологии 7 класса в Казахстане и готовишь ученику подготовку к олимпиаде. По статистике по темам напиши по-русски: 1) краткий вывод (2–3 предложения), 2) 3 самые слабые темы и что именно повторить, 3) конкретный план на неделю из 3–4 шагов, 4) одну фразу поддержки. Пиши простыми предложениями для школьника 12–13 лет, без markdown-разметки и без выдуманных фактов о ребёнке: опирайся только на данные.',
      messages: [{role: 'user', content: 'Статистика ученика (анонимно): ' + JSON.stringify(summary)}]})});
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || 'Ошибка ИИ: ' + r.status);
  return (j.content || []).map((c: any) => c.text || '').join('').trim();
}

function StudentCard({sid, name, stats, bank, onSaved}: any) {
  const [key, setKey] = useState(() => { try { return localStorage.getItem(AI_KEY) || ''; } catch { return ''; } });
  const [text, setText] = useState(''), [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
  const gen = async () => {
    if (!key.trim()) return setMsg('Вставьте ключ API Anthropic (он хранится только в этом браузере).');
    try { localStorage.setItem(AI_KEY, key.trim()); } catch {}
    setBusy(true); setMsg('');
    try {
      const summary = {темы: stats.map((s: Stat) => ({тема: s.name, процент: s.pct, заданий: s.n})), варианты: bank.map((t: any) => ({вариант: vTitle(t.stage, t.variant), баллы: `${t.score}/${t.max}`}))};
      setText(await askClaude(key.trim(), summary));
    } catch (e: any) { setMsg(e?.message || 'Не удалось получить ответ ИИ'); }
    setBusy(false);
  };
  const publish = async () => {
    try { await setDoc(doc(db, 'analyses', sid), {text: text.trim(), source: 'ai', updatedAt: serverTimestamp()}); setMsg('Опубликовано: ученик увидит это в разделе «Мой анализ».'); onSaved?.(); }
    catch (e: any) { setMsg(e?.code === 'permission-denied' ? 'Нет доступа: обновите правила Firebase (npx firebase-tools deploy --only firestore --project biobagdar).' : e?.message || 'Ошибка'); }
  };
  return <div>
    <Bars stats={stats}/><Advice stats={stats}/>
    <h3>ИИ-разбор (по желанию)</h3>
    <div className="mu">В ИИ уходят только проценты по темам и баллы вариантов, без имени ученика. Ключ — ваш собственный, он остаётся в этом браузере, расход идёт с вашего счёта Anthropic.</div>
    <input type="password" placeholder="Ключ API Anthropic (sk-ant-…)" value={key} onChange={e => setKey(e.target.value)}/>
    <button disabled={busy || !stats.length} onClick={gen}>{busy ? 'ИИ думает…' : '🤖 Составить разбор'}</button>
    {msg && <div className="warn" style={{margin: '6px 0'}}>{msg}</div>}
    {text && <><textarea rows={10} value={text} onChange={e => setText(e.target.value)}/><div className="mu">Проверьте и при необходимости отредактируйте текст: ученик увидит его от вашего имени.</div><button onClick={publish}>Опубликовать ученику {name ? '' : ''}</button></>}</div>;
}

// Блок для учителя: класс целиком и каждый ученик
export function TeacherAnalytics({uid}: {uid: string}) {
  const [open, setOpen] = useState(false), [bank, setBank] = useState<any[]>([]), [xyl, setXyl] = useState<any[]>([]), [keys, setKeys] = useState<any>({}), [err, setErr] = useState(''), [sel, setSel] = useState(''), [ready, setReady] = useState(false);
  const load = async () => {
    setErr('');
    const mkd = (d: any[]) => d.map(x => ({id: x.id, ...x.data()}));
    const fail = (e: any) => setErr(e?.code === 'permission-denied' ? 'Нет доступа: обновите правила Firebase.' : e?.message || 'Ошибка');
    try {
      const k: any = {}; (await getDocs(query(collection(db, 'keys'), where('topicId', '==', 'bank')))).docs.forEach(d => { k[d.id] = d.data().answer; }); setKeys(k);
      setBank(mkd((await getDocs(collection(db, 'bankAttempts'))).docs));
      setReady(true);
    } catch (e) { fail(e); }
    try { setXyl(mkd((await getDocs(query(collection(db, 'attempts'), where('teacherId', '==', uid)))).docs)); } catch (e) { fail(e); }
  };
  useEffect(() => { if (open) load(); }, [open]);
  const keyAns = (id: string) => keys[id];
  const ids: any = {}; bank.forEach(t => { ids[t.studentId] = t.studentName; }); xyl.forEach(t => { ids[t.studentId] = ids[t.studentId] || t.studentName; });
  const per = Object.keys(ids).map(id => { const st = topicStats(bank.filter(t => t.studentId === id), keyAns, xyl.filter(t => t.studentId === id)); return {id, name: ids[id], st, ov: overall(st)}; }).sort((a, b) => a.name.localeCompare(b.name));
  const cls = topicStats(bank, keyAns, xyl);
  const cur = per.find(p => p.id === sel);
  return <div style={card}><b>🧭 Анализ по темам</b> <button onClick={() => setOpen(!open)}>{open ? 'Свернуть' : 'Открыть'}</button>
    {open && <>{err && <div style={{color: '#c2410c'}}>{err}</div>}<button className="s" onClick={load}>Обновить</button>
      {!ready ? <div className="mu">Загрузка данных…</div> : <><h3>Класс в целом</h3><Bars stats={cls}/>
      <h3>Ученики</h3>{!per.length && <div className="mu">Пока нет сданных вариантов.</div>}
      {per.map(p => <div key={p.id} className="bar" style={{borderTop: '1px solid var(--bd)', padding: '6px 0'}}><span><b>{p.name}</b> · общий результат {p.ov ?? '—'} %<div className="mu">Слабее всего: {p.st.filter(s => level(s) !== 'few').slice(0, 2).map(s => `${s.name} (${s.pct} %)`).join('; ') || '—'}</div></span><button className="s" onClick={() => setSel(sel === p.id ? '' : p.id)}>{sel === p.id ? 'Скрыть' : 'Подробнее'}</button></div>)}
      </>}
      {ready && cur && <div style={{...card, borderColor: 'var(--g)'}}><h3>{cur.name}</h3>
        <StudentCard sid={cur.id} name={cur.name} stats={cur.st} bank={bank.filter(t => t.studentId === cur.id).sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))}/>
        <div className="mu">Последний вариант: {fmtDate(bank.filter(t => t.studentId === cur.id).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0]?.createdAt)}</div></div>}</>}</div>;
}
