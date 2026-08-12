from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output" / "pdf" / "nirnay-institute-design-guide.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
W, H = A4
NAVY, RED, PAPER, BLUE, YELLOW, INK, GREY = map(HexColor, ["#082b4c","#d8392f","#f5f1e8","#e5eef6","#f2bd3d","#171b1f","#5c6268"])

def wrap(text, font, size, width):
    words=text.split(); lines=[]; line=[]
    for word in words:
        trial=" ".join(line+[word])
        if stringWidth(trial,font,size)<=width: line.append(word)
        else:
            if line: lines.append(" ".join(line))
            line=[word]
    if line: lines.append(" ".join(line))
    return lines

def text(c, value, x, y, width, size=10, leading=15, font="Helvetica", color=INK):
    c.setFont(font,size); c.setFillColor(color)
    for line in wrap(value,font,size,width):
        c.drawString(x,y,line); y-=leading
    return y

def label(c,value,x,y,color=RED):
    c.setFillColor(color); c.setFont("Helvetica-Bold",7.5); c.drawString(x,y,value.upper())

def title(c,value,x,y,width,size=36,color=INK):
    c.setFillColor(color); c.setFont("Helvetica-Bold",size)
    for line in wrap(value,"Helvetica-Bold",size,width):
        c.drawString(x,y,line); y-=size*.92
    return y

def footer(c,n,dark=False):
    col=HexColor("#b9c7d2") if dark else GREY
    c.setStrokeColor(col); c.setLineWidth(.35); c.line(42,35,W-42,35)
    c.setFillColor(col); c.setFont("Helvetica",7); c.drawString(42,22,"NIRNAY INSTITUTE · UI/UX CONCEPT GUIDE")
    c.drawRightString(W-42,22,f"0{n}")

def image_cover(c,path,x,y,w,h):
    img=ImageReader(str(path)); iw,ih=img.getSize(); scale=max(w/iw,h/ih); dw,dh=iw*scale,ih*scale
    c.saveState(); p=c.beginPath(); p.rect(x,y,w,h); c.clipPath(p,stroke=0,fill=0); c.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh,mask='auto'); c.restoreState()

c=canvas.Canvas(str(OUT),pagesize=A4)
c.setTitle("NIRNAY Institute — Design Direction Guide")

# 1 Cover
c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0)
image_cover(c,ROOT/"assets"/"classroom-physics.png",W*.46,0,W*.54,H)
c.setFillColor(NAVY); c.rect(0,H-52,W*.46,52,fill=1,stroke=0)
c.setFillColor(RED); c.rect(40,H-110,44,44,fill=1,stroke=0); c.setFillColor(white); c.setFont("Helvetica-Bold",28); c.drawCentredString(62,H-99,"N")
label(c,"Independent education website direction",40,H-150)
y=title(c,"NIRNAY\nINSTITUTE",40,H-190,W*.38,47,NAVY)
c.setFillColor(RED); c.setFont("Times-Italic",29); c.drawString(40,y-8,"A clear next step.")
text(c,"A serious, student-first digital system for Classes 8–12, board preparation, JEE and NEET.",40,y-63,W*.34,12,18,"Helvetica",INK)
c.setFillColor(YELLOW); c.rect(40,75,175,54,fill=1,stroke=0); c.setFillColor(INK); c.setFont("Helvetica-Bold",10); c.drawString(53,106,"CLIENT DESIGN GUIDE"); c.setFont("Helvetica",8); c.drawString(53,89,"WHY · WHEN · HOW TO USE IT")
footer(c,1); c.showPage()

