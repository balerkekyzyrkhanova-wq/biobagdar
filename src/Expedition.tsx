import {lazy, Suspense, useState} from 'react';
const Cell3D = lazy(() => import('./Cell3D'));
const Heart3D = lazy(() => import('./Heart3D'));
const Human3D = lazy(() => import('./Human3D'));
const Eco3D = lazy(() => import('./Eco3D'));
const Leaf3D = lazy(() => import('./Leaf3D'));
const NerveTypes = lazy(() => import('./NerveArt').then(m => ({default: m.NerveTypes})));
const Neuron = lazy(() => import('./NerveArt').then(m => ({default: m.Neuron})));
const ReflexArc = lazy(() => import('./ReflexArt').then(m => ({default: m.ReflexArc})));
const Pavlov = lazy(() => import('./ReflexArt').then(m => ({default: m.Pavlov})));
const ReflexSort = lazy(() => import('./ReflexArt').then(m => ({default: m.ReflexSort})));
const SleepNight = lazy(() => import('./SleepArt').then(m => ({default: m.SleepNight})));
const DayPlan = lazy(() => import('./SleepArt').then(m => ({default: m.DayPlan})));
const MemoryTest = lazy(() => import('./SleepArt').then(m => ({default: m.MemoryTest})));
const Composition = lazy(() => import('./ChemArt').then(m => ({default: m.Composition})));
const TestLab = lazy(() => import('./ChemArt').then(m => ({default: m.TestLab})));
const NPKLab = lazy(() => import('./ChemArt').then(m => ({default: m.NPKLab})));
const Brain3D = lazy(() => import('./Brain3D'));
const Map3D = lazy(() => import('./Map3D'));
const Succ3D = lazy(() => import('./Succ3D'));
const Factor3D = lazy(() => import('./Factor3D'));
const FactorSort = lazy(() => import('./Factor3D').then(m => ({default: m.FactorSort})));

export const STN: [string, string, string][] = [['🧫', 'Мир клетки', '#7c5cff'], ['🌿', 'Лаборатория растений', '#2f9e5b'], ['🦎', 'Мир животных', '#ff8a3d'], ['🫁', 'Организм человека', '#ef476f'], ['🏜️', 'Экосистемы Казахстана', '#e9b44c'], ['📊', 'Центр анализа данных', '#2aa7e0']];
const AVS = ['🦊', '🐢', '🦎', '🌵'], COLS = ['#0f766e', '#2563eb', '#b8860b', '#9333ea'];

export function useProfile() {
  const get = () => { try { return JSON.parse(localStorage.getItem('bb_prof') || 'null') || {av: '🦊', col: '#0f766e'}; } catch { return {av: '🦊', col: '#0f766e'}; } };
  const [p, setP] = useState(get());
  const set = (x: any) => { const n = {...p, ...x}; setP(n); try { localStorage.setItem('bb_prof', JSON.stringify(n)); } catch {} };
  return [p, set] as const;
}

export function OwlIcon({size = 60}: {size?: number}) {
  return <svg className="owlsvg" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <path d="M12 14 L22 20 L16 28Z M52 14 L42 20 L48 28Z" fill="#7a4a2e"/>
    <ellipse cx="32" cy="38" rx="22" ry="22" fill="#9a6340"/><ellipse cx="32" cy="43" rx="14" ry="15" fill="#f6e3c4"/>
    <path d="M24 40 q3 3 6 0 M34 40 q3 3 6 0 M27 47 q5 3 10 0" stroke="#d9b98a" strokeWidth="1.6" fill="none"/>
    <circle cx="23" cy="29" r="9" fill="#fff"/><circle cx="41" cy="29" r="9" fill="#fff"/>
    <g className="eye"><circle cx="23" cy="30" r="4.5" fill="#12302a"/><circle cx="41" cy="30" r="4.5" fill="#12302a"/><circle cx="24.6" cy="28.4" r="1.4" fill="#fff"/><circle cx="42.6" cy="28.4" r="1.4" fill="#fff"/></g>
    <path d="M29 34 L35 34 L32 40Z" fill="#ff9f1c"/>
    <path d="M12 40 q-5 10 4 18 q2 -10 2 -16Z M52 40 q5 10 -4 18 q-2 -10 -2 -16Z" fill="#7a4a2e"/>
    <path d="M24 60 h5 M35 60 h5" stroke="#ff9f1c" strokeWidth="3" strokeLinecap="round"/></svg>;
}

export function Owl({text}: {text: string}) {
  const [open, setOpen] = useState(() => { try { return localStorage.getItem('bb_owl') !== '0'; } catch { return true; } });
  const tg = () => { setOpen(!open); try { localStorage.setItem('bb_owl', open ? '0' : '1'); } catch {} };
  return <div className="card owl"><OwlIcon size={open ? 64 : 44}/><div style={{flex: 1}}><div className="bar"><b>Био, научный помощник</b><button className="s" onClick={tg}>{open ? 'Свернуть' : 'Развернуть'}</button></div>
    {open && <div className="bub">{text}<div className="mu">Заранее подготовленные реплики, это не чат с ИИ.</div></div>}</div></div>;
}

export function Hero({onOut}: {onOut?: () => void}) {
  return <header className="hero">
    <svg className="lf" viewBox="0 0 200 200" aria-hidden="true"><path d="M20 180 C20 80 80 20 180 20 C180 120 120 180 20 180Z" fill="#fff"/><path d="M20 180 L150 50" stroke="#12806f" strokeWidth="4"/></svg>
    <h1>BioБағдар</h1><p>Биологическая экспедиция · 7 класс</p>
    {onOut && <button className="out s" onClick={onOut} style={{background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: '#fff', boxShadow: 'none'}}>Выйти</button>}
    <svg className="w" viewBox="0 0 400 26" preserveAspectRatio="none" aria-hidden="true"><path d="M0 14 C60 0 110 28 200 14 S340 0 400 14 V26 H0Z" fill="var(--bg)"/></svg></header>;
}

export function Profile({prof, setProf}: any) {
  return <div className="card"><b style={{color: prof.col}}><span style={{fontSize: '1.6rem'}}>{prof.av}</span> Мой профиль исследователя</b>
    <div style={{marginTop: 8}}>Аватар: {AVS.map(a => <button key={a} className={'av' + (prof.av === a ? ' on' : '')} aria-label={'Аватар ' + a} onClick={() => setProf({av: a})}>{a}</button>)}</div>
    <div>Цвет: {COLS.map(c => <button key={c} className={'dot' + (prof.col === c ? ' on' : '')} style={{background: c}} aria-label={'Цвет ' + c} onClick={() => setProf({col: c})}/>)}</div></div>;
}

export type TopicDef = {id: string; title: string; par: string; ready?: boolean; extra?: boolean};
export const STATIONS: {desc: string; topics: TopicDef[]}[] = [
  {desc: 'Клетка, вещества, ДНК, бактерии и вирусы.', topics: [
    {id: 'cell', title: 'Клетка: растительная и животная', par: '§11–12', ready: true},
    {id: 'chem', title: 'Вода и вещества клетки, удобрения', par: '§13–15', ready: true},
    {id: 'dna', title: 'ДНК, гены и хромосомы', par: '§48–51'},
    {id: 'micro', title: 'Бактерии и вирусы', par: '§60–63'}]},
  {desc: 'Транспорт, фотосинтез, дыхание, размножение растений.', topics: [
    {id: 'xylem', title: 'Транспорт веществ: ксилема и флоэма', par: '§16–20', ready: true},
    {id: 'photo', title: 'Лист и фотосинтез', par: '§22–23, 33', ready: true},
    {id: 'plantresp', title: 'Дыхание и выделение у растений', par: '§25, 30'},
    {id: 'plantrepro', title: 'Размножение и рост растений', par: '§52–55, 58–59'}]},
  {desc: 'Классы, сердце, дыхание, движение и развитие.', topics: [
    {id: 'animals', title: 'Классификация и классы животных', par: '§8–10', ready: true},
    {id: 'heart', title: 'Кровеносная система и сердце', par: '§21', ready: true},
    {id: 'animresp', title: 'Дыхание и выделение у животных', par: '§26, 31'},
    {id: 'animmove', title: 'Движение и развитие животных', par: '§34, 56–57'}]},
  {desc: 'Дыхание, нервная система, рефлексы, сон и память.', topics: [
    {id: 'human', title: 'Дыхание человека', par: '§27–28', ready: true},
    {id: 'nerve', title: 'Нервная система и головной мозг', par: '§35–39, 43', ready: true},
    {id: 'reflex', title: 'Рефлексы и поведение', par: '§40–42', ready: true},
    {id: 'sleep', title: 'Сон, режим дня и память', par: '§44–47', ready: true},
    {id: 'food', title: 'Пищеварение', par: 'дополнительно', ready: true, extra: true}]},
  {desc: 'Факторы среды, цепи питания, сукцессия, охрана природы.', topics: [
    {id: 'ecofact', title: 'Экологические факторы', par: '§1', ready: true},
    {id: 'eco', title: 'Пищевые цепи и сети', par: '§2', ready: true},
    {id: 'success', title: 'Смена экосистем, сукцессия', par: '§3', ready: true},
    {id: 'redbook', title: 'Человек и природа: заповедники и Красная книга', par: '§4–7', ready: true}]},
];
export const stationOf = (id: string) => STATIONS.findIndex(s => s.topics.some(t => t.id === id));

export function StationMap({onStation, onTrainer}: any) {
  return <><h2>Карта экспедиции</h2><div className="grid">{STN.map((s, i) => { const st = STATIONS[i]; return <div key={s[1]} className="card st on" style={{'--sc': s[2]} as any}><div className="band"/><div className="ic" aria-hidden="true">{s[0]}</div><b>{s[1]}</b>
    {st ? <><div className="mu">{st.desc}</div><div className="mu">Тем готово: {st.topics.filter(t => t.ready).length} из {st.topics.length}</div><button onClick={() => onStation(i)}>Открыть станцию</button></>
      : <><div className="mu">Олимпиадные задания с рисунками и разбором.</div><button onClick={onTrainer}>🏆 Олимпиадный тренажёр</button></>}</div>; })}</div></>;
}

export function StationPage({i, onBack, onOpen}: any) {
  const s = STN[i], st = STATIONS[i];
  return <div><button className="s" onClick={onBack}>← К карте</button><h1><span aria-hidden="true">{s[0]}</span> {s[1]}</h1><div className="mu">{st.desc}</div>
    <div className="tl">{st.topics.map((t, n) => <div key={t.id} className={'card tp' + (t.ready ? '' : ' off')} style={{'--sc': s[2]} as any}>
      <div className="num" aria-hidden="true">{t.extra ? '+' : n + 1}</div>
      <div className="tx"><b>{t.title}</b></div>
      {t.ready ? <button onClick={() => onOpen(t.id)}>Открыть</button> : <span className="tag">Скоро</span>}</div>)}</div></div>;
}

