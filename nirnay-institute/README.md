# NIRNAY Institute — Coaching Website Concept

NIRNAY is an independent, fictional UI/UX concept for an Indian coaching institute serving Classes 8–12, board examinations, JEE and NEET. It is intentionally more academic and operational than a typical startup landing page: sharp grids, timetable-led information, visible fees and dates, and functional study tools.

## Pages

- `index.html` — homepage with programmes, teaching cycle, schedule, notices and counselling CTA
- `live-classes.html` — live-class stage, schedule, sheet action and demo question chat
- `courses.html` — filterable programme catalogue
- `course-details.html` — query-driven detail page for all six programmes
- `about.html` — teaching philosophy, faculty and centre visit content
- `login.html` and `sign-up.html` — validated demo student/admissions forms
- `test-series.html` — searchable, filterable exam test catalogue
- `test.html` — functioning timed 10-question test with palette, review state and score
- `practice.html` — subject-filtered practice with answer checking and worked solutions
- `blog.html` — study notes and parent guidance

## Design direction

The structure studies three proven education patterns without copying identity or copyrighted content:

- the prominent academic pathways and counselling hierarchy common to large Indian coaching homepages;
- the metadata-rich test catalogue, question palette and performance workflow used by serious practice products;
- the familiar education-site sequence of programmes, faculty, notices, editorial content and admissions.

The visual system uses deep academic blue, examination red, warm paper white and a restrained yellow notice colour. Barlow Condensed carries high-information headings while DM Sans keeps schedules, questions and fees readable. Borders are square and deliberate; there is no glassmorphism, purple gradient or soft SaaS-card language.

## When a client should choose this direction

Choose it when the institute needs to sell both trust and academic organisation: multiple classes, different exam paths, fixed batch schedules, test series and an online student layer. It is especially suitable for a regional institute expanding beyond referrals while still wanting to feel teacher-led and locally accountable.

Do not choose it unchanged for a preschool, hobby course, luxury tutor or institution with only one simple programme. Those businesses need less information density and a different emotional tone.

## Content and launch notes

NIRNAY, its faculty names, address, phone number, dates, results, fees, seat counts and testimonials are illustrative. Before production launch, replace them with verified institute information, connect authentication and admissions to a secure backend, add payment/privacy/terms flows, review accessibility with real content and obtain releases for any people shown in final photography.

## Local use

Open `index.html` directly or serve the repository root:

```bash
python3 -m http.server 4174
```

Then visit `http://127.0.0.1:4174/nirnay-institute/`.

## Asset mix

The homepage, live-class and practice photographs are original generated visuals created specifically for this concept. Two supporting editorial photographs come from Pexels. Full attribution and prompts are in [SOURCES.md](SOURCES.md).
