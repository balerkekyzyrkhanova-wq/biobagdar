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

export function StationMap({onTopic, onCell, onTrainer, onDiary}: any) {
  return <><h2>Карта экспедиции</h2><div className="grid">{STN.map((s, i) => { const on = i === 0 || i === 1 || i === 5; return <div key={s[1]} className={'card st ' + (on ? 'on' : 'off')} style={{'--sc': s[2]} as any}><div className="band"/><div className="ic" aria-hidden="true">{s[0]}</div><b>{s[1]}</b>
    {i === 0 ? <><div className="mu">Строение клетки, органоиды, осмос.</div><button onClick={onCell}>Открыть тему «Клетка»</button></>
      : i === 1 ? <><div className="mu">Транспорт воды и сахаров в растении.</div><button onClick={onTopic}>Открыть тему «Ксилема и флоэма»</button></>
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
  cell: 'Нажимай на части клетки и переключай растительную и животную. Потом проведи опыт с осмосом: сравни воду и солёный раствор.',
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
  return <div><button className="s" onClick={onBack}>← К карте</button><h1>Клетка: строение и функции</h1><span className="tag">Станция «Мир клетки»</span>
    <div className="card"><h3>Что я узнаю</h3>Из каких частей состоит клетка, чем растительная клетка отличается от животной и почему вода входит в клетку или выходит из неё.</div>
    <div className="card"><h3>Клетка — основа жизни</h3>Все живые организмы состоят из клеток. Клетка — самая маленькая единица, которая может жить сама: питаться, расти, размножаться. Новые клетки появляются только из прежних клеток путём деления. Клетки видно только в микроскоп.
      <h3>Из чего состоит клетка</h3>Снаружи — клеточная мембрана. Внутри — цитоплазма, в которой расположены органоиды: ядро, митохондрии, рибосомы и другие. У растений ещё есть клеточная стенка, хлоропласты и крупная вакуоль.
      <h3>Чем растительная клетка отличается от животной</h3>Только у растительной клетки есть клеточная стенка, хлоропласты и крупная вакуоль. Митохондрии, ядро, рибосомы и мембрана есть у обеих.</div>
    <CellLab/>
    <div className="card"><h3>Как вещества попадают в клетку</h3>Мембрана пропускает не всё подряд. Воду она пропускает легко, и вода идёт туда, где растворённых веществ больше (осмос). Поэтому свежий салат, опущенный в воду, становится хрустящим, а посоленные огурцы выпускают сок.</div>
    <OsmosisLab/>
    <div className="card"><h3>Ключевые термины</h3><b>Органоид</b> — постоянная часть клетки с особой функцией. <b>Осмос</b> — движение воды через мембрану. <b>Тургор</b> — упругость клетки из-за давления содержимого на стенку. <b>Плазмолиз</b> — отход мембраны от стенки при потере воды.
      <h3>Разобранная задача</h3>«Ломтики картофеля выдержали час в воде, в 1 % и в 3 % растворах соли. В воде их масса выросла, в 3 % — уменьшилась. Почему?» В воде вода входит в клетки (осмос), масса растёт. В 3 % растворе вне клеток соли больше, вода выходит, масса падает.
      <h3>Типичные ошибки</h3>Думать, что у животных клеток есть стенка; путать хлоропласты (фотосинтез) и митохондрии (дыхание); считать, что соль «впитывается» и вода входит в клетку в солёном растворе.
      <h3>Итог</h3>Ядро управляет, митохондрии дают энергию, хлоропласты делают органику на свету, мембрана выбирает, что пропустить. Следующий шаг — задание от учителя.</div>
    <button className="s" onClick={onBack}>← К карте</button></div>;
}
