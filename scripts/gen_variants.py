# Генератор: собирает варианты олимпиады в content/variants.json и рисует графики в public/img
import json, random, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from v2_district import D2
from v3_district import D3
from oblast_data import B2, B3
ROOT = os.path.join(os.path.dirname(__file__), '..')
L = 'ABCDE'

def split(text):
    # отделяем последнее предложение-вопрос от сюжетной части
    ms = list(re.finditer(r'[.!?»)]\s+(?=[А-ЯЁ«])', text))
    if not ms: return None, text
    m = ms[-1]
    return text[:m.end()].strip(), text[m.end():].strip()

def pts(n): return 1 if n <= 15 else 2 if n <= 25 else 3

def district(vn, data, title):
    items = []
    for i, (ctx, q, right, wrong, expl) in enumerate(data, 1):
        if ctx is None: ctx, q = split(q)
        rnd = random.Random(f'd{vn}-{i}')
        opts = [right] + wrong; rnd.shuffle(opts)
        ans = opts.index(right)
        p = pts(i)
        items.append({'id': f'd{vn}_{i}', 'stage': 'district', 'variant': vn, 'n': i, 'pts': p, 'author': True,
                      'src': f'{title}, вопрос {i} ({p} {"балл" if p == 1 else "балла"})', 'ctx': ctx, 'text': q,
                      'options': [f'{L[j]}. {o}' for j, o in enumerate(opts)], 'answer': ans, 'expl': expl})
    return items

def oblast(vn, tasks, title):
    items = []; n = 0
    for k, (ttl, passage, sts, img) in enumerate(tasks, 1):
        sts = list(sts); random.Random(f'b{vn}-{k}').shuffle(sts)
        for (s, ok, expl) in sts:
            n += 1
            it = {'id': f'b{vn}_{n}', 'stage': 'oblast', 'variant': vn, 'n': n, 'pts': 1, 'author': True,
                  'src': f'{title}, задача {k}, утв. {n}', 'ctx': f'Задача {k}. {ttl}\n\n{passage}',
                  'text': f'{n}. (1 балл) {s}', 'options': ['Верно', 'Неверно'], 'answer': 0 if ok else 1, 'expl': expl}
            if img: it['img'] = [{'src': 'img/' + img[0], 'cap': img[1]}]
            items.append(it)
    return items

out = district(2, D2, 'Вариант 2 «Алатау»') + district(3, D3, 'Вариант 3 «Каспий»') + oblast(2, B2, 'Вариант 2') + oblast(3, B3, 'Вариант 3')
json.dump({'items': out}, open(os.path.join(ROOT, 'content/variants.json'), 'w'), ensure_ascii=False, indent=1)

# проверки
from collections import Counter
for st, v in [('district', 2), ('district', 3), ('oblast', 2), ('oblast', 3)]:
    xs = [x for x in out if x['stage'] == st and x['variant'] == v]
    print(st, v, 'вопросов', len(xs), 'баллов', sum(x['pts'] for x in xs), 'ключи', dict(sorted(Counter(x['answer'] for x in xs).items())))
    assert all(len(x['options']) == (5 if st == 'district' else 2) for x in xs)
    assert all(x['ctx'] and x['text'] for x in xs)

# рисунки
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
img = os.path.join(ROOT, 'public/img'); os.makedirs(img, exist_ok=True)
fig, ax = plt.subplots(figsize=(6.4, 3.8), dpi=140)
names = ['А\nтепло, влажно,\nвоздух', 'Б\nтепло,\nсухо', 'В\n4 °C,\nвлажно', 'Г\nзалиты\nводой']; vals = [92, 0, 15, 10]
bars = ax.bar(names, vals, color=['#2f9e5b', '#c9ced6', '#2aa7e0', '#8b5e3c'])
ax.bar_label(bars, labels=[f'{v} %' for v in vals], padding=3)
ax.set_ylim(0, 105); ax.set_ylabel('Проросло семян, из 100'); ax.set_title('Прорастание семян гороха за 7 суток')
for s in ('top', 'right'): ax.spines[s].set_visible(False)
fig.tight_layout(); fig.savefig(os.path.join(img, 'b2_germ.png'), facecolor='white'); plt.close(fig)
fig, ax = plt.subplots(figsize=(6.4, 3.8), dpi=140)
t = [10, 15, 20, 25]; r = [30, 42, 60, 85]
ax.plot(t, r, marker='o', color='#ff7a3d', linewidth=2.5)
for a, b in zip(t, r): ax.annotate(str(b), (a, b), textcoords='offset points', xytext=(0, 8), ha='center')
ax.set_xticks(t); ax.set_xlabel('Температура воды, °C'); ax.set_ylabel('Движений жаберных крышек в минуту'); ax.set_ylim(0, 100)
ax.set_title('Дыхание карася при разной температуре'); ax.grid(alpha=.25)
for s in ('top', 'right'): ax.spines[s].set_visible(False)
fig.tight_layout(); fig.savefig(os.path.join(img, 'b3_fish.png'), facecolor='white'); plt.close(fig)
print('ok')
