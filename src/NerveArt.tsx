import {useState} from 'react';

const NC = '#f59e0b';
const TYPES = [
  {k: 'net', name: 'Сетчатая (диффузная)', who: 'Гидра, медузы, актинии (кишечнополостные)',
    how: 'Нервные клетки разбросаны по всему телу и соединены отростками в сеть. Нет ни мозга, ни нервных узлов.',
    react: 'На укол иглой отвечает всё тело сразу: гидра сжимается в комочек. Точного ответа одной частью тела нет.',
    plus: 'Самый древний и простой тип. Сигнал расходится во все стороны медленно и постепенно затухает.'},
  {k: 'ladder', name: 'Стволовая (лестничная)', who: 'Плоские черви: белая планария',
    how: 'На переднем конце тела — два головных нервных узла. От них вдоль тела идут два нервных ствола, соединённые перемычками, как ступеньки лестницы.',
    react: 'Появляется «главный» передний конец тела с органами чувств. Червь ползёт к пище и уходит от света.',
    plus: 'Нервные клетки впервые собираются в узлы и стволы. Сигнал идёт по определённым путям, поэтому ответ точнее.'},
  {k: 'node', name: 'Узловая', who: 'Кольчатые черви (дождевой червь), моллюски, членистоногие (насекомые, пауки, раки)',
    how: 'Окологлоточное нервное кольцо (надглоточный и подглоточный узлы) и брюшная нервная цепочка: в каждом членике тела — свой узел.',
    react: 'Каждый узел управляет своим участком тела. У насекомых надглоточный узел крупный и сложный — его называют головным мозгом; поведение сложное (пчёлы, муравьи).',
    plus: 'Нервная цепочка лежит на брюшной стороне тела. У моллюсков узлы разбросаны по телу и соединены нервами.'},
  {k: 'tube', name: 'Трубчатая', who: 'Хордовые: рыбы, земноводные, пресмыкающиеся, птицы, млекопитающие, человек',
    how: 'Нервная трубка лежит на спинной стороне тела. Её передний конец разрастается в головной мозг, остальная часть — спинной мозг. От них отходят нервы.',
    react: 'Самые быстрые и точные ответы, сложное поведение, обучение, память. Мозг защищён черепом, спинной мозг — позвоночником.',
    plus: 'В ряду от рыб к млекопитающим увеличиваются большие полушария и мозжечок. У млекопитающих появляется кора с бороздами и извилинами.'},
];

