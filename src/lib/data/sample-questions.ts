export interface SampleQuestion {
  title: string;
  question: string;
  options: string[];
}

export const ATI_TEAS_SAMPLES: Record<string, SampleQuestion> = {
  science: {
    title: "TEAS 7 PREP SCIENCE SAMPLE",
    question:
      "Which of the following structures in the nephron is responsible for reabsorbing ions, water and nutrients?",
    options: ["Distal tubule", "Proximal tubule", "Glomerulus", "Loop of Henle"],
  },
  english: {
    title: "TEAS 7 PREP ENGLISH SAMPLE",
    question: "Which of the following is an example of accidental plagiarism?",
    options: [
      "Summarizing information without including a source credit",
      "Submitting a paper that was written by a friend",
      "Forgetting to include an in-text citation for information",
      "Copying information from a source and identifying it as your own",
    ],
  },
  math: {
    title: "TEAS 7 PREP MATH SAMPLE",
    question:
      "The length of a rectangular room is 2 feet greater than its width. Which of the following equations represents the area (A) of the room?",
    options: ["A = 2x", "A = 2x + 2(x + 2)", "A = x + (x + 2)", "A = x(x + 2)"],
  },
};

export const HESI_A2_SAMPLES: Record<string, SampleQuestion> = {
  biology: {
    title: "HESI A2 BIOLOGY SAMPLE",
    question:
      "The cellular membrane consists of a bilayer of which substances?",
    options: ["Carbohydrates", "Phospholipids", "Proteins", "Nucleic acids"],
  },
  math: {
    title: "HESI A2 MATH Sample",
    question: "Convert the military time 0056 to 12-hour time.",
    options: ["12:56 P.M.", "1:56 P.M.", "1:56 A.M.", "12:56 A.M."],
  },
  vocabulary: {
    title: "HESI A2 Vocabulary Sample",
    question: "Which word pertains to motion or movement?",
    options: ["Kilocalorie", "Keratosis", "Kinetic", "Kilogram"],
  },
};

export const RN_NURSING_SAMPLES: Record<string, SampleQuestion> = {
  fundamentals: {
    title: "RN FUNDAMENTALS SAMPLE",
    question:
      "A nurse is caring for a client with a chronic wound. Which of the following is a potential complication of a chronic wound?",
    options: [
      "Electrolyte abnormalities",
      "Altered hemoglobin ATC",
      "Psychological distress",
      "Fluid volume overload",
    ],
  },
  pediatrics: {
    title: "RN PEDIATRICS SAMPLE",
    question:
      "The nurse is conducting Intake Interviews of children at a city clinic. Which child is most susceptible to contracting lead poisoning?",
    options: [
      "A 2-year-old who plays on aging outdoor playground equipment.",
      "A 10-year-old who has Type 1 diabetes mellitus.",
      "An 8-year-old who lives in a housing project.",
      "An adolescent who works part-time in a paint factory.",
    ],
  },
  medSurg: {
    title: "RN MED-SURG SAMPLE",
    question:
      "Which complication should the nurse monitor for while caring for a client post gastrectomy?",
    options: [
      "Umbilical hernia",
      "Gallstones",
      "Peptic ulcer",
      "Dumping syndrome",
    ],
  },
};

export const LPN_NURSING_SAMPLES: Record<string, SampleQuestion> = {
  maternalNewborn: {
    title: "PN Maternal & Newborn Sample",
    question:
      "The nurse is educating a class of expectant parents about fetal development. What is considered fetal age of viability?",
    options: ["8", "24", "20", "14"],
  },
  pharmacology: {
    title: "PN Pharmacology Sample",
    question:
      "Before administering an antibiotic that can cause nephrotoxicity, which laboratory value is most important for the practical nurse (PN) to review?",
    options: [
      "White blood cell count (WBC).",
      "Serum creatinine.",
      "Hemoglobin and Hematocrit.",
      "Serum calcium",
    ],
  },
  mediSurg: {
    title: "Medi-Surg Sample",
    question:
      "A nurse has taken on the care of a client who had a coronary artery stent placed yesterday. When reviewing the client's daily medication administration record, the nurse should anticipate administering what drug?",
    options: ["Clopidogrel", "Dipyridamole", "Ibuprofen", "Acetaminophen"],
  },
};
