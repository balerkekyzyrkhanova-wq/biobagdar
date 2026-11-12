import {useEffect, useState} from 'react';
import {onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut} from 'firebase/auth';
import {collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, addDoc, updateDoc, writeBatch, serverTimestamp, increment, Timestamp} from 'firebase/firestore';
import {auth, db, configured} from './firebase';
import xylem from '../content/xylem.json';

const box: any = {maxWidth: 900, margin: '0 auto', padding: 14, font: '17px/1.5 system-ui', color: '#12302a'};
const card: any = {border: '1px solid #cfe3dc', borderRadius: 12, padding: 12, margin: '10px 0', background: '#fff'};
const msgOf = (e: any) => (e?.code === 'permission-denied' ? 'Нет доступа, либо срок или число попыток исчерпаны' : e?.message || 'Ошибка');
const mk = (arr: any[]) => arr.map(d => ({id: d.id, ...d.data()}));

export default function App() {
  const [u, setU] = useState<any>(null), [teacher, setT] = useState(false), [prof, setP] = useState<any>(null), [ready, setR] = useState(false);
  const load = async (x: any) => {
    setU(x);
    if (x) { setT((await getDoc(doc(db, 'teachers', x.uid))).exists()); const s = await getDoc(doc(db, 'users', x.uid)); setP(s.exists() ? s.data() : null); }
    else { setP(null); setT(false); }
    setR(true);
  };
  useEffect(() => (configured ? onAuthStateChanged(auth, load) : undefined), []);
  if (!configured) return <div style={box}><h1>BioБағдар</h1><div style={card}>Деморежим: Firebase не настроен, данные не сохраняются.</div></div>;
  if (!ready) return <div style={box}>Загрузка…</div>;
  return <div style={box}><h1>BioБағдар</h1>
    {!u ? <Auth/> : <><button onClick={() => signOut(auth)}>Выйти</button>
      {teacher ? <Teacher uid={u.uid}/> : prof ? <Student uid={u.uid} prof={prof} reload={() => load(u)}/> : <div style={card}>Профиль не найден.</div>}</>}</div>;
}

function Auth() {
  const [em, setEm] = useState(''), [pw, setPw] = useState(''), [name, setName] = useState(''), [cls, setCls] = useState(''), [reg, setReg] = useState(false), [err, setErr] = useState('');
  const go = async () => {
    setErr('');
    try {
      if (reg) {
        if (!name.trim() || !cls.trim()) return setErr('Укажите имя, фамилию и класс');
        const c = await createUserWithEmailAndPassword(auth, em, pw);
        await setDoc(doc(db, 'users', c.user.uid), {name: name.trim(), cls: cls.trim()});
      } else await signInWithEmailAndPassword(auth, em, pw);
    } catch (e) { setErr(msgOf(e)); }
  };
  return <div style={card}><h2>{reg ? 'Регистрация ученика' : 'Вход'}</h2>
    {reg && <><input placeholder="Имя и фамилия" value={name} onChange={e => setName(e.target.value)}/><input placeholder="Класс" value={cls} onChange={e => setCls(e.target.value)}/></>}
    <input placeholder="Email" value={em} onChange={e => setEm(e.target.value)}/><input type="password" placeholder="Пароль (от 6 символов)" value={pw} onChange={e => setPw(e.target.value)}/>
    <button onClick={go}>{reg ? 'Создать учётную запись' : 'Войти'}</button> <button onClick={() => setReg(!reg)}>{reg ? 'Уже есть аккаунт' : 'Я новый ученик'}</button>
    <div style={{color: '#c2410c'}}>{err}</div><div>Роль учителя выдаёт владелец проекта, самостоятельно её выбрать нельзя.</div></div>;
}

