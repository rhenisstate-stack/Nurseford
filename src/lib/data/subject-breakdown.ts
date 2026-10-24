export interface SubjectTopic {
  icon: string;
  name: string;
  topics: string[];
  image?: string;
}

export const ATI_TEAS_SUBJECTS: SubjectTopic[] = [
  {
    icon: "🚀",
    name: "Science",
    image: "/images/ati-teas/01_science.png",
    topics: [
      "Human Anatomy & Physiology – Body systems, homeostasis, and interrelationships.",
      "Life & Physical Sciences – Genetics, biology basics, chemistry concepts, and physics principles.",
      "Scientific Reasoning – Hypothesis testing, experiment design, and data interpretation.",
      "Health & Disease Context – Applied examples connecting science to healthcare settings.",
    ],
  },
  {
    icon: "➕",
    name: "Mathematics",
    image: "/images/ati-teas/02_mathematics.png",
    topics: [
      "Numbers & Algebra – Whole numbers, fractions, decimals, ratios, proportions.",
      "Measurement & Data – Units of measure, conversions, geometry basics, interpreting graphs.",
      "Word Problems & Applied Math – Real-world scenarios mirroring TEAS question styles.",
      "Calculator-Free Drills – Build confidence solving problems without a calculator.",
    ],
  },
  {
    icon: "📖",
    name: "Reading",
    image: "/images/ati-teas/03_reading.png",
    topics: [
      "Key Ideas & Details – Identify main ideas, supporting details, summarize passages.",
      "Craft & Structure – Analyze author's purpose, point of view, text features, and context clues.",
      "Integration of Knowledge & Ideas – Evaluate arguments, compare sources, use evidence across texts.",
      "Practice Passages & Rationales – Realistic passages with explanations to strengthen comprehension.",
    ],
  },
  {
    icon: "✍️",
    name: "English & Language Usage",
    image: "/images/ati-teas/04_english_language_usage.png",
    topics: [
      "Grammar & Syntax – Parts of speech, sentence structure, subject-verb agreement.",
      "Punctuation & Capitalization – Commas, semicolons, apostrophes, and capitalization rules.",
      "Vocabulary & Context Clues – Word meanings, prefixes, suffixes, and contextual inference.",
      "Writing Conventions – Paragraph organization, transitions, and effective communication.",
    ],
  },
];

export const HESI_A2_SUBJECTS: SubjectTopic[] = [
  {
    icon: "🧬",
    name: "Biology",
    image: "/images/ati-teas/01_science.png",
    topics: [
      "Cell Structure & Function – Organelles, membrane transport, and cellular processes.",
      "Genetics & Heredity – DNA, RNA, mitosis, meiosis, and genetic disorders.",
      "Evolution & Ecology – Natural selection, ecosystems, and environmental interactions.",
      "Human Biology Systems – Overview of major organ systems and their interrelationships.",
    ],
  },
  {
    icon: "📐",
    name: "Mathematics",
    image: "/images/ati-teas/02_mathematics.png",
    topics: [
      "Arithmetic – Fractions, decimals, percentages, ratios, and proportions.",
      "Algebra – Equations, inequalities, word problems, and variable manipulation.",
      "Geometry – Area, perimeter, volume, and spatial reasoning.",
      "Conversion & Measurement – Unit conversions, metric system, and dosage calculations.",
    ],
  },
  {
    icon: "📚",
    name: "Vocabulary",
    image: "/images/ati-teas/05_nursing_school_essentials.png",
    topics: [
      "Medical Terminology – Prefixes, suffixes, and root words used in healthcare.",
      "General Vocabulary – Word meanings, synonyms, antonyms, and context clues.",
      "Word Parts Analysis – Breaking down complex words into recognizable components.",
      "Contextual Usage – Applying vocabulary knowledge in sentence-based scenarios.",
    ],
  },
  {
    icon: "📝",
    name: "Reading Comprehension",
    image: "/images/ati-teas/03_reading.png",
    topics: [
      "Main Idea & Detail – Identifying central themes and supporting information.",
      "Inference & Conclusion – Drawing logical conclusions from passage content.",
      "Vocabulary in Context – Determining word meanings from surrounding text.",
      "Passage Analysis – Analyzing structure, tone, and author's purpose.",
    ],
  },
  {
    icon: "🔬",
    name: "Anatomy & Physiology",
    image: "/images/ati-teas/01_science.png",
    topics: [
      "Cardiovascular System – Heart structure, blood flow, and circulation.",
      "Respiratory System – Gas exchange, lung anatomy, and breathing mechanics.",
      "Renal System – Kidney function, filtration, and fluid balance.",
      "Nervous System – Neuron structure, brain regions, and signal transmission.",
    ],
  },
  {
    icon: "📗",
    name: "Grammar",
    image: "/images/ati-teas/04_english_language_usage.png",
    topics: [
      "Parts of Speech – Nouns, verbs, adjectives, adverbs, and their functions.",
      "Sentence Structure – Subject-verb agreement, clauses, and phrase construction.",
      "Punctuation Rules – Commas, semicolons, colons, and apostrophe usage.",
      "Common Errors – Run-on sentences, fragments, and misplaced modifiers.",
    ],
  },
];

