from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'output'/'pdf'/'wealth-nexus-community-design-guide.pdf'; OUT.parent.mkdir(parents=True,exist_ok=True)
W,H=A4
FOREST,FOREST2,SAND,PAPER,INK,BRASS,RED,MUTED=map(HexColor,['#143c32','#0c2d26','#eee5d4','#f8f3e9','#17201d','#b58a3a','#8d2d2c','#68675f'])

def wrap(s,font,size,width):
    lines=[]; row=[]
    for word in s.split():
        if stringWidth(' '.join(row+[word]),font,size)<=width: row.append(word)
        else:
            if row: lines.append(' '.join(row))
            row=[word]
    if row: lines.append(' '.join(row))
    return lines
def txt(c,s,x,y,w,size=10,leading=15,font='Helvetica',color=INK):
    c.setFillColor(color); c.setFont(font,size)
    for line in wrap(s,font,size,w): c.drawString(x,y,line); y-=leading
    return y
def title(c,s,x,y,w,size=38,color=INK):
    return txt(c,s,x,y,w,size,size*.95,'Times-Bold',color)
def label(c,s,x,y,color=RED):
    c.setFillColor(color); c.setFont('Helvetica-Bold',7.5); c.drawString(x,y,s.upper())
def footer(c,n,dark=False):
    col=HexColor('#9caaa4') if dark else MUTED;c.setStrokeColor(col);c.setLineWidth(.35);c.line(42,35,W-42,35);c.setFillColor(col);c.setFont('Helvetica',7);c.drawString(42,22,'WEALTH NEXUS · COMMUNITY REDESIGN CONCEPT');c.drawRightString(W-42,22,f'0{n}')
def cover_img(c,path,x,y,w,h):
    img=ImageReader(str(path));iw,ih=img.getSize();scale=max(w/iw,h/ih);dw,dh=iw*scale,ih*scale;c.saveState();p=c.beginPath();p.rect(x,y,w,h);c.clipPath(p,stroke=0,fill=0);c.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh,mask='auto');c.restoreState()

c=canvas.Canvas(str(OUT),pagesize=A4);c.setTitle('Wealth Nexus — Community Redesign Guide')
# Cover
c.setFillColor(PAPER);c.rect(0,0,W,H,fill=1,stroke=0);cover_img(c,ROOT/'assets'/'brothers-business.jpg',W*.48,0,W*.52,H);c.setFillColor(FOREST);c.rect(0,H-56,W*.48,56,fill=1,stroke=0)
c.setFillColor(INK);c.setFont('Times-Bold',20);c.drawString(42,H-104,'WEALTH');c.setFillColor(RED);c.drawString(125,H-104,'NEXUS');label(c,'Faith-led community redesign',42,H-143)
y=title(c,'Build with brothers. Keep your deen close.',42,H-185,W*.37,38,FOREST)
txt(c,'A radical six-page digital majlis where Muslim brotherhood becomes the interface, not a decorative theme.',42,y-22,W*.35,11,17,'Helvetica',INK)
c.setFillColor(BRASS);c.rect(42,78,176,55,fill=1,stroke=0);c.setFillColor(INK);c.setFont('Helvetica-Bold',9);c.drawString(55,111,'CLIENT DESIGN GUIDE');c.setFont('Helvetica',7.5);c.drawString(55,94,'WHY · WHEN · RETENTION · TRUST');footer(c,1);c.showPage()
# Problem and strategy
c.setFillColor(PAPER);c.rect(0,0,W,H,fill=1,stroke=0);label(c,'01 · The redesign decision',42,H-60);y=title(c,'The offer is strong. The first visit asks too much.',42,H-98,W-84,37,FOREST)
txt(c,'The existing page explains the brotherhood, ten systems, shared AI, mechanism, members, proof, referrals, qualification, offer stack and FAQ in one continuous sales journey. The result is comprehensive, but the emotional promise competes with the amount of reading.',42,y-18,W-84,10.5,16)
y-=105
items=[('THE MAJLIS','Prayer-led work rhythm, Exchange Board and Amanah Code.'),('THE CIRCLE','Orbiting member map, stamped passports and inspectable proof.'),('THE TREASURY','Ten business systems become an interactive library.'),('THE DOOR','Application becomes a deliberate knock, never a checkout.'),('THE TERMS','Ten membership clauses in a readable editorial structure.'),('PRIVACY','Eight public privacy sections with a clear data trail.')]
for i,(a,b) in enumerate(items):
    yy=y-i*78;c.setFillColor(FOREST if i%2==0 else SAND);c.rect(42,yy-61,W-84,61,fill=1,stroke=0);c.setFillColor(BRASS if i%2==0 else RED);c.setFont('Times-Bold',16);c.drawString(58,yy-23,f'0{i+1}');c.setFillColor(white if i%2==0 else FOREST);c.setFont('Helvetica-Bold',9);c.drawString(105,yy-22,a);txt(c,b,105,yy-39,W-175,8.5,11,'Helvetica',white if i%2==0 else INK)
