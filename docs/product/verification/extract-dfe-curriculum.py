"""Extracts the statutory maths programme of study (Years 2 to 6) from the official DfE page into JSON.

Usage: python3 -I docs/product/verification/extract-dfe-curriculum.py <saved-page.html> <out.json> <retrieved YYYY-MM-DD>
Save the page first:
  curl -sS -L -o pos.html "https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study"

Each statutory statement is a top-level list item under a section heading, kept verbatim (nested sub-points are joined
after a colon, separated by semicolons). Non-statutory notes and guidance are kept separately. A statement's id is
<year>.<section code>.<position in the section>, e.g. Y3.NPV.2.
Source licence: Open Government Licence v3.0 (the page states it). Nothing is paraphrased. The only transformations: the page's "[Fraction:a/b]" markers become a/b, HTML entities are decoded and spaces are collapsed.
"""
import json, re, sys
from html.parser import HTMLParser

CODES = {"Number - number and place value": "NPV", "Number - addition and subtraction": "AS", "Number - multiplication and division": "MD",
         "Number - fractions": "FRAC", "Number - fractions (including decimals)": "FRAC", "Number - fractions (including decimals and percentages)": "FRAC", "Number - Fractions (including decimals and percentages)": "FRAC",
         "Number - addition, subtraction, multiplication and division": "ASMD", "Measurement": "MEAS", "Geometry - properties of shapes": "GPS",
         "Geometry - position and direction": "GPD", "Statistics": "STAT", "Ratio and proportion": "RP", "Algebra": "ALG"}

class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.year=None; self.sec=None; self.out=[]; self.stack=[]; self.buf=None; self.mode=None; self.in_note=False; self.depth=0
        self.item_stack=[]; self.cur_h=None
    def handle_starttag(self,t,a):
        a=dict(a)
        if t in("h2","h3","h4"): self.buf=[]; self.cur_h=(t,a.get("id"))
        if t=="ul": self.depth+=1; self.item_stack.append([])
        if t=="li": self.buf_li=[]; self.stack.append("li"); self.li_text=[]
        if t=="p" and not self.stack: self.pbuf=[]
        if self.stack and t=="li": pass
    def handle_endtag(self,t):
        if t in("h2","h3","h4") and self.buf is not None:
            text=re.sub(r"\s+"," ","".join(self.buf)).strip(); h,anchor=self.cur_h; self.buf=None
            if h=="h2":
                m=re.match(r"Year (\d) programme of study",text); self.year=int(m.group(1)) if m else None; self.sec=None; self.in_note=False
            elif h=="h3" and self.year:
                self.sec={"year":self.year,"heading":text,"anchor":anchor,"code":CODES.get(text,"?"),"statements":[],"notes":[]}; self.out.append(self.sec); self.in_note=False
            elif h=="h4" and self.sec is not None: self.in_note=text.lower().startswith("notes and guidance")
        if t=="ul": self.depth-=1; self.item_stack.pop()
    def handle_data(self,d):
        if self.buf is not None: self.buf.append(d)

# Simpler, robust approach: regex over the section HTML.
def clean(x): return re.sub(r"\s+"," ",re.sub(r"\[Fraction:(\d+)/(\d+)\]",r"\1/\2",re.sub(r"<[^>]+>","",x))).replace("&nbsp;"," ").replace("&amp;","&").replace("&gt;",">").replace("&lt;","<").replace("&rsquo;","’").replace("&lsquo;","‘").replace("&ldquo;","“").replace("&rdquo;","”").replace("&#39;","'").strip()
def top_items(ul):
    items=[];i=0;depth=0;start=None
    for m in re.finditer(r"<(/?)(ul|li)\b[^>]*>",ul):
        close,tag=m.group(1)=="/",m.group(2)
        if tag=="ul": depth+= -1 if close else 1
        elif tag=="li" and not close and depth==1: start=m.end()
        elif tag=="li" and close and depth==1: items.append(ul[start:m.start()])
    return items
def statement(li):
    sub=re.search(r"<ul",li)
    if not sub: return clean(li)
    head=clean(li[:sub.start()]); subs=[clean(x) for x in top_items(li[sub.start():])]
    return head+" "+"; ".join(subs)

html=open(sys.argv[1],encoding="utf-8").read()
date=re.search(r'"dateModified":\s*"([^"]+)"',html).group(1)
sc=re.search(r'<h[23] id="school-curriculum">.*?(?=<h[23] id="attainment-targets">)',html,re.S)
parts=re.split(r'(?=<h2 id=")',html)
res={"source":{"title":"National curriculum in England: mathematics programmes of study","publisher":"Department for Education","url":"https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study","page_last_modified":date,"retrieved":sys.argv[3],"licence":"Open Government Licence v3.0"},"sections":[],"school_curriculum":[]}
for part in parts:
    h2=re.match(r'<h2 id="([^"]+)">(.*?)</h2>',part,re.S)
    if not h2: continue
    m=re.match(r"Year (\d) programme of study",clean(h2.group(2)))
    if not m or int(m.group(1))<2: continue
    year=int(m.group(1))
    for sec in re.split(r'(?=<h3 id=")',part)[1:]:
        h3=re.match(r'<h3 id="([^"]+)">(.*?)</h3>',sec,re.S); heading=clean(h3.group(2)); code=CODES.get(heading,"?")
        body=sec[h3.end():]; stat,notes=body,""
        n=re.search(r'<div class="call-to-action">',body)
        if n: stat,notes=body[:n.start()],body[n.start():]
        intro=clean(re.search(r"<p>(.*?)</p>",stat,re.S).group(1)) if re.search(r"<p>",stat) else ""
        uls=re.findall(r"<ul>.*?</ul>\s*(?=<(?:p|h[234]|div)|$)",stat,re.S)
        ul=stat[stat.index("<ul"):] if "<ul" in stat else ""
        items=top_items(ul) if ul else []
        res["sections"].append({"year":year,"heading":heading,"anchor":h3.group(1),"code":code,"intro":intro,
            "statements":[{"id":f"Y{year}.{code}.{i+1}","text":statement(li)} for i,li in enumerate(items)],
            "notes_non_statutory":[clean(p) for p in re.findall(r"<p>(.*?)</p>",notes,re.S)]})
        if "?" == code: print("UNKNOWN CODE",heading,file=sys.stderr)
res["school_curriculum"]=[clean(p) for p in re.findall(r"<p>(.*?)</p>",sc.group(0),re.S)] if sc else []
json.dump(res,open(sys.argv[2],"w",encoding="utf-8"),indent=1,ensure_ascii=False)
print(len(res["sections"]),"sections;",sum(len(s["statements"]) for s in res["sections"]),"statements; page modified",date)
