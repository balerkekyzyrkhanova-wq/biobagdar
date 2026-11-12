import {vTitle, fmtDate} from './Olympiad';
export function badgesOf(at: any[]) {
  const sc = at.filter(t => t.score != null && t.max);
  const byA: any = {}; sc.forEach(t => { (byA[t.assignmentId] = byA[t.assignmentId] || []).push(t); });
  const improved = Object.values(byA).some((l: any) => { const s = l.sort((x: any, y: any) => x.n - y.n); return s.length > 1 && s[s.length - 1].score > s[0].score; });
  return [
    {i: '📝', n: 'Первая работа', d: 'Сдана хотя бы одна работа', ok: at.length > 0},
    {i: '✅', n: 'Проверено учителем', d: 'Есть работа с оценкой учителя', ok: sc.length > 0},
    {i: '🌟', n: 'Отличный результат', d: 'Не меньше 80% баллов за работу', ok: sc.some(t => t.score / t.max >= 0.8)},
    {i: '📈', n: 'Работа над ошибками', d: 'Новая попытка лучше первой', ok: improved},
  ];
}

export function Results({as, at, ba = [], analysis, onBack}: any) {
  const bs = badgesOf(at);
  return <div><button className="s" onClick={onBack}>← К карте</button><h2>📊 Мои результаты</h2>
    {analysis}
    <div className="card"><h3>Значки</h3><div className="grid">{bs.map(b => <div key={b.n} style={{opacity: b.ok ? 1 : .45}}><span style={{fontSize: '1.8rem'}}>{b.ok ? b.i : '🔒'}</span> <b>{b.n}</b><div className="mu">{b.d}</div></div>)}</div></div>
    <div className="card"><h3>Олимпиадные варианты</h3>{!ba.length ? <div className="mu">Ты ещё не сдавал(а) варианты в тренажёре.</div> : ba.map((t: any) => { const p = t.max ? Math.round(t.score / t.max * 100) : 0;
      return <div key={t.id} style={{marginTop: 8}}><div className="bar"><span>{vTitle(t.stage, t.variant)}<span className="mu"> · {fmtDate(t.createdAt)}</span></span><b>{t.score} из {t.max} баллов</b></div>
        <div style={{background: 'var(--bd)', borderRadius: 8, height: 10, overflow: 'hidden'}}><div style={{width: p + '%', height: '100%', background: p >= 80 ? '#15803d' : p >= 50 ? 'var(--au)' : '#c2410c'}}/></div></div>; })}
      <div className="mu" style={{marginTop: 6}}>Разбор ответов — в тренажёре, в блоке «Мои решённые варианты».</div></div>
    {!as.length && <div className="card">Заданий от учителя пока нет.</div>}
    {as.map((a: any) => { const l = at.filter((t: any) => t.assignmentId === a.id).sort((x: any, y: any) => x.n - y.n);
      return <div key={a.id} className="card"><b>Тема: {a.topicId}</b> <span className="tag">{a.mode === 'control' ? 'контрольный' : 'тренировка'}</span>
        <div className="mu">Срок: {a.due || '—'} · попыток {l.length}/{a.tries}</div>
        {!l.length && <div>Ещё не начато.</div>}
        {l.map((t: any) => { const p = t.score != null && t.max ? Math.round(t.score / t.max * 100) : null;
          return <div key={t.id} style={{marginTop: 8}}>Попытка {t.n}: <b>{t.status}</b>
            {p != null ? <><b> · {t.score}/{t.max}</b>
              <div style={{background: 'var(--bd)', borderRadius: 8, height: 12, overflow: 'hidden'}}><div style={{width: p + '%', height: '100%', background: p >= 80 ? '#15803d' : p >= 50 ? 'var(--au)' : '#c2410c'}}/></div>
              {Array.isArray(t.wrong) && t.wrong.length > 0 && <div className="mu">Вопросов для разбора: {t.wrong.length}. Они в «Дневнике ошибок».</div>}</>
              : <div className="mu">Результат появится после проверки учителем.</div>}
            {t.comments.map((c: string, i: number) => <div key={i} className="warn" style={{marginTop: 4}}>💬 {c}</div>)}</div>; })}</div>; })}</div>;
}
