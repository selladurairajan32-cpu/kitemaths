# 11+ formats: what official pages say (read 10 Nov 2026)

**Decision:** D-037 asked for research into every UK 11+ format, using official public sources only.

**Method:**
- Each page was read on 10 Nov 2026 with an automated page fetch. The quotes below are the sentences that fetch
  returned as verbatim.
- Anything a page didn't state is recorded as **not stated**. It is never filled in from tutoring or publisher
  websites, which often disagree with each other.
- Pages that couldn't be reached are listed as such.

## ISEB Common Pre-Tests (independent schools)

| Fact | What the official page says | Source |
|---|---|---|
| Format | "The Pre-Tests are multiple choice, online tests." "They are adaptive, which means that the test algorithm will choose the most suitable questions for each pupil" | [ISEB: What are the ISEB Pre-Tests](https://iseb.co.uk/families-hub/pre-tests-admissions-toolkit/preparing-for-the-pre-tests/what-are-the-iseb-common-pre-tests-11-and-how-do-they-work) |
| Subjects | "through four tests: English, mathematics, verbal reasoning (VR) and non-verbal reasoning (NVR)." | same |
| Maths time | "Mathematics: 40 minutes" | same |
| Maths content | Questions assess maths "from the National Curriculum Programme of Study up until the end of Year 5" | [ISEB Pre-Tests test framework](https://www.iseb.co.uk/assessments/common-pre-tests/cpt-for-schools/iseb-pre-tests-test-framework/) |
| Number of questions | "pupils may be presented with a differing number of questions" (adaptive) | same |
| Calculators | Not stated | — |

## GL Assessment (used by many grammar schools and consortia)

| Fact | What the official page says | Source |
|---|---|---|
| Format | "We recommend children familiarise themselves with the multiple-choice layout of the test" | [GL Assessment: free familiarisation materials](https://11plus.gl-assessment.co.uk/free-materials/) |
| Timing and length | "The exact timings for, and number of questions in, your local 11+ test may differ" | same |
| Subjects | Practice papers are offered "in four specific areas: verbal reasoning, non-verbal reasoning, English and maths". This describes practice papers; which subjects a local test uses is set locally. | same |
| Calculators | Not stated | — |

GL tests are run for local areas and schools, so a profile for a particular school needs that school's or
consortium's own page (EXAM-002 AC2). The GL profile records only what GL says about all its tests.

## CSSE (Consortium of Selective Schools in Essex)

| Fact | What the official page says | Source |
|---|---|---|
| Subjects | "The candidates sit two tests. One in English and one in Mathematics." | [CSSE](https://www.csse.org.uk/) |
| Maths time | "The Mathematics paper will last sixty minutes." | same |
| Question format | Not stated on the home page. Tutoring sites disagree on this, so it stays unknown. | — |
| Calculators | Not stated | — |

## SEAG (Schools' Entrance Assessment Group, Northern Ireland)

| Fact | What the official page says | Source |
|---|---|---|
| Papers | "The SEAG Entrance Assessment consists of two Papers: Paper 1 and Paper 2." "Both Papers have an identical format and are set at the same level of difficulty." | [SEAG assessment guide](https://www.seagni.co.uk/guidance/assessment-guide) |
| Subjects | "English (or Gaeilge) and Mathematics." | same |
| Length | Main Test "60 Minutes"; the Practice Test is "Not Timed" | same |
| Questions | Main Test: 28 English (or Gaeilge) questions and 28 Maths questions. Practice Test: 5 of each. | same |
| Maths time | Not stated separately: the 60 minutes cover both subjects. | — |
| Question format, answer options, calculators | Not stated on this page. A prep site says "5 possible answers", but that is not an official source, so it isn't used. | — |

The SEAG domains `seag.org.uk` and `www.seag.org.uk` couldn't be resolved from this environment.
`www.seagni.co.uk` could, and was used.

## CEM and AQE

- **CEM:** cem.org/admissions redirects to Cambridge University Press & Assessment (`cambridge.org/insight/admissions`),
  which returned HTTP 403 to the fetch. No official statement could be read.
  - Secondary sources (tutoring sites) say CEM stopped setting grammar-school 11+ tests around 2022–2023 and that
    former CEM areas now use GL or local papers. They disagree on the year.
  - So **no CEM profile is made.** "CEM-style" questions are not claimed anywhere in the app.
- **AQE (Northern Ireland):** a news report says SEAG's test replaced the AQE and PPTC tests. No official AQE page was
  read, so **no AQE profile is made.**

## What the app does with this

`src/engine/examProfile.ts` now has four verified profiles: ISEB, GL Assessment (general), CSSE and SEAG.
- Each verified fact carries its URL, its publisher, the date it was read and its quote.
- Every fact not stated stays `unknown`.
- A practice mock built from a profile uses a verified maths time where there is one (ISEB 40 minutes, CSSE 60
  minutes).
- Otherwise the mock uses the child's choice, and it says which applies.
- The 5-option answer-sheet mode is a practice option. It is **not** claimed for any profile, because no official
  page read here states the number of options.