export function TopicView({id, onBack}: any) {
  return id === 'cell' ? <CellTopic onBack={onBack}/> : id === 'xylem' ? <Topic onBack={onBack}/> : id === 'animals' ? <AnimalTopic part="classes" onBack={onBack}/> : id === 'heart' ? <AnimalTopic part="heart" onBack={onBack}/>
    : id === 'human' ? <HumanTopic part="breath" onBack={onBack}/> : id === 'food' ? <HumanTopic part="food" onBack={onBack}/> : id === 'eco' ? <EcoTopic onBack={onBack}/> : id === 'photo' ? <PhotoTopic onBack={onBack}/> : id === 'ecofact' ? <FactorTopic onBack={onBack}/> : id === 'success' ? <SuccTopic onBack={onBack}/> : id === 'redbook' ? <RedTopic onBack={onBack}/> : id === 'nerve' ? <NerveTopic onBack={onBack}/> : id === 'reflex' ? <ReflexTopic onBack={onBack}/> : id === 'sleep' ? <SleepTopic onBack={onBack}/> : id === 'chem' ? <ChemTopic onBack={onBack}/> : null;
}

const PI: any = {
  xyl: ['Ксилема — трубки для воды и минеральных солей. Зрелые сосуды мёртвые и полые; вода идёт вверх, к листьям.', '#2563eb'],
  phl: ['Флоэма — трубки для растворённых сахаров. Её клетки живые; сахара идут от листьев к корням, плодам и точкам роста.', '#c2410c'],
  leaf: ['Лист: здесь образуются сахара при фотосинтезе, а через устьица испаряется вода — это «тянет» воду вверх.', '#15803d'],
  ring: ['Кольцо: тут убрана кора вместе с флоэмой. Древесина с ксилемой осталась, поэтому вода идёт, а сахара вниз через кольцо пройти не могут.', '#8a5a3b'],
  root: ['Корень впитывает воду и минеральные соли из почвы и запасает сахара, пришедшие по флоэме.', '#92400e'],
};

function PlantLab() {
  const [part, setPart] = useState(''), [run, setRun] = useState(false), [ring, setRing] = useState(false);
  const hl = (p: string) => part === p ? {filter: 'drop-shadow(0 0 4px #000)'} : {};
  const wp1 = 'M122 440 C150 400 188 372 191 322 L191 168', wp2 = 'M278 440 C250 400 194 372 191 322 L191 168';
  const sp = ring ? 'M209 168 L209 258' : 'M209 168 L209 322 C209 370 205 400 200 462';
  const status = !run ? 'Нажми «Запустить движение» и смотри, что и куда идёт.' : ring ? 'Вода по ксилеме идёт вверх. Сахара застряли над кольцом и накапливаются, ниже кольца их нет.' : 'Вода идёт вверх по ксилеме (синие капли), сахара идут вниз по флоэме (оранжевые зёрна).';
  return <div className="card lab"><div className="tb"><b style={{flexBasis: '100%'}}>Лаборатория: растение изнутри</b>
    <button onClick={() => setRun(!run)}>{run ? '⏸ Остановить' : '▶ Запустить движение'}</button>
    <button className="s" onClick={() => setRing(!ring)} aria-pressed={ring}>{ring ? '↩ Убрать кольцо' : '✂ Окольцевать ветку'}</button></div>
    <svg viewBox="0 0 400 500" role="img" aria-label="Растение в разрезе: по ксилеме вода поднимается вверх, по флоэме сахара идут вниз; можно окольцевать ветку">
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fd3f4"/><stop offset="1" stopColor="#e6f7ff"/></linearGradient></defs>
      <rect width="400" height="302" fill="url(#sky)"/><rect y="300" width="400" height="200" fill="#8b5e3c"/>
      <ellipse cx="80" cy="470" rx="40" ry="10" fill="#6f4a2f"/><ellipse cx="330" cy="400" rx="50" ry="12" fill="#6f4a2f"/><ellipse cx="60" cy="360" rx="30" ry="8" fill="#a37350"/><circle cx="240" cy="470" r="9" fill="#a8a29e"/><circle cx="150" cy="490" r="6" fill="#a8a29e"/>
      <path d="M0 300 Q100 288 200 300 T400 298 V312 H0Z" fill="#43b36b"/>
      <g className="rays"><g stroke="#ffc93c" strokeWidth="4" strokeLinecap="round">{Array.from({length: 12}, (_, i) => <line key={i} x1="345" y1="22" x2="345" y2="10" transform={`rotate(${i * 30} 345 50)`}/>)}</g></g><circle cx="345" cy="50" r="20" fill="#ffd54a"/>
      <g className="cloud" fill="#fff"><ellipse cx="70" cy="50" rx="30" ry="12"/><ellipse cx="95" cy="42" rx="22" ry="12"/><ellipse cx="52" cy="44" rx="18" ry="10"/></g>
      {/* корни */}
      <g className="part" onClick={() => setPart('root')} style={hl('root')}><g stroke="#e8c9a0" strokeWidth="6" fill="none" strokeLinecap="round"><path d="M200 305 C190 350 150 385 122 442"/><path d="M200 305 V468"/><path d="M200 305 C210 350 250 385 278 442"/></g>
        <g stroke="#f3e2c6" strokeWidth="1.8" strokeLinecap="round"><path d="M160 372 l-14 -4 M150 392 l-16 2 M136 418 l-14 6 M200 380 l-12 4 M200 410 l12 3 M200 440 l-12 4 M240 372 l14 -4 M250 392 l16 2 M264 418 l14 6"/></g></g>
      <text x="200" y="492" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="700">Корень</text>
      {/* стебель */}
      <g className="part" onClick={() => setPart('xyl')} style={hl('xyl')}><rect x="176" y="150" width="48" height="160" rx="10" fill="#7cc58f" stroke="#2f9e5b" strokeWidth="3"/><rect x="184" y="150" width="14" height="160" fill="#bfe6fb" stroke="#2aa7e0" strokeWidth="2"/></g>
      <g className="part" onClick={() => setPart('phl')} style={hl('phl')}><rect x="202" y="150" width="14" height="160" fill="#ffd9b8" stroke="#ff7a3d" strokeWidth="2"/></g>
      {/* листья */}
      <g className="part" onClick={() => setPart('leaf')} style={hl('leaf')}>
        <path d="M200 160 C130 150 80 110 66 60 C130 55 188 90 200 160Z" fill="#4cc47a" stroke="#1f7a43" strokeWidth="2.5"/><path d="M200 160 C160 120 110 90 78 66" stroke="#1f7a43" strokeWidth="2" fill="none"/>
        <path d="M200 160 C270 150 320 110 334 60 C270 55 212 90 200 160Z" fill="#4cc47a" stroke="#1f7a43" strokeWidth="2.5"/><path d="M200 160 C240 120 290 90 322 66" stroke="#1f7a43" strokeWidth="2" fill="none"/>
        <path d="M200 160 C170 110 180 60 200 30 C220 60 230 110 200 160Z" fill="#5fd48b" stroke="#1f7a43" strokeWidth="2.5"/><path d="M200 160 V40" stroke="#1f7a43" strokeWidth="2"/>
        <g fill="#1f7a43"><circle cx="110" cy="92" r="2.5"/><circle cx="140" cy="115" r="2.5"/><circle cx="290" cy="92" r="2.5"/><circle cx="260" cy="115" r="2.5"/></g></g>
      <text x="200" y="22" textAnchor="middle" fontSize="12" fill="#0f2d29" fontWeight="700">Лист</text>
      {ring && <g className="part pop" onClick={() => setPart('ring')} style={hl('ring')}><rect x="172" y="266" width="12" height="20" fill="#e8c9a0" stroke="#8a5a3b"/><rect x="200" y="266" width="28" height="20" fill="#e8c9a0" stroke="#8a5a3b"/><text x="234" y="281" fontSize="11" fill="#5b3a22" fontWeight="800">кольцо</text></g>}
      <text x="170" y="222" textAnchor="end" fontSize="12" fill="#0b6a99" fontWeight="800">Ксилема ↑</text><text x="232" y="222" fontSize="12" fill="#c2410c" fontWeight="800">Флоэма ↓</text>
      {ring && <ellipse className="swell" cx="209" cy="250" rx="16" ry="12" fill="#ff7a3d" opacity=".55"/>}
      {run && <g>
        {[0, 1, 2, 3].map(i => <circle key={'a' + i} r="5" fill="#2aa7e0" stroke="#fff" strokeWidth="1.5"><animateMotion dur="5s" begin={`${-i * 1.25}s`} repeatCount="indefinite" path={wp1}/></circle>)}
        {[0, 1, 2, 3].map(i => <circle key={'b' + i} r="5" fill="#2aa7e0" stroke="#fff" strokeWidth="1.5"><animateMotion dur="5s" begin={`${-i * 1.25 - .6}s`} repeatCount="indefinite" path={wp2}/></circle>)}
        {[0, 1, 2, 3, 4].map(i => <rect key={'s' + i} x="-4" y="-4" width="8" height="8" rx="2" fill="#ff7a3d" stroke="#fff" strokeWidth="1.5"><animateMotion dur={ring ? '3s' : '6s'} begin={`${-i * (ring ? .6 : 1.2)}s`} repeatCount="indefinite" path={sp}/></rect>)}
        {[[100, 80], [300, 80], [200, 52]].map(([x, y], i) => <g key={'v' + i} fill="#fff" stroke="#2aa7e0" strokeWidth="1"><circle className="vap" cx={x} cy={y} r="4" style={{animationDelay: `${i * .8}s`}}/><circle className="vap" cx={x + 12} cy={y - 8} r="3" style={{animationDelay: `${i * .8 + .9}s`}}/></g>)}</g>}
    </svg>
    <div style={{padding: '0 14px 14px'}}><div className="warn" aria-live="polite">{status}</div>
      <div className="warn" style={{marginTop: 8}}>{part ? <b style={{color: PI[part][1]}}>{PI[part][0]}</b> : 'Нажми на часть рисунка (лист, трубки, корень), чтобы прочитать пояснение.'}</div>
      <div className="mu" style={{marginTop: 6}}>Схема упрощена: на самом деле трубки идут пучками по всему стеблю. Анимация показывает направление, а не скорость.</div></div></div>;
}

