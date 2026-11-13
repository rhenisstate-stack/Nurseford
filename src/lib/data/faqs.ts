export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  category: string;
  tint: string;
  headerBg: string;
  headerText: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: "General Information",
    tint: "coral",
    headerBg: "bg-coral/10",
    headerText: "text-coral",
    items: [
      {
        question: "What is Nurseford?",
        answer:
          "Nurseford is an online platform providing comprehensive nursing exam preparation, including specialized RN Nursing, LPN Nursing, and RN/LPN Exit Exam Q-Banks. Our resources cover Med-Surg, Fundamentals, Maternal-Newborn, Mental Health, Pediatrics, Pharmacology, and more.",
      },
      {
        question: "Who can benefit from Nurseford?",
        answer:
          "RN and LPN nursing students, graduates preparing for exit exams, practicing nurses refreshing their knowledge, and educators seeking reliable question banks can all benefit.",
      },
      {
        question: "What makes Nurseford different from other prep sites?",
        answer:
          "We offer exam-blueprint-aligned content, rationales for every answer, adaptive practice modes, performance tracking, and coverage across multiple nursing specialties—all designed by experienced nurse educators.",
      },
      {
        question: "Is Nurseford suitable for international nursing exams?",
        answer:
          "Yes! Many international nursing students use Nurseford to strengthen their knowledge of core RN/LPN nursing concepts, pharmacology, and clinical reasoning.",
      },
      {
        question: "Does Nurseford offer guidance on study strategies?",
        answer:
          "Absolutely. Alongside our practice questions, we provide expert tips, time-management strategies, and exam-day techniques to help you study smarter and boost your confidence.",
      },
    ],
  },
  {
    category: "Content and Features",
    tint: "sage",
    headerBg: "bg-sage/10",
    headerText: "text-sage",
    items: [
      {
        question: "Which exams are supported?",
        answer:
          "RN Nursing Q-Bank, LPN Nursing Q-Bank, RN Exit Exams, and LPN Exit Exams across Med-Surg, Fundamentals, Maternal-Newborn, Mental Health, Pediatrics, Pharmacology, and more.",
      },
      {
        question: "How many practice questions are available?",
        answer:
          "We offer thousands of high-quality questions that mimic real exam formats, including alternate-format questions (SATA, drag-and-drop, hotspot).",
      },
      {
        question: "Are the questions updated to the latest exam standards?",
        answer:
          "Absolutely. Our team reviews and updates all content to reflect the most current nursing school and exit exam blueprints.",
      },
      {
        question: "Do the questions include rationales?",
        answer:
          "Yes. Each question includes detailed rationales explaining why the correct answer is right and why other options are incorrect, strengthening your critical-thinking skills.",
      },
      {
        question: "Can I track my performance?",
        answer:
          "Yes. Our performance analytics dashboard highlights strengths and weaknesses, so you can focus on areas needing improvement.",
      },
    ],
  },
  {
    category: "Access and Pricing",
    tint: "navy",
    headerBg: "bg-navy/10",
    headerText: "text-navy",
    items: [
      {
        question: "How do I sign up and start practicing?",
        answer:
          "Click Register on the homepage, create an account, choose a subscription plan in the dashboard, and immediately access the Q-Bank and practice exams.",
      },
      {
        question: "What plans or pricing options are available?",
        answer:
          "We offer flexible plans—monthly, quarterly, and yearly subscriptions—to fit your study schedule and budget.",
      },
      {
        question: "Is there a free trial or sample questions?",
        answer:
          "Yes. You can try a limited selection of free questions before committing to a paid plan.",
      },
      {
        question: "Can I cancel my subscription?",
        answer:
          "Yes. Subscriptions can be canceled anytime before the next billing cycle. Review our refund policy for details.",
      },
      {
        question: "Can I upgrade my plan later if I need more features?",
        answer:
          "Yes. You can upgrade at any time—your progress and performance data will transfer seamlessly to your new plan.",
      },
    ],
  },
  {
    category: "Technical and Support",
    tint: "border-light",
    headerBg: "bg-border-light/20",
    headerText: "text-navy-light",
    items: [
      {
        question: "Can I access Nurseford on mobile devices?",
        answer:
          "Absolutely. The platform is mobile-responsive, so you can study on your phone or tablet anywhere.",
      },
      {
        question: "What should I do if I forget my password?",
        answer:
          'Use the "Forgot Password?" link on the login page to reset your password via your registered email.',
      },
      {
        question: "How can I contact support?",
        answer:
          "Reach our team through the Contact Us form on the website or by email. We aim to respond within 24–48 hours.",
      },
      {
        question: "Does Nurseford work on tablets or mobile browsers?",
        answer:
          "Yes. Our platform is fully responsive and optimized for desktops, tablets, and mobile devices so you can study on the go.",
      },
      {
        question: "Are my test scores and personal information secure?",
        answer:
          "Absolutely. Nurseford uses industry-standard encryption and strict privacy practices to protect your data and exam results.",
      },
    ],
  },
];

export const ALL_FAQS: FaqItem[] = FAQ_CATEGORIES.flatMap((group) => group.items);
