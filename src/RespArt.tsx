import {useState} from 'react';

const ORG = [{k: 'leaf', n: 'Листья', t: 'Газы проходят через устьица — щели между замыкающими клетками, в основном на нижней стороне листа.'}, {k: 'stem', n: 'Стебель', t: 'У деревьев и кустарников в коре есть чечевички — бугорки с рыхлой тканью, через которые воздух проходит к живым клеткам ствола.'}, {k: 'root', n: 'Корни', t: 'Корни дышат воздухом, который находится между комочками почвы. Поэтому почву рыхлят, а в залитой водой почве корни задыхаются и гибнут.'}, {k: 'seed', n: 'Семена и плоды', t: 'Живые семена тоже дышат. Сухие — очень слабо, прорастающие — очень сильно, поэтому им нужен доступ воздуха.'}];
export function GasDay() {
  const [day, setDay] = useState(true), [o, setO] = useState('leaf'), cur = ORG.find(x => x.k === o)!;
  const arrow = (x1: number, y1: number, x2: number, y2: number, c: string, lab: string, big = false) => <g><path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c} strokeWidth={big ? 7 : 4} strokeLinecap="round" markerEnd={`url(#a${c.slice(1)})`}/><text x={x1 - 2} y={y1 - 10} fontSize="13" fontWeight="700" fill={c}>{lab}</text></g>;
  const hl = (k: string) => ({onClick: () => setO(k), className: 'part', role: 'button' as const, tabIndex: 0, 'aria-label': ORG.find(x => x.k === k)!.n, style: {filter: o === k ? 'drop-shadow(0 0 7px #ffd166)' : undefined}});
  return <div className="card"><h3>Газообмен растения днём и ночью</h3>
    <div className="mu">Переключай день и ночь и следи за стрелками. Нажимай на органы растения.</div>
    <div style={{display: 'flex', gap: 4, margin: '8px 0'}}><button className={day ? '' : 's'} onClick={() => setDay(true)}>☀️ День</button><button className={!day ? '' : 's'} onClick={() => setDay(false)}>🌙 Ночь</button></div>
    <div className="duo"><div className="art"><svg viewBox="0 0 320 330" role="img" aria-label={day ? 'Днём растение поглощает углекислый газ и выделяет кислород, одновременно дышит' : 'Ночью растение только дышит: поглощает кислород и выделяет углекислый газ'} style={{borderRadius: 14}}>
      <defs>{['#2563eb', '#6b7280'].map(c => <marker key={c} id={`a${c.slice(1)}`} markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="18" refX="10" refY="9" orient="auto"><path d="M0 0 L18 9 L0 18 Z" fill={c}/></marker>)}</defs>
      <rect width="320" height="232" fill={day ? '#cfeafc' : '#1e2a4a'} style={{transition: 'fill .5s'}}/><rect y="232" width="320" height="98" fill="#8a6a44"/>
      {day ? <circle cx="270" cy="44" r="24" fill="#fde047"/> : <path d="M276 26 A22 22 0 1 0 290 62 A17 17 0 1 1 276 26 Z" fill="#f1f5f9"/>}
      <g {...hl('root')}><g stroke="#e7d9b8" strokeWidth="5" fill="none" strokeLinecap="round"><path d="M160 232 L160 312"/><path d="M160 250 C132 262 118 282 108 304"/><path d="M160 250 C188 262 202 282 212 304"/></g><rect x="100" y="236" width="120" height="84" fill="transparent"/></g>
      <g {...hl('stem')}><path d="M160 232 L160 70" stroke="#6b8f3a" strokeWidth="10" strokeLinecap="round"/>{[110, 150, 190].map(y => <ellipse key={y} cx="160" cy={y} rx="2.5" ry="5" fill="#3f5a22"/>)}</g>
      <g {...hl('leaf')}>{[[160, 200, -22], [160, 200, 202], [160, 150, -30], [160, 150, 210], [160, 100, -38], [160, 100, 218]].map(([x, y, r], i) => <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0 0 C18 -20 50 -20 68 0 C50 20 18 20 0 0 Z" fill="#3f9a45" stroke="#2f6f34" strokeWidth="1.5"/>)}</g>
      <g {...hl('seed')}><circle cx="160" cy="62" r="13" fill="#ef4444"/><circle cx="160" cy="62" r="5" fill="#fde047"/></g>
      {day ? <>{arrow(40, 120, 92, 138, '#6b7280', 'CO₂', true)}{arrow(230, 138, 286, 116, '#2563eb', 'O₂', true)}{arrow(40, 196, 84, 196, '#2563eb', 'O₂')}{arrow(236, 196, 284, 196, '#6b7280', 'CO₂')}</> : <>{arrow(36, 150, 90, 150, '#2563eb', 'O₂', true)}{arrow(232, 150, 288, 150, '#6b7280', 'CO₂', true)}</>}
      {arrow(60, 268, 104, 268, '#2563eb', 'O₂')}{arrow(216, 268, 262, 268, '#6b7280', 'CO₂')}</svg></div>
      <div aria-live="polite"><div className="warn"><b>{day ? 'День: идут два процесса сразу.' : 'Ночь: идёт только дыхание.'}</b> {day ? 'Фотосинтез (толстые стрелки) — лист поглощает углекислый газ и выделяет кислород. Дыхание (тонкие стрелки) — растение поглощает кислород и выделяет углекислый газ. Днём фотосинтез намного сильнее, поэтому в итоге растение выделяет кислород.' : 'Без света фотосинтеза нет. Растение продолжает дышать: поглощает кислород и выделяет углекислый газ. Дыхание не прекращается ни на минуту.'}</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{ORG.map(x => <button key={x.k} className={o === x.k ? '' : 's'} style={{minHeight: 38, padding: '4px 10px', fontSize: '.9rem'}} onClick={() => setO(x.k)}>{x.n}</button>)}</div>
        <div className="warn"><b>{cur.n}.</b> {cur.t}</div>
        <div className="mu" style={{marginTop: 6}}><span style={{color: '#2563eb'}}>→</span> кислород · <span style={{color: '#6b7280'}}>→</span> углекислый газ. Дышат все живые клетки растения, а не только листья.</div></div></div></div>;
}

const JAR = [{k: 'wet', n: '🌱 Прорастающие семена', out: true, t: 'Прорастающие семена активно дышали: за сутки они израсходовали кислород в банке и выделили углекислый газ, а он горение не поддерживает.'}, {k: 'dry', n: '🌾 Сухие семена', out: false, t: 'Сухие семена дышат очень слабо, кислорода в банке осталось почти столько же.'}, {k: 'boil', n: '♨️ Варёные семена', out: false, t: 'Варёные семена мертвы и не дышат: кислород не израсходован. Значит, дышат только живые клетки.'}];
export function CandleLab() {
  const [k, setK] = useState('wet'), [st, setSt] = useState(0), j = JAR.find(x => x.k === k)!;
  return <div className="card"><h3>Опыт: дышат ли семена</h3>
    <div className="mu">Положи семена в банку, закрой крышкой на сутки в тёмном тёплом месте, а потом опусти в банку горящую свечу.</div>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{JAR.map(x => <button key={x.k} className={k === x.k ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.9rem'}} onClick={() => { setK(x.k); setSt(0); }}>{x.n}</button>)}</div>
    <div className="duo"><div className="art"><svg viewBox="0 0 300 250" role="img" aria-label="Банка с семенами и свеча">
      <rect x="0" y="216" width="300" height="34" fill="var(--bd)"/>
      <path d="M92 56 L92 200 C92 216 208 216 208 200 L208 56" fill="#eaf6ff" fillOpacity=".6" stroke="var(--mu)" strokeWidth="3"/>
      {st < 2 && <rect x="84" y="42" width="132" height="16" rx="5" fill="#94a3b8" stroke="#475569" strokeWidth="2"/>}
      {Array.from({length: 26}, (_, i) => <g key={i}><ellipse cx={104 + (i % 9) * 11.5} cy={198 - Math.floor(i / 9) * 11} rx="6" ry="4.5" fill={k === 'boil' ? '#b9a27a' : '#d9b76a'} stroke="#8a6a2f" strokeWidth="1"/>{k === 'wet' && i % 2 === 0 && <path d={`M${104 + (i % 9) * 11.5} ${194 - Math.floor(i / 9) * 11} q3 -9 8 -10`} stroke="#6fae4a" strokeWidth="2.2" fill="none"/>}</g>)}
      {st === 1 && <text x="150" y="126" textAnchor="middle" fontSize="15" fill="var(--mu)">прошли сутки…</text>}
      {st === 2 && <g><path d="M150 10 L150 104" stroke="var(--mu)" strokeWidth="2.5"/><rect x="143" y="104" width="14" height="40" rx="3" fill="#fef3c7" stroke="#a16207" strokeWidth="1.5"/>
        {j.out ? <path d="M150 100 q-8 -12 2 -22 q8 -10 -2 -22" stroke="#9ca3af" strokeWidth="3" fill="none" className="npulse"/> : <path d="M150 104 C140 90 146 82 150 70 C155 82 160 90 150 104 Z" fill="#fb923c" stroke="#ea580c" strokeWidth="1.5" className="npulse"/>}</g>}</svg></div>
      <div><div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>{st === 0 && <button onClick={() => setSt(1)}>⏳ Закрыть и ждать сутки</button>}{st === 1 && <button onClick={() => setSt(2)}>🕯️ Опустить горящую свечу</button>}{st === 2 && <button className="s" onClick={() => setSt(0)}>↺ Повторить опыт</button>}</div>
        <div className="warn" aria-live="polite" style={{marginTop: 8}}>{st === 0 ? 'В банке семена и обычный воздух.' : st === 1 ? 'Банка стояла сутки закрытой. Что стало с воздухом внутри? Проверим свечой.' : <><b>{j.out ? 'Свеча погасла.' : 'Свеча горит.'}</b> {j.t}</>}</div>
        <p><b>Ещё два доказательства дыхания.</b> Если прорастающие семена насыпать в термос, температура в нём повысится: при дыхании выделяется энергия, часть её — в виде тепла. Если воздух из банки с такими семенами пропустить через известковую воду, она помутнеет — это обнаруживает углекислый газ.</p></div></div></div>;
}

const SORT: [string, number][] = [['Идёт только на свету', 0], ['Идёт круглые сутки', 1], ['Поглощается кислород', 1], ['Выделяется кислород', 0], ['Органические вещества образуются', 0], ['Органические вещества расходуются', 1], ['Энергия накапливается', 0], ['Энергия освобождается', 1], ['Идёт только в клетках с хлоропластами', 0], ['Идёт во всех живых клетках', 1]];
const GR = ['Фотосинтез', 'Дыхание'];
export function ProcSort() {
  const [a, setA] = useState<Record<number, number>>({});
  const done = Object.keys(a).length === SORT.length, right = SORT.filter((s, i) => a[i] === s[1]).length;
  return <div className="card"><h3>Проверь себя: фотосинтез или дыхание?</h3>
    {SORT.map(([t, g], i) => <div key={t} style={{padding: '8px 0', borderBottom: '1px solid var(--bd)'}}><b>{t}</b> {a[i] !== undefined && <span style={{color: a[i] === g ? '#15803d' : '#b91c1c', fontWeight: 700}}>{a[i] === g ? '✓ верно' : `✗ это ${GR[g].toLowerCase()}`}</span>}
      <div>{GR.map((n, j) => <button key={n} className={a[i] === j ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.88rem'}} onClick={() => setA({...a, [i]: j})}>{n}</button>)}</div></div>)}
    {done && <div className="warn" style={{marginTop: 8}}><b>Верно {right} из {SORT.length}.</b> <button className="s" onClick={() => setA({})}>Пройти ещё раз</button></div>}</div>;
}

const EX = [['🍂', 'Листопад', 'За лето в листьях накапливаются ненужные и вредные вещества (соли, продукты обмена). Сбрасывая листья, растение избавляется от них. Заодно оно уменьшает испарение воды зимой.'], ['💨', 'Устьица', 'Через устьица выходят водяной пар, лишний кислород (на свету) и углекислый газ (при дыхании).'], ['💧', 'Гуттация', 'При влажном воздухе вода не успевает испаряться и выступает каплями на краях листьев через водяные устьица. С ней выходят лишние соли.'], ['🌲', 'Смола', 'Хвойные выделяют смолу в особые смоляные ходы. Она заливает раны и защищает дерево от вредителей и грибов.'], ['🥛', 'Млечный сок', 'У одуванчика, молочая, чистотела ненужные вещества собираются в млечном соке. Он горький или ядовитый и отпугивает животных.'], ['🌸', 'Нектар и эфирные масла', 'Нектар привлекает опылителей. Эфирные масла (мята, полынь, хвойные) дают запах, отпугивают вредителей и убивают микробов.'], ['🪨', 'Корни', 'Корни выделяют в почву углекислый газ и слабые кислоты. Кислоты растворяют минеральные соли, и растению легче их всосать.'], ['🧂', 'Солевые желёзки', 'Растения солончаков (например, кермек, тамарикс) выводят лишнюю соль через желёзки на листьях — на них виден белый налёт.']];
export function Excrete() {
  const [i, setI] = useState(0);
  return <div className="card"><h3>Как растения избавляются от ненужных веществ</h3>
    <div className="mu">У растений нет специальных органов выделения, как почки у животных. Нажимай на карточки.</div>
    <div className="shp" style={{gridTemplateColumns: 'repeat(auto-fill,minmax(104px,1fr))'}}>{EX.map((e, k) => <button key={e[1]} className={i === k ? '' : 's'} style={{display: 'grid', justifyItems: 'center', gap: 2, padding: '8px 4px', margin: 0, minHeight: 78, fontSize: '.85rem'}} onClick={() => setI(k)}><span style={{fontSize: '1.7rem'}} aria-hidden="true">{e[0]}</span>{e[1]}</button>)}</div>
    <div className="warn" aria-live="polite" style={{marginTop: 10}}><b>{EX[i][1]}.</b> {EX[i][2]}</div></div>;
}
