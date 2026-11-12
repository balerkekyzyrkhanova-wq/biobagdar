import {useEffect, useRef, useState} from 'react';
import {addDoc, collection, getDocs, query, serverTimestamp, where} from 'firebase/firestore';
import {db} from './firebase';
import {Owl, OWL} from './Expedition';
import {STAGE_NAME, VARIANTS, meta, maxOf, itemsOf, Stage} from './bankdata';

const card: any = {border: '1px solid var(--bd)', borderRadius: 14, padding: 14, margin: '10px 0', background: 'var(--card)'};
const IMGBASE = (import.meta as any).env.BASE_URL || './';
const msgOf = (e: any) => (e?.code === 'permission-denied' ? 'Нет доступа' : e?.message || 'Ошибка');
const mk = (arr: any[]) => arr.map(d => ({id: d.id, ...d.data()}));
export const fmtDate = (t: any) => { try { return t?.toDate ? t.toDate().toLocaleString('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '—'; } catch { return '—'; } };
export const vTitle = (stage: string, variant: number) => `${STAGE_NAME[stage as Stage] || stage} · ${VARIANTS.find(v => v.stage === stage && v.variant === variant)?.title || 'вариант ' + variant}`;

export function Ctx({q, prev}: any) {
  if (!q.ctx || (prev && prev.ctx === q.ctx)) return null;
  return <div style={{background: 'var(--bg)', padding: 10, borderRadius: 8, marginBottom: 8, fontSize: 15, whiteSpace: 'pre-line'}}>{q.ctx}
    {(q.img || []).map((im: any) => <figure key={im.src} style={{margin: '10px 0 0'}}><img src={IMGBASE + im.src} alt={im.cap} style={{maxWidth: '100%', height: 'auto', borderRadius: 6, background: '#fff'}}/><figcaption style={{fontSize: 13, color: 'var(--mu)'}}>{im.cap}</figcaption></figure>)}
    {(q.img || []).length > 0 && <details><summary>Как читать рисунок</summary><div style={{fontSize: 14}}>1) Прочитай подпись и найди условные обозначения. 2) Определи, что отложено по осям или что обозначено стрелками и цветами, и в каких единицах. 3) Сравни опыт с контролем: что изменилось и что осталось прежним. 4) Отвечай только по тому, что видно на рисунке и сказано в условии, а не по догадке.</div></details>}</div>;
}

// Разбор работы: вопросы, ответ ученика, верный ответ и пояснение. keyOf(q) -> {answer, expl}
export function Review({qs, answers, keyOf, showAll}: any) {
  const [only, setOnly] = useState(false);
  const wrongN = qs.filter((q: any) => answers?.[q.id] !== keyOf(q)?.answer).length;
  return <div>{wrongN > 0 && <label style={{display: 'block', margin: '6px 0'}}><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)}/> Показать только ошибки и пропуски ({wrongN})</label>}
    {qs.map((q: any, i: number) => { const a = answers?.[q.id], k = keyOf(q), ok = a !== undefined && a === k?.answer; const p = meta(q).pts;
      if (only && ok) return null;
      return <div key={q.id} style={{...card, borderLeft: `6px solid ${ok ? '#15803d' : '#c2410c'}`}}>
        <Ctx q={q} prev={only ? undefined : qs[i - 1]}/>
        <div className="mu">{q.text.startsWith(String(meta(q).n) + '.') ? '' : `Вопрос ${meta(q).n}. `}{p > 1 ? `${p} балла` : '1 балл'}</div>
        <b>{q.text}</b>
        <div style={{marginTop: 6}}>Твой ответ: <b style={{color: ok ? '#15803d' : '#c2410c'}}>{a === undefined ? 'нет ответа' : q.options[a]}</b> {ok ? `✓ +${p}` : '✗ 0'}</div>
        {!ok && k && <div>Верный ответ: <b>{q.options[k.answer]}</b></div>}
        {k?.expl && <div style={{marginTop: 4}}>💡 {k.expl}</div>}</div>; })}
    {showAll}</div>;
}

export function ScoreBox({score, max, qs, answers, keyOf}: any) {
  const pct = max ? Math.round(score / max * 100) : 0;
  const byLevel: any = {}; qs.forEach((q: any) => { const p = meta(q).pts; const b = (byLevel[p] = byLevel[p] || {n: 0, ok: 0}); b.n++; if (answers?.[q.id] === keyOf(q)?.answer) b.ok++; });
  return <div className="card" style={{textAlign: 'center'}}><div style={{fontSize: '2.6rem', fontWeight: 800, color: pct >= 80 ? '#15803d' : pct >= 50 ? 'var(--au)' : '#c2410c'}}>{score} из {max}</div>
    <div>баллов · {pct} %</div>
    <div style={{background: 'var(--bd)', borderRadius: 8, height: 12, overflow: 'hidden', margin: '8px 0'}}><div style={{width: pct + '%', height: '100%', background: pct >= 80 ? '#15803d' : pct >= 50 ? 'var(--au)' : '#c2410c'}}/></div>
    {Object.keys(byLevel).length > 1 && <div className="mu">{Object.keys(byLevel).sort().map(p => `${p}-балльные: ${byLevel[p].ok} из ${byLevel[p].n}`).join(' · ')}</div>}</div>;
}