export const RN_NURSING_CATEGORIES: SubjectTopic[] = [
  {
    icon: "🎓",
    name: "RN HESI Exams",
    image: "/images/lpn-nursing/01_hesi_exam_review.png",
    topics: [
      "Targeted practice aligned with HESI testing standards for Med-Surg, Mental Health, Maternal-Newborn, and Fundamentals.",
      "Build confidence with detailed rationales and adaptive quizzes.",
      "Strengthen weak areas quickly using performance analytics.",
    ],
  },
  {
    icon: "📘",
    name: "RN ATI Exams",
    image: "/images/lpn-nursing/02_ati_practice.png",
    topics: [
      "Comprehensive question sets covering Med-Surg, Mental Health, Maternal-Newborn, and Fundamentals.",
      "Realistic scenarios to refine clinical reasoning skills.",
      "Customizable quizzes for focused preparation.",
    ],
  },
  {
    icon: "✳️",
    name: "ATI Exit Exams (RN)",
    image: "/images/lpn-nursing/03_medical_surgical.png",
    topics: [
      "End-of-program practice designed to match exit exam style.",
      "Identify knowledge gaps before graduation.",
      "Timed assessments replicate actual testing pressure.",
    ],
  },
  {
    icon: "🎓",
    name: "HESI Exit Exams (RN)",
    image: "/images/lpn-nursing/04_hesi_comprehensive.png",
    topics: [
      "Extensive question banks modeled after RN exit exams.",
      "Covers Med-Surg, Mental Health, Maternal-Newborn, and Fundamentals.",
      "Build readiness with progressive difficulty levels.",
    ],
  },
  {
    icon: "💻",
    name: "EXAMPLIFY PRACTICE",
    image: "/images/lpn-nursing/05_examplify.png",
    topics: [
      "Practice Med-Surg, Mental Health, Maternal & Newborn, Fundamentals of Nursing, and Dosage Calculation in an authentic testing interface.",
      "Gain familiarity with digital exam tools and reduce test-day anxiety.",
      "Access standalone practice questions, custom test builders, and readiness assessments.",
    ],
  },
];

export const GED_SUBJECTS: SubjectTopic[] = [
  {
    icon: "📐",
    name: "Mathematical Reasoning",
    topics: [
      "Number Operations – Fractions, decimals, percents, and negative numbers.",
      "Algebra – Linear equations, inequalities, functions, and graphing.",
      "Geometry – Area, volume, slope, and coordinate plane.",
      "Data Analysis – Statistics, probability, and interpreting charts and graphs.",
    ],
  },
  {
    icon: "🔬",
    name: "Science",
    topics: [
      "Life Science – Cells, genetics, evolution, and human body systems.",
      "Physical Science – Matter, energy, forces, and chemical reactions.",
      "Earth & Space Science – Plate tectonics, weather, and astronomy.",
      "Scientific Reasoning – Experimental design, data interpretation, and hypothesis testing.",
    ],
  },
  {
    icon: "📚",
    name: "Social Studies",
    topics: [
      "Civics & Government – Constitution, branches of government, and citizen rights.",
      "U.S. History – Colonial era through modern times, key events and figures.",
      "Economics – Supply and demand, market systems, and personal finance.",
      "Geography – Maps, climate, resources, and global interconnectedness.",
    ],
  },
  {
    icon: "✍️",
    name: "Reasoning Through Language Arts",
    topics: [
      "Reading Comprehension – Main idea, inference, and text analysis.",
      "Grammar & Usage – Sentence structure, punctuation, and common errors.",
      "Writing – Essay organization, thesis development, and revision strategies.",
      "Informational Text – Analyzing arguments, identifying bias, and evaluating sources.",
    ],
  },
];

