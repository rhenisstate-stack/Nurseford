/**
 * Canonical subject ordering across all dashboards and views.
 *
 * Guaranteed order matching standard clinical curriculum:
 * 1. Med-Surg / Medical-Surgical
 * 2. Adult Health
 * 3. Pediatrics
 * 4. Maternal & Newborn Care
 * 5. Mental Health
 * 6. Fundamentals of Nursing
 * 7. Pharmacology
 * 8. Capstone
 * 9. Dosage Calculation
 * 10. Health Assessment
 * 11. Leadership
 * 12. Community Health
 * 13. Nutrition
 * 14. Custom Exams
 * 15. Concept-Based Assessment Level Exams
 * 16. Critical Care
 * 17. Pathophysiology
 * 18. Anatomy & Physiology
 * 19. Gerontology
 * 20. Milestone Exams
 * 21. Exit & Comprehensive Predictor Exams
 */

export function getSubjectRank(subjectName?: string | null): number {
  if (!subjectName || typeof subjectName !== "string") return 999;
  const n = subjectName.toLowerCase().replace(/rhenis\s*/gi, "").trim();

  // 1. Med-Surg (Medical-Surgical)
  if (/(?:med[\s\-]*surg|medical[\s\-]*surgical)/i.test(n) && !/^adult[\s\-]*health/i.test(n)) {
    return 1;
  }

  // 2. Adult Health
  if (/adult[\s\-]*health/i.test(n)) {
    return 2;
  }

  // 3. Pediatrics & Child Health
  if (/(?:pediatric|peds|child)/i.test(n)) {
    return 3;
  }

  // 4. Maternal & Newborn Care
  if (/(?:matern|newborn|obstetric|perinatal)/i.test(n)) {
    return 4;
  }

  // 5. Mental Health & Psych
  if (/(?:mental[\s\-]*health|psych)/i.test(n)) {
    return 5;
  }

  // 6. Fundamentals of Nursing
  if (/(?:fundament|foundation)/i.test(n)) {
    return 6;
  }

  // 7. Pharmacology
  if (/(?:pharm(?:acol)?)/i.test(n)) {
    return 7;
  }

  // 8. Capstone
  if (/capstone/i.test(n)) {
    return 8;
  }

  // 9. Dosage Calculation
  if (/(?:dosage|calc(?:ulat)?)/i.test(n)) {
    return 9;
  }

  // 10. Health Assessment
  if (/(?:health[\s\-]*assessment|physical[\s\-]*assessment|\bassessment\s*rn\b|\bassessment\s*pn\b)/i.test(n)) {
    return 10;
  }

  // 11. Leadership & Management
  if (/(?:leadership|management)/i.test(n)) {
    return 11;
  }

  // 12. Community Health
  if (/(?:community|public[\s\-]*health)/i.test(n)) {
    return 12;
  }

  // 13. Nutrition
  if (/nutrition/i.test(n)) {
    return 13;
  }

  // 14. Custom RN / PN Exams
  if (/custom/i.test(n)) {
    return 14;
  }

  // 15. Concept-Based Assessment Level Exams
  if (/concept/i.test(n)) {
    return 15;
  }

  // 16. Critical Care
  if (/(?:critical[\s\-]*care|intensive[\s\-]*care|emergency|\bicu\b)/i.test(n)) {
    return 16;
  }

  // 17. Pathophysiology
  if (/(?:pathophysiol|pathology)/i.test(n)) {
    return 17;
  }

  // 18. Anatomy & Physiology
  if (/(?:anatom|physiol)/i.test(n)) {
    return 18;
  }

  // 19. Gerontological / Geriatric
  if (/(?:gerontol|geriatric)/i.test(n)) {
    return 19;
  }

  // 20. Milestone Hesi Exams
  if (/milestone/i.test(n)) {
    return 20;
  }

  // 21. Exit & Comprehensive Predictor Exams
  if (/(?:exit|predictor)/i.test(n)) {
    return 21;
  }

  return 50;
}

export function compareSubjects(aName?: string | null, bName?: string | null): number {
  const rankA = getSubjectRank(aName);
  const rankB = getSubjectRank(bName);
  if (rankA !== rankB) return rankA - rankB;
  return (aName || "").localeCompare(bName || "");
}

export default compareSubjects;