function Work({v, qs, keys, uid, prof, onBack, onSaved}: any) {
  const dk = `bb_draft_${v.stage}_${v.variant}_${uid}`;
  const [ans, setAns] = useState<any>(() => { try { return JSON.parse(localStorage.getItem(dk) || '{}'); } catch { return {}; } });
  const [res, setRes] = useState<any>(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [sec, setSec] = useState(0);
  const t0 = useRef(Date.now());
  useEffect(() => { const t = setInterval(() => setSec(Math.floor((Date.now() - t0.current) / 1000)), 1000); return () => clearInterval(t); }, []);
  const set = (id: string, j: number) => { const n = {...ans, [id]: j}; setAns(n); try { localStorage.setItem(dk, JSON.stringify(n)); } catch {} };
  const max = maxOf(qs), done = qs.filter((q: any) => ans[q.id] !== undefined).length;
  const keyOf = (q: any) => keys[q.id];
  const submit = async () => {
    const left = qs.length - done;
    if (!confirm(left ? `Не отвечено вопросов: ${left}. Они дадут 0 баллов. Сдать вариант?` : 'Сдать вариант и узнать результат?')) return;
    const score = qs.reduce((s: number, q: any) => s + (ans[q.id] === keys[q.id]?.answer ? meta(q).pts : 0), 0);
    const r = {score, max, answers: ans};
    setBusy(true); setErr('');
    try {
      await addDoc(collection(db, 'bankAttempts'), {studentId: uid, studentName: `${prof.name}, ${prof.cls}`, groupId: prof.groupId || null, stage: v.stage, variant: v.variant, answers: ans, score, max, durationSec: sec, createdAt: serverTimestamp()});
      try { localStorage.removeItem(dk); } catch {}
      onSaved();
    } catch (e) { setErr(msgOf(e) === 'Нет доступа' ? 'Результат показан, но не сохранён: учитель должен обновить правила Firebase (инструкция в кабинете учителя).' : 'Результат показан, но не сохранён: ' + msgOf(e)); }
    setBusy(false); setRes(r);
  };
  const mm = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  if (res) return <div><button className="s" onClick={onBack}>← К вариантам</button><h2>Результат: {vTitle(v.stage, v.variant)}</h2>
    {err && <div className="warn">{err}</div>}
    <ScoreBox score={res.score} max={res.max} qs={qs} answers={res.answers} keyOf={keyOf}/>
    <h3>Разбор</h3><Review qs={qs} answers={res.answers} keyOf={keyOf}/></div>;
  return <div><button className="s" onClick={onBack}>← К вариантам (ответы сохранены на этом устройстве)</button>
    <h2>{vTitle(v.stage, v.variant)}</h2>
    <div className="warn">Вопросов: {qs.length} · максимум {max} баллов · время на олимпиаде: {v.minutes} мин. Ответы проверяются после сдачи. Верные ответы и пояснения откроются в разборе.</div>
    <div className="card" style={{position: 'sticky', top: 0, zIndex: 4}}><div className="bar"><b>Отвечено: {done} из {qs.length}</b><span>⏱ {mm}</span></div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6}}>{qs.map((q: any) => <a key={q.id} href={'#q_' + q.id} style={{width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 13, textDecoration: 'none', background: ans[q.id] !== undefined ? 'var(--g)' : 'var(--bd)', color: ans[q.id] !== undefined ? 'var(--bt)' : 'var(--tx)'}}>{meta(q).n}</a>)}</div></div>
    {qs.map((q: any, i: number) => <div key={q.id} id={'q_' + q.id} style={card}>
      <Ctx q={q} prev={qs[i - 1]}/>
      <div className="mu">{q.src}</div><b>{q.text}</b>
      {q.options.map((o: string, j: number) => <label key={j} style={{display: 'block', padding: '6px 8px', margin: '4px 0', border: '2px solid ' + (ans[q.id] === j ? 'var(--g)' : 'var(--bd)'), borderRadius: 10}}><input type="radio" name={q.id} checked={ans[q.id] === j} onChange={() => set(q.id, j)}/> {o}</label>)}
      {ans[q.id] !== undefined && <button className="s" onClick={() => { const n = {...ans}; delete n[q.id]; setAns(n); try { localStorage.setItem(dk, JSON.stringify(n)); } catch {} }}>Очистить выбор</button>}</div>)}
    <button disabled={busy} onClick={submit}>{busy ? 'Сохраняю…' : 'Сдать вариант'}</button></div>;
}

