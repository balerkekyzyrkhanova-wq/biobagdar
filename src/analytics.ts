import topicsMap from '../content/topics.json';
import {itemsOf, meta} from './bankdata';

export const TOPICS: Record<string, {name: string; tip: string}> = {
  eco: {name: 'Экология и пищевые цепи', tip: 'Повтори пищевые цепи и трофические уровни (правило 10 %), роли продуцентов, консументов и редуцентов, сукцессию, влияние загрязнения и вселенцев. Перед ответом рисуй цепь питания и спрашивай себя: что изменится у звена до и после?'},
  animals: {name: 'Животные и их приспособления', tip: 'Повтори признаки основных групп (членистоногие, моллюски, рыбы, земноводные, пресмыкающиеся, птицы, млекопитающие). Составь таблицу: группа — покровы, дыхание, сердце, размножение — и найди приспособления к среде.'},
  human: {name: 'Организм человека', tip: 'Повтори кровь и кровообращение, дыхание, пищеварение, нервную и выделительную системы. Для каждого органа выпиши, что он делает и как меняется при нагрузке.'},
  plants: {name: 'Строение и размножение растений', tip: 'Повтори корень, стебель, цветок, семя, опыление и распространение семян. К каждому приспособлению ставь вопрос: какую проблему оно решает?'},
  cell: {name: 'Клетка и клеточные процессы', tip: 'Повтори органоиды и их функции, отличия растительной клетки от животной, осмос и транспорт через мембрану.'},
  photo: {name: 'Фотосинтез и дыхание', tip: 'Повтори, где и что идёт при фотосинтезе и дыхании, какие вещества нужны и образуются, как свет и температура влияют на процессы.'},
  data: {name: 'Анализ данных и эксперименты', tip: 'Тренируйся читать графики и таблицы: оси и единицы, сравнение с контролем, повторность опыта. Отвечай только по данным, а не по догадке.'},
  transport: {name: 'Транспорт веществ в растении', tip: 'Открой на карте экспедиции тему «Ксилема, флоэма и транспорт веществ»: схема с анимацией и опыт с окольцовыванием. Повтори транспирацию и работу устьиц.'},
  fungi: {name: 'Грибы и лишайники', tip: 'Повтори отличия грибов от растений, строение лишайников и пользу микоризы.'},
};
export const topicOf = (id: string) => (topicsMap as any)[id] as string | undefined;
export type Stat = {id: string; name: string; n: number; ok: number; got: number; max: number; pct: number};
export const level = (s: Stat) => (s.n < 3 ? 'few' : s.pct < 50 ? 'weak' : s.pct < 75 ? 'mid' : 'good');
export const LEVEL_TEXT: any = {few: 'мало данных', weak: 'нужно подтянуть', mid: 'стоит повторить', good: 'хорошо'};
export const LEVEL_COLOR: any = {few: '#64748b', weak: '#c2410c', mid: '#b8860b', good: '#15803d'};

// bankAtt — попытки вариантов; keyAns(id) — ключ задания; xyl — проверенные работы по теме «Ксилема» ({score,max,assignmentId,n})
export function topicStats(bankAtt: any[], keyAns: (id: string) => number | undefined, xyl: any[] = []): Stat[] {
  const latest: any = {};
  bankAtt.forEach(t => { const k = t.studentId + '|' + t.stage + '|' + t.variant; if (!latest[k] || (t.createdAt?.seconds || 0) > (latest[k].createdAt?.seconds || 0)) latest[k] = t; });
  const m: any = {};
  const add = (tp: string, n: number, got: number, max: number, ok: number) => { const s = (m[tp] = m[tp] || {id: tp, name: TOPICS[tp].name, n: 0, ok: 0, got: 0, max: 0, pct: 0}); s.n += n; s.got += got; s.max += max; s.ok += ok; };
  Object.values(latest).forEach((t: any) => itemsOf(t.stage, t.variant).forEach(q => {
    const tp = topicOf(q.id); if (!tp) return; const p = meta(q).pts, k = keyAns(q.id);
    const ok = k !== undefined && t.answers?.[q.id] === k; add(tp, 1, ok ? p : 0, p, ok ? 1 : 0);
  }));
  const lx: any = {};
  xyl.filter(t => t.score != null && t.max).forEach(t => { const k = t.studentId + '|' + t.assignmentId; if (!lx[k] || t.n > lx[k].n) lx[k] = t; });
  Object.values(lx).forEach((t: any) => { add((() => { const f = Object.keys(t.answers || {})[0] || ''; return f.startsWith('c') ? 'cell' : f.startsWith('a') ? 'animals' : f.startsWith('h') ? 'human' : f.startsWith('e') ? 'eco' : 'transport'; })(), t.max, t.score, t.max, t.score); });
  return Object.values(m).map((s: any) => ({...s, pct: s.max ? Math.round(s.got / s.max * 100) : 0})).sort((a: any, b: any) => a.pct - b.pct);
}
export const overall = (st: Stat[]) => { const g = st.reduce((s, x) => s + x.got, 0), m = st.reduce((s, x) => s + x.max, 0); return m ? Math.round(g / m * 100) : null; };