const DATA = {t: 'Учебные модельные данные: сахара в тканях ветки, усл. ед. (по одной ветке в группе)', g: ['Опыт (кольцо коры)', 'Контроль (без кольца)'], s: ['Выше места кольца', 'Ниже места кольца'], v: [[8.5, 2.1], [5.0, 4.8]]};
function Chart() {
  const W = 330, m = 8.5 * 1.15, cl = ['#0f766e', '#b8860b'];
  return <div><div className="warn">{DATA.t}</div>
    <svg viewBox="0 0 330 200" width="100%" role="img" aria-label={'Столбчатая диаграмма: ' + DATA.t} style={{color: 'var(--tx)'}}>
      <line x1="40" y1="20" x2="40" y2="150" stroke="currentColor"/><line x1="40" y1="150" x2={W - 5} y2="150" stroke="currentColor"/><text x="2" y="14" fontSize="10" fill="currentColor">Сахара, усл. ед.</text>
      {[0, 5, 10].map(v => { const y = 150 - v / m * 130; return <g key={v}><text x="26" y={y + 3} fontSize="10" fill="currentColor">{v}</text><line x1="38" y1={y} x2={W - 5} y2={y} stroke="currentColor" opacity=".15"/></g>; })}
      {DATA.g.map((g, i) => <g key={g}>{DATA.s.map((s, j) => { const h = DATA.v[i][j] / m * 130, x = 60 + i * 140 + j * 50; return <g key={s}><rect x={x} y={150 - h} width="44" height={h} fill={cl[j]}/><text x={x + 22} y={145 - h} fontSize="11" textAnchor="middle" fill="currentColor">{DATA.v[i][j]}</text></g>; })}<text x={60 + i * 140 + 47} y="166" fontSize="10" textAnchor="middle" fill="currentColor">{g}</text></g>)}
      <rect x="50" y="178" width="10" height="10" fill={cl[0]}/><text x="64" y="187" fontSize="10" fill="currentColor">{DATA.s[0]}</text><rect x="180" y="178" width="10" height="10" fill={cl[1]}/><text x="194" y="187" fontSize="10" fill="currentColor">{DATA.s[1]}</text></svg>
    <details><summary>Исходная таблица</summary><div className="sc"><table><thead><tr><th></th>{DATA.s.map(s => <th key={s}>{s}</th>)}</tr></thead><tbody>{DATA.g.map((g, i) => <tr key={g}><td>{g}</td>{DATA.v[i].map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody></table></div></details>
    <div className="mu">Как читать: сравни столбцы «выше» и «ниже» кольца. В опыте сахара накопились выше кольца (8,5 против 2,1), в контроле почти поровну (5,0 и 4,8). Это согласуется с тем, что кольцо остановило поток сахаров вниз. Данные учебные, одна ветка в группе: для настоящего вывода нужны повторности.</div></div>;
}

export function Topic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Ксилема, флоэма и транспорт веществ</h1><span className="tag">Станция «Лаборатория растений»</span>
    <div className="card"><h3>Что я узнаю</h3>Чем ксилема отличается от флоэмы, что и куда они переносят и как по опыту с окольцовыванием делают выводы.</div>
    <div className="card"><h3>Зачем растению трубки</h3>Воду из корней нужно доставить к листьям, а сахара, образовавшиеся в листьях, — к корням, плодам и растущим почкам. Эту работу выполняют проводящие ткани: ксилема и флоэма. Они идут рядом и образуют проводящие пучки.
      <h3>Ксилема</h3>Ксилема проводит воду и растворённые минеральные вещества от корня вверх, к листьям. Зрелые сосуды — мёртвые полые трубки с прочными стенками, поэтому они ещё и поддерживают растение. Главная сила — испарение: вода выходит из листьев через устьица, и вслед за ней поднимается новая вода (транспирация).
      <h3>Флоэма</h3>Флоэма проводит органические вещества, прежде всего растворённые сахара. Её клетки живые. Сахара идут от места образования (лист) к месту потребления или запасания (корень, плод, растущий побег), поэтому направление зависит от нужд растения.
      <h3>Как это проверяют</h3>Если снять с ветки кольцо коры вместе с флоэмой, а древесину с ксилемой оставить, вода ещё поднимается к листьям, но сахара вниз не проходят: выше кольца они накапливаются. Для вывода нужен контроль — ветка без кольца и несколько повторностей.</div>
    <PlantLab/>
    <div className="card"><h3>Данные опыта</h3><Chart/></div>
    <div className="card"><h3>Ключевые термины</h3><b>Транспирация</b> — испарение воды растением. <b>Устьица</b> — отверстия в коже листа. <b>Сосуд</b> — трубка ксилемы. <b>Ситовидная трубка</b> — трубка флоэмы.
      <h3>Разобранная задача</h3>«Ветку окольцевали, а листья выше кольца зелёные. Что это говорит?» Вода поступает (значит, ксилема цела), а утолщение выше кольца — сахара не проходят вниз (флоэма прервана).
      <h3>Типичные ошибки</h3>Думать, что сахара идут вверх по ксилеме; считать ксилему и флоэму «венами и артериями»; делать общий вывод по одной ветке.
      <h3>Итог</h3>Ксилема — вода вверх, флоэма — сахара туда, где нужны. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export const OWL: any = {
  home: 'Привет! Я Био. Выбери станцию на карте и открой тему. Задания от учителя — выше карты, а разделы — в меню.',
  topic: 'Читай теорию, затем нажимай на части схемы и запускай движение. Посмотри на график: сравнивай опыт с контролем.',
  trainer: 'Это задания олимпиады. Сначала внимательно прочитай условие и рассмотри рисунок, потом отвечай. После проверки прочитай разбор.',
  cell: 'Нажимай на части клетки и переключай растительную и животную. Потом проведи опыт с осмосом: сравни воду и солёный раствор.',
  animals: 'Сравнивай классы по таблице: покровы, дыхание, сердце, температура, размножение.',
  heart: 'Выбери животное и запусти поток крови. Следи по шагам, в какую камеру кровь попадает сначала, а в какую потом.',
  food: 'Запусти путь пищи и следи по шагам, что происходит в каждом органе.',
  human: 'Запусти дыхание и следи за шагами по порядку: каждый шаг подсвечивает нужный орган.',
  eco: 'Выбери экосистему и иди по цепи питания слева направо. Потом попробуй убрать звено и посмотри, что изменится.',
  photo: 'Запусти фотосинтез, а потом выключай по очереди свет, воду и закрывай устьица. Посмотри, что перестаёт двигаться.',
  ecofact: 'Выбери растение и двигай ползунки. Найди, при каких условиях ему лучше всего и какой фактор его ограничивает.',
  success: 'Запусти время и смотри, кто появляется первым, а кто приходит позже. Сравни скалу, пожарище и озеро.',
  redbook: 'Нажимай на метки на карте, потом открой Красную книгу и посмотри, где охраняют каждый вид. В конце — история Аральского моря.',
  nerve: 'Нажимай на части мозга и читай, за что они отвечают. Потом включи «Проверяю себя» и найди отделы без подсказок.',
  reflex: 'Запусти рефлекс и проследи пять звеньев дуги. Потом выработай у собаки условный рефлекс на звонок, как в опыте Павлова.',
  sleep: 'Посмотри, как меняется сон за ночь, собери свой режим дня и проверь, сколько цифр удерживает твоя память.',
  chem: 'Проведи опыты в виртуальной лаборатории: найди крахмал, жир, белок, воду и соли. Потом посмотри, что будет с растением без азота, фосфора или калия.',
  diary: 'Ошибка — это подсказка, что повторить. Выбери причину честно, так легче не повторять её.',
};

// ---------- Мир клетки ----------
const CI: any = {
  wall: ['Клеточная стенка (только у растений, грибов и бактерий): прочный каркас, у растений из целлюлозы. Она даёт форму и защищает; вода и растворы через неё проходят свободно.', '#2f7a3a'],
  mem: ['Клеточная мембрана: тонкая плёнка, которая выбирает, какие вещества входят в клетку и выходят из неё. Есть у всех клеток.', '#5bb450'],
  cyt: ['Цитоплазма: жидкое содержимое клетки. В ней расположены органоиды, и в ней идут многие реакции. Часто она медленно течёт — это движение цитоплазмы.', '#8a6d3b'],
  nuc: ['Ядро: хранит наследственную информацию (ДНК) и управляет работой клетки.', '#7c5cff'],
  vac: ['Вакуоль: у растений крупная, заполнена клеточным соком. Запасает воду и вещества и создаёт упругость клетки (тургор).', '#2a7fb8'],
  chl: ['Хлоропласты (только у растений): здесь на свету идёт фотосинтез. Зелёный цвет им даёт хлорофилл.', '#15803d'],
  mit: ['Митохондрии: здесь при дыхании высвобождается энергия из органических веществ. Они есть и у растений, и у животных.', '#c2410c'],
  rib: ['Рибосомы: крошечные «фабрики», на которых синтезируются белки.', '#6b21a8'],
};

export function CellLab() {
  const [kind, setKind] = useState<'plant' | 'animal'>('plant'), [run, setRun] = useState(false), [part, setPart] = useState('');
  const pl = kind === 'plant';
  const hl = (p: string) => (part === p ? {filter: 'drop-shadow(0 0 5px #000)'} : {});
  const avail = pl ? ['wall', 'mem', 'cyt', 'nuc', 'vac', 'chl', 'mit', 'rib'] : ['mem', 'cyt', 'nuc', 'vac', 'mit', 'rib'];
  const sel = (p: string) => { setPart(p); };
  const circ = 'M200 60 a150 90 0 1 0 0.01 0';
  return <div className={'card lab' + (run ? ' crun' : '')}><div className="tb"><b style={{flexBasis: '100%'}}>Лаборатория: клетка под микроскопом</b>
    <button className={pl ? '' : 's'} onClick={() => { setKind('plant'); setPart(''); }}>🌿 Растительная клетка</button>
    <button className={pl ? 's' : ''} onClick={() => { setKind('animal'); setPart(''); }}>🐾 Животная клетка</button>
    <button className="s" onClick={() => setRun(!run)}>{run ? '⏸ Остановить' : '▶ Запустить жизнь клетки'}</button></div>
    <svg viewBox="0 0 400 320" role="img" aria-label={pl ? 'Схема растительной клетки' : 'Схема животной клетки'} style={{background: '#101d2b'}}>
      {pl ? <>
        <g className="part" onClick={() => sel('wall')} style={hl('wall')}><rect x="14" y="14" width="372" height="292" rx="46" fill="#7fbf6e" stroke="#2f7a3a" strokeWidth="6"/></g>
        <g className="part" onClick={() => sel('mem')} style={hl('mem')}><rect x="26" y="26" width="348" height="268" rx="38" fill="#eaf7d9" stroke="#5bb450" strokeWidth="4"/></g>
        <g className="part" onClick={() => sel('cyt')} style={hl('cyt')}><rect x="34" y="34" width="332" height="252" rx="32" fill="#f4f9e6" opacity=".01"/></g>
        <g className="part" onClick={() => sel('vac')} style={hl('vac')}><ellipse cx="150" cy="165" rx="92" ry="78" fill="#bfe6fb" stroke="#2a7fb8" strokeWidth="3"/><text x="150" y="170" textAnchor="middle" fontSize="12" fill="#17527a">вакуоль</text></g>
        <g className="part" onClick={() => sel('nuc')} style={hl('nuc')}><circle cx="300" cy="100" r="38" fill="#ddd6fe" stroke="#7c5cff" strokeWidth="3"/><circle cx="306" cy="104" r="11" fill="#a78bfa"/><text x="300" y="150" textAnchor="middle" fontSize="12" fill="#4c1d95">ядро</text></g>
        <g className="part chl" onClick={() => sel('chl')} style={hl('chl')}>{[[60, 70], [110, 50], [60, 250], [250, 255], [335, 205], [335, 250]].map(([x, y], i) => <g key={i}><ellipse cx={x} cy={y} rx="20" ry="11" fill="#22c55e" stroke="#15803d" strokeWidth="2"/><path d={`M${x - 11} ${y} h22 M${x - 9} ${y - 4} h18 M${x - 9} ${y + 4} h18`} stroke="#15803d" strokeWidth="1.2"/></g>)}</g>
        <g className="part mit" onClick={() => sel('mit')} style={hl('mit')}>{[[270, 190], [255, 60], [90, 135]].map(([x, y], i) => <g key={i}><ellipse cx={x} cy={y} rx="19" ry="9" fill="#fdba74" stroke="#c2410c" strokeWidth="2"/><path d={`M${x - 12} ${y} q4 -6 8 0 t8 0 t8 0`} stroke="#c2410c" strokeWidth="1.3" fill="none"/></g>)}</g>
      </> : <>
        <g className="part" onClick={() => sel('mem')} style={hl('mem')}><path d="M60 150 C50 70 130 22 210 30 C300 24 365 80 352 160 C360 240 290 296 200 290 C110 298 40 240 60 150Z" fill="#fde7d4" stroke="#f59e6b" strokeWidth="5"/></g>
        <g className="part" onClick={() => sel('cyt')} style={hl('cyt')}><path d="M76 150 C68 90 140 48 210 52 C290 46 340 94 332 160 C338 224 278 272 200 268 C120 274 64 224 76 150Z" fill="#fff4e8" opacity=".01"/></g>
        <g className="part" onClick={() => sel('nuc')} style={hl('nuc')}><circle cx="215" cy="150" r="48" fill="#ddd6fe" stroke="#7c5cff" strokeWidth="3"/><circle cx="224" cy="156" r="14" fill="#a78bfa"/><text x="215" y="215" textAnchor="middle" fontSize="12" fill="#4c1d95">ядро</text></g>
        <g className="part" onClick={() => sel('vac')} style={hl('vac')}>{[[110, 215], [300, 80], [310, 225]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="14" fill="#bfe6fb" stroke="#2a7fb8" strokeWidth="2"/>)}</g>
        <g className="part mit" onClick={() => sel('mit')} style={hl('mit')}>{[[130, 110], [290, 160], [150, 245], [250, 250]].map(([x, y], i) => <g key={i}><ellipse cx={x} cy={y} rx="19" ry="9" fill="#fdba74" stroke="#c2410c" strokeWidth="2"/><path d={`M${x - 12} ${y} q4 -6 8 0 t8 0 t8 0`} stroke="#c2410c" strokeWidth="1.3" fill="none"/></g>)}</g>
      </>}
      <g className="part" onClick={() => sel('rib')} style={hl('rib')}>{(pl ? [[200, 255], [225, 270], [240, 150], [215, 230], [325, 150]] : [[150, 175], [160, 190], [270, 215], [250, 90], [175, 80]]).map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#7e22ce"/>)}</g>
      {run && <g>{[0, 1, 2, 3, 4, 5].map(i => <circle key={i} r="4" fill="#fde047" stroke="#a16207" strokeWidth="1"><animateMotion dur="14s" begin={`${-i * 2.3}s`} repeatCount="indefinite" path={pl ? 'M200 44 h110 a30 30 0 0 1 30 30 v150 a30 30 0 0 1 -30 30 h-240 a30 30 0 0 1 -30 -30 v-150 a30 30 0 0 1 30 -30 z' : 'M210 44 C300 40 345 94 340 160 C346 226 286 276 200 272 C116 278 66 226 70 156 C66 92 130 44 210 44Z'}/></circle>)}</g>}
    </svg>
    <div style={{padding: '0 14px 14px'}}><div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{avail.map(p => <button key={p} className={part === p ? '' : 's'} style={{minHeight: 36, padding: '4px 10px'}} onClick={() => sel(p)}>{CI[p][0].split(':')[0].split(' (')[0]}</button>)}</div>
      <div className="warn" aria-live="polite">{part && avail.includes(part) ? <b style={{color: CI[part][1]}}>{CI[part][0]}</b> : 'Нажми на часть клетки на рисунке или на кнопку с названием органоида.'}</div>
      <div className="warn" style={{marginTop: 8}}>{pl ? 'Растительная клетка: есть клеточная стенка, хлоропласты и крупная вакуоль.' : 'Животная клетка: нет клеточной стенки и хлоропластов, вакуоли мелкие.'}{run ? ' Жёлтые точки показывают движение цитоплазмы, а митохондрии и хлоропласты «работают».' : ''}</div>
      <div className="mu" style={{marginTop: 6}}>Схема упрощена: размеры и число органоидов условные.</div></div></div>;
}

export function OsmosisLab() {
  const [m, setM] = useState<'start' | 'water' | 'salt'>('start');
  const sc = m === 'water' ? 1 : m === 'start' ? 0.9 : 0.58;
  const txt = m === 'start' ? 'Клетка в обычных условиях. Выбери раствор, чтобы увидеть, что будет.' : m === 'water' ? 'В чистой воде растворённых веществ в клетке больше, чем снаружи, поэтому вода входит внутрь. Вакуоль набухает, содержимое прижимается к стенке — клетка упругая (тургор). Стенка не даёт ей лопнуть.' : 'В солёном растворе соли больше снаружи, поэтому вода выходит из клетки. Объём содержимого уменьшается, мембрана отходит от стенки. Это плазмолиз; клетка вянет.';
  return <div className={'card lab os-' + m}><div className="tb"><b style={{flexBasis: '100%'}}>Опыт: осмос в растительной клетке</b>
    <button className={m === 'water' ? '' : 's'} onClick={() => setM('water')}>💧 Чистая вода</button><button className={m === 'salt' ? '' : 's'} onClick={() => setM('salt')}>🧂 Солёный раствор</button><button className="s" onClick={() => setM('start')}>↩ Сначала</button></div>
    <svg viewBox="0 0 400 250" role="img" aria-label="Растительная клетка в растворе: вода входит или выходит" style={{background: m === 'salt' ? '#f3e7b8' : '#cfeeff', transition: 'background 1s'}}>
      {m === 'salt' && [[40, 40], [90, 200], [330, 60], [350, 190], [60, 120], [345, 125], [180, 30], [220, 225]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#a16207"/>)}
      <rect x="100" y="40" width="200" height="170" rx="28" fill="#7fbf6e" stroke="#2f7a3a" strokeWidth="6"/>
      <rect x="108" y="48" width="184" height="154" rx="22" fill="#eaf7d9"/>
      <g style={{transformBox: 'fill-box', transformOrigin: 'center', transform: `scale(${sc})`, transition: 'transform 1.4s ease'}}><rect x="108" y="48" width="184" height="154" rx="22" fill="#bfe6fb" stroke="#5bb450" strokeWidth="4"/><circle cx="215" cy="110" r="22" fill="#ddd6fe" stroke="#7c5cff" strokeWidth="3"/></g>
      {m !== 'start' && <g className={m === 'water' ? 'wat-in' : 'wat-out'}>{[[60, 125, 90], [340, 125, 310], [200, 18, 200]].map(([x, y, tx], i) => <g key={i}><path d={m === 'water' ? `M${x} ${y} H${tx}` : `M${tx} ${y} H${x}`} stroke="#2a7fb8" strokeWidth="4" strokeLinecap="round" markerEnd="url(#ar)"/><circle cx={x} cy={y} r="5" fill="#2aa7e0"/></g>)}</g>}
      <defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#2a7fb8"/></marker></defs>
      <text x="200" y="238" textAnchor="middle" fontSize="12" fill="#12302a">{m === 'water' ? 'клетка в чистой воде' : m === 'salt' ? 'клетка в солёном растворе (3 %)' : 'клетка'}</text>
    </svg>
    <div style={{padding: '0 14px 14px'}}><div className="warn" aria-live="polite" style={{marginTop: 8}}>{txt}</div><div className="mu" style={{marginTop: 6}}>Осмос — движение воды через мембрану в сторону, где растворённых веществ больше.</div></div></div>;
}

export function CellTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Клетка: строение и функции</h1><span className="tag">Станция «Мир клетки»</span>
    <div className="card"><h3>Что я узнаю</h3>Из каких частей состоит клетка, чем растительная клетка отличается от животной и почему вода входит в клетку или выходит из неё.</div>
    <div className="card"><h3>Клетка — основа жизни</h3>Все живые организмы состоят из клеток. Клетка — самая маленькая единица, которая может жить сама: питаться, расти, размножаться. Новые клетки появляются только из прежних клеток путём деления. Клетки видно только в микроскоп.
      <h3>Из чего состоит клетка</h3>Снаружи — клеточная мембрана. Внутри — цитоплазма, в которой расположены органоиды: ядро, митохондрии, рибосомы и другие. У растений ещё есть клеточная стенка, хлоропласты и крупная вакуоль.
      <h3>Чем растительная клетка отличается от животной</h3>Только у растительной клетки есть клеточная стенка, хлоропласты и крупная вакуоль. Митохондрии, ядро, рибосомы и мембрана есть у обеих.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-модель…</div>}><Cell3D/></Suspense>
    <CellLab/>
    <div className="card"><h3>Как вещества попадают в клетку</h3>Мембрана пропускает не всё подряд. Воду она пропускает легко, и вода идёт туда, где растворённых веществ больше (осмос). Поэтому свежий салат, опущенный в воду, становится хрустящим, а посоленные огурцы выпускают сок.</div>
    <OsmosisLab/>
    <div className="card"><h3>Ключевые термины</h3><b>Органоид</b> — постоянная часть клетки с особой функцией. <b>Осмос</b> — движение воды через мембрану. <b>Тургор</b> — упругость клетки из-за давления содержимого на стенку. <b>Плазмолиз</b> — отход мембраны от стенки при потере воды.
      <h3>Разобранная задача</h3>«Ломтики картофеля выдержали час в воде, в 1 % и в 3 % растворах соли. В воде их масса выросла, в 3 % — уменьшилась. Почему?» В воде вода входит в клетки (осмос), масса растёт. В 3 % растворе вне клеток соли больше, вода выходит, масса падает.
      <h3>Типичные ошибки</h3>Думать, что у животных клеток есть стенка; путать хлоропласты (фотосинтез) и митохондрии (дыхание); считать, что соль «впитывается» и вода входит в клетку в солёном растворе.
      <h3>Итог</h3>Ядро управляет, митохондрии дают энергию, хлоропласты делают органику на свету, мембрана выбирает, что пропустить. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

// ---------- Мир животных ----------
const CLASSES: {k: string; t: string; e: string; rows: [string, string][]; ex: string}[] = [
  {k: 'fish', t: 'Рыбы', e: '🐟', rows: [['Покровы', 'Чешуя, покрытая слизью'], ['Дыхание', 'Жабры'], ['Сердце', 'Две камеры (предсердие и желудочек), один круг кровообращения'], ['Температура тела', 'Непостоянная (зависит от воды)'], ['Размножение', 'Икра в воде, наружное оплодотворение'], ['Особенности', 'Плавательный пузырь, боковая линия']], ex: 'осётр, сазан, судак'},
  {k: 'amph', t: 'Земноводные', e: '🐸', rows: [['Покровы', 'Голая влажная кожа с железами'], ['Дыхание', 'Личинки — жабры; взрослые — лёгкие и кожа'], ['Сердце', 'Три камеры (два предсердия и один желудочек), два круга; кровь частично смешивается'], ['Температура тела', 'Непостоянная'], ['Размножение', 'Икра в воде, личинка (головастик), превращение'], ['Особенности', 'Связаны с водой на всех этапах жизни']], ex: 'озёрная лягушка, зелёная жаба'},
  {k: 'rept', t: 'Пресмыкающиеся', e: '🦎', rows: [['Покровы', 'Сухая кожа с роговыми чешуями'], ['Дыхание', 'Лёгкие'], ['Сердце', 'Три камеры с неполной перегородкой в желудочке (у крокодилов — четыре)'], ['Температура тела', 'Непостоянная'], ['Размножение', 'Яйца с кожистой оболочкой, откладываются на суше'], ['Особенности', 'Первые настоящие наземные позвоночные']], ex: 'степная агама, щитомордник, среднеазиатская черепаха'},
  {k: 'bird', t: 'Птицы', e: '🦅', rows: [['Покровы', 'Перья'], ['Дыхание', 'Лёгкие и воздушные мешки'], ['Сердце', 'Четыре камеры, два круга кровообращения'], ['Температура тела', 'Постоянная'], ['Размножение', 'Яйца с твёрдой скорлупой, насиживание'], ['Особенности', 'Облегчённый скелет, крылья (не все птицы летают)']], ex: 'беркут, лебедь-кликун, стрепет, дрофа'},
  {k: 'mam', t: 'Млекопитающие', e: '🐆', rows: [['Покровы', 'Шерсть, кожные железы'], ['Дыхание', 'Лёгкие, дыхательная мышца — диафрагма'], ['Сердце', 'Четыре камеры, два круга кровообращения'], ['Температура тела', 'Постоянная'], ['Размножение', 'Живорождение (кроме утконоса и ехидны), вскармливание молоком'], ['Особенности', 'Развитая нервная система, забота о потомстве']], ex: 'сайгак, архар, снежный барс'},
  {k: 'arth', t: 'Членистоногие', e: '🕷️', rows: [['Покровы', 'Хитиновый покров, линька'], ['Дыхание', 'Трахеи (насекомые), лёгочные мешки (пауки), жабры (рачки)'], ['Сердце', 'Трубка на спинной стороне, кровеносная система незамкнутая'], ['Температура тела', 'Непостоянная'], ['Размножение', 'Яйца; развитие с превращением или прямое'], ['Особенности', 'Членистые конечности, самая многочисленная группа животных']], ex: 'саранчовые, тарантул, каракурт, речной рак'},
];
const HEART: any = {
  fish: {atria: [['вен.', '#3b82f6', 130, 140]], vents: [['вен.', '#3b82f6', 130, 140]], sep: 'none', note: 'Кровь в сердце только венозная. Из желудочка она идёт в жабры, обогащается кислородом и сразу расходится по телу — один круг кровообращения.'},
  amph: {atria: [['вен.', '#3b82f6', 80, 120], ['арт.', '#ef4444', 200, 120]], vents: [['смеш.', '#a855f7', 80, 240]], sep: 'none', note: 'В единственном желудочке артериальная и венозная кровь частично смешиваются. Два круга кровообращения.'},
  rept: {atria: [['вен.', '#3b82f6', 80, 120], ['арт.', '#ef4444', 200, 120]], vents: [['смеш.', '#8b5cf6', 80, 240]], sep: 'part', note: 'В желудочке есть неполная перегородка, поэтому смешивания меньше, чем у земноводных. У крокодилов перегородка полная.'},
  bird: {atria: [['вен.', '#3b82f6', 80, 120], ['арт.', '#ef4444', 200, 120]], vents: [['вен.', '#3b82f6', 80, 120], ['арт.', '#ef4444', 200, 120]], sep: 'full', note: 'Полная перегородка: венозная и артериальная кровь не смешиваются. Это обеспечивает высокий обмен веществ и постоянную температуру тела.'},
};
HEART.mam = HEART.bird;

export function HeartLab() {
  const [k, setK] = useState('fish'), [run, setRun] = useState(false);
  const h = HEART[k];
  const dots = (c: any[], row: number) => c.flatMap(([, col, x, w], ci: number) => Array.from({length: 7}, (_, i) => ({key: `${row}${ci}${i}`, cx: x + 14 + ((i * 37 + ci * 11) % (w - 28)), cy: (row ? 140 : 56) + ((i * 23 + ci * 7) % (row ? 56 : 36)), col, d: -((i * 0.31 + ci * 0.2) % 2)})));
  return <div className={'card lab' + (run ? ' hrun' : '')}><div className="tb"><b style={{flexBasis: '100%'}}>Лаборатория: как устроено сердце</b>
    {[['fish', '🐟 Рыба'], ['amph', '🐸 Земноводное'], ['rept', '🦎 Рептилия'], ['bird', '🦅 Птица'], ['mam', '🐆 Млекопитающее']].map(([id, t]) => <button key={id} className={k === id ? '' : 's'} onClick={() => setK(id)} style={{minHeight: 38, padding: '4px 10px'}}>{t}</button>)}
    <button className="s" onClick={() => setRun(!run)}>{run ? '⏸ Остановить' : '▶ Запустить сердце'}</button></div>
    <svg viewBox="0 0 400 250" role="img" aria-label="Схема сердца позвоночного: камеры и кровь" style={{background: 'var(--bg)'}}>
      <text x="200" y="18" textAnchor="middle" fontSize="12" fill="currentColor">Предсердия — принимают кровь</text>
      {h.atria.map(([l, c, x, w]: any, i: number) => <g key={'a' + i}><rect x={x} y="28" width={w} height="68" rx="22" fill={c} opacity=".22" stroke={c} strokeWidth="3"/></g>)}
      <text x="200" y="118" textAnchor="middle" fontSize="12" fill="currentColor">Желудочки — выталкивают кровь</text>
      <g className="beat" style={{transformBox: 'fill-box', transformOrigin: 'center'}}>{h.vents.map(([l, c, x, w]: any, i: number) => <rect key={'v' + i} x={x} y="126" width={w} height="86" rx="26" fill={c} opacity=".28" stroke={c} strokeWidth="3"/>)}</g>
      {h.sep === 'full' && <rect x="196" y="126" width="8" height="86" fill="#475569"/>}
      {h.sep === 'part' && <rect x="196" y="160" width="8" height="52" fill="#475569"/>}
      {(h.atria.length > 1) && <line x1="200" y1="28" x2="200" y2="96" stroke="#475569" strokeWidth="5"/>}
      {[...dots(h.atria, 0), ...dots(h.vents, 1)].map(d => <circle key={d.key} className="bl" cx={d.cx} cy={d.cy} r="5" fill={d.col} style={{animationDelay: d.d + 's'}}/>)}
      <g fontSize="11" fill="currentColor"><circle cx="40" cy="236" r="5" fill="#3b82f6"/><text x="50" y="240">венозная</text><circle cx="130" cy="236" r="5" fill="#ef4444"/><text x="140" y="240">артериальная</text><circle cx="250" cy="236" r="5" fill="#a855f7"/><text x="260" y="240">смешанная</text></g>
    </svg>
    <div style={{padding: '0 14px 14px'}}><div className="warn" aria-live="polite" style={{marginTop: 8}}><b>{k === 'fish' ? 'Два' : k === 'amph' || k === 'rept' ? 'Три' : 'Четыре'} камеры.</b> {h.note}</div><div className="mu" style={{marginTop: 6}}>Схема упрощена; камеры показаны условно.</div></div></div>;
}

export function ClassTabs() {
  const [k, setK] = useState('fish'); const c = CLASSES.find(x => x.k === k)!;
  return <div className="card"><h3>Сравни классы животных</h3>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>{CLASSES.map(x => <button key={x.k} className={k === x.k ? '' : 's'} style={{minHeight: 38, padding: '4px 10px'}} onClick={() => setK(x.k)}>{x.e} {x.t}</button>)}</div>
    <div className="sc"><table style={{marginTop: 8}}><tbody>{c.rows.map(([a, b]) => <tr key={a}><th style={{width: '34%'}}>{a}</th><td>{b}</td></tr>)}</tbody></table></div>
    <div className="mu" style={{marginTop: 6}}>Примеры из Казахстана: {c.ex}.</div></div>;
}

export function AnimalTopic({onBack, part}: any) {
  if (part === 'heart') return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Кровеносная система и сердце</h1><span className="tag">Станция «Мир животных»</span>
    <div className="card"><h3>Что я узнаю</h3>Зачем животным кровеносная система, как устроено сердце у разных классов позвоночных и в каком порядке кровь проходит по камерам сердца.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-модель сердца…</div>}><Heart3D/></Suspense>
    <details className="card"><summary>Плоская схема сердца (если 3D не работает)</summary><HeartLab/></details>
    <div className="card"><h3>Зачем нужна кровеносная система</h3>Кровь переносит кислород и питательные вещества ко всем клеткам и уносит углекислый газ и ненужные вещества. Движение крови обеспечивает сердце. Кровеносная система бывает незамкнутой (у насекомых и большинства моллюсков кровь изливается в полость тела) и замкнутой (у дождевого червя и позвоночных кровь течёт только по сосудам).
      <h3>Сосуды</h3><b>Артерии</b> несут кровь от сердца, <b>вены</b> — к сердцу, <b>капилляры</b> — тончайшие сосуды, через стенки которых идёт обмен веществ с клетками.
      <h3>Как усложнялось сердце</h3>Рыбы — 2 камеры и один круг кровообращения. Земноводные и пресмыкающиеся — 3 камеры, кровь частично смешивается. Птицы и млекопитающие — 4 камеры, кровь не смешивается, поэтому клетки получают больше кислорода и температура тела постоянная.
      <h3>Типичные ошибки</h3>Считать, что по артериям всегда течёт артериальная кровь (по лёгочной артерии течёт венозная); путать артерии и вены: название зависит от направления — от сердца или к сердцу.
      <h3>Итог</h3>Чем полнее разделены артериальная и венозная кровь, тем активнее животное. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Классификация и классы животных</h1><span className="tag">Станция «Мир животных»</span>
    <div className="card"><h3>Что я узнаю</h3>Как животных делят на группы и чем различаются основные классы позвоночных и беспозвоночных.</div>
    <div className="card"><h3>Зачем делить животных на группы</h3>Животных миллионы видов. Чтобы в них разобраться, учёные сравнивают строение и образ жизни и объединяют похожих в группы: типы и классы. Главное деление — на беспозвоночных (нет позвоночника: членистоногие, моллюски, черви) и позвоночных (есть внутренний скелет с позвоночником: рыбы, земноводные, пресмыкающиеся, птицы, млекопитающие).
      <h3>Как читать признаки</h3>Для каждого класса запоминай пять признаков: покровы, дыхание, сердце, температура тела, размножение. Они связаны между собой: например, у птиц высокий обмен веществ требует четырёхкамерного сердца и постоянной температуры тела.</div>
    <ClassTabs/>
    <div className="card"><h3>Приспособления к среде в Казахстане</h3>Сайгак на открытых степях быстро бегает и переносит холод и жару. Снежный барс в горах покрыт густой шерстью и держит равновесие длинным хвостом. Степная агама зависит от тепла: утром греется на солнце, а в жару прячется в норах. Осётр живёт в Каспии, а на нерест идёт в реки. Беркут парит на воздушных потоках в горах и степи.</div>
    <div className="card"><h3>Ключевые термины</h3><b>Позвоночные</b> — животные с позвоночником. <b>Холоднокровные</b> — температура тела зависит от среды. <b>Теплокровные</b> — температура тела постоянная. <b>Метаморфоз</b> — превращение личинки во взрослое животное. <b>Хитин</b> — прочное вещество покрова членистоногих.
      <h3>Разобранная задача</h3>«У животного сухая кожа с роговыми чешуями, лёгочное дыхание, трёхкамерное сердце, яйца откладывает на суше. К какому классу оно относится?» Сухая кожа и яйца на суше исключают земноводных, а трёхкамерное сердце — птиц и млекопитающих. Это пресмыкающееся, например степная агама.
      <h3>Типичные ошибки</h3>Считать всех птиц летающими (страус, пингвин не летают); относить летучих мышей к птицам (они млекопитающие, выкармливают молоком); путать «холоднокровные» с «холодными»: температура зависит от среды и может быть высокой.
      <h3>Итог</h3>Класс определяют по сочетанию признаков, а не по одному. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export function HumanTopic({onBack, part}: any) {
  if (part === 'food') return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Пищеварение</h1><span className="tag">Станция «Организм человека»</span>
    <div className="card"><h3>Что я узнаю</h3>По каким органам и в каком порядке проходит пища и что происходит в каждом отделе.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-модель…</div>}><Human3D only="food"/></Suspense>
    <div className="card"><h3>Пищеварительная система</h3>Путь пищи: ротовая полость → глотка → пищевод → желудок → тонкая кишка → толстая кишка. В ротовой полости пища измельчается, слюна начинает расщеплять крахмал. В желудке сок с соляной кислотой и пепсином расщепляет белки. В тонкой кишке пищу доводят до конца желчь (печень) и сок поджелудочной железы, а питательные вещества всасываются в кровь. В толстой кишке всасывается вода.
      <h3>Ключевые термины</h3><b>Перистальтика</b> — волны сокращений стенок, продвигающие пищу. <b>Ферменты</b> — вещества, ускоряющие расщепление пищи. <b>Желчь</b> — жидкость печени, помогающая перевариванию жиров.
      <h3>Типичные ошибки</h3>Считать, что желчь расщепляет белки (она помогает с жирами); считать, что большая часть питательных веществ всасывается в толстой кишке (в тонкой).
      <h3>Итог</h3>Пищеварение — цепочка органов, у каждого своя работа.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Дыхание человека</h1><span className="tag">Станция «Организм человека»</span>
    <div className="card"><h3>Что я узнаю</h3>Как воздух попадает в лёгкие, как работает диафрагма, где происходит газообмен и как беречь органы дыхания.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-модель…</div>}><Human3D only="breath"/></Suspense>
    <div className="card"><h3>Дыхательная система</h3>Путь воздуха: носовая полость → глотка → гортань → трахея → бронхи → альвеолы. В носу воздух согревается и очищается. Лёгкие состоят из миллионов альвеол — тонкостенных пузырьков, оплетённых капиллярами. Здесь кислород переходит из воздуха в кровь, а углекислый газ — из крови в воздух.
      <h3>Вдох и выдох</h3>При вдохе диафрагма и межрёберные мышцы сокращаются, грудная клетка расширяется, давление в лёгких падает, и воздух входит. При выдохе мышцы расслабляются, объём уменьшается, и воздух выходит.</div>
    <div className="card"><h3>Заболевания и профилактика</h3>Через воздух передаются грипп, ОРВИ, туберкулёз. Защищают проветривание, влажная уборка, закаливание, прививки, маска при болезни. Курение разрушает альвеолы и реснички дыхательных путей, поэтому лёгкие хуже очищаются и чаще болеют.
      <h3>Ключевые термины</h3><b>Альвеолы</b> — пузырьки лёгких, где идёт газообмен. <b>Диафрагма</b> — мышца под лёгкими, главная в дыхании. <b>Газообмен</b> — переход кислорода в кровь и углекислого газа из крови.
      <h3>Типичные ошибки</h3>Думать, что газообмен идёт в трахее или бронхах (он идёт в альвеолах); считать, что лёгкие сами втягивают воздух (их растягивают диафрагма и межрёберные мышцы).
      <h3>Итог</h3>Дыхательные пути проводят и очищают воздух, а газообмен идёт в альвеолах. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export function EcoTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Экосистемы Казахстана: цепи питания</h1><span className="tag">Станция «Экосистемы Казахстана»</span>
    <div className="card"><h3>Что я узнаю</h3>Как устроены экосистемы степи, пустыни, гор и озера, кто в них продуценты, консументы и редуценты и что случится, если убрать звено цепи питания.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-диораму…</div>}><Eco3D/></Suspense>
    <div className="card"><h3>Роли в экосистеме</h3><b>Продуценты</b> (растения, водоросли) создают органические вещества при фотосинтезе. <b>Консументы</b> питаются готовыми органическими веществами: первого порядка — растительноядные, второго и третьего — хищники. <b>Редуценты</b> (грибы, бактерии) разлагают остатки и возвращают минеральные вещества.
      <h3>Правило 10 %</h3>На каждый следующий уровень цепи питания переходит примерно 10 % энергии, остальное тратится на дыхание, движение и тепло. Поэтому цепи короткие (4–5 звеньев), а хищников всегда меньше, чем растительноядных.
      <h3>Ключевые термины</h3><b>Экосистема</b> — сообщество организмов и среда, в которой они живут. <b>Цепь питания</b> — последовательность организмов, где каждый служит пищей следующему. <b>Пищевая сеть</b> — переплетение многих цепей. <b>Приспособленность</b> — особенности, помогающие выживать в данной среде.
      <h3>Разобранная задача</h3>«В степи живут ковыль, суслик, степной орёл. Составь цепь и назови роли». Ковыль → суслик → степной орёл. Ковыль — продуцент, суслик — консумент I порядка, орёл — консумент II порядка. Стрелка идёт от съеденного к тому, кто ест.
      <h3>Типичные ошибки</h3>Рисовать стрелки в обратную сторону; считать грибы продуцентами или консументами (они редуценты); думать, что энергия возвращается по кругу (по кругу идут вещества, а энергия уходит в виде тепла).
      <h3>Итог</h3>Экосистема держится на продуцентах и редуцентах, а численность звеньев зависит друг от друга. Следующий шаг — задание от учителя.</div></div>;
}

export function PhotoTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Лист и фотосинтез</h1><span className="tag">Станция «Лаборатория растений»</span>
    <div className="card"><h3>Что я узнаю</h3>Как устроен лист снаружи и внутри, что такое фотосинтез, какие условия для него нужны и как это доказать опытом.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-модель…</div>}><Leaf3D/></Suspense>
    <div className="card"><h3>Внешнее строение листа</h3>Лист состоит из листовой пластинки и черешка, которым он прикреплён к стеблю. В пластинке видны жилки — по ним идут вода и питательные вещества. Листья бывают простые (одна пластинка: берёза, тополь) и сложные (несколько листочков на общем черешке: шиповник, карагана).
      <h3>Внутреннее строение</h3>Сверху и снизу лист покрыт кожицей — прозрачной защитной тканью. В нижней кожице больше всего устьиц: каждое состоит из двух замыкающих клеток, между которыми открывается щель. Под верхней кожицей лежит столбчатая ткань — в ней больше всего хлоропластов. Ниже находится губчатая ткань с воздушными полостями. Жилка содержит ксилему (вода вверх) и флоэму (сахара из листа).
      <h3>Функции листа</h3>Фотосинтез, газообмен (дыхание) и испарение воды.</div>
    <div className="card"><h3>Фотосинтез</h3>Фотосинтез — образование органических веществ (глюкозы) из углекислого газа и воды с использованием энергии света. Он идёт в хлоропластах, где находится зелёный пигмент хлорофилл. Побочный продукт — кислород.
      <h3>Условия фотосинтеза</h3>Нужны свет, углекислый газ, вода и хлорофилл. Если убрать хотя бы одно условие, фотосинтез прекращается. Скорость зависит также от температуры.
      <h3>Опыт: образуется ли крахмал на свету</h3>1) Растение ставят на 2–3 дня в темноту, чтобы крахмал из листьев израсходовался. 2) Часть листа закрывают с двух сторон полоской тёмной бумаги и выставляют растение на свет. 3) Лист срывают, кипятят в воде, затем в спирте — хлорофилл уходит, лист становится бесцветным. 4) Лист обрабатывают раствором йода. Освещённая часть синеет (там крахмал), закрытая остаётся светлой. Вывод: крахмал образуется только на свету.
      <h3>Значение фотосинтеза</h3>Растения создают пищу для себя и для всех остальных организмов, выделяют кислород и поглощают углекислый газ.</div>
    <div className="card"><h3>Ключевые термины</h3><b>Фотосинтез</b> — образование органических веществ на свету. <b>Хлорофилл</b> — зелёный пигмент, улавливающий свет. <b>Хлоропласт</b> — органоид, где идёт фотосинтез. <b>Устьице</b> — щель между двумя замыкающими клетками для газообмена и испарения. <b>Столбчатая ткань</b> — основная фотосинтезирующая ткань листа.
      <h3>Типичные ошибки</h3>Путать фотосинтез и дыхание: при фотосинтезе растение поглощает углекислый газ и выделяет кислород, а дышит оно круглые сутки, поглощая кислород. Считать, что растение «питается» только из почвы: из почвы оно берёт воду и минеральные соли, а органические вещества создаёт само. Думать, что йод окрашивает сахар: он окрашивает крахмал.
      <h3>Итог</h3>Лист — орган фотосинтеза: его строение помогает ловить свет, получать воду и углекислый газ. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export function FactorTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Экологические факторы</h1><span className="tag">Станция «Экосистемы Казахстана»</span>
    <div className="card"><h3>Что я узнаю</h3>Что такое экологические факторы, на какие группы их делят, что такое оптимум, пределы выносливости и ограничивающий фактор.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-опыт…</div>}><Factor3D/></Suspense>
    <div className="card"><h3>Что такое экологические факторы</h3>Экологические факторы — это условия среды, которые влияют на организм. Их делят на три группы.
      <h3>Три группы факторов</h3><b>Абиотические</b> — факторы неживой природы: свет, температура, вода и влажность, воздух, почва, солёность. <b>Биотические</b> — влияние живых организмов друг на друга: хищничество, конкуренция, паразитизм, взаимная польза (опыление, симбиоз). <b>Антропогенные</b> — влияние человека: вырубка лесов, распашка степей, загрязнение, но также создание заповедников и посадка лесов.
      <h3>Оптимум и пределы выносливости</h3>Для каждого организма есть наилучшее значение фактора — <b>оптимум</b>. Чем дальше от оптимума, тем сильнее организм угнетён. Самое малое и самое большое значения, при которых он ещё может жить, — <b>пределы выносливости</b>. За ними организм гибнет.
      <h3>Ограничивающий фактор</h3>Состояние организма определяет тот фактор, который сильнее всего отклоняется от оптимума. Его называют ограничивающим. В пустыне это обычно вода, в горах — тепло, в глубине леса — свет.</div>
    <Suspense fallback={null}><FactorSort/></Suspense>
    <div className="card"><h3>Ключевые термины</h3><b>Среда обитания</b> — всё, что окружает организм. <b>Экологический фактор</b> — условие среды, влияющее на организм. <b>Оптимум</b> — наилучшее значение фактора. <b>Пределы выносливости</b> — границы, за которыми жизнь невозможна. <b>Ограничивающий фактор</b> — фактор, дальше всех отклонившийся от оптимума.
      <h3>Разобранная задача</h3>«Пшеницу хорошо поливают и удобряют, но лето выдалось очень холодным, и урожай низкий. Почему?» Вода и питание в оптимуме, но температура далека от оптимума. Она стала ограничивающим фактором, и остальные хорошие условия не могут это исправить.
      <h3>Типичные ошибки</h3>Считать антропогенные факторы только вредными (заповедник — тоже влияние человека); относить влияние человека к биотическим факторам; думать, что «чем больше, тем лучше»: избыток воды или тепла вреден так же, как недостаток.
      <h3>Итог</h3>На организм действуют сразу многие факторы, но его состояние определяет ограничивающий. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export function SuccTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Смена экосистем, сукцессия</h1><span className="tag">Станция «Экосистемы Казахстана»</span>
    <div className="card"><h3>Что я узнаю</h3>Почему экосистемы не вечны, как одно сообщество сменяет другое, чем первичная сукцессия отличается от вторичной.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-модель…</div>}><Succ3D/></Suspense>
    <div className="card"><h3>Что такое сукцессия</h3>Сукцессия — это последовательная смена одних сообществ организмов другими на одной и той же территории. Каждое сообщество изменяет среду (накапливает почву, даёт тень, удерживает влагу) и этим готовит условия для следующего.
      <h3>Первичная сукцессия</h3>Начинается на месте, где не было ни жизни, ни почвы: голые скалы, застывшая лава, песчаные дюны. Первыми приходят организмы-пионеры — лишайники и мхи. Идёт очень медленно, сотни лет: лишайники → мхи → травы → кустарники → лес.
      <h3>Вторичная сукцессия</h3>Идёт там, где сообщество разрушено, но почва сохранилась: после пожара, вырубки, на заброшенном поле. Она быстрее, потому что в почве остались семена, корни и питательные вещества.
      <h3>Устойчивое сообщество</h3>Сукцессия заканчивается устойчивым (климаксным) сообществом, которое соответствует климату местности: в лесной зоне это лес, в степной — ковыльная степь. В нём много видов, и состав долго не меняется.
      <h3>Пример из Казахстана</h3>Заброшенное поле (залежь) в степи зарастает так: однолетние сорняки → пырей и другие корневищные травы → типчак и ковыль. Через 15–20 лет восстанавливается степь. Высохшее дно Аральского моря — пример первичной сукцессии: первыми его заселяют солянки.</div>
    <div className="card"><h3>Ключевые термины</h3><b>Сукцессия</b> — смена сообществ во времени. <b>Организмы-пионеры</b> — первые поселенцы (лишайники, мхи). <b>Первичная сукцессия</b> — на месте без почвы. <b>Вторичная сукцессия</b> — на месте разрушенного сообщества с сохранившейся почвой. <b>Климаксное сообщество</b> — устойчивое завершающее сообщество.
      <h3>Разобранная задача</h3>«После лесного пожара через год участок зарос иван-чаем, через десять лет — берёзами. Какой это тип сукцессии и почему?» Вторичная: почва с семенами сохранилась, поэтому растения появились уже через год.
      <h3>Типичные ошибки</h3>Путать сукцессию с сезонными изменениями (листопад — не сукцессия); считать сукцессию после пожара первичной; думать, что первыми на скале вырастают травы (сначала нужна почва, её создают лишайники и мхи).
      <h3>Итог</h3>Сообщества сменяют друг друга закономерно, пока не установится устойчивое. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export function RedTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Человек и природа: заповедники и Красная книга</h1><span className="tag">Станция «Экосистемы Казахстана»</span>
    <div className="card"><h3>Что я узнаю</h3>Как человек влияет на экосистемы, какие бывают охраняемые природные территории, зачем нужна Красная книга и какие виды Казахстана в неё занесены.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-карту…</div>}><Map3D/></Suspense>
    <div className="card"><h3>Человек — часть экосистемы</h3>Человек, как и другие организмы, зависит от природы: дышит кислородом, пьёт воду, питается растениями и животными. Но он влияет на экосистемы сильнее любого другого вида.
      <h3>Влияние человека</h3><b>Отрицательное:</b> распашка степей, вырубка лесов, чрезмерный выпас скота, загрязнение воды и воздуха, браконьерство, забор воды из рек. <b>Положительное:</b> охраняемые территории, посадка лесов, очистка воды, разведение и возвращение редких видов в природу.
      <h3>Особо охраняемые природные территории</h3><b>Заповедник</b> — самая строгая охрана: природа сохраняется в нетронутом виде, хозяйственная деятельность запрещена, учёные ведут наблюдения. <b>Национальный парк</b> — охрана природы сочетается с отдыхом и туризмом по правилам. <b>Заказник</b> — охраняют отдельные виды или природные объекты, часть деятельности разрешена. <b>Памятник природы</b> — отдельный уникальный объект: роща, скала, источник.
      <h3>Красная книга Казахстана</h3>Это список редких и находящихся под угрозой исчезновения животных, растений и грибов с описанием, где они живут и как их охранять. Добывать такие виды запрещено законом. Сайгак в Казахстане в начале 2000-х годов был на грани исчезновения, но благодаря запрету охоты и охране его численность сильно выросла — это пример успешной охраны.</div>
    <div className="card"><h3>Ключевые термины</h3><b>Антропогенное влияние</b> — воздействие человека на природу. <b>Заповедник</b> — территория со строгой охраной. <b>Национальный парк</b> — охрана и регулируемый туризм. <b>Красная книга</b> — список редких и исчезающих видов. <b>Реинтродукция</b> — возвращение вида туда, где он раньше жил.
      <h3>Разобранная задача</h3>«Почему после высыхания Аральского моря пострадали поля за сотни километров от него?» На высохшем дне осталась соль. Ветер поднимает её вместе с пылью и переносит на большие расстояния. Соль оседает на почву, и растения на полях растут хуже.
      <h3>Типичные ошибки</h3>Считать, что в заповеднике можно отдыхать как в парке; думать, что в Красную книгу заносят только животных (в ней есть растения и грибы); считать влияние человека только вредным.
      <h3>Итог</h3>Человек может и разрушать экосистемы, и сохранять их. Охраняемые территории и Красная книга — главные инструменты охраны природы. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export function NerveTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Нервная система и головной мозг</h1><span className="tag">Станция «Организм человека»</span>
    <div className="card"><h3>Что я узнаю</h3>Какие типы нервной системы бывают у животных, из чего состоит нервная система человека, как устроены спинной и головной мозг и за что отвечает каждый отдел.</div>
    <Suspense fallback={<div className="card">Загружаю 3D-модель…</div>}><Brain3D/></Suspense>
    <div className="card"><h3>Зачем нужна нервная система</h3>Нервная система принимает сигналы от органов чувств, обрабатывает их и управляет работой всех органов. Она связывает организм в единое целое и обеспечивает его связь с окружающей средой.
