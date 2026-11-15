import {useEffect, useState} from 'react';

const ST = [
  {n: 'Бодрствование', c: '#f59e0b', t: 'Человек засыпает или ненадолго просыпается. Короткие пробуждения ночью — это нормально, утром мы их не помним.'},
  {n: 'Быстрый сон', c: '#ec4899', t: 'Глаза под веками быстро двигаются, мозг активен почти как днём, мы видим сны. Мышцы расслаблены. В это время мозг перерабатывает и закрепляет то, что выучено за день.'},
  {n: 'Лёгкий медленный сон', c: '#60a5fa', t: 'Дыхание и пульс замедляются, температура тела немного падает. Человека легко разбудить.'},
  {n: 'Глубокий медленный сон', c: '#1d4ed8', t: 'Самый крепкий сон: разбудить трудно. Организм восстанавливает силы, у детей и подростков выделяется гормон роста. Его больше всего в первой половине ночи.'},
];
const SEQ: [number, number][] = [[0, 0], [10, 2], [25, 3], [75, 2], [85, 1], [95, 2], [110, 3], [160, 2], [172, 1], [190, 2], [205, 3], [235, 2], [255, 1], [285, 2], [330, 1], [365, 2], [400, 1], [440, 2], [470, 1], [520, 2], [535, 0], [540, 0]];
const stageAt = (m: number) => { let s = 0; for (const [a, b] of SEQ) if (m >= a) s = b; return s; };
const hh = (m: number) => { const t = (22 * 60 + m) % 1440; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.round(t % 60)).padStart(2, '0')}`; };

export function SleepNight() {
  const [m, setM] = useState(0), [play, setPlay] = useState(false);
  useEffect(() => { if (!play) return; const id = setInterval(() => setM(x => { if (x >= 540) { setPlay(false); return 540; } return x + 3; }), 50); return () => clearInterval(id); }, [play]);
  const W = 560, H = 190, px = (x: number) => 46 + x / 540 * (W - 60), py = (s: number) => 28 + s * 40, s = stageAt(m);
  let d = ''; SEQ.forEach(([a, b], i) => { d += i ? ` L${px(a)} ${py(SEQ[i - 1][1])} L${px(a)} ${py(b)}` : `M${px(a)} ${py(b)}`; });
  return <div className="card"><h3>Что происходит ночью: фазы сна</h3>
    <div className="mu">Сон состоит из циклов примерно по 90 минут. За ночь их 4–6. Запусти ночь или двигай ползунок.</div>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="График фаз сна за ночь" style={{display: 'block', width: '100%', maxWidth: 720, margin: '8px auto'}}>
      {ST.map((x, i) => <g key={i}><line x1="46" y1={py(i)} x2={W - 14} y2={py(i)} stroke="var(--bd)" strokeWidth="1"/><circle cx="14" cy={py(i)} r="7" fill={x.c}/><text x="26" y={py(i) + 4} fontSize="10" fill="var(--mu)">{['Б', 'БС', 'Л', 'Г'][i]}</text></g>)}
      <path d={d} fill="none" stroke="var(--tx)" strokeWidth="2.5" strokeLinejoin="round"/>
      {SEQ.slice(0, -1).map(([a, b], i) => <line key={i} x1={px(a)} y1={py(b)} x2={px(SEQ[i + 1][0])} y2={py(b)} stroke={ST[b].c} strokeWidth="6" strokeLinecap="round"/>)}
      <line x1={px(m)} y1="14" x2={px(m)} y2={H - 24} stroke="var(--au)" strokeWidth="2.5"/><circle cx={px(m)} cy={py(s)} r="8" fill="#ffd166" stroke="#b45309" strokeWidth="2"/>
      {[0, 120, 240, 360, 480, 540].map(x => <text key={x} x={px(x)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--mu)">{hh(x)}</text>)}</svg>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center'}}><button onClick={() => { if (m >= 540) setM(0); setPlay(!play); }}>{play ? '⏸ Пауза' : m >= 540 ? '↺ Сначала' : '▶ Запустить ночь'}</button><b>Время: {hh(m)}</b></div>
    <input aria-label="Время ночи" type="range" min={0} max={540} value={m} onChange={e => { setPlay(false); setM(+e.target.value); }} style={{width: '100%', padding: 0, border: 0, minHeight: 36, accentColor: 'var(--g)'}}/>
    <div className="warn" aria-live="polite"><b style={{color: ST[s].c}}>●</b> <b>{ST[s].n}.</b> {ST[s].t}</div>
    <div className="mu" style={{marginTop: 6}}>Б — бодрствование, БС — быстрый сон, Л — лёгкий, Г — глубокий медленный сон. График типичный, у каждого человека он немного свой.</div></div>;
}

const tm = (v: number) => `${String(Math.floor((v % 1440) / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
const PERF = [20, 15, 12, 10, 10, 15, 30, 50, 70, 85, 95, 100, 90, 70, 60, 70, 85, 92, 85, 70, 55, 40, 30, 22];
export function DayPlan() {
  const [bed, setBed] = useState(23 * 60), [up, setUp] = useState(7 * 60), [o, setO] = useState<any>({phone: true, air: false, sport: false});
  const sl = ((up + 1440 - bed) % 1440) / 60, ok = sl >= 9 && sl <= 11, late = bed % 1440 > 22 * 60 + 30 || bed >= 1440;
  let score = (ok ? 2 : sl >= 8 ? 1 : 0) + (late ? 0 : 1) + (o.phone ? 0 : 1) + (o.air ? 1 : 0) + (o.sport ? 1 : 0);
  const tips = [sl < 9 && `Сна всего ${sl.toFixed(1).replace('.0', '')} ч. В 12–13 лет нужно 9–10 часов: ложись раньше.`, sl > 11 && 'Слишком долгий сон тоже делает вялым.', late && 'Ложиться лучше до 22:30 — тогда больше глубокого сна в первой половине ночи.', o.phone && 'Телефон перед сном мешает заснуть: яркий свет экрана сбивает биологические часы. Убери его за час до сна.', !o.air && 'Проветри комнату: в прохладной комнате сон крепче.', !o.sport && 'Добавь зарядку или прогулку днём — заснуть будет легче.'].filter(Boolean) as string[];
  const W = 560, H = 130, px = (h: number) => 20 + h / 23 * (W - 40), py = (v: number) => H - 22 - v / 100 * (H - 40);
  const chk = (k: string, t: string) => <label style={{display: 'flex', gap: 8, alignItems: 'center', minHeight: 44}}><input type="checkbox" checked={o[k]} onChange={e => setO({...o, [k]: e.target.checked})} style={{width: 22, height: 22}}/> {t}</label>;
  return <div className="card"><h3>Собери свой режим дня</h3>
    <div className="duo"><div>
      <label htmlFor="bed"><b>Ложусь спать: {tm(bed)}</b></label><input id="bed" type="range" min={20 * 60} max={25 * 60} step={15} value={bed} onChange={e => setBed(+e.target.value)} style={{width: '100%', padding: 0, border: 0, minHeight: 36, accentColor: '#1d4ed8'}}/>
      <label htmlFor="up"><b>Встаю: {tm(up)}</b></label><input id="up" type="range" min={5 * 60} max={9 * 60} step={15} value={up} onChange={e => setUp(+e.target.value)} style={{width: '100%', padding: 0, border: 0, minHeight: 36, accentColor: '#f59e0b'}}/>
      {chk('phone', 'Сижу в телефоне перед сном')}{chk('air', 'Проветриваю комнату перед сном')}{chk('sport', 'Делаю зарядку или гуляю днём')}</div>
      <div aria-live="polite"><div className="warn"><b>Сон: {sl.toFixed(1).replace('.0', '')} ч. Оценка режима: {'★'.repeat(score)}{'☆'.repeat(6 - score)}</b><div>{score >= 5 ? 'Отличный режим: мозг успевает отдохнуть, память и внимание работают хорошо.' : score >= 3 ? 'Неплохо, но можно лучше.' : 'При таком режиме накапливается усталость: труднее учиться и запоминать.'}</div></div>
        {tips.length > 0 && <ul style={{margin: '8px 0', paddingLeft: 20}}>{tips.map(t => <li key={t}>{t}</li>)}</ul>}</div></div>
    <h3>Работоспособность в течение дня</h3>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Кривая работоспособности по часам суток: пики в 10–12 и 16–18 часов" style={{display: 'block', width: '100%', maxWidth: 720, margin: '0 auto'}}>
      <line x1="20" y1={H - 22} x2={W - 20} y2={H - 22} stroke="var(--bd)" strokeWidth="2"/>
      <polyline points={PERF.map((v, h) => `${px(h)},${py(v)}`).join(' ')} fill="none" stroke="var(--g)" strokeWidth="3.5" strokeLinejoin="round"/>
      {[[11, 'первый подъём'], [17, 'второй подъём'], [14, 'спад']].map(([h, t]) => <text key={t} x={px(+h)} y={py(PERF[+h]) - 8} textAnchor="middle" fontSize="11" fill="var(--mu)">{t}</text>)}
      {[0, 4, 8, 12, 16, 20, 23].map(h => <text key={h} x={px(h)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--mu)">{h}:00</text>)}</svg>
    <div className="mu">Самые трудные уроки и задания лучше делать в часы подъёма: примерно с 10 до 12 и с 16 до 18. Кривая типичная, у «жаворонков» и «сов» она сдвинута.</div></div>;
}

export function MemoryTest() {
  const [len, setLen] = useState(4), [seq, setSeq] = useState(''), [ph, setPh] = useState<'idle' | 'show' | 'ask' | 'res'>('idle'), [inp, setInp] = useState(''), [best, setBest] = useState(0), [grp, setGrp] = useState(false);
  const start = (n: number) => { let s = ''; for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10); setSeq(s); setInp(''); setPh('show'); };
  useEffect(() => { if (ph !== 'show') return; const id = setTimeout(() => setPh('ask'), 900 + len * 550); return () => clearTimeout(id); }, [ph, seq]);
  const check = () => { const ok = inp.replace(/\D/g, '') === seq; if (ok) setBest(Math.max(best, len)); setPh('res'); };
  const ok = inp.replace(/\D/g, '') === seq, show = grp ? seq.replace(/(\d{3})(?=\d)/g, '$1 ') : seq;
  return <div className="card"><h3>Опыт: объём кратковременной памяти</h3>
    <div className="mu">На экране ненадолго появятся цифры. Запомни их и введи по порядку. С каждым верным ответом ряд становится длиннее.</div>
    <div style={{minHeight: 96, display: 'grid', placeItems: 'center', background: 'var(--bg)', borderRadius: 14, margin: '10px 0', fontFamily: 'Rubik,sans-serif', fontSize: 'clamp(1.6rem,7vw,2.6rem)', letterSpacing: '.12em', fontWeight: 700}} aria-live="polite">
      {ph === 'show' ? show : ph === 'ask' ? '?' : ph === 'res' ? <span style={{color: ok ? '#15803d' : '#b91c1c'}}>{show}</span> : '— — — —'}</div>
    {ph === 'idle' && <button onClick={() => start(len)}>▶ Начать (цифр: {len})</button>}
    {ph === 'ask' && <><input inputMode="numeric" autoFocus placeholder="Введи цифры" value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') check(); }} aria-label="Цифры по порядку"/><button onClick={check}>Проверить</button></>}
    {ph === 'res' && <div className="warn"><b>{ok ? `✓ Верно! ${len} цифр запомнено.` : `✗ Было ${seq}, ты ввёл(а) ${inp || 'ничего'}.`}</b> <div><button onClick={() => { const n = ok ? Math.min(12, len + 1) : Math.max(3, len - 1); setLen(n); start(n); }}>{ok ? 'Дальше: на одну цифру больше ▶' : 'Ещё раз, на одну цифру меньше'}</button></div></div>}
    <label style={{display: 'flex', gap: 8, alignItems: 'center', minHeight: 44, marginTop: 6}}><input type="checkbox" checked={grp} onChange={e => setGrp(e.target.checked)} style={{width: 22, height: 22}}/> Показывать цифры группами по три (приём запоминания)</label>
    <div style={{marginTop: 4}}><b>Мой рекорд: {best || '—'} {best ? 'цифр' : ''}</b></div>
    <div className="mu" style={{marginTop: 6}}>Большинство людей удерживает в кратковременной памяти 5–9 элементов. Если объединять цифры в группы, запомнить удаётся больше — попробуй включить группы и сравни рекорд.</div></div>;
}
