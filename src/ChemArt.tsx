import {useState} from 'react';

const EL: [string, number, string][] = [['Кислород (O)', 65, '#ef4444'], ['Углерод (C)', 18, '#475569'], ['Водород (H)', 10, '#38bdf8'], ['Азот (N)', 3, '#8b5cf6'], ['Остальные', 4, '#f59e0b']];
const WAT: [string, number][] = [['Медуза', 97], ['Огурец', 95], ['Лист салата', 94], ['Человек', 65], ['Древесина', 45], ['Сухие семена', 12]];
export function Composition() {
  let x = 0;
  return <div className="card"><h3>Из чего состоит живое</h3>
    <b>Химические элементы в теле человека (по массе)</b>
    <svg viewBox="0 0 400 34" role="img" aria-label="Кислород 65 %, углерод 18 %, водород 10 %, азот 3 %, остальные 4 %" style={{display: 'block', width: '100%', maxWidth: 720, margin: '6px 0'}}>{EL.map(([n, v, c]) => { const r = <rect key={n} x={x * 4} y="2" width={v * 4 - 1.5} height="30" rx="4" fill={c}/>; x += v; return r; })}</svg>
    <div className="mu">{EL.map(([n, v, c]) => <span key={n} style={{marginRight: 12, whiteSpace: 'nowrap'}}><span style={{color: c}}>●</span> {n} — {v} %</span>)}</div>
    <p>Четыре элемента — кислород, углерод, водород и азот — составляют около 96 % массы. Вместе с фосфором, серой, калием, кальцием, магнием, натрием, хлором их называют <b>макроэлементами</b>. Железо, йод, цинк, фтор, медь нужны в очень малых количествах — это <b>микроэлементы</b>, но без них организм болеет.</p>
    <b>Сколько воды в организмах и их частях</b>
    {WAT.map(([n, v]) => <div key={n} style={{display: 'grid', gridTemplateColumns: '112px 1fr 44px', gap: 8, alignItems: 'center', margin: '5px 0'}}><span>{n}</span><div style={{height: 16, background: 'var(--bd)', borderRadius: 8, overflow: 'hidden'}}><div style={{width: v + '%', height: '100%', background: '#2aa7e0', borderRadius: 8}}/></div><b>{v} %</b></div>)}
    <div className="mu">Числа приблизительные. Чем активнее идут процессы жизнедеятельности, тем больше в ткани воды.</div></div>;
}

