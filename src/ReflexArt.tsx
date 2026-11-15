import {useEffect, useRef, useState} from 'react';

const ARC = [
  {n: 'Рецептор', c: '#2563eb', t: 'Чувствительное окончание в коже пальца. Воспринимает раздражение (высокую температуру) и превращает его в нервный импульс.'},
  {n: 'Чувствительный нейрон', c: '#2563eb', t: 'Проводит импульс от рецептора в спинной мозг. Его тело лежит в нервном узле рядом со спинным мозгом, импульс входит через задний корешок.'},
  {n: 'Вставочный нейрон (нервный центр)', c: '#16a34a', t: 'Находится в сером веществе спинного мозга. Принимает сигнал, «решает», что делать, и передаёт команду двигательному нейрону.'},
  {n: 'Двигательный нейрон', c: '#dc2626', t: 'Проводит команду из спинного мозга к мышце. Его аксон выходит через передний корешок.'},
  {n: 'Рабочий орган (мышца)', c: '#dc2626', t: 'Мышца плеча сокращается — рука отдёргивается от горячего. Весь путь занимает доли секунды, ещё до того, как мы осознаём боль.'},
];
const SEG = ['M92 238 L104 226', 'M104 226 C150 190 210 140 268 96 C292 78 318 70 338 70 C362 70 384 78 404 90', 'M404 90 C420 100 424 116 414 136', 'M414 136 C392 150 362 150 338 152 C300 160 250 196 214 222', 'M214 222 L196 236'];