function Art({k}: {k: string}) {
  const body = {fill: 'var(--bd)', stroke: 'var(--mu)', strokeWidth: 2.5}, nv = {stroke: NC, strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const};
  if (k === 'net') { const pts: [number, number][] = [[150, 70], [130, 95], [172, 100], [150, 125], [128, 150], [170, 155], [150, 180], [132, 205], [168, 210], [150, 232], [112, 48], [188, 48], [84, 30], [216, 30], [150, 44]];
    const ln = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [6, 7], [6, 8], [7, 9], [8, 9], [1, 4], [2, 5], [4, 7], [5, 8], [0, 14], [14, 10], [14, 11], [10, 12], [11, 13], [1, 10], [2, 11]];
    return <svg viewBox="0 0 300 270" role="img" aria-label="Гидра: нервные клетки образуют сеть по всему телу"><path d="M125 60 C118 120 118 200 132 245 L168 245 C182 200 182 120 175 60 Z" {...body}/><ellipse cx="150" cy="248" rx="26" ry="7" {...body}/>
      {[[125, 60, 70, 20, 60, 8], [140, 55, 120, 10, 105, 4], [160, 55, 180, 10, 195, 4], [175, 60, 230, 20, 240, 8], [150, 54, 150, 20, 150, 6]].map((t, i) => <path key={i} d={`M${t[0]} ${t[1]} Q${t[2]} ${t[3]} ${t[4]} ${t[5]}`} fill="none" stroke="var(--mu)" strokeWidth="9" strokeLinecap="round" opacity=".55"/>)}
      {ln.map(([a, b], i) => <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={NC} strokeWidth="2"/>)}
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="5" fill={NC} className="npulse" style={{animationDelay: `${i * 0.12}s`}}/>)}
      <text x="150" y="266" textAnchor="middle" fontSize="12" fill="var(--mu)">гидра</text></svg>; }
  if (k === 'ladder') return <svg viewBox="0 0 300 270" role="img" aria-label="Планария: два головных узла и два нервных ствола с перемычками">
    <path d="M150 14 C120 18 108 44 112 70 C100 130 104 200 150 256 C196 200 200 130 188 70 C192 44 180 18 150 14 Z" {...body}/>
    <circle cx="138" cy="40" r="4" fill="var(--tx)"/><circle cx="162" cy="40" r="4" fill="var(--tx)"/>
    <path d="M138 62 C128 120 130 190 148 240" {...nv}/><path d="M162 62 C172 120 170 190 152 240" {...nv}/>
    {[90, 115, 140, 165, 190, 212].map((y, i) => <line key={y} x1={134 - (i < 3 ? 2 : -i)} y1={y} x2={166 + (i < 3 ? 2 : -i)} y2={y} stroke={NC} strokeWidth="2.5"/>)}
    <ellipse cx="138" cy="58" rx="10" ry="8" fill={NC} className="npulse"/><ellipse cx="162" cy="58" rx="10" ry="8" fill={NC} className="npulse"/>
    <text x="205" y="58" fontSize="12" fill="var(--mu)">головные узлы</text><text x="205" y="140" fontSize="12" fill="var(--mu)">нервные</text><text x="205" y="154" fontSize="12" fill="var(--mu)">стволы</text>
    <text x="150" y="268" textAnchor="middle" fontSize="12" fill="var(--mu)">планария</text></svg>;
  if (k === 'node') return <svg viewBox="0 40 300 190" role="img" aria-label="Дождевой червь: окологлоточное кольцо и брюшная нервная цепочка">
    <path d="M28 120 C28 92 52 88 80 88 L250 88 C276 88 284 104 284 120 C284 138 276 152 250 152 L80 152 C52 152 28 148 28 120 Z" {...body}/>
    {Array.from({length: 11}, (_, i) => <line key={i} x1={74 + i * 19} y1={89} x2={74 + i * 19} y2={151} stroke="var(--mu)" strokeWidth="1.2" opacity=".6"/>)}
    <path d="M40 120 C60 116 250 118 276 120" stroke="var(--mu)" strokeWidth="6" fill="none" opacity=".35"/>
    <path d="M58 142 L274 142" {...nv}/>
    {Array.from({length: 11}, (_, i) => <circle key={i} cx={83 + i * 19} cy={142} r="5.5" fill={NC} className="npulse" style={{animationDelay: `${i * 0.15}s`}}/>)}
    <ellipse cx="52" cy="120" rx="10" ry="20" fill="none" stroke={NC} strokeWidth="3.5"/><ellipse cx="52" cy="100" rx="9" ry="6.5" fill={NC} className="npulse"/><ellipse cx="54" cy="140" rx="8" ry="5.5" fill={NC}/>
    <text x="20" y="72" fontSize="12" fill="var(--mu)">окологлоточное кольцо</text><text x="120" y="176" fontSize="12" fill="var(--mu)">брюшная нервная цепочка</text><text x="188" y="76" fontSize="12" fill="var(--mu)">спинная сторона</text>
    <text x="150" y="215" textAnchor="middle" fontSize="12" fill="var(--mu)">дождевой червь (вид сбоку)</text></svg>;
  return <svg viewBox="0 50 300 180" role="img" aria-label="Рыба: головной и спинной мозг на спинной стороне тела">
    <path d="M30 135 C60 85 150 78 215 112 L270 85 L262 135 L270 185 L215 158 C150 192 60 185 30 135 Z" {...body}/>
    <circle cx="62" cy="126" r="6" fill="var(--tx)"/><path d="M92 105 C100 135 100 140 92 165" fill="none" stroke="var(--mu)" strokeWidth="2"/>
    <path d="M100 112 C150 104 205 112 250 122" {...nv} strokeWidth="5"/>
    <g className="npulse"><ellipse cx="70" cy="110" rx="9" ry="7" fill={NC}/><ellipse cx="84" cy="107" rx="8" ry="8" fill="#fbbf24"/><ellipse cx="97" cy="108" rx="7" ry="8" fill={NC}/></g>
    {[130, 160, 190, 220].map(x => <path key={x} d={`M${x} ${109 + (x - 100) * 0.07} l-6 22`} stroke={NC} strokeWidth="2"/>)}
    <text x="40" y="76" fontSize="12" fill="var(--mu)">головной мозг</text><text x="150" y="92" fontSize="12" fill="var(--mu)">спинной мозг</text><text x="118" y="150" fontSize="12" fill="var(--mu)">нервы</text>
    <text x="150" y="215" textAnchor="middle" fontSize="12" fill="var(--mu)">рыба (вид сбоку)</text></svg>;
}