# 2 Why
c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0)
label(c,"01 · Why this direction",42,H-60)
y=title(c,"Coaching is operational. The website should show that.",42,H-96,W-84,36,NAVY)
text(c,"Parents and students are not only buying aspiration. They are comparing exam paths, teachers, class timings, fees, tests and whether the institute appears organised enough to guide an academic year.",42,y-18,W-84,11,17)
cards=[("CLARITY BEFORE CLAIMS","Dates, fees, batch size and teaching rhythm sit above generic promises."),("SERIOUS PRACTICE","Test and practice pages feel like actual academic tools, not decorative feature cards."),("LOCAL ACCOUNTABILITY","Faculty names, doubt-room timings and centre notices make the institution feel reachable."),("ONE CONNECTED SYSTEM","Marketing pages lead naturally into live classes, tests, practice and login.")]
y-=95
for i,(a,b) in enumerate(cards):
    col=i%2; row=i//2; x=42+col*258; yy=y-row*142
    c.setFillColor(BLUE if i!=1 else YELLOW); c.rect(x,yy-110,236,110,fill=1,stroke=0)
    c.setFillColor(RED); c.setFont("Helvetica-Bold",18); c.drawString(x+15,yy-25,f"0{i+1}")
    c.setFillColor(INK); c.setFont("Helvetica-Bold",10); c.drawString(x+52,yy-25,a)
    text(c,b,x+15,yy-50,205,9,14)
footer(c,2); c.showPage()

# 3 Visual system
c.setFillColor(white); c.rect(0,0,W,H,fill=1,stroke=0)
label(c,"02 · Visual system",42,H-60)
y=title(c,"Academic confidence without the template look.",42,H-96,W-84,36,NAVY)
text(c,"The system deliberately avoids purple gradients, glass panels and endless rounded cards. Information is organised through square borders, strong type contrast and repeatable bands.",42,y-18,W-84,11,17)
colors=[(NAVY,"ACADEMIC BLUE","Trust · navigation"),(RED,"EXAM RED","Action · urgency"),(PAPER,"PAPER WHITE","Warm reading base"),(YELLOW,"NOTICE YELLOW","Dates · live states")]
y-=90
for i,(col,name,use) in enumerate(colors):
    x=42+i*128; c.setFillColor(col); c.rect(x,y-68,112,68,fill=1,stroke=1)
    c.setFillColor(INK); c.setFont("Helvetica-Bold",7.5); c.drawString(x,y-84,name); c.setFont("Helvetica",7); c.drawString(x,y-96,use)
c.setFillColor(NAVY); c.rect(42,220,W-84,250,fill=1,stroke=0)
c.setFillColor(YELLOW); c.setFont("Helvetica-Bold",8); c.drawString(64,438,"TYPE + INFORMATION HIERARCHY")
c.setFillColor(white); c.setFont("Helvetica-Bold",34); c.drawString(64,382,"BATCH. SHEET. TEST.")
c.setFillColor(HexColor("#c9d7e2")); c.setFont("Helvetica",11); c.drawString(64,345,"Condensed headlines carry urgency without hype.")
c.setStrokeColor(HexColor("#567188")); c.line(64,314,W-64,314)
c.setFillColor(white); c.setFont("Helvetica-Bold",11); c.drawString(64,286,"JEE TWO-YEAR CLASSROOM")
c.setFont("Helvetica",9); c.drawString(64,263,"Tue–Sun · 7:00–10:00 AM     Starts 5 Sep 2026     ₹1,18,000")
c.setFillColor(RED); c.rect(W-165,253,101,36,fill=1,stroke=0); c.setFillColor(white); c.setFont("Helvetica-Bold",8); c.drawCentredString(W-114.5,267,"VIEW COURSE")
footer(c,3); c.showPage()

# 4 Pages
c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0)
label(c,"03 · Complete experience",42,H-60)
y=title(c,"Eleven connected pages, not one landing screen.",42,H-96,W-84,36,NAVY)
pages=[("HOME","Pathways, active batches, teaching cycle, timetable and notices."),("LIVE CLASSES","Class stage, chat, downloadable sheet actions and daily schedule."),("COURSES","Filterable catalogue with six realistic batch options."),("COURSE DETAILS","Reusable detail route with terms, weekly rhythm, faculty and fee panel."),("TEST SERIES","Search and exam filters with question, mark, timing and attempt metadata."),("TEST PAGE","Timer, answer palette, review state, navigation and calculated demo result."),("PRACTICE","Subject filters, answer checking, worked solutions and progress."),("LOGIN + SIGN UP","Validated demo forms with clear privacy caveats."),("ABOUT + BLOG","Faculty, teaching philosophy and practical student/parent notes.")]
y-=25
for i,(name,desc) in enumerate(pages):
    yy=y-i*61
    c.setStrokeColor(HexColor("#a7aaab")); c.line(42,yy-45,W-42,yy-45)
    c.setFillColor(RED); c.setFont("Helvetica-Bold",12); c.drawString(42,yy-22,f"{i+1:02}")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold",10); c.drawString(78,yy-22,name)
    text(c,desc,205,yy-20,W-247,8.5,12,"Helvetica",INK)
