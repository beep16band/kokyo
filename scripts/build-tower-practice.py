"""Rebuild only the practice block and reviewed usage choices in the published HTML.
Original question records, assets, save format, and other script blocks stay intact.
"""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
html_path=ROOT/'kotoba-tower.html'
s=html_path.read_text()
match=re.search(r'<script>globalThis.KotobaData=(.*?);</script>',s,re.S)
if not match:raise ValueError('KotobaData block missing')
data=json.loads(match[1])
updates=json.loads((ROOT/'assets/kotoba-tower/practice/idiom-usage.json').read_text())
questions={q['id']:q for q in data['questions']}
for qid,record in updates.items():
 q=questions[qid]
 if q['category']!='慣用句' or '使い方' not in q['prompt']:raise ValueError(qid)
 choices=record['distractors'].copy();choices.insert(q['answer'],q['choices'][q['answer']])
 if len(choices)!=4 or len(set(choices))!=4:raise ValueError(qid)
 # Use the existing review mechanism so battles and practice share the same content.
 data['questionReview']['overrides'].setdefault(qid,{}).update(choices=choices,explanation=q['explanation']+' 誤答は、同じ慣用句を別の意味や場面で使っています。'+record['contrast'])
s=s[:match.start(1)]+json.dumps(data,ensure_ascii=False)+s[match.end(1):]
pattern=r'<script>/\* Independent practice and teacher-assisted recovery; original bank is read-only\. \*/.*?</script>'
source=(ROOT/'assets/kotoba-tower/practice/student-tools.js').read_text()
s,n=re.subn(pattern,lambda m:'<script>'+source.replace('</script','<\\/script')+'</script>',s,flags=re.S)
if n!=1:raise ValueError('Practice script block missing or duplicated')
css='''/* PRACTICE_REVIEW_STYLE_BEGIN */
#studentContent>label{display:block;margin:12px 0;line-height:1.6}
#studentContent select,#studentContent input{max-width:100%;font:inherit}
.practice-item{border-top:1px solid #8399a9;padding:14px 0;overflow-wrap:anywhere}
.practice-item h4{font-size:18px;line-height:1.6;margin:4px 0 10px}
.practice-item li{line-height:1.7;margin:8px 0}
.practice-item summary{cursor:pointer;padding:10px 0;color:#f4d88f}
.practice-item details p{white-space:pre-line}
.practice-pagination{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
/* PRACTICE_REVIEW_STYLE_END */'''
if '/* PRACTICE_REVIEW_STYLE_BEGIN */' in s:
 s=re.sub(r'/\* PRACTICE_REVIEW_STYLE_BEGIN \*/.*?/\* PRACTICE_REVIEW_STYLE_END \*/',lambda m:css,s,flags=re.S)
else:s=s.replace('</style>','\n'+css+'\n</style>',1)
html_path.write_text(s)
print('Updated practice UI and',len(updates),'idiom usage questions')
