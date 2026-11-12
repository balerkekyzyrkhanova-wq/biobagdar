import {useState} from 'react';

export const STN: [string, string][] = [['🧫', 'Мир клетки'], ['🌿', 'Лаборатория растений'], ['🦎', 'Мир животных'], ['🫁', 'Организм человека'], ['🏜️', 'Экосистемы Казахстана'], ['📊', 'Центр анализа данных']];
const AVS = ['🦊', '🐢', '🦎', '🌵'], COLS = ['#0f766e', '#2563eb', '#b8860b', '#9333ea'];

export function useProfile() {
  const get = () => { try { return JSON.parse(localStorage.getItem('bb_prof') || 'null') || {av: '🦊', col: '#0f766e'}; } catch { return {av: '🦊', col: '#0f766e'}; } };
  const [p, setP] = useState(get());
  const set = (x: any) => { const n = {...p, ...x}; setP(n); try { localStorage.setItem('bb_prof', JSON.stringify(n)); } catch {} };
  return [p, set] as const;
}

export function Owl({text}: {text: string}) {
  const [open, setOpen] = useState(() => { try { return localStorage.getItem('bb_owl') !== '0'; } catch { return true; } });
  const tg = () => { setOpen(!open); try { localStorage.setItem('bb_owl', open ? '0' : '1'); } catch {} };
  return <div className="card owl"><div className="bar"><b>🦉 Био, научный помощник</b><button className="s" onClick={tg}>{open ? 'Свернуть' : 'Развернуть'}</button></div>
    {open && <><div>{text}</div><div className="mu">Заранее подготовленные реплики, это не чат с ИИ.</div></>}</div>;
}

export function Profile({prof, setProf}: any) {
  return <div className="card"><b style={{color: prof.col}}><span style={{fontSize: '1.6rem'}}>{prof.av}</span> Мой профиль исследователя</b>
    <div style={{marginTop: 8}}>Аватар: {AVS.map(a => <button key={a} className={'av' + (prof.av === a ? ' on' : '')} aria-label={'Аватар ' + a} onClick={() => setProf({av: a})}>{a}</button>)}</div>
    <div>Цвет: {COLS.map(c => <button key={c} className={'dot' + (prof.col === c ? ' on' : '')} style={{background: c}} aria-label={'Цвет ' + c} onClick={() => setProf({col: c})}/>)}</div></div>;
}

export function StationMap({onTopic, onTrainer, onDiary}: any) {
  return <><h2>Карта экспедиции</h2><div className="grid">{STN.map((s, i) => <div key={s[1]} className="card st"><div className="ic">{s[0]}</div><b>{s[1]}</b>
    {i === 1 ? <><div className="mu">Готова 1 тема из 4 запланированных.</div><button onClick={onTopic}>Открыть тему «Ксилема и флоэма»</button></>
      : i === 5 ? <><div className="mu">Олимпиадные задания с рисунками и разбором.</div><button onClick={onTrainer}>🏆 Олимпиадный тренажёр</button></>
      : <><span className="tag">Скоро</span><div className="mu">Содержание в разработке</div></>}</div>)}</div>
    <div className="card"><button className="s" onClick={onDiary}>📓 Дневник ошибок</button></div>
    <div className="card"><b>🔎 Раскрой биологическую тайну</b> <span className="tag">Скоро</span><div className="mu">Кейс ещё не готов, поэтому не запускается.</div></div></>;
}

const PI: any = {
  xyl: ['Ксилема — трубки для воды и минеральных солей. Зрелые сосуды мёртвые и полые; вода идёт вверх, к листьям.', '#2563eb'],
  phl: ['Флоэма — трубки для растворённых сахаров. Её клетки живые; сахара идут от листьев к корням, плодам и точкам роста.', '#c2410c'],
  leaf: ['Лист: здесь образуются сахара при фотосинтезе, а через устьица испаряется вода — это «тянет» воду вверх.', '#15803d'],
  root: ['Корень впитывает воду и минеральные соли из почвы и запасает сахара, пришедшие по флоэме.', '#92400e'],
};

function Scheme() {
  const [part, setPart] = useState(''), [run, setRun] = useState(false);
  const sw = (p: string, c: string) => ({stroke: part === p ? '#000' : c, strokeWidth: part === p ? 4 : 2});
  return <div className={'card' + (run ? ' run' : '')}><h3>Схема: куда идут вода и сахара</h3>
    <svg viewBox="0 0 300 330" width="100%" style={{maxWidth: 340}} role="img" aria-label="Схема: ксилема проводит воду вверх, флоэма проводит сахара вниз">
      <g className="part" onClick={() => setPart('leaf')}><ellipse cx="150" cy="55" rx="80" ry="38" fill="#86efac" {...sw('leaf', '#15803d')}/><text x="150" y="60" textAnchor="middle" fontSize="14" fill="#064e3b">Лист</text></g>
      <g className="part" onClick={() => setPart('xyl')}><rect x="118" y="90" width="26" height="170" fill="#bfdbfe" {...sw('xyl', '#2563eb')}/></g>
      <g className="part" onClick={() => setPart('phl')}><rect x="156" y="90" width="26" height="170" fill="#fed7aa" {...sw('phl', '#c2410c')}/></g>
      <g className="part" onClick={() => setPart('root')}><path d="M130 262 L90 318 M150 262 L150 320 M170 262 L210 318" stroke={part === 'root' ? '#000' : '#92400e'} strokeWidth="6" fill="none"/><text x="150" y="327" textAnchor="middle" fontSize="12" fill="currentColor">Корень</text></g>
      <path className="flow" d="M131 255 V100" stroke="#2563eb"/><path className="flow" d="M169 100 V255" stroke="#c2410c"/>
      <path d="M122 108 l9 -12 l9 12z" fill="#2563eb"/><path d="M160 247 l9 12 l9 -12z" fill="#c2410c"/>
      <text x="10" y="180" fontSize="12" fill="#2563eb">Ксилема ↑</text><text x="200" y="180" fontSize="12" fill="#c2410c">Флоэма ↓</text></svg>
    <div><button onClick={() => setRun(!run)}>{run ? 'Остановить' : 'Запустить'} движение</button></div>
    <div className="mu">Схема упрощена; анимация показывает направление, а не скорость.</div>
    <div className="warn" style={{marginTop: 8}}>{part ? <b style={{color: PI[part][1]}}>{PI[part][0]}</b> : 'Нажми на часть схемы (лист, трубки, корень), чтобы прочитать пояснение.'}</div></div>;
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
    <Scheme/>
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