export function ReflexArc() {
  const [step, setStep] = useState(0), [run, setRun] = useState(0), [pulled, setPulled] = useState(false); const tm = useRef<any[]>([]);
  const stop = () => { tm.current.forEach(clearTimeout); tm.current = []; };
  useEffect(() => stop, []);
  const play = () => { stop(); setPulled(false); setStep(0); setRun(r => r + 1); [1, 2, 3, 4].forEach(i => tm.current.push(setTimeout(() => setStep(i), i * 750))); tm.current.push(setTimeout(() => setPulled(true), 4 * 750 + 250)); };
  const go = (i: number) => { stop(); setRun(0); setPulled(i === 4); setStep((i + 5) % 5); };
  const w = (i: number) => (step === i ? 7 : 4), op = (i: number) => (step === i ? 1 : 0.55);
  return <div className="card"><h3>Рефлекторная дуга: путь нервного импульса</h3>
    <div className="mu">Рука коснулась горячего. Запусти рефлекс и проследи, через какие пять звеньев по порядку проходит сигнал.</div>
    <div className="duo" style={{gridTemplateColumns: '1fr'}}><div className="art"><svg viewBox="0 0 560 320" role="img" aria-label="Схема рефлекторной дуги отдёргивания руки" style={{maxWidth: 620}}>
      <ellipse cx="430" cy="112" rx="100" ry="74" fill="#f6efe2" stroke="var(--mu)" strokeWidth="2.5"/>
      <path d="M430 60 C410 62 396 74 398 92 C400 104 412 108 414 114 C416 124 398 128 396 142 C394 158 412 166 430 164 C448 166 466 158 464 142 C462 128 444 124 446 114 C448 108 460 104 462 92 C464 74 450 62 430 60 Z" fill="#cbbcae" stroke="#9c8b7c" strokeWidth="1.5"/>
      <circle cx="430" cy="112" r="4" fill="#f6efe2"/>
      <text x="430" y="30" textAnchor="middle" fontSize="13" fill="var(--mu)">спинной мозг (поперечный разрез)</text><text x="486" y="72" fontSize="11" fill="var(--mu)">серое</text><text x="486" y="85" fontSize="11" fill="var(--mu)">вещество</text>
      <ellipse cx="338" cy="70" rx="15" ry="11" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/><text x="318" y="50" textAnchor="middle" fontSize="11" fill="var(--mu)">нервный узел</text>
      <g style={{transition: 'transform .35s', transform: pulled ? 'translate(34px,-30px) rotate(-10deg)' : 'none', transformOrigin: '260px 200px'}}>
        <path d="M250 196 C210 214 170 236 126 250 C112 256 96 256 84 250 L70 244 C64 240 68 232 76 234 L96 238 C120 226 180 196 236 172 Z" fill="#f3c9a5" stroke="#b98a62" strokeWidth="2.5"/>
        <path d="M150 232 C170 214 206 204 236 206 C216 222 180 240 150 232 Z" fill={step === 4 ? '#ef4444' : '#f59a8b'} stroke="#b91c1c" strokeWidth="2" style={{transition: 'fill .2s'}}/>
        <circle cx="90" cy="240" r={step === 0 ? 8 : 5.5} fill="#2563eb" stroke="#fff" strokeWidth="2"/></g>
      <g><rect x="34" y="262" width="26" height="40" rx="4" fill="#e7e2d6" stroke="var(--mu)" strokeWidth="2"/><path d="M47 262 C36 246 44 236 47 222 C52 236 60 246 47 262 Z" fill="#fb923c" stroke="#ea580c" strokeWidth="1.5" className="npulse"/></g>
      {SEG.map((d, i) => <path key={i} d={d} fill="none" stroke={ARC[i].c} strokeWidth={w(i)} strokeLinecap="round" opacity={op(i)} style={{transition: 'opacity .2s'}}/>)}
      <circle cx="414" cy="113" r="6" fill="#16a34a"/><circle cx="414" cy="138" r="7" fill="#dc2626"/>
      {run > 0 && <circle key={run} r="8" fill="#ffe14a" stroke="#b45309" strokeWidth="2"><animateMotion dur="3.4s" repeatCount="1" fill="freeze" path="M92 238 L104 226 C150 190 210 140 268 96 C292 78 318 70 338 70 C362 70 384 78 404 90 C420 100 424 116 414 136 C392 150 362 150 338 152 C300 160 250 196 214 222 L196 236"/></circle>}
      {[[70, 214], [226, 108], [448, 112], [300, 182], [176, 266]].map(([x, y], i) => <g key={i} onClick={() => go(i)} className="part" role="button" tabIndex={0} aria-label={`Звено ${i + 1}: ${ARC[i].n}`} onKeyDown={e => { if (e.key === 'Enter') go(i); }}><circle cx={x} cy={y} r="14" fill={step === i ? '#ffd166' : 'var(--card)'} stroke={ARC[i].c} strokeWidth="3"/><text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f2d29">{i + 1}</text></g>)}
      <text x="150" y="300" fontSize="12" fill="var(--mu)">мышца плеча</text><text x="236" y="72" fontSize="11" fill="#2563eb">задний корешок</text><text x="330" y="172" fontSize="11" fill="#dc2626">передний корешок</text></svg></div>
      <div><div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}><button onClick={play}>▶ Запустить рефлекс</button><button className="s" onClick={() => go(step - 1)}>◀ Назад</button><button className="s" onClick={() => go(step + 1)}>Вперёд ▶</button></div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{ARC.map((a, i) => <button key={i} className={step === i ? '' : 's'} style={{minHeight: 36, padding: '2px 12px'}} onClick={() => go(i)} aria-label={`Звено ${i + 1}: ${a.n}`}>{i + 1}</button>)}</div>
        <div className="warn" aria-live="polite"><b>Звено {step + 1} из 5: {ARC[step].n}.</b> {ARC[step].t}</div>
        <div className="mu" style={{marginTop: 8}}><span style={{color: '#2563eb'}}>●</span> чувствительный путь · <span style={{color: '#16a34a'}}>●</span> вставочный нейрон · <span style={{color: '#dc2626'}}>●</span> двигательный путь</div></div></div></div>;
}

export function Pavlov() {
  const [s, setS] = useState(0), [pairs, setPairs] = useState(0), [ev, setEv] = useState<{bell: boolean; food: boolean; saliva: boolean; msg: string; n: number}>({bell: false, food: false, saliva: false, msg: 'Собака спокойна. Попробуй сначала включить звонок без корма.', n: 0});
  const act = (bell: boolean, food: boolean) => {
    let saliva = food, msg = '', ns = s;
    if (bell && food) { ns = Math.min(1, s + 0.2); setPairs(pairs + 1); msg = ns >= 0.6 ? 'Звонок и корм снова вместе: связь в коре мозга закрепляется.' : `Звонок, затем корм. Сочетаний: ${pairs + 1}. Между центром слуха и центром слюноотделения в коре начинает возникать временная связь.`; }
    else if (food) msg = 'Корм попал в рот — выделяется слюна. Это безусловный (врождённый) рефлекс: учиться ему не нужно.';
    else if (s >= 0.6) { saliva = true; ns = Math.max(0, s - 0.15); msg = ns >= 0.6 ? 'Слюна выделяется на один только звонок — выработан условный рефлекс! Но корма нет: без подкрепления рефлекс слабеет.' : 'Слюна ещё выделилась, но звонок уже несколько раз не подкрепили кормом. Рефлекс угасает — это торможение.'; }
    else msg = s > 0 ? 'Собака насторожилась, но слюны нет: связь ещё слабая. Нужно больше сочетаний звонка с кормом.' : 'Собака повернула голову на звук (ориентировочный рефлекс), но слюны нет: звонок для неё пока ничего не значит.';
    setS(ns); setEv({bell, food, saliva, msg, n: ev.n + 1});
  };
  return <div className="card"><h3>Опыт Павлова: вырабатываем условный рефлекс</h3>
    <div className="mu">Задача: добейся, чтобы у собаки выделялась слюна на один только звонок. А потом проверь, что будет, если звонок перестать подкреплять кормом.</div>
    <div className="duo"><div className="art"><svg viewBox="0 0 400 250" role="img" aria-label="Собака, миска и звонок">
      <rect x="0" y="206" width="400" height="44" fill="var(--bd)"/>
      <g key={'b' + ev.n} className={ev.bell ? 'ring' : ''} style={{transformOrigin: '60px 40px'}}><path d="M60 40 C40 44 38 70 30 84 L90 84 C82 70 80 44 60 40 Z" fill={ev.bell ? '#facc15' : '#d9d2bf'} stroke="#a16207" strokeWidth="2.5"/><circle cx="60" cy="90" r="6" fill="#a16207"/><line x1="60" y1="20" x2="60" y2="40" stroke="#a16207" strokeWidth="3"/></g>
      {ev.bell && <g stroke="#eab308" strokeWidth="3" fill="none" strokeLinecap="round"><path d="M100 50 q10 12 0 26"/><path d="M114 42 q16 20 0 42"/></g>}
      <g><ellipse cx="250" cy="150" rx="78" ry="40" fill="#c8a27a" stroke="#8a6644" strokeWidth="2.5"/>
        {[205, 232, 280, 304].map(x => <rect key={x} x={x} y={172} width="16" height="40" rx="7" fill="#c8a27a" stroke="#8a6644" strokeWidth="2.5"/>)}
        <path d="M324 138 C350 120 356 100 352 92" fill="none" stroke="#8a6644" strokeWidth="9" strokeLinecap="round"/>
        <g style={{transition: 'transform .3s', transform: ev.bell && !ev.food ? 'rotate(-12deg)' : ev.food ? 'rotate(10deg)' : 'none', transformOrigin: '190px 130px'}}>
          <ellipse cx="170" cy="112" rx="40" ry="32" fill="#d6b48c" stroke="#8a6644" strokeWidth="2.5"/><path d="M134 116 C116 114 108 124 112 134 C120 142 140 140 148 132 Z" fill="#d6b48c" stroke="#8a6644" strokeWidth="2.5"/>
          <circle cx="112" cy="124" r="5" fill="#3b2a1d"/><circle cx="160" cy="102" r="5" fill="#3b2a1d"/><path d="M186 84 C204 80 210 104 196 120 C188 110 184 96 186 84 Z" fill="#8a6644"/>
          {ev.saliva && <g fill="#60a5fa">{[0, 1, 2].map(i => <path key={i} d="M0 0 C-5 9 -5 14 0 16 C5 14 5 9 0 0 Z" transform={`translate(${126 + i * 7},${140})`} className="drip" style={{animationDelay: `${i * 0.25}s`}}/>)}</g>}</g></g>
      <path d="M78 206 C80 188 150 188 152 206 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2.5"/>{ev.food && <ellipse cx="115" cy="190" rx="26" ry="9" fill="#92400e"/>}
      <text x="60" y="118" textAnchor="middle" fontSize="12" fill="var(--mu)">звонок</text><text x="115" y="232" textAnchor="middle" fontSize="12" fill="var(--mu)">миска</text></svg></div>
      <div><div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}><button className="s" onClick={() => act(true, false)}>🔔 Только звонок</button><button className="s" onClick={() => act(false, true)}>🍖 Только корм</button><button onClick={() => act(true, true)}>🔔 + 🍖 Звонок, затем корм</button></div>
        <div className="warn" aria-live="polite" style={{marginTop: 8}}><b>{ev.saliva ? '💧 Слюна выделяется.' : 'Слюны нет.'}</b> {ev.msg}</div>
        <div style={{marginTop: 10}}><b>Сила условного рефлекса на звонок</b><div style={{height: 16, borderRadius: 8, background: 'var(--bd)', overflow: 'hidden', marginTop: 4}} role="progressbar" aria-valuenow={Math.round(s * 100)} aria-valuemin={0} aria-valuemax={100}><div style={{width: `${s * 100}%`, height: '100%', background: s >= 0.6 ? '#16a34a' : '#f59e0b', transition: 'width .3s'}}/></div>
          <div className="mu">{s >= 0.6 ? 'Рефлекс выработан: звонок стал сигналом пищи.' : s > 0 ? 'Связь формируется.' : 'Рефлекса нет.'} <button className="s" style={{minHeight: 34, padding: '2px 10px'}} onClick={() => { setS(0); setPairs(0); setEv({bell: false, food: false, saliva: false, msg: 'Опыт начат заново.', n: ev.n + 1}); }}>↺ Заново</button></div></div></div></div></div>;
}

