window.NIRNAY_DATA = {
  courses: [
    {id:'foundation-10', badge:'CLASS 10 · CBSE / GSEB', title:'Board + Foundation 2026', desc:'Daily Maths and Science teaching with weekly board-pattern writing practice.', schedule:'Mon, Wed, Fri · 4:30–6:30 PM', starts:'2 Sep 2026', fee:'₹22,500', term:'Full academic term', seats:14, tone:'blue'},
    {id:'jee-2028', badge:'CLASS 11 · JEE MAIN + ADVANCED', title:'JEE Two-Year Classroom', desc:'A measured two-year programme with concept classes, sheets, doubt desks and fortnightly tests.', schedule:'Tue–Sun · 7:00–10:00 AM', starts:'5 Sep 2026', fee:'₹1,18,000', term:'2 years · instalments available', seats:11, tone:'red'},
    {id:'neet-2028', badge:'CLASS 11 · NEET UG', title:'NEET Two-Year Classroom', desc:'NCERT-led Biology, Physics and Chemistry with diagrams, recall drills and test review.', schedule:'Tue–Sun · 7:15–10:15 AM', starts:'5 Sep 2026', fee:'₹1,12,000', term:'2 years · instalments available', seats:9, tone:'yellow'},
    {id:'boards-12', badge:'CLASS 12 · PCM / PCB', title:'Board Exam Intensive', desc:'Chapter completion, derivations, numericals and answer-writing checks before pre-boards.', schedule:'Mon–Sat · 5:00–7:30 PM', starts:'14 Sep 2026', fee:'₹34,800', term:'6 months', seats:18, tone:'ink'},
    {id:'foundation-8-9', badge:'CLASSES 8 & 9', title:'Maths + Science Foundation', desc:'Strong school fundamentals, mental maths and practical science without early exam pressure.', schedule:'Tue, Thu, Sat · 4:30–6:00 PM', starts:'8 Sep 2026', fee:'₹18,900', term:'Full academic term', seats:20, tone:'blue'},
    {id:'jee-repeaters', badge:'CLASS 12 PASSED · JEE', title:'JEE Repeater Batch', desc:'Fast-paced revision, mixed problem sets and daily supervised practice for repeat aspirants.', schedule:'Mon–Sat · 8:00 AM–1:00 PM', starts:'1 Oct 2026', fee:'₹82,000', term:'8 months', seats:16, tone:'red'}
  ],
  faculty: [
    {name:'Arvind Rao', subject:'Physics', detail:'M.Sc. Physics · 14 years in classrooms', initials:'AR', quote:'A derivation should feel inevitable, not memorised.'},
    {name:'Meera Kulkarni', subject:'Chemistry', detail:'M.Sc. Chemistry · Organic & Inorganic', initials:'MK', quote:'We revise NCERT lines before adding shortcuts.'},
    {name:'Nitin Shah', subject:'Mathematics', detail:'M.Sc. Mathematics · JEE problem solving', initials:'NS', quote:'First write the known information. Speed follows clarity.'},
    {name:'Dr Kavita Menon', subject:'Biology', detail:'Ph.D. Life Sciences · NEET Biology', initials:'KM', quote:'Diagrams and recall cycles do more than rereading.'}
  ],
  tests: [
    {id:'jee-main-01', exam:'JEE', title:'JEE Main Part Test 01', scope:'Units & Dimensions, Vectors, Mole Concept, Quadratic Equations', questions:75, marks:300, minutes:180, date:'23 Aug · 9:00 AM', free:true, attempted:'1,284'},
    {id:'neet-ncert-bio', exam:'NEET', title:'NCERT Biology Drill 06', scope:'Cell: The Unit of Life + Biomolecules', questions:45, marks:180, minutes:50, date:'Available now', free:true, attempted:'2,106'},
    {id:'boards-maths', exam:'Boards', title:'Class 10 Maths Chapter Test', scope:'Triangles + Coordinate Geometry', questions:30, marks:40, minutes:75, date:'Available now', free:false, attempted:'842'},
    {id:'jee-advanced', exam:'JEE', title:'JEE Advanced Pattern Set 03', scope:'Mechanics + Algebra mixed application', questions:36, marks:120, minutes:120, date:'30 Aug · 2:00 PM', free:false, attempted:'629'},
    {id:'neet-full', exam:'NEET', title:'NEET Full Syllabus Mock 02', scope:'Class 11 and 12 full syllabus', questions:180, marks:720, minutes:200, date:'6 Sep · 10:00 AM', free:false, attempted:'1,537'}
  ],
  questions: [
    {subject:'Physics', chapter:'Units & Measurements', q:'The dimensional formula of impulse is the same as that of:', options:['Force','Momentum','Pressure','Energy'], answer:1, solution:'Impulse = force × time = change in momentum. Both therefore have dimensions [M L T⁻¹].'},
    {subject:'Physics', chapter:'Kinematics', q:'A body starts from rest with constant acceleration 2 m/s². Its displacement in 5 seconds is:', options:['10 m','20 m','25 m','50 m'], answer:2, solution:'Using s = ut + ½at², s = 0 + ½ × 2 × 25 = 25 m.'},
    {subject:'Chemistry', chapter:'Mole Concept', q:'The number of moles present in 18 g of water is:', options:['0.5 mol','1 mol','2 mol','18 mol'], answer:1, solution:'Molar mass of H₂O is 18 g mol⁻¹, so 18 g contains 1 mole.'},
    {subject:'Mathematics', chapter:'Quadratic Equations', q:'If the roots of x² − 5x + 6 = 0 are α and β, then αβ equals:', options:['−6','−5','5','6'], answer:3, solution:'For ax² + bx + c = 0, product of roots is c/a. Here it is 6/1 = 6.'},
    {subject:'Biology', chapter:'Cell', q:'Which organelle is chiefly responsible for ATP production in a eukaryotic cell?', options:['Golgi apparatus','Mitochondrion','Lysosome','Ribosome'], answer:1, solution:'Oxidative phosphorylation occurs on the inner mitochondrial membrane, producing most cellular ATP.'},
    {subject:'Mathematics', chapter:'Triangles', q:'If two similar triangles have corresponding sides in the ratio 3:5, the ratio of their areas is:', options:['3:5','6:10','9:25','27:125'], answer:2, solution:'Areas of similar triangles are proportional to the squares of corresponding sides: 3²:5² = 9:25.'},
    {subject:'Chemistry', chapter:'Atomic Structure', q:'The maximum number of electrons in the n = 3 shell is:', options:['8','10','18','32'], answer:2, solution:'Maximum shell capacity is 2n². For n = 3, 2 × 3² = 18.'},
    {subject:'Biology', chapter:'Biomolecules', q:'The monomer unit of proteins is:', options:['Fatty acid','Nucleotide','Monosaccharide','Amino acid'], answer:3, solution:'Proteins are polymers formed by amino acids joined through peptide bonds.'},
    {subject:'Physics', chapter:'Work & Energy', q:'The kinetic energy of a 2 kg body moving at 3 m/s is:', options:['3 J','6 J','9 J','18 J'], answer:2, solution:'K = ½mv² = ½ × 2 × 3² = 9 J.'},
    {subject:'Mathematics', chapter:'Coordinate Geometry', q:'The distance between (0,0) and (3,4) is:', options:['4','5','6','7'], answer:1, solution:'Distance = √[(3−0)² + (4−0)²] = √25 = 5.'}
  ],
  blogs: [
    {tag:'Study method', date:'10 Aug 2026', time:'6 min read', title:'What to do in the 20 minutes after a mock test', excerpt:'Do not rush to the score screen. Mark guessed answers, classify errors and write the next revision task first.'},
    {tag:'For parents', date:'4 Aug 2026', time:'5 min read', title:'A practical way to discuss test marks at home', excerpt:'Begin with attendance and attempts, then ask what changed between the last two papers. One score rarely tells the whole story.'},
    {tag:'Class 10', date:'29 Jul 2026', time:'7 min read', title:'How we check a three-mark Science answer', excerpt:'Keywords matter, but sequence, labelled diagrams and a final statement are what turn knowledge into board marks.'},
    {tag:'JEE', date:'20 Jul 2026', time:'8 min read', title:'When a hard problem deserves another ten minutes', excerpt:'A teacher’s checklist for deciding whether to persist, change representation or leave the question for review.'},
    {tag:'NEET', date:'14 Jul 2026', time:'6 min read', title:'A weekly NCERT Biology revision cycle', excerpt:'One chapter, three passes: diagrams, exceptions and recall. Here is the exact Sunday routine used in our batches.'},
    {tag:'Institute note', date:'1 Jul 2026', time:'4 min read', title:'Why our doubt room stays open after the last class', excerpt:'Some questions arrive only after the busier lesson is over. The 30-minute quiet window gives them a place.'}
  ]
};