</div>
    <Suspense fallback={null}><NerveTypes/><Neuron/></Suspense>
    <div className="card"><h3 style={{marginTop: 0}}>Строение нервной системы человека</h3><b>Центральная</b> — головной и спинной мозг. <b>Периферическая</b> — нервы и нервные узлы, которые связывают мозг со всеми органами.
      <h3>Деление по функциям</h3><b>Соматическая</b> нервная система управляет скелетными мышцами и подчиняется нашей воле. <b>Вегетативная (автономная)</b> управляет внутренними органами, сосудами и железами без нашего сознательного участия.</div>
    <div className="card"><h3>Спинной мозг</h3>Расположен в позвоночном канале. От него отходит 31 пара спинномозговых нервов. Выполняет две функции: <b>рефлекторную</b> (центры простых рефлексов, например отдёргивания руки) и <b>проводниковую</b> (проводит сигналы к головному мозгу и от него).
      <h3>Головной мозг</h3>Находится в полости черепа. Отделы: продолговатый мозг, мост, мозжечок, средний мозг, промежуточный мозг и большие полушария. Поверхность полушарий покрыта корой с бороздами и извилинами — они увеличивают её площадь. В коре выделяют доли: лобную, теменную, височную и затылочную.
      <h3>Ключевые термины</h3><b>Нейрон</b> — нервная клетка. <b>Нерв</b> — пучок длинных отростков нейронов. <b>Кора больших полушарий</b> — слой серого вещества на поверхности полушарий. <b>Серое вещество</b> — тела нейронов. <b>Белое вещество</b> — отростки нейронов.
      <h3>Типичные ошибки</h3>Путать мозжечок (координация) и продолговатый мозг (дыхание, сердцебиение); считать, что спинной мозг только проводит сигналы (в нём есть и центры рефлексов); считать, что зрительная зона находится в лобной доле (она в затылочной).
      <h3>Итог</h3>Нервная система состоит из центральной и периферической частей, а у каждого отдела головного мозга своя работа. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export function ReflexTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Рефлексы и поведение</h1><span className="tag">Станция «Организм человека»</span>
    <div className="card"><h3>Что я узнаю</h3>Что такое рефлекс и рефлекторная дуга, чем условные рефлексы отличаются от безусловных, как вырабатывается условный рефлекс и из чего складывается поведение.</div>
    <div className="card"><h3>Рефлекс и рефлекторная дуга</h3><b>Рефлекс</b> — ответная реакция организма на раздражение, которая происходит при участии нервной системы. Путь, по которому проходит нервный импульс при рефлексе, называется <b>рефлекторной дугой</b>. В ней пять звеньев: рецептор → чувствительный нейрон → вставочный нейрон (нервный центр) → двигательный нейрон → рабочий орган (мышца или железа). Если повреждено хотя бы одно звено, рефлекс не происходит.</div>
    <Suspense fallback={<div className="card">Загружаю схемы…</div>}><ReflexArc/></Suspense>
    <div className="card"><h3>Безусловные и условные рефлексы</h3>
      <div className="sc"><table><thead><tr><th>Признак</th><th>Безусловные</th><th>Условные</th></tr></thead><tbody>
        <tr><td>Происхождение</td><td>врождённые, передаются по наследству</td><td>приобретаются в течение жизни</td></tr>
        <tr><td>У кого</td><td>одинаковы у всех особей вида</td><td>индивидуальны, у каждого свои</td></tr>
        <tr><td>Постоянство</td><td>сохраняются всю жизнь</td><td>могут угасать и появляться новые</td></tr>
        <tr><td>Где центры</td><td>спинной мозг и ствол головного мозга</td><td>кора больших полушарий</td></tr>
        <tr><td>Примеры</td><td>мигание, кашель, глотание, отдёргивание руки</td><td>слюна при виде лимона, реакция на звонок с урока</td></tr></tbody></table></div>
      <h3>Как вырабатывается условный рефлекс</h3>Русский учёный И. П. Павлов показал: если безразличный сигнал (звонок, свет) много раз подаётся незадолго до корма, в коре мозга между двумя центрами возникает временная связь. Потом слюна выделяется на один только сигнал. Условия: сигнал должен идти перед подкреплением, сочетаний должно быть несколько, животное должно быть здорово и не отвлекаться.
      <h3>Торможение</h3>Если условный сигнал перестать подкреплять, рефлекс постепенно угасает. Это не разрушение, а торможение: оно помогает организму отказываться от ненужных реакций.</div>
    <Suspense fallback={null}><Pavlov/><ReflexSort/></Suspense>
    <div className="card"><h3>Рефлекторная природа поведения</h3>Поведение складывается из врождённых и приобретённых реакций. <b>Инстинкт</b> — сложная цепь безусловных рефлексов: птица строит гнездо, паук плетёт паутину, не обучаясь этому. <b>Навык</b> — действие, ставшее автоматическим после многих повторений: письмо, езда на велосипеде. У человека к этому добавляются речь и мышление, поэтому он может планировать свои действия.
      <h3>Ключевые термины</h3><b>Рефлекс</b> — ответ на раздражение при участии нервной системы. <b>Рефлекторная дуга</b> — путь импульса при рефлексе. <b>Рецептор</b> — окончание, воспринимающее раздражение. <b>Подкрепление</b> — безусловный раздражитель (корм), следующий за сигналом. <b>Торможение</b> — ослабление или прекращение рефлекса.
      <h3>Типичные ошибки</h3>Путать порядок звеньев дуги (двигательный нейрон всегда после вставочного); считать слюноотделение на вид или запах пищи безусловным рефлексом (безусловный — только когда пища во рту); думать, что условные рефлексы передаются по наследству.
      <h3>Итог</h3>Безусловные рефлексы дают готовые ответы с рождения, а условные позволяют приспосабливаться к меняющимся условиям. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export function SleepTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Сон, режим дня и память</h1><span className="tag">Станция «Организм человека»</span>
    <div className="card"><h3>Что я узнаю</h3>Что такое биологические ритмы, зачем нужен сон и из каких фаз он состоит, как составить режим дня, как работает память и что вредит нервной системе.</div>
    <div className="card"><h3>Биологические ритмы</h3>Биологические ритмы — это регулярно повторяющиеся изменения в работе организма. <b>Суточные</b>: сон и бодрствование, температура тела, частота пульса. <b>Сезонные</b>: листопад, спячка, перелёты птиц, линька. Главный «датчик времени» — свет: на свету мозг бодрствует, в темноте вырабатывается гормон сна мелатонин.
      <h3>Зачем нужен сон</h3>Во сне отдыхают нервные клетки, восстанавливаются силы, закрепляется в памяти выученное за день, у детей и подростков выделяется гормон роста. Без сна человек не может прожить дольше нескольких суток.</div>
    <Suspense fallback={<div className="card">Загружаю…</div>}><SleepNight/><DayPlan/></Suspense>
    <div className="card"><h3>Гигиена сна</h3>Ложиться и вставать в одно и то же время; спать 9–10 часов; за час до сна отложить телефон и компьютер; проветрить комнату; не есть плотно и не пить крепкий чай перед сном; спать в темноте и тишине.
      <h3>Режим дня и умственный труд</h3>Режим дня — это чередование учёбы, отдыха, питания, движения и сна в одни и те же часы. Организм привыкает к порядку и работает экономнее. Во время занятий делай перерыв 10–15 минут каждые 40–45 минут, меняй вид деятельности, начинай с предмета средней трудности, а самое сложное делай в часы подъёма работоспособности.</div>
    <div className="card"><h3>Память</h3>Память — способность запоминать, хранить и воспроизводить информацию. <b>Кратковременная</b> хранит немного информации несколько секунд или минут. <b>Долговременная</b> хранит её годами. По тому, что запоминается, различают зрительную, слуховую, двигательную, словесно-логическую и эмоциональную память.
      <h3>Как улучшить память</h3>Понять материал, а не зубрить; повторять через промежутки времени (через 20 минут, вечером, на следующий день); пересказывать своими словами; делать схемы и рисунки; разбивать большое на части; высыпаться.</div>
    <Suspense fallback={null}><MemoryTest/></Suspense>
    <div className="card"><h3>Что вредит нервной системе</h3>Недосыпание, переутомление, долгое сидение в гаджетах, шум, стресс. Алкоголь, никотин и наркотические вещества разрушают нервные клетки, ухудшают память и внимание и вызывают зависимость. Организм подростка особенно уязвим, потому что его мозг ещё развивается.
      <h3>Ключевые термины</h3><b>Биоритмы</b> — повторяющиеся изменения в работе организма. <b>Быстрый сон</b> — фаза со сновидениями и активным мозгом. <b>Медленный сон</b> — фаза глубокого отдыха. <b>Работоспособность</b> — способность выполнять работу с нужным качеством. <b>Память</b> — запоминание, хранение и воспроизведение информации.
      <h3>Типичные ошибки</h3>Считать, что во сне мозг «выключается» (он активно работает, особенно в быстром сне); думать, что недосып можно полностью возместить в выходные; считать, что учить ночью перед контрольной полезно (без сна выученное хуже закрепляется).
      <h3>Итог</h3>Сон, режим и правильные приёмы запоминания помогают учиться легче. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}