function Student({uid, prof, reload}: any) {
  const [code, setCode] = useState(''), [as, setAs] = useState<any[]>([]), [at, setAt] = useState<any[]>([]), [w, setW] = useState<any>(null), [err, setErr] = useState('');
  const refresh = async () => {
    if (!prof.groupId) return;
    setAs(mk((await getDocs(query(collection(db, 'assignments'), where('groupId', '==', prof.groupId)))).docs));
    const t = await getDocs(query(collection(db, 'attempts'), where('studentId', '==', uid)));
    setAt(await Promise.all(t.docs.map(async d => ({id: d.id, ...d.data(), comments: (await getDocs(collection(db, 'attempts', d.id, 'comments'))).docs.map(c => c.data().text)}))));
  };
  useEffect(() => { refresh(); }, [prof.groupId]);
  const join = async () => {
    setErr('');
    try {
      const c = code.trim().toUpperCase(); const s = await getDoc(doc(db, 'groupCodes', c));
      if (!s.exists()) throw new Error('Группа с таким кодом не найдена');
      const gid = s.data().groupId;
      await setDoc(doc(db, 'groups', gid, 'members', uid), {code: c, joinedAt: serverTimestamp()});
      await updateDoc(doc(db, 'users', uid), {groupId: gid}); reload();
    } catch (e) { setErr(msgOf(e)); }
  };
  if (!prof.groupId) return <div style={card}><h2>Присоединиться к группе</h2><input placeholder="Код группы" value={code} onChange={e => setCode(e.target.value)}/><button onClick={join}>Войти в группу</button><div>{err}</div></div>;
  if (w) return <Work a={w} uid={uid} prof={prof} onDone={() => { setW(null); refresh(); }}/>;
  return <div><h2>{prof.name}, {prof.cls}</h2>
    {as.map(a => { const mine = at.filter(t => t.assignmentId === a.id).sort((x, y) => x.n - y.n); return <div key={a.id} style={card}>
      <b>Тема: {a.topicId}</b> · {a.mode === 'control' ? 'контрольный' : 'тренировка'} · срок: {a.due || '—'} · попыток {mine.length}/{a.tries}
      <div><button disabled={mine.length >= a.tries} onClick={() => setW(a)}>{mine.length ? 'Новая попытка' : 'Начать'}</button></div>
      {mine.map(t => <div key={t.id}>Попытка {t.n}: {t.status}{t.score != null ? ` · ${t.score}/${t.max}` : ' · результат появится после проверки учителем'}{t.comments.map((c: string, i: number) => <div key={i}>💬 {c}</div>)}</div>)}</div>; })}
    {!as.length && <div style={card}>Заданий пока нет.</div>}</div>;
}

function Work({a, uid, prof, onDone}: any) {
  const [qs, setQs] = useState<any[]>([]), [ans, setAns] = useState<any>({}), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [ok, setOk] = useState(false);
  useEffect(() => { getDocs(query(collection(db, 'questions'), where('topicId', '==', a.topicId), orderBy('order'))).then(s => setQs(mk(s.docs))); }, []);
  const send = async () => {
    setBusy(true); setErr('');
    try {
      const n = (await getDocs(query(collection(db, 'attempts'), where('assignmentId', '==', a.id), where('studentId', '==', uid)))).size + 1;
      await setDoc(doc(db, 'attempts', `${a.id}_${uid}_${n}`), {assignmentId: a.id, groupId: a.groupId, teacherId: a.teacherId, studentId: uid, studentName: `${prof.name}, ${prof.cls}`, n, answers: ans, status: 'Сдано', submittedAt: serverTimestamp()});
      setOk(true); // «отправлено» показываем только после подтверждения записи
    } catch (e) { setErr(msgOf(e)); } finally { setBusy(false); }
  };
  if (ok) return <div style={card}>Работа отправлена. Результат появится после проверки учителем.<div><button onClick={onDone}>Готово</button></div></div>;
  const skipped = qs.filter(q => ans[q.id] === undefined).length;
  return <div>{qs.map((q, i) => <div key={q.id} style={card}><b>{i + 1}.</b> {q.text}
    {(q.type === 'tf' ? ['Верно', 'Неверно'] : q.options).map((o: string, j: number) => { const v = q.type === 'tf' ? j === 0 : j;
      return <label key={j} style={{display: 'block'}}><input type="radio" name={q.id} checked={ans[q.id] === v} onChange={() => setAns({...ans, [q.id]: v})}/> {o}</label>; })}
    {q.type === 'tf' && <button onClick={() => { const n = {...ans}; delete n[q.id]; setAns(n); }}>Очистить (без ответа ≠ «Неверно»)</button>}</div>)}
    <div>Пропущено: {skipped}. Пропуск даёт 0 баллов.</div><button disabled={busy} onClick={send}>{busy ? 'Отправка…' : 'Подтвердить сдачу'}</button> <button onClick={onDone}>Назад</button><div style={{color: '#c2410c'}}>{err}</div></div>;
}

