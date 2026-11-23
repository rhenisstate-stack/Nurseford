export interface SampleQuestion {
  id: string;
  track: "RN Nursing Exam" | "LPN Nursing Exam" | "RN Exit" | "PN Exit";
  subject: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  rationale: string;
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  // ─── 1. RN NURSING EXAM (2 Questions) ───
  {
    id: "rn-medsurg-heart-failure",
    track: "RN Nursing Exam",
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
    track: "RN Nursing Exam",
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

  // ─── 2. LPN NURSING EXAM (2 Questions) ───
  {
    id: "lpn-fundamentals-ppe-removal",
    track: "LPN Nursing Exam",
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
    track: "LPN Nursing Exam",
    subject: "Dosage Calculation",
    difficulty: "Medium",
    question:
      "The physician orders 1,000 mL of 0.9% Normal Saline to infuse intravenously over 8 hours. The infusion tubing drop factor is 15 gtt/mL. What is the calculated flow rate in drops per minute (gtt/min)?",
    options: ["21 gtt/min", "31 gtt/min", "42 gtt/min", "125 gtt/min"],
    correctIndex: 1,
    rationale:
      "Formula: Flow rate (gtt/min) = [Total Volume (mL) × Drop Factor (gtt/mL)] ÷ [Time in Minutes]. Here: Total volume = 1,000 mL, Drop factor = 15 gtt/mL, Time = 8 hours × 60 min/hr = 480 minutes. Calculation: (1,000 × 15) ÷ 480 = 15,000 ÷ 480 = 31.25. Rounding to the nearest whole drop yields 31 gtt/min. (125 mL/hr is the infusion pump rate, not the gravity drip rate).",
  },

  // ─── 3. RN EXIT (2 Questions) ───
  {
    id: "rn-exit-triage-priority-delegation",
    track: "RN Exit",
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
    id: "rn-exit-clinical-judgment-sepsis",
    track: "RN Exit",
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

  // ─── 4. PN EXIT (2 Questions) ───
  {
    id: "pn-exit-scope-client-assignment",
    track: "PN Exit",
    subject: "Exit Exams & Capstone",
    difficulty: "Medium",
    question:
      "The charge nurse is making shift client assignments. Which client is most appropriate to assign to the Licensed Practical Nurse (LPN / LVN)?",
    options: [
      "A client admitted 2 hours ago with chest pain scheduled for an emergency cardiac catheterization",
      "A client who underwent laparoscopic cholecystectomy 2 days ago requiring dressing care and established colostomy irrigation",
      "A client with newly diagnosed Type 1 diabetes requiring initial insulin self-administration education",
      "A client transferred from the ICU 1 hour ago following stabilization of acute respiratory distress syndrome",
    ],
    correctIndex: 1,
    rationale:
      "LPN/LVN scope of practice is best suited for stable clients with predictable clinical outcomes who require routine care, standard wound/ostomy maintenance, and administration of scheduled medications. The client 2 days postoperative following laparoscopic cholecystectomy is stable. Newly admitted clients, clients transferred from the ICU within the hour, and clients requiring initial discharge/disease education require comprehensive registered nurse (RN) assessment, clinical judgment, and direct teaching.",
  },
  {
    id: "pn-exit-focused-assessment-hypoglycemia",
    track: "PN Exit",
    subject: "General Clinical",
    difficulty: "Medium",
    question:
      "A practical nurse (LPN) is monitoring a post-surgical client with diabetes mellitus. Two hours after receiving morning insulin, the client reports feeling shaky, nervous, and diaphoresis is observed. The bedside capillary glucose reading is 54 mg/dL. The client is alert and oriented. Which action should the nurse take first?",
    options: [
      "Administer 1 mg of glucagon intramuscularly into the deltoid",
      "Provide 4 ounces (120 mL) of fruit juice or regular soda",
      "Notify the healthcare provider and wait for a stat intravenous dextrose order",
      "Encourage the client to eat their scheduled lunch tray immediately",
    ],
    correctIndex: 1,
    rationale:
      "According to the American Diabetes Association 'Rule of 15', an alert client with acute hypoglycemia (glucose < 70 mg/dL) should immediately receive 15 grams of fast-acting simple carbohydrate (e.g., 4 oz fruit juice, 4 oz regular soda, or 3–4 glucose tablets). The blood glucose is rechecked in 15 minutes. Intramuscular glucagon or IV 50% dextrose is indicated only if the client is unconscious, unable to swallow, or NPO. Waiting for the physician or waiting for lunch causes dangerous delays.",
  },
];
