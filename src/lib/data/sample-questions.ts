export interface SampleQuestion {
  id: string;
  track: "RN Nursing" | "LPN Nursing" | "Exit Exam";
  subject: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  rationale: string;
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  {
    id: "rn-medsurg-1",
    track: "RN Nursing",
    subject: "Medical-Surgical",
    question:
      "A nurse is caring for a client 4 hours post-thyroidectomy who reports numbness and tingling around the lips and fingertips. Which laboratory finding should the nurse anticipate?",
    options: [
      "Serum potassium 5.4 mEq/L",
      "Serum calcium 7.4 mg/dL",
      "Serum sodium 129 mEq/L",
      "Serum magnesium 2.8 mg/dL",
    ],
    correctIndex: 1,
    rationale:
      "Circumoral paresthesia and tingling in the fingertips are early signs of hypocalcemia (< 8.5 mg/dL) caused by accidental parathyroid injury or removal during thyroidectomy. Prepare IV calcium gluconate and monitor for Trousseau or Chvostek signs.",
  },
  {
    id: "rn-pediatrics-1",
    track: "RN Nursing",
    subject: "Pediatrics",
    question:
      "A 6-month-old infant diagnosed with acute bronchiolitis (RSV) has nasal flaring, subcostal retractions, and a respiratory rate of 64/min. Which nursing action takes highest priority before feeding?",
    options: [
      "Offer small, frequent oral feedings every 2 hours",
      "Administer blow-by humidified oxygen via face mask only during sleep",
      "Suction the nasopharynx with a bulb syringe and assess oxygen saturation",
      "Place the infant in a prone position to drain secretions",
    ],
    correctIndex: 2,
    rationale:
      "Infants are obligate nose breathers, and copious nasal secretions in RSV bronchiolitis rapidly impair oxygenation and increase aspiration risk during feeding. Clearing the nasal airway and verifying oxygenation comes first.",
  },
  {
    id: "lpn-pharm-1",
    track: "LPN Nursing",
    subject: "Pharmacology",
    question:
      "A client prescribed furosemide 40 mg PO daily also takes digoxin 0.125 mg daily. Which clinical finding requires immediate reporting to the provider?",
    options: [
      "Urine output of 45 mL/hr",
      "Serum potassium level of 2.9 mEq/L",
      "Blood pressure of 118/74 mm Hg",
      "Weight loss of 0.5 kg over 24 hours",
    ],
    correctIndex: 1,
    rationale:
      "Loop diuretics such as furosemide cause potassium wasting. Hypokalemia (< 3.5 mEq/L) markedly increases sensitivity to digoxin and predisposes the client to life-threatening digoxin toxicity and dysrhythmias.",
  },
  {
    id: "lpn-dosage-1",
    track: "LPN Nursing",
    subject: "Dosage Calculation",
    question:
      "A provider orders cefazolin 750 mg IV every 8 hours. The pharmacy supplies a vial labeled 1 g/10 mL after reconstitution. How many mL should the nurse administer per dose?",
    options: ["0.75 mL", "5.0 mL", "7.5 mL", "13.3 mL"],
    correctIndex: 2,
    rationale:
      "Convert 1 g to 1,000 mg. Using Dose Ordered / Dose on Hand × Volume: (750 mg / 1,000 mg) × 10 mL = 7.5 mL per dose.",
  },
  {
    id: "exit-priority-1",
    track: "Exit Exam",
    subject: "Priority Setting & Safety",
    question:
      "After receiving shift report on four clients, which client should the nurse assess first?",
    options: [
      "A client with COPD whose SpO2 is 90% on 2 L/min nasal cannula",
      "A post-op hip arthroplasty client reporting incisional pain rated 6/10",
      "A client with acute pancreatitis exhibiting new-onset inspiratory stridor",
      "A client with heart failure who gained 0.4 kg since yesterday",
    ],
    correctIndex: 2,
    rationale:
      "Using the ABC (Airway, Breathing, Circulation) priority framework, new-onset stridor indicates upper airway compromise and requires immediate assessment. An SpO2 of 90% is expected for many clients with COPD, and 6/10 pain is secondary to airway threats.",
  },
  {
    id: "exit-maternal-1",
    track: "Exit Exam",
    subject: "Maternal & Newborn",
    question:
      "A client 2 hours postpartum has a boggy uterus displaced 2 cm above and to the right of the umbilicus with heavy lochia rubra. What is the nurse's initial intervention?",
    options: [
      "Increase the IV maintenance fluid rate",
      "Massage the uterine fundus firmly until it becomes boggy-free",
      "Assist the client to void and reassess fundal height and tone",
      "Notify the provider immediately to prepare for blood transfusion",
    ],
    correctIndex: 2,
    rationale:
      "A fundus displaced upward and to the right indicates a distended bladder preventing effective uterine contraction (uterine atony). Assisting the client to empty the bladder (or catheterizing if unable to void) allows the uterus to contract cleanly in the midline alongside fundal massage.",
  },
];