function Teacher({uid}: any) {
  const [gs, setGs] = useState<any[]>([]), [as, setAs] = useState<any[]>([]), [at, setAt] = useState<any[]>([]), [name, setName] = useState(''), [f, setF] = useState<any>({groupId: '', topicId: 'xylem', due: '', mode: 'training', tries: 2}), [cm, setCm] = useState<any>({}), [msg, setMsg] = useState('');
  const refresh = async () => {
    setGs(mk((await getDocs(query(collection(db, 'groups'), where('teacherId', '==', uid)))).docs));
    setAs(mk((await getDocs(query(collection(db, 'assignments'), where('teacherId', '==', uid)))).docs));
    setAt(mk((await getDocs(query(collection(db, 'attempts'), where('teacherId', '==', uid)))).docs));
  };
  useEffect(() => { refresh(); }, []);
  const act = async (fn: () => Promise<any>, ok: string) => { setMsg(''); try { await fn(); setMsg(ok); refresh(); } catch (e) { setMsg(msgOf(e)); } };
  const seed = async () => { const b = writeBatch(db); (xylem as any[]).forEach((q, i) => { const {answer, confirmed, ...pub} = q; b.set(doc(db, 'questions', q.id), {...pub, order: i}); b.set(doc(db, 'keys', q.id), {answer, confirmed: !!confirmed, topicId: q.topicId}); }); await b.commit(); };
  const group = async () => { if (!name.trim()) throw new Error('Введите название группы');
    const code = 'BIO-' + Array.from(crypto.getRandomValues(new Uint8Array(3))).map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    const r = await addDoc(collection(db, 'groups'), {name: name.trim(), code, teacherId: uid, createdAt: serverTimestamp()}); await setDoc(doc(db, 'groupCodes', code), {groupId: r.id, teacherId: uid}); };
  const assign = async () => {
    if (!f.groupId) throw new Error('Выберите группу');
    const ks = await getDocs(query(collection(db, 'keys'), where('topicId', '==', f.topicId)));
    if (!ks.size) throw new Error('Сначала загрузите задания');
    if (f.mode === 'control' && ks.docs.some(k => k.data().confirmed !== true)) throw new Error('Ключ требует проверки учителем');
    await addDoc(collection(db, 'assignments'), {groupId: f.groupId, teacherId: uid, topicId: f.topicId, due: f.due || null, dueAt: f.due ? Timestamp.fromDate(new Date(f.due + 'T23:59:59+05:00')) : null, mode: f.mode, tries: Math.min(5, Math.max(1, +f.tries || 1)), createdAt: serverTimestamp()});
  };
  const review = async (t: any, retry: boolean) => {
    const a = as.find(x => x.id === t.assignmentId); const ks = await getDocs(query(collection(db, 'keys'), where('topicId', '==', a.topicId)));
    let score = 0; ks.docs.forEach(k => { if (t.answers[k.id] !== undefined && t.answers[k.id] === k.data().answer) score++; });
    if (cm[t.id]?.trim()) await addDoc(collection(db, 'attempts', t.id, 'comments'), {text: cm[t.id].trim(), at: serverTimestamp()});
    await updateDoc(doc(db, 'attempts', t.id), {score, max: ks.size, status: retry ? 'На доработке' : 'Проверено'});
    if (retry) await updateDoc(doc(db, 'assignments', t.assignmentId), {tries: increment(1)});
  };
  return <div><h2>Кабинет учителя</h2><div><b>{msg}</b></div>
    <div style={card}><button onClick={() => act(seed, 'Задания загружены')}>Загрузить задания (тема «xylem»)</button></div>
    <div style={card}><input placeholder="Название группы" value={name} onChange={e => setName(e.target.value)}/><button onClick={() => act(group, 'Группа создана')}>Создать группу</button>{gs.map(g => <div key={g.id}>{g.name}: код <b>{g.code}</b></div>)}</div>
    <div style={card}><select value={f.groupId} onChange={e => setF({...f, groupId: e.target.value})}><option value="">Группа</option>{gs.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
      <input type="date" value={f.due} onChange={e => setF({...f, due: e.target.value})}/><select value={f.mode} onChange={e => setF({...f, mode: e.target.value})}><option value="training">Тренировка</option><option value="control">Контрольный</option></select>
      <input type="number" min={1} max={5} value={f.tries} onChange={e => setF({...f, tries: +e.target.value})}/><button onClick={() => act(assign, 'Назначено')}>Назначить</button></div>
    <h3>Работы</h3>{at.map(t => <div key={t.id} style={card}>{t.studentName} · попытка {t.n} · {t.status} · {t.score != null ? `${t.score}/${t.max}` : 'балл ещё не посчитан'}
      <textarea placeholder="Комментарий" value={cm[t.id] || ''} onChange={e => setCm({...cm, [t.id]: e.target.value})}/>
      <button onClick={() => act(() => review(t, false), 'Проверено')}>Посчитать балл и отметить «Проверено»</button> <button onClick={() => act(() => review(t, true), 'Назначена доработка')}>На доработку</button></div>)}</div>;
}
