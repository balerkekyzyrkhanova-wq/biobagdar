import bank from '../content/bank.json';
import vars from '../content/variants.json';

export type Stage = 'district' | 'oblast';
export const STAGE_NAME: Record<Stage, string> = {district: 'Районный этап', oblast: 'Областной этап'};
export const VARIANTS: {stage: Stage; variant: number; title: string; minutes: number; sample?: boolean}[] = [
  {stage: 'district', variant: 1, title: 'Вариант 1 · образец 2025', minutes: 90, sample: true},
  {stage: 'district', variant: 2, title: 'Вариант 2 · «Алатау»', minutes: 90},
  {stage: 'district', variant: 3, title: 'Вариант 3 · «Каспий»', minutes: 90},
  {stage: 'oblast', variant: 1, title: 'Вариант 1 · образец 2025', minutes: 150, sample: true},
  {stage: 'oblast', variant: 2, title: 'Вариант 2 · «Горы»', minutes: 75},
  {stage: 'oblast', variant: 3, title: 'Вариант 3 · «Каспий»', minutes: 75},
];
export const ptsOfDistrict = (n: number) => (n <= 15 ? 1 : n <= 25 ? 2 : 3);

// Достраивает этап/вариант/номер/баллы по id (для заданий образцов, загруженных раньше)
export function meta(q: any) {
  if (q.stage && q.variant && q.n) return {stage: q.stage as Stage, variant: q.variant as number, n: q.n as number, pts: (q.pts ?? 1) as number};
  const m = /^([ro])(\d+)$/.exec(q.id) || [];
  const n = +m[2];
  return m[1] === 'r' ? {stage: 'district' as Stage, variant: 1, n, pts: ptsOfDistrict(n)} : {stage: 'oblast' as Stage, variant: 1, n, pts: 1};
}
export const withMeta = (q: any) => ({...q, ...meta(q)});
export const ALL_ITEMS: any[] = [...(bank as any).items, ...(vars as any).items].map(withMeta)
  .sort((a, b) => (a.stage === b.stage ? a.variant - b.variant || a.n - b.n : a.stage < b.stage ? -1 : 1));
export const itemsOf = (stage: Stage, variant: number) => ALL_ITEMS.filter(q => q.stage === stage && q.variant === variant);
export const maxOf = (qs: any[]) => qs.reduce((s, q) => s + (meta(q).pts), 0);
export const EXCLUDED: any[] = (bank as any).excluded;
