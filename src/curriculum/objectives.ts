// Generated from docs/product/curriculum/curriculum-map.csv by src/curriculum/map.test.ts. Do not edit by hand:
// edit the CSV, then run `UPDATE_DOCS=1 npx vitest run src/curriculum/map.test.ts`.
// Not independently reviewed (CUR-004): shown to grown-ups with that caveat.

export interface CurriculumObjective {
  id: string;
  /** null for an 11+ extension candidate, which belongs to no school year. */
  year: number | null;
  strand: string;
  /** "statutory" (DfE programme of study) or "11+-extension-candidate" (not statutory). */
  status: string;
  outcome: string;
  skills: string[];
}

export const OBJECTIVES: CurriculumObjective[] = [
  {
    "id": "Y3.NPV.1",
    "year": 3,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Counts on and back in 4s, 8s, 50s and 100s from 0, and finds 10 or 100 more or less than any number.",
    "skills": [
      "place-value.more-less",
      "times-tables.three-four-eight"
    ]
  },
  {
    "id": "Y3.NPV.2",
    "year": 3,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Says the value of each digit in a 3-digit number.",
    "skills": [
      "place-value.digit-value",
      "place-value.partition"
    ]
  },
  {
    "id": "Y3.NPV.3",
    "year": 3,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Compares and orders numbers up to 1,000.",
    "skills": [
      "place-value.compare-order"
    ]
  },
  {
    "id": "Y3.NPV.4",
    "year": 3,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Identifies, represents and estimates numbers using different representations.",
    "skills": [
      "place-value.digit-value",
      "place-value.partition"
    ]
  },
  {
    "id": "Y3.NPV.5",
    "year": 3,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Reads and writes numbers up to 1,000 in numerals and words.",
    "skills": [
      "place-value.read-write"
    ]
  },
  {
    "id": "Y3.NPV.6",
    "year": 3,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Solves number and practical problems using place value up to 1,000.",
    "skills": [
      "place-value.more-less"
    ]
  },
  {
    "id": "Y3.AS.1",
    "year": 3,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Adds and subtracts mentally: a 3-digit number and 1s, 10s or 100s.",
    "skills": [
      "add-subtract.mental",
      "place-value.more-less"
    ]
  },
  {
    "id": "Y3.AS.2",
    "year": 3,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Adds and subtracts numbers up to 3 digits using columns.",
    "skills": [
      "add-subtract.column-add",
      "add-subtract.column-sub"
    ]
  },
  {
    "id": "Y3.AS.3",
    "year": 3,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Estimates an answer and uses the inverse operation to check it.",
    "skills": [
      "rounding.estimate",
      "add-subtract.inverse"
    ]
  },
  {
    "id": "Y3.AS.4",
    "year": 3,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Solves problems, including missing-number problems, with addition and subtraction.",
    "skills": [
      "add-subtract.problems",
      "add-subtract.inverse"
    ]
  },
  {
    "id": "Y3.MD.1",
    "year": 3,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Recalls and uses multiplication and division facts for the 3, 4 and 8 times tables.",
    "skills": [
      "times-tables.three-four-eight",
      "times-tables.division-facts"
    ]
  },
  {
    "id": "Y3.MD.2",
    "year": 3,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Writes and calculates multiplication and division statements, including 2-digit × 1-digit, mentally then by a written method.",
    "skills": [
      "multiply-divide.short-mult",
      "times-tables.division-facts"
    ]
  },
  {
    "id": "Y3.MD.3",
    "year": 3,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Solves multiplication and division problems, including missing-number, scaling and correspondence problems.",
    "skills": [
      "problem-solving.sum-difference",
      "problem-solving.counting"
    ]
  },
  {
    "id": "Y3.FRAC.1",
    "year": 3,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Counts up and down in tenths; knows tenths come from splitting a whole into 10 equal parts and from dividing a one-digit number or quantity by 10.",
    "skills": [
      "decimals.tenths-hundredths"
    ]
  },
  {
    "id": "Y3.FRAC.2",
    "year": 3,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Recognises, finds and writes fractions of a set of objects: unit and non-unit fractions with small denominators.",
    "skills": [
      "fractions.equal-parts",
      "fractions.name",
      "fractions.represent",
      "fractions.fraction-of"
    ]
  },
  {
    "id": "Y3.FRAC.3",
    "year": 3,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Recognises and uses fractions as numbers: unit and non-unit fractions with small denominators.",
    "skills": [
      "fractions.number-line",
      "fractions.name"
    ]
  },
  {
    "id": "Y3.FRAC.4",
    "year": 3,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Recognises and shows, using diagrams, equivalent fractions with small denominators.",
    "skills": [
      "fractions.equivalent"
    ]
  },
  {
    "id": "Y3.FRAC.5",
    "year": 3,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Adds and subtracts fractions with the same denominator within one whole.",
    "skills": [
      "fractions.add-same",
      "fractions-2.add-same"
    ]
  },
  {
    "id": "Y3.FRAC.6",
    "year": 3,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Compares and orders unit fractions, and fractions with the same denominator.",
    "skills": [
      "fractions.compare",
      "fractions.reasoning"
    ]
  },
  {
    "id": "Y3.FRAC.7",
    "year": 3,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Solves problems that involve all of the above.",
    "skills": [
      "fractions.fraction-of",
      "fractions.reasoning",
      "problem-solving.fractions-in-context"
    ]
  },
  {
    "id": "Y3.MEAS.1",
    "year": 3,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Measures, compares, adds and subtracts lengths (m/cm/mm), mass (kg/g) and capacity (l/ml).",
    "skills": [
      "measures.convert"
    ]
  },
  {
    "id": "Y3.MEAS.2",
    "year": 3,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Measures the perimeter of simple 2-D shapes.",
    "skills": [
      "area-perimeter.perimeter"
    ]
  },
  {
    "id": "Y3.MEAS.3",
    "year": 3,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Adds and subtracts amounts of money to give change, using £ and p in practical contexts.",
    "skills": [
      "money.pounds-pence",
      "money.totals",
      "money.change"
    ]
  },
  {
    "id": "Y3.MEAS.4",
    "year": 3,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Tells and writes the time from an analogue clock, including Roman numerals I to XII, and 12-hour and 24-hour clocks.",
    "skills": [
      "time.read-clock",
      "time.24-hour"
    ]
  },
  {
    "id": "Y3.MEAS.5",
    "year": 3,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Estimates and reads time to the nearest minute; records and compares time in seconds, minutes and hours; uses a.m./p.m. vocabulary.",
    "skills": [
      "time.read-clock",
      "time.units"
    ]
  },
  {
    "id": "Y3.MEAS.6",
    "year": 3,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Knows the number of seconds in a minute and the number of days in each month, year and leap year.",
    "skills": [
      "time.units"
    ]
  },
  {
    "id": "Y3.MEAS.7",
    "year": 3,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Compares durations of events, for example calculates the time taken by tasks.",
    "skills": [
      "time.durations"
    ]
  },
  {
    "id": "Y3.GPS.1",
    "year": 3,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Draws 2-D shapes and makes 3-D shapes; recognises 3-D shapes in different orientations and describes them.",
    "skills": [
      "shapes-angles.shapes"
    ]
  },
  {
    "id": "Y3.GPS.2",
    "year": 3,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Recognises angles as a property of shape or a description of a turn.",
    "skills": [
      "shapes-angles.turns",
      "shapes-angles.angle-types"
    ]
  },
  {
    "id": "Y3.GPS.3",
    "year": 3,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Identifies right angles; knows 2 right angles make a half-turn, 3 three-quarters and 4 a full turn; says whether an angle is greater or less than a right angle.",
    "skills": [
      "shapes-angles.turns",
      "shapes-angles.angle-types"
    ]
  },
  {
    "id": "Y3.STAT.1",
    "year": 3,
    "strand": "Statistics",
    "status": "statutory",
    "outcome": "Interprets and presents data using bar charts, pictograms and tables.",
    "skills": [
      "charts-data.pictograms",
      "charts-data.bar-charts",
      "charts-data.tables"
    ]
  },
  {
    "id": "Y3.STAT.2",
    "year": 3,
    "strand": "Statistics",
    "status": "statutory",
    "outcome": "Solves one-step and two-step 'how many more/fewer' questions using scaled bar charts, pictograms and tables.",
    "skills": [
      "charts-data.bar-charts",
      "charts-data.pictograms",
      "charts-data.tables"
    ]
  },
  {
    "id": "Y4.NPV.1",
    "year": 4,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Counts in multiples of 6, 7, 9, 25 and 1,000.",
    "skills": [
      "times-tables.six-seven-nine"
    ]
  },
  {
    "id": "Y4.NPV.2",
    "year": 4,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Finds 1,000 more or less than a given number.",
    "skills": [
      "place-value.more-less"
    ]
  },
  {
    "id": "Y4.NPV.3",
    "year": 4,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Counts backwards through 0 to include negative numbers.",
    "skills": [
      "negative.count-through-zero",
      "negative.read"
    ]
  },
  {
    "id": "Y4.NPV.4",
    "year": 4,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Says the value of each digit in a 4-digit number.",
    "skills": [
      "place-value.digit-value"
    ]
  },
  {
    "id": "Y4.NPV.5",
    "year": 4,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Orders and compares numbers beyond 1,000.",
    "skills": [
      "place-value.compare-order"
    ]
  },
  {
    "id": "Y4.NPV.6",
    "year": 4,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Identifies, represents and estimates numbers using different representations.",
    "skills": [
      "place-value.digit-value",
      "place-value.partition"
    ]
  },
  {
    "id": "Y4.NPV.7",
    "year": 4,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Rounds any number to the nearest 10, 100 or 1,000.",
    "skills": [
      "rounding.nearest-10",
      "rounding.nearest-100-1000"
    ]
  },
  {
    "id": "Y4.NPV.8",
    "year": 4,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Solves number and practical problems with all of the above and increasingly large positive numbers.",
    "skills": [
      "place-value.more-less",
      "rounding.estimate"
    ]
  },
  {
    "id": "Y4.NPV.9",
    "year": 4,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Reads Roman numerals to 100 (I to C) and knows the numeral system changed over time to include 0 and place value.",
    "skills": [
      "place-value.roman"
    ]
  },
  {
    "id": "Y4.AS.1",
    "year": 4,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Adds and subtracts numbers with up to 4 digits using columns where appropriate.",
    "skills": [
      "add-subtract.column-add",
      "add-subtract.column-sub"
    ]
  },
  {
    "id": "Y4.AS.2",
    "year": 4,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Estimates and uses inverse operations to check answers.",
    "skills": [
      "rounding.estimate",
      "add-subtract.inverse"
    ]
  },
  {
    "id": "Y4.AS.3",
    "year": 4,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Solves addition and subtraction two-step problems, deciding which operations and methods to use and why.",
    "skills": [
      "add-subtract.problems",
      "problem-solving.two-step"
    ]
  },
  {
    "id": "Y4.MD.1",
    "year": 4,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Recalls multiplication and division facts up to 12 × 12.",
    "skills": [
      "times-tables.six-seven-nine",
      "times-tables.eleven-twelve",
      "times-tables.division-facts"
    ]
  },
  {
    "id": "Y4.MD.2",
    "year": 4,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Uses place value, known and derived facts to multiply and divide mentally, including × by 0 and 1, ÷ by 1 and multiplying 3 numbers.",
    "skills": [
      "multiply-divide.ten-hundred",
      "times-tables.eleven-twelve",
      "mental-maths.partition-factors"
    ]
  },
  {
    "id": "Y4.MD.3",
    "year": 4,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Recognises and uses factor pairs and commutativity in mental calculations.",
    "skills": [
      "multiply-divide.factors",
      "times-tables.laws"
    ]
  },
  {
    "id": "Y4.MD.4",
    "year": 4,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Multiplies 2-digit and 3-digit numbers by a 1-digit number using a formal written layout.",
    "skills": [
      "multiply-divide.short-mult"
    ]
  },
  {
    "id": "Y4.MD.5",
    "year": 4,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Solves problems with multiplying and adding, using the distributive law, integer scaling and harder correspondence problems.",
    "skills": [
      "problem-solving.sum-difference",
      "problem-solving.counting",
      "multiply-divide.short-mult",
      "times-tables.laws",
      "times-tables.meaning"
    ]
  },
  {
    "id": "Y4.FRAC.1",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Recognises and shows, using diagrams, families of common equivalent fractions.",
    "skills": [
      "fractions.equivalent",
      "fractions-2.simplify"
    ]
  },
  {
    "id": "Y4.FRAC.2",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Counts up and down in hundredths; knows hundredths arise when dividing an object by 100 and tenths by 10.",
    "skills": [
      "decimals.tenths-hundredths"
    ]
  },
  {
    "id": "Y4.FRAC.3",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Solves problems that find fractions of quantities and divide quantities, including non-unit fractions with a whole-number answer.",
    "skills": [
      "fractions.fraction-of",
      "fractions-2.multiply",
      "problem-solving.fractions-in-context"
    ]
  },
  {
    "id": "Y4.FRAC.4",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Adds and subtracts fractions with the same denominator.",
    "skills": [
      "fractions.add-same",
      "fractions-2.add-same"
    ]
  },
  {
    "id": "Y4.FRAC.5",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Recognises and writes decimal equivalents of any number of tenths or hundredths.",
    "skills": [
      "decimals.as-fractions",
      "decimals.tenths-hundredths"
    ]
  },
  {
    "id": "Y4.FRAC.6",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Recognises and writes decimal equivalents to 1/4, 1/2 and 3/4.",
    "skills": [
      "decimals.as-fractions"
    ]
  },
  {
    "id": "Y4.FRAC.7",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Finds the effect of dividing a 1- or 2-digit number by 10 and 100, giving digit values as ones, tenths and hundredths.",
    "skills": [
      "decimals.times-ten",
      "multiply-divide.ten-hundred"
    ]
  },
  {
    "id": "Y4.FRAC.8",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Rounds decimals with 1 decimal place to the nearest whole number.",
    "skills": [
      "decimals.compare-round"
    ]
  },
  {
    "id": "Y4.FRAC.9",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Compares numbers with the same number of decimal places up to 2 decimal places.",
    "skills": [
      "decimals.compare-round"
    ]
  },
  {
    "id": "Y4.FRAC.10",
    "year": 4,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Solves simple measure and money problems involving fractions and decimals to 2 decimal places.",
    "skills": [
      "decimals.add-subtract",
      "money.problems"
    ]
  },
  {
    "id": "Y4.MEAS.1",
    "year": 4,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Converts between units of measure, for example km to m and hours to minutes.",
    "skills": [
      "time.units"
    ]
  },
  {
    "id": "Y4.MEAS.2",
    "year": 4,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Measures and calculates the perimeter of rectilinear figures, including squares, in cm and m.",
    "skills": [
      "area-perimeter.perimeter"
    ]
  },
  {
    "id": "Y4.MEAS.3",
    "year": 4,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Finds the area of rectilinear shapes by counting squares.",
    "skills": [
      "area-perimeter.area-counting"
    ]
  },
  {
    "id": "Y4.MEAS.4",
    "year": 4,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Estimates, compares and calculates different measures, including money in pounds and pence.",
    "skills": [
      "money.problems",
      "money.totals"
    ]
  },
  {
    "id": "Y4.MEAS.5",
    "year": 4,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Reads, writes and converts time between analogue and digital 12- and 24-hour clocks.",
    "skills": [
      "time.24-hour",
      "time.read-clock"
    ]
  },
  {
    "id": "Y4.MEAS.6",
    "year": 4,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Solves problems converting hours to minutes, minutes to seconds, years to months and weeks to days.",
    "skills": [
      "time.units"
    ]
  },
  {
    "id": "Y4.GPS.1",
    "year": 4,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Compares and classifies geometric shapes, including quadrilaterals and triangles, by properties and sizes.",
    "skills": [
      "shapes-angles.shapes"
    ]
  },
  {
    "id": "Y4.GPS.2",
    "year": 4,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Identifies acute and obtuse angles and compares and orders angles up to 2 right angles by size.",
    "skills": [
      "shapes-angles.angle-types"
    ]
  },
  {
    "id": "Y4.GPS.3",
    "year": 4,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Identifies lines of symmetry in 2-D shapes in different orientations.",
    "skills": [
      "shapes-angles.symmetry"
    ]
  },
  {
    "id": "Y4.GPS.4",
    "year": 4,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Completes a simple symmetric figure with respect to a specific line of symmetry.",
    "skills": [
      "shapes-angles.symmetry"
    ]
  },
  {
    "id": "Y4.GPD.1",
    "year": 4,
    "strand": "Geometry: position and direction",
    "status": "statutory",
    "outcome": "Describes positions on a 2-D grid as coordinates in the first quadrant.",
    "skills": [
      "coordinates.read",
      "coordinates.plot"
    ]
  },
  {
    "id": "Y4.GPD.2",
    "year": 4,
    "strand": "Geometry: position and direction",
    "status": "statutory",
    "outcome": "Describes movements between positions as translations of a given unit left/right and up/down.",
    "skills": [
      "coordinates.translate"
    ]
  },
  {
    "id": "Y4.GPD.3",
    "year": 4,
    "strand": "Geometry: position and direction",
    "status": "statutory",
    "outcome": "Plots specified points and draws sides to complete a given polygon.",
    "skills": [
      "coordinates.plot",
      "coordinates.shapes"
    ]
  },
  {
    "id": "Y4.STAT.1",
    "year": 4,
    "strand": "Statistics",
    "status": "statutory",
    "outcome": "Interprets and presents discrete and continuous data using bar charts and time graphs.",
    "skills": [
      "charts-data.bar-charts",
      "charts-data.line-graphs"
    ]
  },
  {
    "id": "Y4.STAT.2",
    "year": 4,
    "strand": "Statistics",
    "status": "statutory",
    "outcome": "Solves comparison, sum and difference problems using bar charts, pictograms, tables and other graphs.",
    "skills": [
      "charts-data.bar-charts",
      "charts-data.tables",
      "charts-data.line-graphs"
    ]
  },
  {
    "id": "Y5.NPV.1",
    "year": 5,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Reads, writes, orders and compares numbers to at least 1,000,000 and gives the value of each digit.",
    "skills": [
      "place-value.digit-value",
      "place-value.read-write",
      "place-value.compare-order"
    ]
  },
  {
    "id": "Y5.NPV.2",
    "year": 5,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Counts forwards or backwards in steps of powers of 10 from any number up to 1,000,000.",
    "skills": [
      "place-value.more-less"
    ]
  },
  {
    "id": "Y5.NPV.3",
    "year": 5,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Interprets negative numbers in context and counts with positive and negative whole numbers, including through 0.",
    "skills": [
      "negative.read",
      "negative.order",
      "negative.count-through-zero"
    ]
  },
  {
    "id": "Y5.NPV.4",
    "year": 5,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Rounds any number up to 1,000,000 to the nearest 10, 100, 1,000, 10,000 and 100,000.",
    "skills": [
      "rounding.big-numbers",
      "rounding.nearest-100-1000"
    ]
  },
  {
    "id": "Y5.NPV.5",
    "year": 5,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Solves number and practical problems involving all of the above.",
    "skills": [
      "place-value.more-less",
      "rounding.big-numbers"
    ]
  },
  {
    "id": "Y5.NPV.6",
    "year": 5,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Reads Roman numerals to 1,000 (M) and recognises years written in Roman numerals.",
    "skills": [
      "place-value.roman"
    ]
  },
  {
    "id": "Y5.AS.1",
    "year": 5,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Adds and subtracts whole numbers with more than 4 digits, including by columns.",
    "skills": [
      "add-subtract.column-add",
      "add-subtract.column-sub"
    ]
  },
  {
    "id": "Y5.AS.2",
    "year": 5,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Adds and subtracts numbers mentally with increasingly large numbers.",
    "skills": [
      "add-subtract.mental",
      "mental-maths.bridge-compensate"
    ]
  },
  {
    "id": "Y5.AS.3",
    "year": 5,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Uses rounding to check answers and decides the level of accuracy needed in a problem.",
    "skills": [
      "rounding.estimate"
    ]
  },
  {
    "id": "Y5.AS.4",
    "year": 5,
    "strand": "Number: addition and subtraction",
    "status": "statutory",
    "outcome": "Solves multi-step addition and subtraction problems, deciding which operations and methods to use and why.",
    "skills": [
      "problem-solving.two-step",
      "add-subtract.problems"
    ]
  },
  {
    "id": "Y5.MD.1",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Identifies multiples and factors, including all factor pairs of a number and common factors of 2 numbers.",
    "skills": [
      "multiply-divide.factors"
    ]
  },
  {
    "id": "Y5.MD.2",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Knows and uses the vocabulary of prime numbers, prime factors and composite numbers.",
    "skills": [
      "multiply-divide.primes"
    ]
  },
  {
    "id": "Y5.MD.3",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Establishes whether a number up to 100 is prime and recalls primes up to 19.",
    "skills": [
      "multiply-divide.primes"
    ]
  },
  {
    "id": "Y5.MD.4",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Multiplies numbers up to 4 digits by a 1- or 2-digit number using a formal method, including long multiplication for 2-digit numbers.",
    "skills": [
      "multiply-divide.short-mult",
      "multiply-divide.long-mult"
    ]
  },
  {
    "id": "Y5.MD.5",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Multiplies and divides mentally, drawing on known facts.",
    "skills": [
      "multiply-divide.ten-hundred",
      "times-tables.division-facts",
      "mental-maths.special-multipliers",
      "mental-maths.partition-factors"
    ]
  },
  {
    "id": "Y5.MD.6",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Divides numbers up to 4 digits by a 1-digit number using short division and interprets remainders appropriately.",
    "skills": [
      "multiply-divide.division"
    ]
  },
  {
    "id": "Y5.MD.7",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Multiplies and divides whole numbers and those with decimals by 10, 100 and 1,000.",
    "skills": [
      "multiply-divide.ten-hundred",
      "decimals.times-ten"
    ]
  },
  {
    "id": "Y5.MD.8",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Recognises and uses square and cube numbers and the notation ² and ³.",
    "skills": [
      "mental-maths.squares",
      "multiply-divide.squares-cubes"
    ]
  },
  {
    "id": "Y5.MD.9",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Solves multiplication and division problems using factors, multiples, squares and cubes.",
    "skills": [
      "problem-solving.two-step"
    ]
  },
  {
    "id": "Y5.MD.10",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Solves problems with all four operations and combinations, including the meaning of the equals sign.",
    "skills": [
      "problem-solving.two-step",
      "add-subtract.inverse"
    ]
  },
  {
    "id": "Y5.MD.11",
    "year": 5,
    "strand": "Number: multiplication and division",
    "status": "statutory",
    "outcome": "Solves multiplication and division problems including scaling by simple fractions and simple rates.",
    "skills": [
      "ratio-algebra.scaling",
      "problem-solving.fractions-in-context"
    ]
  },
  {
    "id": "Y5.FRAC.1",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Compares and orders fractions whose denominators are all multiples of the same number.",
    "skills": [
      "fractions.compare",
      "fractions-2.add-related"
    ]
  },
  {
    "id": "Y5.FRAC.2",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Identifies, names and writes equivalent fractions of a given fraction, shown visually, including tenths and hundredths.",
    "skills": [
      "fractions.equivalent",
      "fractions-2.simplify",
      "decimals.as-fractions"
    ]
  },
  {
    "id": "Y5.FRAC.3",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Recognises mixed numbers and improper fractions, converts between them, and writes statements greater than 1 as a mixed number.",
    "skills": [
      "fractions-2.mixed-numbers"
    ]
  },
  {
    "id": "Y5.FRAC.4",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Adds and subtracts fractions with the same denominator and with denominators that are multiples of the same number.",
    "skills": [
      "fractions-2.add-same",
      "fractions-2.add-related"
    ]
  },
  {
    "id": "Y5.FRAC.5",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Multiplies proper fractions and mixed numbers by whole numbers, supported by materials and diagrams.",
    "skills": [
      "fractions-2.multiply"
    ]
  },
  {
    "id": "Y5.FRAC.6",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Reads and writes decimal numbers as fractions.",
    "skills": [
      "decimals.as-fractions"
    ]
  },
  {
    "id": "Y5.FRAC.8",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Rounds decimals with 2 decimal places to the nearest whole number and to 1 decimal place.",
    "skills": [
      "decimals.compare-round"
    ]
  },
  {
    "id": "Y5.FRAC.9",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Reads, writes, orders and compares numbers with up to 3 decimal places.",
    "skills": [
      "decimals.compare-round",
      "decimals.tenths-hundredths"
    ]
  },
  {
    "id": "Y5.FRAC.10",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Solves problems involving numbers up to 3 decimal places.",
    "skills": [
      "decimals.add-subtract"
    ]
  },
  {
    "id": "Y5.FRAC.11",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Recognises the per cent symbol and that per cent means parts per 100; writes percentages as fractions with denominator 100 and as decimals.",
    "skills": [
      "percentages.meaning",
      "percentages.convert"
    ]
  },
  {
    "id": "Y5.FRAC.12",
    "year": 5,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Solves problems needing percentage and decimal equivalents of 1/2, 1/4, 1/5, 2/5, 4/5 and fractions with denominators that are multiples of 10 or 25.",
    "skills": [
      "percentages.convert"
    ]
  },
  {
    "id": "Y5.MEAS.1",
    "year": 5,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Converts between metric units of measure.",
    "skills": [
      "measures.convert"
    ]
  },
  {
    "id": "Y5.MEAS.2",
    "year": 5,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Understands and uses approximate equivalences between metric and common imperial units.",
    "skills": [
      "measures.miles-km"
    ]
  },
  {
    "id": "Y5.MEAS.3",
    "year": 5,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Measures and calculates the perimeter of composite rectilinear shapes in cm and m.",
    "skills": [
      "area-perimeter.perimeter",
      "area-perimeter.compound",
      "area-perimeter.missing-sides"
    ]
  },
  {
    "id": "Y5.MEAS.4",
    "year": 5,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Calculates and compares the area of rectangles using cm² and m², and estimates the area of irregular shapes.",
    "skills": [
      "area-perimeter.area-rectangles",
      "area-perimeter.compound"
    ]
  },
  {
    "id": "Y5.MEAS.5",
    "year": 5,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Estimates volume and capacity.",
    "skills": [
      "measures.volume"
    ]
  },
  {
    "id": "Y5.MEAS.6",
    "year": 5,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Solves problems converting between units of time.",
    "skills": [
      "time.units",
      "time.durations"
    ]
  },
  {
    "id": "Y5.MEAS.7",
    "year": 5,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Uses all four operations to solve measure problems with decimal notation, including scaling.",
    "skills": [
      "money.problems",
      "problem-solving.two-step"
    ]
  },
  {
    "id": "Y5.GPS.1",
    "year": 5,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Identifies 3-D shapes, including cubes and other cuboids, from 2-D representations.",
    "skills": [
      "shapes-angles.shapes"
    ]
  },
  {
    "id": "Y5.GPS.2",
    "year": 5,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Knows angles are measured in degrees; estimates and compares acute, obtuse and reflex angles.",
    "skills": [
      "shapes-angles.angle-types",
      "shapes-angles.turns"
    ]
  },
  {
    "id": "Y5.GPS.3",
    "year": 5,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Draws given angles and measures them in degrees.",
    "skills": [
      "shapes-angles.estimate-angles"
    ]
  },
  {
    "id": "Y5.GPS.4",
    "year": 5,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Identifies angles at a point (360°), on a straight line (180°) and multiples of 90°; uses rectangle properties to find missing lengths and angles; distinguishes regular and irregular polygons.",
    "skills": [
      "shapes-angles.angle-facts"
    ]
  },
  {
    "id": "Y5.GPD.1",
    "year": 5,
    "strand": "Geometry: position and direction",
    "status": "statutory",
    "outcome": "Identifies, describes and represents the position of a shape after a reflection or translation, using appropriate language, and knows the shape has not changed.",
    "skills": [
      "coordinates.translate"
    ]
  },
  {
    "id": "Y5.STAT.1",
    "year": 5,
    "strand": "Statistics",
    "status": "statutory",
    "outcome": "Solves comparison, sum and difference problems using information in a line graph.",
    "skills": [
      "charts-data.line-graphs"
    ]
  },
  {
    "id": "Y5.STAT.2",
    "year": 5,
    "strand": "Statistics",
    "status": "statutory",
    "outcome": "Completes, reads and interprets information in tables, including timetables.",
    "skills": [
      "charts-data.tables"
    ]
  },
  {
    "id": "Y6.NPV.1",
    "year": 6,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Reads, writes, orders and compares numbers up to 10,000,000 and gives the value of each digit.",
    "skills": [
      "place-value.digit-value",
      "place-value.read-write",
      "place-value.compare-order"
    ]
  },
  {
    "id": "Y6.NPV.2",
    "year": 6,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Rounds any whole number to a required degree of accuracy.",
    "skills": [
      "rounding.big-numbers",
      "rounding.estimate"
    ]
  },
  {
    "id": "Y6.NPV.3",
    "year": 6,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Uses negative numbers in context and calculates intervals across 0.",
    "skills": [
      "negative.difference",
      "negative.count-through-zero"
    ]
  },
  {
    "id": "Y6.NPV.4",
    "year": 6,
    "strand": "Number: place value",
    "status": "statutory",
    "outcome": "Solves number and practical problems involving all of the above.",
    "skills": [
      "place-value.more-less"
    ]
  },
  {
    "id": "Y6.ASMD.1",
    "year": 6,
    "strand": "Number: addition, subtraction, multiplication and division",
    "status": "statutory",
    "outcome": "Multiplies multi-digit numbers up to 4 digits by a 2-digit number using long multiplication.",
    "skills": [
      "multiply-divide.long-mult"
    ]
  },
  {
    "id": "Y6.ASMD.2",
    "year": 6,
    "strand": "Number: addition, subtraction, multiplication and division",
    "status": "statutory",
    "outcome": "Divides numbers up to 4 digits by a 2-digit number using long division, interpreting remainders as whole numbers, fractions or by rounding.",
    "skills": [
      "multiply-divide.long-division"
    ]
  },
  {
    "id": "Y6.ASMD.3",
    "year": 6,
    "strand": "Number: addition, subtraction, multiplication and division",
    "status": "statutory",
    "outcome": "Divides numbers up to 4 digits by a 2-digit number using short division where appropriate, interpreting remainders in context.",
    "skills": [
      "multiply-divide.division"
    ]
  },
  {
    "id": "Y6.ASMD.4",
    "year": 6,
    "strand": "Number: addition, subtraction, multiplication and division",
    "status": "statutory",
    "outcome": "Performs mental calculations, including mixed operations and large numbers.",
    "skills": [
      "add-subtract.mental",
      "mental-maths.choose-method",
      "mental-maths.bridge-compensate"
    ]
  },
  {
    "id": "Y6.ASMD.5",
    "year": 6,
    "strand": "Number: addition, subtraction, multiplication and division",
    "status": "statutory",
    "outcome": "Identifies common factors, common multiples and prime numbers.",
    "skills": [
      "multiply-divide.factors"
    ]
  },
  {
    "id": "Y6.ASMD.6",
    "year": 6,
    "strand": "Number: addition, subtraction, multiplication and division",
    "status": "statutory",
    "outcome": "Uses the order of operations to carry out calculations with the 4 operations.",
    "skills": [
      "multiply-divide.order-ops"
    ]
  },
  {
    "id": "Y6.ASMD.7",
    "year": 6,
    "strand": "Number: addition, subtraction, multiplication and division",
    "status": "statutory",
    "outcome": "Solves multi-step addition and subtraction problems, deciding operations and methods and why.",
    "skills": [
      "problem-solving.two-step"
    ]
  },
  {
    "id": "Y6.ASMD.8",
    "year": 6,
    "strand": "Number: addition, subtraction, multiplication and division",
    "status": "statutory",
    "outcome": "Solves problems involving addition, subtraction, multiplication and division.",
    "skills": [
      "problem-solving.two-step",
      "problem-solving.backwards",
      "problem-solving.sum-difference"
    ]
  },
  {
    "id": "Y6.ASMD.9",
    "year": 6,
    "strand": "Number: addition, subtraction, multiplication and division",
    "status": "statutory",
    "outcome": "Uses estimation to check answers and decides an appropriate degree of accuracy in context.",
    "skills": [
      "rounding.estimate"
    ]
  },
  {
    "id": "Y6.FRAC.1",
    "year": 6,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Uses common factors to simplify fractions and common multiples to express fractions in the same denomination.",
    "skills": [
      "fractions-2.simplify",
      "fractions-2.add-related"
    ]
  },
  {
    "id": "Y6.FRAC.2",
    "year": 6,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Compares and orders fractions, including fractions greater than 1.",
    "skills": [
      "fractions.compare",
      "fractions-2.mixed-numbers"
    ]
  },
  {
    "id": "Y6.FRAC.3",
    "year": 6,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Adds and subtracts fractions with different denominators and mixed numbers, using equivalent fractions.",
    "skills": [
      "fractions-2.add-related"
    ]
  },
  {
    "id": "Y6.FRAC.4",
    "year": 6,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Multiplies simple pairs of proper fractions, writing the answer in its simplest form.",
    "skills": [
      "fractions-2.multiply-fractions"
    ]
  },
  {
    "id": "Y6.FRAC.5",
    "year": 6,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Divides proper fractions by whole numbers.",
    "skills": [
      "fractions-2.divide-whole"
    ]
  },
  {
    "id": "Y6.FRAC.6",
    "year": 6,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Associates a fraction with division and calculates decimal equivalents of simple fractions.",
    "skills": [
      "decimals.as-fractions"
    ]
  },
  {
    "id": "Y6.FRAC.7",
    "year": 6,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Identifies the value of each digit in numbers given to 3 decimal places and multiplies and divides by 10, 100 and 1,000 with answers up to 3 decimal places.",
    "skills": [
      "decimals.times-ten",
      "decimals.tenths-hundredths"
    ]
  },
  {
    "id": "Y6.FRAC.10",
    "year": 6,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Solves problems requiring answers rounded to specified degrees of accuracy.",
    "skills": [
      "decimals.compare-round"
    ]
  },
  {
    "id": "Y6.FRAC.11",
    "year": 6,
    "strand": "Number: fractions (including decimals and percentages)",
    "status": "statutory",
    "outcome": "Recalls and uses equivalences between simple fractions, decimals and percentages, including in different contexts.",
    "skills": [
      "percentages.convert",
      "decimals.as-fractions"
    ]
  },
  {
    "id": "Y6.RP.1",
    "year": 6,
    "strand": "Ratio and proportion",
    "status": "statutory",
    "outcome": "Solves problems on the relative sizes of 2 quantities where missing values come from integer multiplication and division facts.",
    "skills": [
      "ratio-algebra.ratio",
      "ratio-algebra.scaling"
    ]
  },
  {
    "id": "Y6.RP.2",
    "year": 6,
    "strand": "Ratio and proportion",
    "status": "statutory",
    "outcome": "Solves problems calculating percentages (for example of measures, such as 15% of 360) and uses percentages for comparison.",
    "skills": [
      "percentages.of-amounts",
      "percentages.problems",
      "mental-maths.percent-fraction"
    ]
  },
  {
    "id": "Y6.RP.3",
    "year": 6,
    "strand": "Ratio and proportion",
    "status": "statutory",
    "outcome": "Solves problems with similar shapes where the scale factor is known or can be found.",
    "skills": [
      "ratio-algebra.scaling"
    ]
  },
  {
    "id": "Y6.RP.4",
    "year": 6,
    "strand": "Ratio and proportion",
    "status": "statutory",
    "outcome": "Solves problems involving unequal sharing and grouping using fractions and multiples.",
    "skills": [
      "ratio-algebra.ratio",
      "problem-solving.fractions-in-context"
    ]
  },
  {
    "id": "Y6.ALG.1",
    "year": 6,
    "strand": "Algebra",
    "status": "statutory",
    "outcome": "Uses simple formulae.",
    "skills": [
      "ratio-algebra.formulas"
    ]
  },
  {
    "id": "Y6.ALG.2",
    "year": 6,
    "strand": "Algebra",
    "status": "statutory",
    "outcome": "Generates and describes linear number sequences.",
    "skills": [
      "ratio-algebra.sequences"
    ]
  },
  {
    "id": "Y6.ALG.3",
    "year": 6,
    "strand": "Algebra",
    "status": "statutory",
    "outcome": "Expresses missing number problems algebraically.",
    "skills": [
      "ratio-algebra.equations"
    ]
  },
  {
    "id": "Y6.ALG.5",
    "year": 6,
    "strand": "Algebra",
    "status": "statutory",
    "outcome": "Enumerates possibilities of combinations of 2 variables.",
    "skills": [
      "problem-solving.counting"
    ]
  },
  {
    "id": "Y6.MEAS.1",
    "year": 6,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Solves problems involving calculation and conversion of units of measure, with decimal notation up to 3 decimal places.",
    "skills": [
      "measures.convert"
    ]
  },
  {
    "id": "Y6.MEAS.2",
    "year": 6,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Uses, reads, writes and converts between standard units of length, mass, volume and time, small to large and vice versa, with decimal notation.",
    "skills": [
      "time.units"
    ]
  },
  {
    "id": "Y6.MEAS.3",
    "year": 6,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Converts between miles and kilometres.",
    "skills": [
      "measures.miles-km"
    ]
  },
  {
    "id": "Y6.MEAS.4",
    "year": 6,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Recognises that shapes with the same area can have different perimeters and vice versa.",
    "skills": [
      "area-perimeter.compound",
      "area-perimeter.missing-sides"
    ]
  },
  {
    "id": "Y6.MEAS.5",
    "year": 6,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Recognises when it is possible to use formulae for area and volume of shapes.",
    "skills": [
      "area-perimeter.area-rectangles"
    ]
  },
  {
    "id": "Y6.MEAS.7",
    "year": 6,
    "strand": "Measurement",
    "status": "statutory",
    "outcome": "Calculates, estimates and compares the volume of cubes and cuboids in standard units.",
    "skills": [
      "measures.volume"
    ]
  },
  {
    "id": "Y6.GPS.2",
    "year": 6,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Recognises, describes and builds simple 3-D shapes, including making nets.",
    "skills": [
      "shapes-angles.shapes",
      "shapes-angles.nets"
    ]
  },
  {
    "id": "Y6.GPS.3",
    "year": 6,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Compares and classifies shapes by properties and sizes and finds unknown angles in triangles, quadrilaterals and regular polygons.",
    "skills": [
      "shapes-angles.shapes",
      "shapes-angles.angle-facts"
    ]
  },
  {
    "id": "Y6.GPS.4",
    "year": 6,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Illustrates and names parts of circles, including radius, diameter and circumference; knows the diameter is twice the radius.",
    "skills": [
      "shapes-angles.circles"
    ]
  },
  {
    "id": "Y6.GPS.5",
    "year": 6,
    "strand": "Geometry: properties of shapes",
    "status": "statutory",
    "outcome": "Recognises angles at a point, on a straight line or vertically opposite, and finds missing angles.",
    "skills": [
      "shapes-angles.angle-facts"
    ]
  },
  {
    "id": "Y6.GPD.1",
    "year": 6,
    "strand": "Geometry: position and direction",
    "status": "statutory",
    "outcome": "Describes positions on the full coordinate grid (all 4 quadrants).",
    "skills": [
      "coordinates.read"
    ]
  },
  {
    "id": "Y6.GPD.2",
    "year": 6,
    "strand": "Geometry: position and direction",
    "status": "statutory",
    "outcome": "Draws and translates simple shapes on the coordinate plane, and reflects them in the axes.",
    "skills": [
      "coordinates.translate"
    ]
  },
  {
    "id": "Y6.STAT.1",
    "year": 6,
    "strand": "Statistics",
    "status": "statutory",
    "outcome": "Interprets and constructs pie charts and line graphs and uses them to solve problems.",
    "skills": [
      "charts-data.line-graphs",
      "charts-data.pie-charts"
    ]
  },
  {
    "id": "Y6.STAT.2",
    "year": 6,
    "strand": "Statistics",
    "status": "statutory",
    "outcome": "Calculates and interprets the mean as an average.",
    "skills": [
      "charts-data.mean"
    ]
  },
  {
    "id": "E11.1",
    "year": null,
    "strand": "Extension candidate",
    "status": "11+-extension-candidate",
    "outcome": "Ratio notation (a : b), simplifying ratios and sharing an amount in a ratio.",
    "skills": [
      "ratio-algebra.ratio"
    ]
  },
  {
    "id": "E11.2",
    "year": null,
    "strand": "Extension candidate",
    "status": "11+-extension-candidate",
    "outcome": "Finding the nth term of a linear sequence.",
    "skills": [
      "ratio-algebra.sequences"
    ]
  },
  {
    "id": "E11.3",
    "year": null,
    "strand": "Extension candidate",
    "status": "11+-extension-candidate",
    "outcome": "Solving two-step equations.",
    "skills": [
      "ratio-algebra.equations"
    ]
  },
  {
    "id": "E11.4",
    "year": null,
    "strand": "Extension candidate",
    "status": "11+-extension-candidate",
    "outcome": "Working backwards to find a starting number.",
    "skills": [
      "problem-solving.backwards"
    ]
  },
  {
    "id": "E11.5",
    "year": null,
    "strand": "Extension candidate",
    "status": "11+-extension-candidate",
    "outcome": "Bar-model puzzles: sum and difference, and 'times as many'.",
    "skills": [
      "problem-solving.sum-difference"
    ]
  },
  {
    "id": "E11.6",
    "year": null,
    "strand": "Extension candidate",
    "status": "11+-extension-candidate",
    "outcome": "Compass directions.",
    "skills": [
      "shapes-angles.turns"
    ]
  },
  {
    "id": "E11.7",
    "year": null,
    "strand": "Extension candidate",
    "status": "11+-extension-candidate",
    "outcome": "Speed, distance and time.",
    "skills": [
      "measures.speed"
    ]
  },
  {
    "id": "E11.8",
    "year": null,
    "strand": "Extension candidate",
    "status": "11+-extension-candidate",
    "outcome": "Mode, median and range.",
    "skills": [
      "charts-data.averages"
    ]
  },
  {
    "id": "E11.9",
    "year": null,
    "strand": "Extension candidate",
    "status": "11+-extension-candidate",
    "outcome": "Simple probability as words and fractions.",
    "skills": [
      "charts-data.probability"
    ]
  }
];

/** The objectives a skill serves, statutory first, in map order. */
export function objectivesForSkill(skill: string): CurriculumObjective[] {
  const own = OBJECTIVES.filter((o) => o.skills.includes(skill));
  return [...own.filter((o) => o.status === "statutory"), ...own.filter((o) => o.status !== "statutory")];
}