export function ChemTopic({onBack}: any) {
  return <div><button className="s" onClick={onBack}>← К темам станции</button><h1>Вода и вещества клетки, удобрения</h1><span className="tag">Станция «Мир клетки»</span>
    <div className="card"><h3>Что я узнаю</h3>Из каких химических элементов и веществ состоят живые организмы, зачем клетке вода, как обнаружить органические вещества опытом и какие элементы питания нужны растениям.</div>
    <Suspense fallback={<div className="card">Загружаю…</div>}><Composition/></Suspense>
    <div className="card"><h3>Вода в клетке</h3>Вода — главное вещество клетки. <b>Растворитель:</b> большинство веществ поступает в клетку и выводится из неё в растворённом виде. <b>Среда для реакций:</b> химические превращения в клетке идут в водной среде. <b>Транспорт:</b> с водой по организму переносятся питательные вещества. <b>Терморегуляция:</b> испаряясь (пот, испарение с листьев), вода охлаждает организм. <b>Упругость:</b> вода создаёт давление внутри клетки, поэтому листья и стебли упругие, а без воды вянут.
      <h3>Неорганические и органические вещества</h3><b>Неорганические</b> есть и в живой, и в неживой природе: вода и минеральные соли. <b>Органические</b> образуются в живых организмах, и все они содержат углерод.
      <div className="sc"><table style={{marginTop: 8}}><thead><tr><th>Вещество</th><th>Главная роль</th><th>Где много</th></tr></thead><tbody>
        <tr><td>Белки</td><td>строительный материал клетки, ускоряют реакции (ферменты), перенос веществ, защита</td><td>мясо, рыба, яйца, бобовые</td></tr>
        <tr><td>Углеводы</td><td>главный источник энергии; запас (крахмал), опора (целлюлоза клеточной стенки)</td><td>картофель, хлеб, фрукты</td></tr>
        <tr><td>Жиры</td><td>запас энергии и воды, защита от холода</td><td>семена подсолнечника, орехи, сало</td></tr>
        <tr><td>Нуклеиновые кислоты (ДНК)</td><td>хранение и передача наследственной информации</td><td>в ядре каждой клетки</td></tr></tbody></table></div></div>
    <Suspense fallback={null}><TestLab/></Suspense>
    <div className="card"><h3>Питание растений и удобрения</h3>Из почвы растение получает воду и растворённые в ней минеральные соли. Больше всего ему нужны три элемента: <b>азот, фосфор и калий</b>. Когда их в почве не хватает, вносят удобрения.
      <h3>Виды удобрений</h3><b>Органические</b> — навоз, перегной, компост, торф, птичий помёт. Действуют медленно, улучшают структуру почвы. <b>Минеральные</b> — азотные, фосфорные, калийные и комплексные. Действуют быстро, вносятся строго по норме.
      <h3>Почему важна норма</h3>Избыток удобрений накапливается в овощах (нитраты) и вреден для человека. Дожди смывают лишние удобрения в реки и озёра: вода «цветёт» от водорослей, в ней не хватает кислорода, и гибнет рыба.</div>
    <Suspense fallback={null}><NPKLab/></Suspense>
    <div className="card"><h3>Ключевые термины</h3><b>Макроэлементы</b> — элементы, которых в организме много (O, C, H, N и другие). <b>Микроэлементы</b> — нужны в очень малых количествах (железо, йод, цинк). <b>Органические вещества</b> — белки, жиры, углеводы, нуклеиновые кислоты. <b>Неорганические вещества</b> — вода и минеральные соли. <b>Удобрения</b> — вещества, которые вносят в почву для питания растений.
      <h3>Типичные ошибки</h3>Считать, что йод окрашивает сахар или белок (он окрашивает крахмал); думать, что зола — это органическое вещество (это минеральные соли); считать, что «чем больше удобрений, тем лучше».
      <h3>Итог</h3>Клетка состоит из воды, минеральных солей и органических веществ, а растению для роста нужны азот, фосфор и калий. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К темам станции</button></div>;
}