footer(c,2);c.showPage()
# Visual
c.setFillColor(FOREST);c.rect(0,0,W,H,fill=1,stroke=0);label(c,'02 · Visual language',42,H-60,BRASS);y=title(c,'Islamic belonging without decorative cliché.',42,H-98,W-84,37,white)
txt(c,'The design uses the visual memory of home, masjid and majlis: opening doors, a vertical corridor, prayer-led time, stamped passports, warm limestone, deep green, brass line work and documentary photography.',42,y-20,W-84,10.5,17,'Helvetica',HexColor('#d5d6cf'))
cols=[(FOREST,'MASJID GREEN','Trust + home'),(SAND,'WARM LIMESTONE','Hospitality'),(BRASS,'MUTED BRASS','Craft + dignity'),(RED,'BURGUNDY','Action + conviction')];yy=y-95
for i,(col,name,use) in enumerate(cols):
    x=42+i*128;c.setFillColor(col);c.rect(x,yy-64,112,64,fill=1,stroke=1);c.setFillColor(white);c.setFont('Helvetica-Bold',7.5);c.drawString(x,yy-80,name);c.setFillColor(HexColor('#bfc7c3'));c.setFont('Helvetica',7);c.drawString(x,yy-92,use)
cover_img(c,ROOT/'assets'/'brothers-prayer.jpg',42,88,W-84,355);c.setFillColor(FOREST2);c.rect(42,88,220,355,fill=1,stroke=0);label(c,'Faith is structural',62,405,BRASS);title(c,'A place where deen needs no explanation.',62,370,170,27,white);txt(c,'Prayer imagery is used as a sign of shared rhythm and belonging—not as a conversion device or a generic luxury motif.',62,244,170,9,14,'Helvetica',HexColor('#d3d7d2'));footer(c,3,True);c.showPage()
# Retention
c.setFillColor(PAPER);c.rect(0,0,W,H,fill=1,stroke=0);label(c,'03 · Retention strategy',42,H-60);y=title(c,'A visitor can understand it before deciding to study it.',42,H-98,W-84,37,FOREST)
steps=[('00–03 SEC','The doors open','The visitor enters a place, not a landing page.'),('03–10 SEC','The declaration','Come as a builder. Leave with brothers.'),('10–25 SEC','The rhythm','Fajr to Isha makes faith part of the operating day.'),('NEXT CLICK','Choose a room','Enter the Circle, Treasury or Door.')]
yy=y-28
for i,(t,a,b) in enumerate(steps):
    c.setStrokeColor(BRASS);c.line(70,yy-9,70,yy-107 if i<3 else yy-68);c.setFillColor(RED);c.circle(70,yy-6,5,fill=1,stroke=0);label(c,t,93,yy);c.setFillColor(FOREST);c.setFont('Times-Bold',20);c.drawString(93,yy-28,a);txt(c,b,93,yy-48,W-145,9.5,14);yy-=122
c.setFillColor(SAND);c.rect(42,92,W-84,82,fill=1,stroke=0);c.setFillColor(FOREST);c.setFont('Times-Italic',17);txt(c,'The homepage no longer tries to close every objection. It earns the next click by making the right man feel recognised.',58,140,W-116,17,21,'Times-Italic',FOREST);footer(c,4);c.showPage()
# Fit/launch
c.setFillColor(PAPER);c.rect(0,0,W,H,fill=1,stroke=0);label(c,'04 · When to choose it',42,H-60);y=title(c,'Best for a brotherhood becoming a trusted institution.',42,H-98,W-84,37,FOREST)
c.setFillColor(SAND);c.rect(42,410,245,260,fill=1,stroke=0);c.setFillColor(FOREST);c.rect(307,410,245,260,fill=1,stroke=0);c.setFillColor(FOREST);c.setFont('Helvetica-Bold',11);c.drawString(60,640,'CHOOSE THIS DIRECTION');c.setFillColor(BRASS);c.drawString(325,640,'RECONSIDER IT WHEN')
yes=['Belonging should lead the brand.','Trust matters more than hype.','Visitors need separate evaluation paths.','Faith and enterprise must feel naturally linked.'];no=['The business requires one long VSL page.','Every objection must appear before click.','The team cannot maintain multiple pages.','The positioning shifts beyond Muslim men.']
yy=607
for s in yes: c.setFillColor(RED);c.circle(63,yy+3,3,fill=1,stroke=0);yy=txt(c,s,76,yy,190,9,14)-17
yy=607
for s in no: c.setFillColor(BRASS);c.circle(328,yy+3,3,fill=1,stroke=0);yy=txt(c,s,341,yy,190,9,14,'Helvetica',white)-17
label(c,'Before production launch',42,358);req=['Confirm every public member description and proof asset.','Keep official membership price and terms inside the application flow.','Have a qualified scholar review any future religious teaching or quoted scripture.','Connect the fit-check only if Wealth Nexus explicitly wants to collect that data.','Obtain or confirm model/property releases for final commercial photography.']
yy=326
for i,s in enumerate(req): c.setFillColor(FOREST);c.setFont('Times-Bold',15);c.drawString(42,yy,f'0{i+1}');yy=txt(c,s,82,yy,W-124,9.5,14)-24
c.setFillColor(BRASS);c.rect(42,78,W-84,58,fill=1,stroke=0);txt(c,'This concept preserves the official application as the only real submission point. The demo stores and transmits nothing.',57,111,W-114,9,14,'Helvetica',INK);footer(c,5);c.save();print(OUT)