export function NerveTypes() {
  const [i, setI] = useState(0), t = TYPES[i];
  return <div className="card"><h3>Типы нервной системы у животных</h3>
    <div className="mu">Нервная система усложнялась постепенно: от сети отдельных клеток до головного и спинного мозга. Нажимай по порядку.</div>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{TYPES.map((x, n) => <button key={x.k} className={i === n ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.9rem'}} onClick={() => setI(n)}>{n + 1}. {x.name}</button>)}</div>
    <div className="duo"><div className="art"><Art k={t.k}/><div className="mu" style={{textAlign: 'center'}}><span style={{color: NC}}>●</span> нервная система</div></div>
      <div aria-live="polite"><h3 style={{marginTop: 0}}>{t.name}</h3><p><b>У кого:</b> {t.who}.</p><p><b>Как устроена:</b> {t.how}</p><p><b>Как отвечает на раздражение:</b> {t.react}</p><p><b>Важно:</b> {t.plus}</p></div></div>
    <div className="sc"><table style={{marginTop: 8}}><thead><tr><th>Тип</th><th>Животные</th><th>Главный признак</th></tr></thead><tbody>
      <tr><td>Сетчатая</td><td>гидра, медузы</td><td>сеть клеток, нет узлов</td></tr><tr><td>Стволовая</td><td>плоские черви</td><td>головные узлы и два ствола</td></tr>
      <tr><td>Узловая</td><td>кольчатые черви, моллюски, членистоногие</td><td>нервные узлы, брюшная цепочка</td></tr><tr><td>Трубчатая</td><td>хордовые, человек</td><td>головной и спинной мозг на спинной стороне</td></tr></tbody></table></div></div>;
}

const NP: Record<string, [string, string]> = {
  dend: ['Дендриты', 'Короткие ветвящиеся отростки. Принимают сигналы от других нейронов или рецепторов и проводят их к телу клетки. Их обычно много.'],
  soma: ['Тело нейрона', 'Здесь находятся ядро и органоиды. Тело обрабатывает полученные сигналы. Скопления тел нейронов образуют серое вещество мозга.'],
  nuc: ['Ядро', 'Хранит наследственную информацию и управляет жизнью клетки. Зрелые нейроны обычно не делятся.'],
  axon: ['Аксон', 'Один длинный отросток (у человека — до 1 метра). Проводит нервный импульс от тела клетки к другому нейрону, мышце или железе. Пучки аксонов образуют нервы и белое вещество.'],
  myel: ['Миелиновая оболочка', 'Жироподобная оболочка вокруг аксона. Работает как изоляция на проводе: импульс идёт быстрее, перескакивая через перехваты.'],
  term: ['Нервные окончания (синапс)', 'Веточки на конце аксона. Место контакта с соседней клеткой называется синапсом: здесь сигнал передаётся дальше с помощью химических веществ.'],
};
export function Neuron() {
  const [k, setK] = useState('dend'), [run, setRun] = useState(true);
  const P = (id: string, extra: any = {}) => ({onClick: () => setK(id), className: 'part', tabIndex: 0, role: 'button' as const, 'aria-label': NP[id][0], onKeyDown: (e: any) => { if (e.key === 'Enter' || e.key === ' ') setK(id); }, style: {outline: 'none', filter: k === id ? 'drop-shadow(0 0 6px #ffd166)' : undefined}, ...extra});
  const hi = (id: string, c: string) => (k === id ? '#ffb703' : c);
  const dn = ['M118 108 C92 92 80 74 62 66 M92 92 C82 96 64 96 50 90 M80 74 C76 62 78 50 70 40', 'M112 128 C84 130 62 128 40 136 M74 129 C62 122 52 122 44 116', 'M120 150 C98 166 86 184 68 196 M94 170 C84 172 70 170 58 176 M86 184 C84 196 88 206 82 216', 'M140 100 C136 80 142 62 136 44 M139 72 C148 62 150 52 158 46'];
  return <div className="card"><h3>Нейрон — нервная клетка</h3>
    <div className="mu">Нажимай на части нейрона. Жёлтая точка показывает путь нервного импульса: он идёт только в одну сторону.</div>
    <div className="duo" style={{gridTemplateColumns: '1fr'}}><div className="art"><svg viewBox="0 0 520 260" role="img" aria-label="Схема нейрона: дендриты, тело с ядром, аксон в миелиновой оболочке, нервные окончания" style={{maxWidth: 640}}>
      <g {...P('dend')}>{dn.map((d, i) => <path key={i} d={d} fill="none" stroke={hi('dend', '#8b5cf6')} strokeWidth="5" strokeLinecap="round"/>)}<rect x="30" y="34" width="110" height="190" fill="transparent"/></g>
      <g {...P('axon')}><path d="M170 130 C230 132 300 128 430 130" fill="none" stroke={hi('axon', '#f59e0b')} strokeWidth="7" strokeLinecap="round"/></g>
      <g {...P('myel')}>{[196, 250, 304, 358].map(x => <rect key={x} x={x} y={119} width="44" height="22" rx="11" fill={hi('myel', '#fde9a9')} stroke="#d49a1a" strokeWidth="1.5"/>)}</g>
      <g {...P('term')}>{['M430 130 C452 118 462 104 480 96', 'M430 130 C456 130 470 130 490 132', 'M430 130 C452 144 462 158 478 168'].map((d, i) => <path key={i} d={d} fill="none" stroke={hi('term', '#ef6a4c')} strokeWidth="5" strokeLinecap="round"/>)}{[[482, 94], [493, 132], [480, 170]].map(([x, y]) => <circle key={y} cx={x} cy={y} r="7" fill={hi('term', '#ef6a4c')}/>)}<rect x="436" y="84" width="70" height="96" fill="transparent"/></g>
      <g {...P('soma')}><path d="M140 96 C166 92 180 112 174 132 C178 152 160 166 140 162 C118 166 104 148 110 128 C104 108 120 94 140 96 Z" fill={hi('soma', '#c4b5fd')} stroke="#7c3aed" strokeWidth="2.5"/></g>
      <g {...P('nuc')}><circle cx="140" cy="129" r="15" fill={hi('nuc', '#7c3aed')}/><circle cx="144" cy="126" r="4.5" fill="#fff" opacity=".7"/></g>
      {run && <circle r="7" fill="#ffe14a" stroke="#b45309" strokeWidth="2"><animateMotion dur="3.2s" repeatCount="indefinite" path="M52 90 C64 96 82 96 92 92 C104 98 112 104 118 108 L140 129 L170 130 C230 132 300 128 430 130 C456 130 470 130 490 132"/></circle>}
      <path d="M210 176 L400 176 M388 168 L402 176 L388 184" fill="none" stroke="var(--mu)" strokeWidth="2.5" strokeLinecap="round"/><text x="305" y="198" textAnchor="middle" fontSize="13" fill="var(--mu)">направление импульса</text>
      <text x="60" y="244" textAnchor="middle" fontSize="12" fill="var(--mu)">дендриты</text><text x="140" y="186" textAnchor="middle" fontSize="12" fill="var(--mu)">тело</text><text x="300" y="108" textAnchor="middle" fontSize="12" fill="var(--mu)">аксон в миелиновой оболочке</text><text x="470" y="72" textAnchor="middle" fontSize="12" fill="var(--mu)">окончания</text></svg>
      <button className="s" style={{minHeight: 38, padding: '4px 10px'}} onClick={() => setRun(!run)}>{run ? '⏸ Остановить импульс' : '▶ Запустить импульс'}</button></div>
      <div><div style={{display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8}}>{Object.entries(NP).map(([id, v]) => <button key={id} className={k === id ? '' : 's'} style={{minHeight: 38, padding: '4px 10px', fontSize: '.9rem'}} onClick={() => setK(id)}>{v[0]}</button>)}</div>
        <div className="warn" aria-live="polite"><b>{NP[k][0]}.</b> {NP[k][1]}</div>
        <p><b>Три вида нейронов.</b> <b>Чувствительные</b> несут сигнал от рецепторов (кожи, глаз, ушей) в мозг. <b>Вставочные</b> находятся внутри мозга и обрабатывают сигнал. <b>Двигательные</b> несут команду от мозга к мышцам и железам.</p>
        <p><b>Свойства нервной ткани:</b> возбудимость (способность отвечать на раздражение) и проводимость (способность проводить импульс).</p></div></div></div>;
}
