import {useEffect, useState} from 'react';

type Stg = {n: string; t: string; d: (on: boolean) => JSX.Element};
const em = (e: string, s = 40) => () => <text textAnchor="middle" dominantBaseline="central" fontSize={s}>{e}</text>;
const pupa = () => <g><ellipse rx="11" ry="22" fill="#a3a36b" stroke="#6b6b3a" strokeWidth="2"/>{[-10, -2, 6, 14].map(y => <path key={y} d={`M-10 ${y} q10 5 20 0`} fill="none" stroke="#6b6b3a" strokeWidth="1.5"/>)}<path d="M0 -22 L0 -32" stroke="#6b6b3a" strokeWidth="2"/></g>;
const tad = (legs: boolean) => () => <g><ellipse rx="15" ry="11" fill="#4d5b3a"/><path d="M13 0 q16 -10 30 0 q-14 10 -30 0" fill="#6b7c52"/><circle cx="-7" cy="-3" r="2.2" fill="#fff"/>{legs && <path d="M2 9 l-4 10 M8 8 l4 10" stroke="#4d5b3a" strokeWidth="3" strokeLinecap="round"/>}</g>;
const eggs = () => <g>{[[-10, -6], [4, -9], [12, 3], [-3, 6], [-14, 6]].map(([x, y]) => <g key={x}><circle cx={x} cy={y} r="8" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5"/><circle cx={x} cy={y} r="3" fill="#1f2937"/></g>)}</g>;
const CYC: {k: string; n: string; type: string; note: string; st: Stg[]}[] = [
  {k: 'but', n: '🦋 Бабочка', type: 'Непрямое развитие с полным превращением', note: 'Четыре стадии. Личинка совсем не похожа на взрослое насекомое и питается другой пищей, поэтому они не соперничают за корм. Так же развиваются жуки, мухи, комары, пчёлы, муравьи.', st: [
    {n: 'Яйцо', t: 'Самка откладывает яйца на листья растения, которым будет питаться гусеница.', d: em('🥚', 30)},
    {n: 'Личинка (гусеница)', t: 'Гусеница много ест, быстро растёт и несколько раз линяет. У неё грызущий ротовой аппарат, она питается листьями.', d: em('🐛')},
    {n: 'Куколка', t: 'Куколка неподвижна и не питается. Внутри неё тело гусеницы полностью перестраивается в тело бабочки.', d: pupa},
    {n: 'Взрослое насекомое', t: 'Из куколки выходит бабочка с крыльями. Она питается нектаром, расселяется и откладывает яйца.', d: em('🦋')}]},
  {k: 'gra', n: '🦗 Кузнечик', type: 'Непрямое развитие с неполным превращением', note: 'Три стадии, куколки нет. Личинка похожа на взрослое насекомое, но меньше и без крыльев. Так же развиваются саранча, клопы, тараканы, стрекозы.', st: [
    {n: 'Яйцо', t: 'Самка откладывает яйца в почву. Они зимуют.', d: em('🥚', 30)},
    {n: 'Личинка', t: 'Личинка похожа на взрослого кузнечика, но у неё нет крыльев и она не может размножаться. Она растёт и несколько раз линяет.', d: em('🦗', 26)},
    {n: 'Взрослое насекомое', t: 'После последней линьки появляются крылья. Взрослый кузнечик размножается.', d: em('🦗', 44)}]},
  {k: 'fro', n: '🐸 Лягушка', type: 'Непрямое развитие (с превращением)', note: 'Головастик живёт в воде и похож на рыбку: дышит жабрами, имеет хвост, один круг кровообращения. Взрослая лягушка дышит лёгкими и кожей и живёт на суше и в воде.', st: [
    {n: 'Икра', t: 'Лягушка мечет икру в воду. Икринки покрыты прозрачной слизистой оболочкой.', d: eggs},
    {n: 'Головастик', t: 'Из икринки выходит головастик с хвостом и жабрами. Он питается водорослями.', d: tad(false)},
    {n: 'Головастик с ногами', t: 'Сначала появляются задние ноги, потом передние. Развиваются лёгкие, жабры исчезают.', d: tad(true)},
    {n: 'Лягушонок', t: 'Хвост постепенно рассасывается. Лягушонок выходит на сушу.', d: em('🐸', 24)},
    {n: 'Взрослая лягушка', t: 'Дышит лёгкими и кожей, питается насекомыми. Через 3 года может размножаться.', d: em('🐸', 44)}]},
  {k: 'hen', n: '🐔 Курица', type: 'Прямое развитие', note: 'Детёныш сразу похож на взрослое животное и отличается размерами и пропорциями. Так развиваются пресмыкающиеся, птицы, млекопитающие, а также пауки и дождевые черви.', st: [
    {n: 'Яйцо', t: 'В яйце много питательных веществ (желток). Зародыш развивается под скорлупой 21 день, его согревает наседка.', d: em('🥚', 34)},
    {n: 'Вылупление', t: 'Цыплёнок пробивает скорлупу. Он уже похож на птицу: покрыт пухом, видит и может ходить.', d: em('🐣')},
    {n: 'Цыплёнок', t: 'Цыплёнок растёт, пух сменяется перьями. Строение тела не перестраивается.', d: em('🐥')},
    {n: 'Взрослая птица', t: 'Взрослая курица может размножаться. Цикл повторяется.', d: em('🐔', 44)}]},
];
export function LifeCycle() {
  const [k, setK] = useState('but'), [i, setI] = useState(0), [play, setPlay] = useState(false), c = CYC.find(x => x.k === k)!, n = c.st.length;
  useEffect(() => { if (!play) return; const id = setInterval(() => setI(x => (x + 1) % n), 2200); return () => clearInterval(id); }, [play, n]);
  const pos = (j: number) => { const a = -Math.PI / 2 + j * 2 * Math.PI / n; return [150 + Math.cos(a) * 96, 138 + Math.sin(a) * 92]; };
  return <div className="card"><h3>Жизненные циклы: как развиваются животные</h3>
    <div className="mu">Выбери животное и пройди стадии по кругу. Сравни, сколько стадий и похожа ли личинка на взрослое животное.</div>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{CYC.map(x => <button key={x.k} className={k === x.k ? '' : 's'} style={{minHeight: 40, padding: '4px 10px'}} onClick={() => { setK(x.k); setI(0); }}>{x.n}</button>)}</div>
    <div className="duo"><div className="art"><svg viewBox="0 0 300 280" role="img" aria-label={`${c.n}: ${c.type}. Стадия ${i + 1}: ${c.st[i].n}`}>
      <defs><marker id="lc" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="9" refY="7" orient="auto"><path d="M0 0 L14 7 L0 14 Z" fill="var(--mu)"/></marker></defs>
      {c.st.map((_, j) => { const a0 = -Math.PI / 2 + (j + 0.28) * 2 * Math.PI / n, a1 = -Math.PI / 2 + (j + 0.72) * 2 * Math.PI / n, am = (a0 + a1) / 2; return <path key={j} d={`M${150 + Math.cos(a0) * 96} ${138 + Math.sin(a0) * 92} Q${150 + Math.cos(am) * 112} ${138 + Math.sin(am) * 108} ${150 + Math.cos(a1) * 96} ${138 + Math.sin(a1) * 92}`} fill="none" stroke="var(--mu)" strokeWidth="2.5" markerEnd="url(#lc)" opacity={i === j ? 1 : 0.45}/>; })}
      {c.st.map((s, j) => { const [x, y] = pos(j), on = i === j; return <g key={s.n} transform={`translate(${x} ${y})`} onClick={() => { setPlay(false); setI(j); }} className="part" role="button" tabIndex={0} aria-label={`Стадия ${j + 1}: ${s.n}`} onKeyDown={e => { if (e.key === 'Enter') setI(j); }}>
        <circle r="36" fill={on ? '#fff3c4' : 'var(--card)'} stroke={on ? '#f59e0b' : 'var(--bd)'} strokeWidth={on ? 4 : 2}/>{s.d(on)}<circle cx="-26" cy="-26" r="11" fill={on ? '#f59e0b' : 'var(--mu)'}/><text x="-26" y="-22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{j + 1}</text></g>; })}</svg></div>
      <div aria-live="polite"><div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}><button onClick={() => setPlay(!play)}>{play ? '⏸ Пауза' : '▶ Запустить цикл'}</button><button className="s" onClick={() => { setPlay(false); setI((i + 1) % n); }}>Следующая стадия ▶</button></div>
        <div className="warn" style={{marginTop: 8}}><b>Стадия {i + 1} из {n}: {c.st[i].n}.</b> {c.st[i].t}</div>
        <p><span className="tag">{c.type}</span></p><p>{c.note}</p></div></div></div>;
}

const UNI = [{k: 'am', n: 'Амёба: ложноножки', t: 'Цитоплазма перетекает в выросты — ложноножки. Амёба как бы переливается с места на место и постоянно меняет форму. Движение медленное.'}, {k: 'eu', n: 'Эвглена: жгутик', t: 'Длинный жгутик на переднем конце вращается и ввинчивается в воду, как винт, и тянет клетку за собой.'}, {k: 'in', n: 'Инфузория: реснички', t: 'Тело покрыто тысячами коротких ресничек. Они гребут согласованно, как вёсла, поэтому инфузория — самый быстрый пловец среди простейших.'}];
export function UniMove() {
  const [k, setK] = useState('am'), u = UNI.find(x => x.k === k)!;
  return <div className="card"><h3>Как движутся одноклеточные</h3>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{UNI.map(x => <button key={x.k} className={k === x.k ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.9rem'}} onClick={() => setK(x.k)}>{x.n}</button>)}</div>
    <div className="duo"><div className="art"><svg viewBox="0 0 300 150" role="img" aria-label={u.n} style={{background: '#e6f4fb', borderRadius: 14}}>
      {k === 'am' && <g className="swim slow"><path fill="#b8e0c8" stroke="#3f7d5a" strokeWidth="2.5"><animate attributeName="d" dur="4s" repeatCount="indefinite" values="M90 76 C80 40 130 34 150 52 C180 30 220 54 206 82 C226 110 180 126 156 108 C130 130 96 112 90 76 Z;M84 70 C92 30 126 44 150 44 C190 40 236 70 214 86 C210 122 176 110 150 116 C120 120 76 110 84 70 Z;M90 76 C80 40 130 34 150 52 C180 30 220 54 206 82 C226 110 180 126 156 108 C130 130 96 112 90 76 Z"/></path><circle cx="140" cy="80" r="12" fill="#8b5cf6" opacity=".6"/></g>}
      {k === 'eu' && <g className="swim"><path d="M70 75 C90 52 150 50 190 75 C150 100 90 98 70 75 Z" fill="#8fd16a" stroke="#3f7d2a" strokeWidth="2.5"/><circle cx="170" cy="72" r="4" fill="#ef4444"/><circle cx="120" cy="76" r="9" fill="#3f7d2a" opacity=".5"/><path fill="none" stroke="#3f7d2a" strokeWidth="2.5" strokeLinecap="round"><animate attributeName="d" dur=".5s" repeatCount="indefinite" values="M190 75 q12 -14 24 0 t24 0;M190 75 q12 14 24 0 t24 0;M190 75 q12 -14 24 0 t24 0"/></path></g>}
      {k === 'in' && <g className="swim fast"><path d="M80 75 C84 46 180 40 206 70 C214 84 190 104 150 104 C110 104 78 96 80 75 Z" fill="#c9d8f2" stroke="#4b6aa8" strokeWidth="2.5"/><ellipse cx="140" cy="76" rx="20" ry="10" fill="#4b6aa8" opacity=".45"/>{Array.from({length: 22}, (_, i) => { const a = i / 22 * 6.283, x = 143 + Math.cos(a) * 65, y = 74 + Math.sin(a) * 31; return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * 9} y2={y + Math.sin(a) * 9} stroke="#4b6aa8" strokeWidth="2" className="cil" style={{animationDelay: `${i * 0.04}s`, transformOrigin: `${x}px ${y}px`}}/>; })}</g>}</svg></div>
      <div className="warn" aria-live="polite"><b>{u.n}.</b> {u.t}</div></div></div>;
}

const MV = [['🪱', 'Кожно-мускульный мешок', 'У червей кожа срослась с мышцами. Кольцевые мышцы делают тело тонким и длинным, продольные — коротким и толстым. Чередуя сокращения, червь ползёт. Опорой служит жидкость в полости тела.'], ['🦑', 'Реактивное движение', 'Кальмары, осьминоги и медузы с силой выталкивают воду из тела и получают толчок в обратную сторону.'], ['🐌', 'Мускулистая нога', 'У улитки по подошве ноги пробегают волны сокращений мышц, а слизь уменьшает трение.'], ['🦀', 'Членистые конечности', 'У раков, пауков и насекомых ноги состоят из члеников, соединённых суставами. Мышцы крепятся изнутри к наружному хитиновому скелету.'], ['🐟', 'Плавники и хвост', 'Рыбу толкают вперёд изгибы тела и хвостовой плавник. Парные плавники — рули и стабилизаторы. Обтекаемое тело и слизь уменьшают сопротивление воды.'], ['🐸', 'Ноги рычажного типа', 'У наземных позвоночных конечности — система рычагов из костей, соединённых суставами. У лягушки задние ноги длинные, прыгательные, с плавательными перепонками.'], ['🐍', 'Изгибы тела', 'Змеи ползут, изгибая тело волнами и упираясь в неровности чешуйками на брюхе.'], ['🦅', 'Крылья', 'У птиц передние конечности превратились в крылья. Лёгкие полые кости, мощные грудные мышцы и киль грудины — приспособления к полёту. У насекомых крылья — выросты покрова.'], ['🐎', 'Ноги зверей', 'Ноги расположены под туловищем, поэтому тело приподнято над землёй. Форма зависит от образа жизни: бег (лошадь), рытьё (крот), плавание (тюлень, кит), полёт (летучая мышь), лазанье (обезьяна).']];
export function MoveCards() {
  const [i, setI] = useState(0);
  return <div className="card"><h3>Органы движения многоклеточных животных</h3>
    <div className="shp" style={{gridTemplateColumns: 'repeat(auto-fill,minmax(104px,1fr))'}}>{MV.map((e, k) => <button key={e[1]} className={i === k ? '' : 's'} style={{display: 'grid', justifyItems: 'center', gap: 2, padding: '8px 4px', margin: 0, minHeight: 84, fontSize: '.82rem'}} onClick={() => setI(k)}><span style={{fontSize: '1.7rem'}} aria-hidden="true">{e[0]}</span>{e[1]}</button>)}</div>
    <div className="warn" aria-live="polite" style={{marginTop: 10}}><b>{MV[i][1]}.</b> {MV[i][2]}</div></div>;
}

const SORT: [string, number][] = [['🐈 Кошка', 0], ['🦋 Капустная белянка', 1], ['🐸 Озёрная лягушка', 1], ['🦎 Прыткая ящерица', 0], ['🪲 Майский жук', 1], ['🕊️ Голубь', 0], ['🦟 Комар', 1], ['🕷️ Паук-крестовик', 0], ['🦗 Саранча', 1]];
const GR = ['Прямое', 'Непрямое'];
export function DevSort() {
  const [a, setA] = useState<Record<number, number>>({});
  const done = Object.keys(a).length === SORT.length, right = SORT.filter((s, i) => a[i] === s[1]).length;
  return <div className="card"><h3>Проверь себя: прямое или непрямое развитие?</h3>
    {SORT.map(([t, g], i) => <div key={t} style={{padding: '8px 0', borderBottom: '1px solid var(--bd)'}}><b>{t}</b> {a[i] !== undefined && <span style={{color: a[i] === g ? '#15803d' : '#b91c1c', fontWeight: 700}}>{a[i] === g ? '✓ верно' : `✗ у него ${GR[g].toLowerCase()} развитие`}</span>}
      <div>{GR.map((n, j) => <button key={n} className={a[i] === j ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.88rem'}} onClick={() => setA({...a, [i]: j})}>{n}</button>)}</div></div>)}
    {done && <div className="warn" style={{marginTop: 8}}><b>Верно {right} из {SORT.length}.</b> <button className="s" onClick={() => setA({})}>Пройти ещё раз</button></div>}</div>;
}
