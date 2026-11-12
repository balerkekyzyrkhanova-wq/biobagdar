# Разметка заданий банка по темам -> content/topics.json (id задания -> тема)
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
m = {}
r = {1:'eco',2:'eco',3:'animals',4:'cell',5:'plants',6:'transport',7:'transport',8:'photo',9:'animals',10:'plants',11:'eco',12:'plants',13:'eco',14:'human',15:'data',16:'transport',17:'transport',18:'human',19:'human',20:'animals',21:'animals',22:'transport',23:'transport',24:'plants',25:'eco',26:'eco',27:'eco',28:'human',29:'eco',30:'eco'}
for n, t in r.items(): m[f'r{n}'] = t
oblast1 = [(1,4,'eco'),(5,8,'animals'),(9,12,'cell'),(13,16,'plants'),(17,20,'eco'),(21,29,'cell'),(30,33,'transport'),(34,41,'human'),(42,45,'photo'),(46,49,'eco'),(50,61,'animals')]
# границы задач 3,4,5,6,11 уточняются по данным ниже
bank = json.load(open(os.path.join(ROOT, 'content/bank.json')))['items']
import re
task_topic = {1:'eco',2:'animals',3:'cell',4:'plants',5:'eco',6:'cell',7:'transport',8:'human',9:'photo',10:'eco',11:'animals'}
for x in bank:
    if x['id'].startswith('o'):
        k = int(re.search(r'задача (\d+)', x['src']).group(1)); m[x['id']] = task_topic[k]
d2 = 'eco plants plants animals eco human fungi plants animals photo animals cell animals human eco human transport plants eco human fungi eco photo animals plants data eco eco transport eco'.split()
d3 = 'eco eco animals animals eco animals animals animals photo animals photo eco animals cell animals animals eco eco eco animals human photo animals animals cell data eco data data eco'.split()
assert len(d2) == 30 and len(d3) == 30
for i, t in enumerate(d2, 1): m[f'd2_{i}'] = t
for i, t in enumerate(d3, 1): m[f'd3_{i}'] = t
import sys; sys.path.insert(0, os.path.dirname(__file__))
v = json.load(open(os.path.join(ROOT, 'content/variants.json')))['items']
b2 = {1:'eco',2:'photo',3:'human',4:'animals',5:'eco',6:'data',7:'animals',8:'fungi'}
b3 = {1:'eco',2:'human',3:'plants',4:'data',5:'human',6:'animals',7:'eco',8:'plants'}
for x in v:
    if x['id'].startswith('b'):
        k = int(re.search(r'задача (\d+)', x['src']).group(1)); m[x['id']] = (b2 if x['variant'] == 2 else b3)[k]
allids = {x['id'] for x in bank} | {x['id'] for x in v}
assert set(m) == allids, (allids - set(m), set(m) - allids)
json.dump(m, open(os.path.join(ROOT, 'content/topics.json'), 'w'), ensure_ascii=False, indent=0)
from collections import Counter; print(Counter(m.values()))
