export interface SampleQuestion {
  id: string;
  track: "RN Nursing" | "LPN Nursing" | "Exit Exam";
  subject: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  rationale: string;
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  // ─── RN NURSING QUESTIONS ───
  {
    id: "rn-medsurg-heart-failure",
    track: "RN Nursing",
    subject: "Med-Surg / Adult Health",
    difficulty: "Hard",
    question:
      "A 68-year-old client with chronic heart failure is prescribed furosemide 40 mg IV daily and digoxin 0.25 mg orally daily. Which laboratory finding requires the nurse's immediate priority intervention?",
    options: [
      "Serum sodium 136 mEq/L",
      "Serum potassium 2.9 mEq/L",
      "Serum digoxin level 1.1 ng/mL",
      "Blood urea nitrogen (BUN) 22 mg/dL",
    ],
    correctIndex: 1,
    rationale:
      "Hypokalemia (potassium < 3.5 mEq/L) dramatically potentiates the myocardial sensitivity to digitalis toxicity, placing the client at high risk for life-threatening ventricular dysrhythmias and cardiac arrest. Furosemide is a potassium-wasting loop diuretic. A potassium level of 2.9 mEq/L is critically low. Sodium 136 mEq/L is within normal limits (135–145 mEq/L). Digoxin 1.1 ng/mL is within therapeutic range (0.5–2.0 ng/mL). BUN 22 mg/dL is only slightly elevated and secondary to diuretic volume shift.",
  },
  {
    id: "rn-pharm-heparin-protamine",
    track: "RN Nursing",
    subject: "Pharmacology",
    difficulty: "Medium",
    question:
      "A client receiving a continuous intravenous heparin infusion for acute deep vein thrombosis (DVT) develops epistaxis and hematuria. The laboratory reports an activated partial thromboplastin time (aPTT) of 138 seconds (control: 30 seconds). Which medication should the nurse anticipate administering immediately?",
    options: [
      "Vitamin K (Phytonadione)",
      "Protamine sulfate",
      "Enoxaparin sodium",
      "Fresh frozen plasma (FFP)",
    ],
    correctIndex: 1,
    rationale:
      "Protamine sulfate is the specific chemical antagonist that rapidly neutralizes the anticoagulant effect of unfractionated heparin by forming a stable, inactive salt complex. The therapeutic aPTT target is 1.5 to 2.5 times the control (typically 45–75 seconds); an aPTT of 138 seconds accompanied by overt bleeding constitutes heparin toxicity. Vitamin K reverses warfarin, not heparin. Enoxaparin is a low-molecular-weight heparin that would worsen bleeding. FFP is used for mass coagulopathy or urgent warfarin reversal.",
  },
  {
    id: "rn-pediatrics-epiglottitis",
    track: "RN Nursing",
    subject: "Pediatrics & Child Health",
    difficulty: "Hard",
    question:
      "A 4-year-old child presents to the emergency department with acute high fever, severe inspiratory stridor, drooling, and sitting upright in a 'tripod' position. What action must the nurse avoid taking?",
    options: [
      "Preparing equipment for immediate emergency endotracheal intubation",
      "Visualizing the pharynx using a tongue depressor to inspect the throat",
      "Maintaining a calm environment and keeping the child in the caregiver's lap",
      "Administering humidified oxygen via blow-by mask without causing agitation",
    ],
    correctIndex: 1,
    rationale:
      "In suspected acute epiglottitis (indicated by the hallmark triad of drooling, dysphagia, and distress in a tripod position), direct visualization of the posterior pharynx with a tongue depressor or throat swab can provoke immediate, complete laryngospasm and catastrophic airway obstruction. Pharyngeal examination should only occur in the operating room with an anesthesiologist and surgical airway team ready. Keeping the child calm, preparing intubation equipment, and blow-by oxygen are all indicated.",
  },