const SORT: [string, number][] = [['Отдёргивание руки от горячего', 0], ['Слюна при виде лимона', 1], ['Мигание, когда что-то летит в глаз', 0], ['Кошка бежит на звук открываемого холодильника', 1], ['Кашель, когда поперхнулся', 0], ['Остановка на красный свет', 1], ['Сосание у новорождённого', 0], ['Умение ездить на велосипеде', 1], ['Коленный рефлекс', 0]];
const GR = ['Безусловный', 'Условный'];
export function ReflexSort() {
  const [a, setA] = useState<Record<number, number>>({});
  const done = Object.keys(a).length === SORT.length, right = SORT.filter((s, i) => a[i] === s[1]).length;
  return <div className="card"><h3>Проверь себя: условный или безусловный?</h3>
    {SORT.map(([t, g], i) => <div key={t} style={{padding: '8px 0', borderBottom: '1px solid var(--bd)'}}><b>{t}</b> {a[i] !== undefined && <span style={{color: a[i] === g ? '#15803d' : '#b91c1c', fontWeight: 700}}>{a[i] === g ? '✓ верно' : `✗ это ${GR[g].toLowerCase()} рефлекс`}</span>}
      <div>{GR.map((n, j) => <button key={n} className={a[i] === j ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.88rem'}} onClick={() => setA({...a, [i]: j})}>{n}</button>)}</div></div>)}
    {done && <div className="warn" style={{marginTop: 8}}><b>Верно {right} из {SORT.length}.</b> <button className="s" onClick={() => setA({})}>Пройти ещё раз</button></div>}</div>;
}