export function BankAttemptsList({list, qsOf, keyOfFor, empty}: any) {
  const [open, setOpen] = useState('');
  if (!list.length) return <div className="mu">{empty || 'Решённых вариантов пока нет.'}</div>;
  return <div>{list.map((t: any) => { const qs = qsOf(t.stage, t.variant); const pct = t.max ? Math.round(t.score / t.max * 100) : 0;
    return <div key={t.id} style={{...card, margin: '6px 0'}}><div className="bar"><div>{t.studentName && <b>{t.studentName} · </b>}{vTitle(t.stage, t.variant)}<div className="mu">{fmtDate(t.createdAt)}{t.durationSec ? ` · ${Math.round(t.durationSec / 60)} мин` : ''}</div></div>
      <div><b style={{fontSize: '1.2rem'}}>{t.score}/{t.max}</b> <span className="tag">{pct} %</span></div></div>
      <button className="s" onClick={() => setOpen(open === t.id ? '' : t.id)}>{open === t.id ? 'Скрыть разбор' : 'Разбор'}</button>
      {open === t.id && (qs.length ? <Review qs={qs} answers={t.answers} keyOf={keyOfFor(t)}/> : <div className="mu">Разбор доступен, когда вариант подтверждён учителем.</div>)}</div>; })}</div>;
}

export function Trainer({uid, prof, onBack}: any) {
  const [qs, setQs] = useState<any[]>([]), [keys, setKeys] = useState<any>({}), [hist, setHist] = useState<any[]>([]), [loaded, setLoaded] = useState(false), [err, setErr] = useState(''), [stage, setStage] = useState<Stage | ''>(''), [work, setWork] = useState<any>(null);
  const load = async () => {
    const q = await getDocs(query(collection(db, 'questions'), where('topicId', '==', 'bank'), where('confirmed', '==', true)));
    setQs(mk(q.docs).map((x: any) => ({...x, ...meta(x)})));
    const k: any = {}; (await getDocs(collection(db, 'bankKeys'))).docs.forEach(d => { k[d.id] = d.data(); }); setKeys(k);
    try { setHist(mk((await getDocs(query(collection(db, 'bankAttempts'), where('studentId', '==', uid)))).docs).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))); } catch { setHist([]); }
    setLoaded(true);
  };
  useEffect(() => { load().catch(e => { setErr(msgOf(e)); setLoaded(true); }); }, []);
  const vq = (s: string, n: number) => qs.filter(x => x.stage === s && x.variant === n).sort((a, b) => a.n - b.n);
  if (work) return <Work v={work} qs={vq(work.stage, work.variant)} keys={keys} uid={uid} prof={prof} onBack={() => { setWork(null); load(); }} onSaved={() => {}}/>;
  const need: any = {}; // сколько заданий должно быть в варианте
  VARIANTS.forEach(v => { need[v.stage + v.variant] = itemsOf(v.stage, v.variant).length; });
  return <div><button className="s" onClick={stage ? () => setStage('') : onBack}>← {stage ? 'К выбору этапа' : 'Назад'}</button><h2>🏆 Олимпиадный тренажёр</h2><Owl text={OWL.trainer}/>
    <div style={{color: '#c2410c'}}>{err}</div>
    {!loaded ? <div>Загрузка…</div> : !stage ? <>
      <div className="grid">{(['district', 'oblast'] as Stage[]).map(s => { const vs = VARIANTS.filter(v => v.stage === s); const ready = vs.filter(v => vq(s, v.variant).length === need[s + v.variant]).length;
        return <div key={s} className="card"><h3>{STAGE_NAME[s]}</h3><div className="mu">{s === 'district' ? 'Тест из 30 вопросов с общим сюжетом, 5 вариантов ответа, вопросы за 1, 2 и 3 балла.' : 'Задачи с описанием и утверждениями «Верно / Неверно», по 1 баллу за утверждение.'}</div><div>Вариантов доступно: {ready} из {vs.length}</div><button onClick={() => setStage(s)}>Открыть</button></div>; })}</div>
      <div className="card"><h3>Мои решённые варианты</h3><BankAttemptsList list={hist} qsOf={(s: string, n: number) => vq(s, n)} keyOfFor={() => (q: any) => keys[q.id]}/></div></>
    : <>
      <h3>{STAGE_NAME[stage]}</h3>
      <div className="grid">{VARIANTS.filter(v => v.stage === stage).map(v => { const list = vq(stage, v.variant), n = need[stage + v.variant], ok = list.length === n; const mine = hist.filter(h => h.stage === stage && h.variant === v.variant); const best = mine.reduce((m: number, h: any) => Math.max(m, h.score), -1);
        return <div key={v.variant} className="card"><b>{v.title}</b>{v.sample && <span className="tag" style={{marginLeft: 6}}>из олимпиады «Дарын»</span>}{!v.sample && <span className="tag" style={{marginLeft: 6}}>авторский</span>}
          <div className="mu">{n} {stage === 'district' ? 'вопросов' : 'утверждений'} · максимум {ok ? maxOf(list) : '—'} баллов · {v.minutes} мин</div>
          {mine.length > 0 && <div>Лучший результат: <b>{best}/{mine[0].max}</b> · попыток: {mine.length}</div>}
          {ok ? <button onClick={() => setWork(v)}>{mine.length ? 'Решить ещё раз' : 'Начать'}</button> : <div className="warn">Пока недоступен: учитель подтвердил {list.length} из {n} ключей.</div>}</div>; })}</div></>}
  </div>;
}