  // ─── LPN / LVN NURSING QUESTIONS ───
  {
    id: "lpn-fundamentals-ppe-removal",
    track: "LPN Nursing",
    subject: "Fundamentals of Nursing",
    difficulty: "Easy",
    question:
      "A licensed practical nurse (LPN) has completed patient care in an airborne and contact isolation room. In which sequence should the personal protective equipment (PPE) be removed before exiting?",
    options: [
      "Gloves, goggles/face shield, gown, mask/respirator",
      "Mask/respirator, gown, gloves, goggles/face shield",
      "Gown, gloves, mask/respirator, goggles/face shield",
      "Goggles/face shield, gloves, gown, mask/respirator",
    ],
    correctIndex: 0,
    rationale:
      "According to CDC guidelines, the correct sequence for doffing PPE is: 1) Gloves (most contaminated), 2) Goggles/face shield, 3) Gown, 4) Mask or N95 respirator (removed outside the isolation room for airborne precautions). Alternatively, the gown and gloves may be removed simultaneously, followed by eye protection and the respirator. The mask is always removed last to protect the respiratory tract.",
  },
  {
    id: "lpn-dosage-calc-iv-rate",
    track: "LPN Nursing",
    subject: "Dosage Calculation",
    difficulty: "Medium",
    question:
      "The physician orders 1,000 mL of 0.9% Normal Saline to infuse intravenously over 8 hours. The infusion tubing drop factor is 15 gtt/mL. What is the calculated flow rate in drops per minute (gtt/min)?",
    options: ["21 gtt/min", "31 gtt/min", "42 gtt/min", "125 gtt/min"],
    correctIndex: 1,
    rationale:
      "Formula: Flow rate (gtt/min) = [Total Volume (mL) × Drop Factor (gtt/mL)] ÷ [Time in Minutes]. Here: Total volume = 1,000 mL, Drop factor = 15 gtt/mL, Time = 8 hours × 60 min/hr = 480 minutes. Calculation: (1,000 × 15) ÷ 480 = 15,000 ÷ 480 = 31.25. Rounding to the nearest whole drop yields 31 gtt/min. (125 mL/hr is the infusion pump rate, not the gravity drip rate).",
  },
  {
    id: "lpn-mental-health-lithium",
    track: "LPN Nursing",
    subject: "Mental Health & Psych",
    difficulty: "Medium",
    question:
      "A client diagnosed with Bipolar I Disorder has been taking lithium carbonate 300 mg TID for two weeks. Which clinical manifestation should the nurse recognize as an early indicator of lithium toxicity?",
    options: [
      "Coarse hand tremors, ataxia, and persistent diarrhea",
      "Mild transient nausea and fine resting hand tremors",
      "Weight gain of 2 pounds over one month",
      "Slight metallic taste in the mouth after doses",
    ],
    correctIndex: 0,
    rationale:
      "Coarse hand tremors, ataxia, muscle weakness, confusion, persistent nausea/vomiting, and watery diarrhea are early to moderate signs of lithium toxicity (blood levels > 1.5 mEq/L). Mild fine tremors, slight nausea, and mild thirst are common benign side effects during early therapeutic initiation (0.6–1.2 mEq/L) but coarse tremors signal neurotoxicity requiring immediate blood level check and withholding the dose.",
  },

  // ─── EXIT EXAMS & CAPSTONE CLINICAL JUDGMENT ───
  {
    id: "exit-triage-priority-delegation",
    track: "Exit Exam",
    subject: "Exit Exams & Capstone",
    difficulty: "Hard",
    question:
      "After morning interdisciplinary handover report, the medical-surgical charge nurse reviews four assigned clients. Which client should the nurse assess first?",
    options: [
      "A 52-year-old with acute pancreatitis requesting pain medication for epigastric pain rating 8/10",
      "A 64-year-old post-thyroidectomy client reporting tingling around the mouth and muscle spasms in the fingers",
      "A 70-year-old with chronic COPD having an oxygen saturation of 90% on 2 L/min nasal cannula",
      "A 45-year-old 1 day post-abdominal surgery with 40 mL of serosanguinous drainage in the surgical bulb drain",
    ],
    correctIndex: 1,
    rationale:
      "The post-thyroidectomy client is exhibiting classic signs of acute hypocalcemia (circumoral paresthesia and positive Trousseau/Chvostek sign) due to accidental parathyroid gland trauma or excision during surgery. Acute hypocalcemia can rapidly deteriorate into laryngeal spasm, tetany, seizures, and fatal airway obstruction. Calcium gluconate must be available. Pain in pancreatitis is expected (assess second). SpO2 of 90% is acceptable in COPD. 40 mL serosanguinous drainage is an expected postoperative finding.",
  },
  {
    id: "exit-clinical-judgment-sepsis",
    track: "Exit Exam",
    subject: "Critical Care",
    difficulty: "Hard",
    question:
      "A client with an indwelling urinary catheter presents with temperature 102.8°F (39.3°C), heart rate 124 beats/min, respiratory rate 26 breaths/min, and blood pressure 84/48 mmHg. The serum lactate is 4.2 mmol/L. According to the Surviving Sepsis Campaign bundle, what is the initial priority intervention?",
    options: [
      "Administer IV broad-spectrum antibiotics within 3 hours",
      "Initiate rapid intravenous fluid resuscitation with 30 mL/kg of crystalloid fluids",
      "Start a norepinephrine infusion at 2 mcg/min via peripheral line",
      "Send the client for an emergency computed tomography (CT) scan of the abdomen",
    ],
    correctIndex: 1,
    rationale:
      "The client meets criteria for septic shock (hypotension refractory to baseline and serum lactate > 4.0 mmol/L). In the 1-hour sepsis resuscitation bundle, the immediate priority is rapid volume expansion with 30 mL/kg of crystalloid fluid (e.g., Lactated Ringer's or Normal Saline) to restore intravascular volume and tissue perfusion. Blood cultures and broad-spectrum IV antibiotics are administered within the first hour. Vasopressors (norepinephrine) are added only if mean arterial pressure (MAP) remains < 65 mmHg despite adequate fluid resuscitation.",
  },
];