footer(c,4); c.showPage()

# 5 Fit
c.setFillColor(NAVY); c.rect(0,0,W,H,fill=1,stroke=0)
label(c,"04 · Choosing this design",42,H-60,YELLOW)
y=title(c,"When this direction is the right choice.",42,H-96,W-84,36,white)
c.setFillColor(BLUE); c.rect(42,390,245,285,fill=1,stroke=0)
c.setFillColor(YELLOW); c.rect(307,390,245,285,fill=1,stroke=0)
c.setFillColor(NAVY); c.setFont("Helvetica-Bold",12); c.drawString(61,640,"CHOOSE IT WHEN")
yes=["The institute serves several classes or exam paths.","Timetables, tests and faculty are meaningful purchase factors.","The client wants a credible regional identity, not a tech-startup aesthetic.","Online practice or live classes will grow into a real student product."]
yy=607
for item in yes: c.setFillColor(RED); c.circle(64,yy+3,3,fill=1,stroke=0); yy=text(c,item,76,yy,190,9,14)-17
c.setFillColor(INK); c.setFont("Helvetica-Bold",12); c.drawString(326,640,"RECONSIDER IT WHEN")
no=["There is only one tutor and one programme.","The audience is preschool, hobby learning or luxury private tuition.","The institute cannot maintain dates, notices and course data.","The brand needs a calm editorial or playful child-first tone."]
yy=607
for item in no: c.setFillColor(RED); c.circle(329,yy+3,3,fill=1,stroke=0); yy=text(c,item,341,yy,190,9,14)-17
text(c,"The best fit: a credible local institute becoming digitally complete.",42,325,W-84,22,25,"Times-Italic",white)
text(c,"The system has enough personality to be recognisable, but the hierarchy remains practical enough for admissions teams, teachers, parents and students to use every week.",42,265,W-84,11,18,"Helvetica",HexColor("#cad7e0"))
footer(c,5,True); c.showPage()

# 6 Launch
c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0)
label(c,"05 · From concept to production",42,H-60)
y=title(c,"What the client must provide before launch.",42,H-96,W-84,36,NAVY)
items=[("VERIFIED ACADEMIC DATA","Actual course names, fee policy, start dates, capacities, school-board coverage and scholarship rules."),("PEOPLE + PROOF","Approved faculty biographies, real results with consent, classroom photography releases and parent/student testimonials."),("PRODUCT CONNECTIONS","Secure authentication, student records, streaming, test APIs, payment gateway and admissions CRM."),("COMPLIANCE","Privacy policy, terms, refund rules, cookie decision, accessibility review and child-data safeguards."),("OPERATIONS OWNER","A named staff member responsible for notices, batch changes, live links and expired dates.")]
yy=y-22
for i,(a,b) in enumerate(items):
    c.setFillColor(RED if i%2==0 else NAVY); c.rect(42,yy-68,58,58,fill=1,stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold",18); c.drawCentredString(71,yy-46,f"0{i+1}")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold",10); c.drawString(120,yy-21,a)
    text(c,b,120,yy-39,W-162,8.7,13)
    yy-=90
c.setFillColor(YELLOW); c.rect(42,92,W-84,78,fill=1,stroke=0)
c.setFillColor(INK); c.setFont("Helvetica-Bold",12); c.drawString(59,139,"IMPORTANT DEMO NOTE")
text(c,"NIRNAY, all names, contacts, fees, dates, results, seat counts and testimonials are illustrative. Replace and verify every operational claim before public launch.",59,119,W-118,8.5,13)
footer(c,6); c.save()
print(OUT)