const SMP = [{k: 'potato', n: '🥔 Клубень картофеля', c: '#f3e3b0'}, {k: 'sun', n: '🌻 Семя подсолнечника', c: '#d9d2c2'}, {k: 'dough', n: '🍞 Тесто из пшеничной муки', c: '#f1e6cf'}, {k: 'wheat', n: '🌾 Сухие семена пшеницы', c: '#d9b76a'}];
const TST = [{k: 'iod', n: '🧪 Капнуть раствор йода'}, {k: 'paper', n: '📄 Раздавить на бумаге'}, {k: 'wash', n: '🚰 Промыть в воде в марле'}, {k: 'heat', n: '♨️ Нагреть в пробирке'}, {k: 'burn', n: '🔥 Сжечь'}];
const RES: Record<string, Record<string, [string, string, string]>> = {
  iod: {potato: ['#27306e', 'Срез посинел.', 'В клубне много крахмала. Крахмал — углевод, запасное вещество растений. Йод окрашивает его в сине-фиолетовый цвет.'], sun: ['#c9b98a', 'Цвет почти не изменился — остался жёлто-бурым, как у йода.', 'Крахмала в семени подсолнечника очень мало: его запасное вещество — жир.'], dough: ['#27306e', 'Тесто посинело.', 'В муке много крахмала.'], wheat: ['#3b3f7a', 'Срез зерна посинел.', 'Зерно пшеницы запасает крахмал.']},
  paper: {potato: ['#e9ddb0', 'На бумаге мокрое пятно. Оно высохло и исчезло.', 'Это была вода. Жира в клубне почти нет.'], sun: ['#e8d98a', 'На бумаге осталось жирное полупрозрачное пятно. Оно не высыхает.', 'В семенах подсолнечника много жира (масла). Жиры — запас энергии.'], dough: ['#efe5cf', 'Пятна почти нет.', 'Жира в муке очень мало.'], wheat: ['#d9b76a', 'Пятна нет.', 'Жира в зерне пшеницы мало.']},
  wash: {potato: ['#f3e3b0', 'Этот опыт проводят с тестом.', 'Выбери тесто из пшеничной муки.'], sun: ['#d9d2c2', 'Этот опыт проводят с тестом.', 'Выбери тесто из пшеничной муки.'], dough: ['#cdbb93', 'Вода стала мутной, а в марле остался тягучий клейкий комочек.', 'Комочек — клейковина, растительный белок. Вода помутнела от крахмала. Белки — главный строительный материал клетки.'], wheat: ['#d9b76a', 'Этот опыт проводят с тестом.', 'Выбери тесто из пшеничной муки.']},
  heat: {potato: ['#e6d39a', 'На холодных стенках пробирки появилось много капель.', 'Это вода: в клубне её около 80 %.'], sun: ['#cfc6b2', 'На стенках пробирки появились мелкие капли.', 'Даже в сухих семенах есть вода, хотя её мало.'], dough: ['#e8d8b6', 'На стенках пробирки появились капли.', 'В тесте есть вода.'], wheat: ['#cfa95a', 'На стенках пробирки появились мелкие капли.', 'В сухих семенах воды 10–15 %: её мало, поэтому семена долго хранятся и не прорастают.']},
  burn: Object.fromEntries(SMP.map(s => [s.k, ['#9ca3af', 'Образец сначала почернел и задымился, а потом остался серый порошок — зола.', 'Сгорели органические вещества (белки, жиры, углеводы). Зола не горит — это минеральные соли, неорганические вещества.']])) as any,
};
export function TestLab() {
  const [s, setS] = useState('potato'), [t, setT] = useState(''), smp = SMP.find(x => x.k === s)!, r = t ? RES[t][s] : null;
  const chip = {minHeight: 40, padding: '4px 10px', fontSize: '.9rem'};
  return <div className="card"><h3>Виртуальная лаборатория: какие вещества есть в растениях</h3>
    <div className="mu">Выбери образец и опыт. Посмотри, что произойдёт, и сделай вывод.</div>
    <div style={{margin: '8px 0 2px'}}><b>1. Образец</b></div><div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>{SMP.map(x => <button key={x.k} className={s === x.k ? '' : 's'} style={chip} onClick={() => { setS(x.k); setT(''); }}>{x.n}</button>)}</div>
    <div style={{margin: '8px 0 2px'}}><b>2. Опыт</b></div><div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>{TST.map(x => <button key={x.k} className={t === x.k ? '' : 's'} style={chip} onClick={() => setT(x.k)}>{x.n}</button>)}</div>
    <div className="duo" style={{marginTop: 10}}><div className="art"><svg viewBox="0 0 300 190" role="img" aria-label="Образец на лабораторном столе">
      <rect x="0" y="150" width="300" height="40" fill="var(--bd)"/>
      {t === 'heat' ? <g><path d="M120 20 L120 130 C120 160 180 160 180 130 L180 20" fill="#eaf6ff" stroke="var(--mu)" strokeWidth="3" opacity=".9"/><ellipse cx="150" cy="134" rx="22" ry="14" fill={r![0]}/>{[[128, 50], [170, 62], [132, 84], [168, 96], [128, 106], [172, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="#60a5fa" className="npulse" style={{animationDelay: `${i * 0.2}s`}}/>)}<path d="M138 172 C130 160 146 156 142 146 M158 172 C150 160 166 156 162 146" stroke="#fb923c" strokeWidth="4" fill="none" strokeLinecap="round"/></g>
        : <g><ellipse cx="150" cy="148" rx="92" ry="16" fill="#fff" stroke="var(--mu)" strokeWidth="2.5"/>
          {t === 'paper' && <rect x="70" y="92" width="160" height="56" fill="#fff" stroke="var(--mu)" strokeWidth="2"/>}
          <ellipse cx="150" cy={t === 'paper' ? 120 : 128} rx={t === 'burn' ? 34 : t === 'paper' ? 40 : 52} ry={t === 'burn' ? 9 : t === 'paper' ? 16 : 24} fill={r ? r[0] : smp.c} stroke="rgba(0,0,0,.25)" strokeWidth="2" opacity={t === 'paper' ? 0.55 : 1} style={{transition: 'fill .6s, rx .4s, ry .4s'}}/>
          {t === 'iod' && <path d="M150 30 C140 48 140 58 150 62 C160 58 160 48 150 30 Z" fill="#8b5a2b" className="drip"/>}
          {t === 'burn' && <path d="M150 70 C132 96 140 106 150 114 C160 106 168 96 150 70 Z" fill="#fb923c" opacity=".7" className="npulse"/>}
          {t === 'wash' && s === 'dough' && <path d="M60 60 C100 40 200 40 240 60" stroke="#60a5fa" strokeWidth="5" fill="none" strokeDasharray="6 8" className="npulse"/>}</g>}</svg></div>
      <div aria-live="polite">{r ? <div className="warn"><b>Что видно:</b> {r[1]}<div><b>Вывод:</b> {r[2]}</div></div> : <div className="warn">Образец: {smp.n.slice(3)}. Теперь выбери опыт.</div>}
        <div className="sc"><table style={{marginTop: 8}}><thead><tr><th>Вещество</th><th>Как обнаружить</th></tr></thead><tbody><tr><td>Крахмал</td><td>синеет от йода</td></tr><tr><td>Жир</td><td>жирное пятно на бумаге</td></tr><tr><td>Белок</td><td>клейковина при промывании теста</td></tr><tr><td>Вода</td><td>капли при нагревании</td></tr><tr><td>Минеральные соли</td><td>зола после сжигания</td></tr></tbody></table></div></div></div></div>;
}

const NPK = [{k: 'n', s: 'N', n: 'Азот', c: '#8b5cf6', fn: 'Нужен для роста стеблей и листьев: входит в состав белков и хлорофилла.', no: 'Листья мелкие, бледно-зелёные и желтеют, начиная с нижних. Растение слабое и низкое.', fert: 'Азотные удобрения: селитра, мочевина; навоз, перегной.'}, {k: 'p', s: 'P', n: 'Фосфор', c: '#f97316', fn: 'Нужен для развития корней, цветения и созревания плодов и семян.', no: 'Корни слабые, листья тёмные с красно-фиолетовым оттенком, цветков и плодов мало, они созревают поздно.', fert: 'Фосфорные удобрения: суперфосфат, костная мука.'}, {k: 'k', s: 'K', n: 'Калий', c: '#0ea5e9', fn: 'Помогает передвижению веществ по растению, делает стебель прочным, повышает устойчивость к засухе, холоду и болезням.', no: 'Края листьев буреют и засыхают («краевой ожог»), стебель слабый и полегает.', fert: 'Калийные удобрения: хлорид калия, зола.'}];
export function NPKLab() {
  const [v, setV] = useState<any>({n: true, p: true, k: true}), all = v.n && v.p && v.k;
  const leaf = v.n ? (v.p ? '#3f9a45' : '#5b5a8a') : '#d8d06a', sc = v.n ? 1 : 0.72, lean = v.k ? 0 : 14, edge = v.k ? 'none' : '#8a5a2b', rs = v.p ? 1 : 0.5, fl = v.p ? (v.n ? 3 : 2) : 0;
  const L = (x: number, y: number, r: number, i: number) => <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${sc})`}><path d="M0 0 C16 -18 44 -18 60 0 C44 18 16 18 0 0 Z" fill={!v.n && i < 2 ? '#e9dc6a' : leaf} stroke={edge === 'none' ? '#2f6f34' : edge} strokeWidth={v.k ? 1.5 : 5} strokeDasharray={v.k ? undefined : '7 3'} style={{transition: 'fill .5s'}}/><path d="M2 0 L56 0" stroke="rgba(0,0,0,.2)" strokeWidth="1.5"/></g>;
  return <div className="card"><h3>Опыт: чем питается растение</h3>
    <div className="mu">Растение получает из почвы минеральные соли. Выключай элементы по одному и смотри, как меняется растение.</div>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{NPK.map(e => <button key={e.k} className={v[e.k] ? '' : 's'} aria-pressed={v[e.k]} style={{minHeight: 44, padding: '4px 12px', background: v[e.k] ? e.c : undefined, boxShadow: v[e.k] ? 'none' : undefined}} onClick={() => setV({...v, [e.k]: !v[e.k]})}>{v[e.k] ? '✓' : '✗'} {e.n} ({e.s})</button>)}<button className="s" style={{minHeight: 44}} onClick={() => setV({n: true, p: true, k: true})}>↺ Все элементы</button></div>
    <div className="duo"><div className="art"><svg viewBox="0 0 300 330" role="img" aria-label={all ? 'Здоровое растение' : 'Растение с признаками нехватки элементов питания'}>
      <rect x="0" y="230" width="300" height="100" fill="#8a6a44"/><rect x="0" y="226" width="300" height="8" fill="#6f5334"/>
      <g stroke="#e7d9b8" strokeWidth="4" fill="none" strokeLinecap="round" style={{transition: 'transform .5s', transform: `scale(${rs})`, transformOrigin: '150px 232px'}}><path d="M150 232 L150 310"/><path d="M150 250 C120 262 104 280 92 302"/><path d="M150 250 C180 262 196 280 208 302"/><path d="M150 272 C132 284 126 298 120 316"/><path d="M150 272 C168 284 174 298 180 316"/></g>
      <g style={{transition: 'transform .5s', transform: `rotate(${lean}deg)`, transformOrigin: '150px 230px'}}>
        <path d={`M150 230 L150 ${v.n ? 70 : 118}`} stroke="#4f8a3a" strokeWidth={v.k ? 8 : 5} strokeLinecap="round"/>
        {[[150, 200, -24], [150, 200, 204], [150, 165, -30], [150, 165, 210], [150, 130, -36], [150, 130, 216]].map(([x, y, r], i) => L(x, v.n ? y : y + 14, r, i))}
        {Array.from({length: fl}, (_, i) => <g key={i} transform={`translate(${150 + (i - 1) * 26} ${v.n ? 66 + Math.abs(i - 1) * 14 : 112})`}><circle r="11" fill="#ef4444"/><circle r="4" fill="#fde047"/></g>)}</g></svg>
      <div className="mu" style={{textAlign: 'center'}}>{all ? 'Все элементы есть: растение здорово' : 'Не хватает: ' + NPK.filter(e => !v[e.k]).map(e => e.n.toLowerCase()).join(', ')}</div></div>
      <div aria-live="polite">{NPK.map(e => <div key={e.k} className="warn" style={{marginBottom: 8, borderColor: e.c, opacity: 1}}><b style={{color: e.c}}>{e.n} ({e.s}).</b> {v[e.k] ? e.fn : <><b>Признаки нехватки:</b> {e.no}</>}<div className="mu">{e.fert}</div></div>)}</div></div>
    <div className="mu">Рисунок условный: в природе признаки проявляются постепенно и зависят от вида растения.</div></div>;
}