export const CNA_SUBJECTS: SubjectTopic[] = [
  {
    icon: "🩺",
    name: "Patient Care Skills",
    topics: [
      "Activities of Daily Living (ADLs) – Bathing, dressing, grooming, and feeding.",
      "Mobility & Positioning – Transferring, ambulation, and range-of-motion exercises.",
      "Vital Signs – Temperature, pulse, respiration, blood pressure, and pain assessment.",
      "Hygiene & Comfort – Oral care, catheter care, and bed making.",
    ],
  },
  {
    icon: "🛡️",
    name: "Safety & Infection Control",
    topics: [
      "Standard Precautions – Hand hygiene, PPE, and barrier techniques.",
      "Body Mechanics – Proper lifting, transferring, and positioning to prevent injury.",
      "Fire Safety – Evacuation procedures, fire extinguisher use, and emergency protocols.",
      "Infection Prevention – Sterilization, disinfection, and isolation procedures.",
    ],
  },
  {
    icon: "🧠",
    name: "Nursing Assistant Responsibilities",
    topics: [
      "Communication – Therapeutic communication, reporting, and documentation.",
      "Patient Rights – Confidentiality, dignity, informed consent, and advance directives.",
      "Legal & Ethical – Scope of practice, negligence, and abuse reporting requirements.",
      "Teamwork – Working with nurses, physicians, and other healthcare team members.",
    ],
  },
  {
    icon: "❤️",
    name: "Mental Health & Social Services",
    topics: [
      "Mental Health Basics – Recognizing signs of depression, anxiety, and dementia.",
      "Communication with Cognitively Impaired – Validation therapy and redirection techniques.",
      "Social Services – Community resources, discharge planning, and patient advocacy.",
      "Death & Dying – End-of-life care, grief support, and postmortem procedures.",
    ],
  },
];

export const LPN_NURSING_CATEGORIES: SubjectTopic[] = [
  {
    icon: "🎓",
    name: "LPN HESI Exams",
    image: "/images/lpn-nursing/01_hesi_exam_review.png",
    topics: [
      "Comprehensive practice for Med-Surg, Mental Health, Maternal-Newborn, and Fundamentals.",
      "Adaptive quizzes with detailed feedback to identify strengths and weaknesses.",
      "Analytics to monitor progress and fine-tune study plans.",
    ],
  },
  {
    icon: "📘",
    name: "LPN ATI Exams",
    image: "/images/lpn-nursing/02_ati_practice.png",
    topics: [
      "Broad coverage across Med-Surg, Mental Health, Maternal-Newborn, and Fundamentals.",
      "Case-based questions to strengthen clinical judgment.",
      "Custom quizzes allow targeted review of challenging areas.",
    ],
  },
  {
    icon: "✳️",
    name: "ATI Exit Exams (LPN)",
    image: "/images/lpn-nursing/03_medical_surgical.png",
    topics: [
      "Simulated end-of-program tests for accurate readiness checks.",
      "Pinpoint areas needing reinforcement before graduation.",
      "Timed tests mimic real-world pressure for better preparation.",
    ],
  },
  {
    icon: "🎓",
    name: "HESI Exit Exams (LPN)",
    image: "/images/lpn-nursing/04_hesi_comprehensive.png",
    topics: [
      "Exhaustive bank designed for practical nursing exit exam formats.",
      "Includes Med-Surg, Mental Health, Maternal-Newborn, and Fundamentals sections.",
      "Progressive difficulty levels prepare you for every scenario.",
    ],
  },
  {
    icon: "💻",
    name: "EXAMPLIFY PRACTICE",
    image: "/images/lpn-nursing/05_examplify.png",
    topics: [
      "Hands-on drills in Med-Surg, Mental Health, Maternal-Newborn, Fundamentals, and Dosage Calculation within a realistic testing environment.",
      "Become comfortable with digital exam tools and reduce test-day stress.",
      "Access to standalone practice items, custom test creation, and readiness scoring.",
    ],
  },
];
