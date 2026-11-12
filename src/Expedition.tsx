import {useState} from 'react';

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

export function StationMap({onTopic, onTrainer, onDiary}: any) {
  return <><h2>Карта экспедиции</h2><div className="grid">{STN.map((s, i) => { const on = i === 1 || i === 5; return <div key={s[1]} className={'card st ' + (on ? 'on' : 'off')} style={{'--sc': s[2]} as any}><div className="band"/><div className="ic" aria-hidden="true">{s[0]}</div><b>{s[1]}</b>
    {i === 1 ? <><div className="mu">Готова 1 тема из 4 запланированных.</div><button onClick={onTopic}>Открыть тему «Ксилема и флоэма»</button></>
      : i === 5 ? <><div className="mu">Олимпиадные задания с рисунками и разбором.</div><button onClick={onTrainer}>🏆 Олимпиадный тренажёр</button></>
      : <><span className="tag">Скоро</span><div className="mu">Содержание в разработке</div></>}</div>; })}</div>
    <div className="card"><button className="s" onClick={onDiary}>📓 Дневник ошибок</button></div>
    <div className="card"><b>🔎 Раскрой биологическую тайну</b> <span className="tag">Скоро</span><div className="mu">Кейс ещё не готов, поэтому не запускается.</div></div></>;
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
  return <div><button className="s" onClick={onBack}>← К карте</button><h1>Ксилема, флоэма и транспорт веществ</h1><span className="tag">Станция «Лаборатория растений»</span>
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
    <button className="s" onClick={onBack}>← К карте</button></div>;
}

export const OWL: any = {
  home: 'Привет! Я Био. Выбери станцию на карте: пока готова «Лаборатория растений». Задания от учителя — ниже на этой странице.',
  topic: 'Читай теорию, затем нажимай на части схемы и запускай движение. Посмотри на график: сравнивай опыт с контролем.',
  trainer: 'Это задания олимпиады. Сначала внимательно прочитай условие и рассмотри рисунок, потом отвечай. После проверки прочитай разбор.',
  diary: 'Ошибка — это подсказка, что повторить. Выбери причину честно, так легче не повторять её.',
};
