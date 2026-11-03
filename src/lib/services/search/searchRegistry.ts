// Client-side search registry to allow instant (0ms) lookup of subjects and exams
// loaded across dashboard pages, combined with global dynamic backend search.

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface DynamicSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: "Exam" | "Subject / Course" | "Exam Bank" | "Dashboard Tool" | "Navigation";
  href: string;
  badge?: string;
  panelSlug?: string;
  keywords?: string;
}

interface RegisteredSubject {
  id: string;
  guidId?: string;
  name: string;
  examCount?: number;
  courseId: string;
  courseSlug: string;
  courseName: string;
  panelSlug: string;
}

interface RegisteredExam {
  id: string;
  guidId?: string;
  title: string;
  subjectId?: string;
  subjectName?: string;
  courseName?: string;
  panelSlug: string;
  year?: number | string;
  season?: string;
  questionsCount?: number;
}

const registeredSubjects = new Map<string, RegisteredSubject>();
const registeredExams = new Map<string, RegisteredExam>();

/**
 * Register subjects loaded on a page (e.g. in CourseSubjectsPage).
 */
export function registerSearchSubjects(
  panelSlug: string,
  courseSlug: string,
  courseId: string,
  courseName: string,
  subjects: Array<{ id: number | string; guidId?: string; name: string; examCount?: number; slug?: string }>
) {
  if (!Array.isArray(subjects)) return;

  subjects.forEach((s) => {
    const key = `${panelSlug}:${courseId}:${s.guidId || s.id}`;
    registeredSubjects.set(key, {
      id: String(s.id),
      guidId: s.guidId,
      name: s.name,
      examCount: s.examCount,
      courseId,
      courseSlug: courseSlug || toSlug(courseName || "general"),
      courseName: courseName || "",
      panelSlug: panelSlug || "rn-nursing",
    });
  });
}

/**
 * Register exams loaded on a page (e.g. in SubjectExamsHierarchyPage).
 */
export function registerSearchExams(
  panelSlug: string,
  subjectId: string,
  subjectName: string,
  exams: Array<{
    id: number | string;
    guidId?: string;
    title: string;
    courseName?: string;
    year?: number | string;
    season?: string;
    questionsCount?: number;
  }>
) {
  if (!Array.isArray(exams)) return;

  exams.forEach((e) => {
    const key = `${panelSlug}:${e.guidId || e.id}`;
    registeredExams.set(key, {
      id: String(e.id),
      guidId: e.guidId,
      title: e.title,
      subjectId,
      subjectName,
      courseName: e.courseName,
      panelSlug: panelSlug || "rn-nursing",
      year: e.year,
      season: e.season,
      questionsCount: e.questionsCount,
    });
  });
}

/**
 * Search the in-memory client registry instantly.
 */
export function searchClientRegistry(query: string, currentPanel?: string): DynamicSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const rawTerms = q.split(/[\s\-_]+/).filter(Boolean);
  if (rawTerms.length === 0) return [];

  // Filter out standalone "exam", "test", numbers to match subjects when composite queries are typed
  const nonExamTerms = rawTerms.filter((t) => !/^(?:exam|exams|test|tests|\d+)$/i.test(t));
  const examNumberMatch = q.match(/(?:exam|test)[\s\-_]*(\d+)/i) || q.match(/\b(\d+)\b/);
  const examNumber = examNumberMatch ? examNumberMatch[1] : null;

  const results: DynamicSearchResult[] = [];
  const seenIds = new Set<string>();

  // 1. Search registered exams
  registeredExams.forEach((exam) => {
    const fullText = `${exam.title} ${exam.subjectName || ""} ${exam.courseName || ""} ${exam.year || ""} ${exam.season || ""}`.toLowerCase();
    const isMatch = rawTerms.every((t) => fullText.includes(t));
    if (isMatch) {
      const examIdentifier = exam.guidId || exam.id;
      const href = `/web/${exam.panelSlug || currentPanel || "rn-nursing"}/vista/exam/generic?mode=Practice&identifier=${examIdentifier}`;
      const uniqueId = `exam-${examIdentifier}`;
      if (!seenIds.has(uniqueId)) {
        seenIds.add(uniqueId);
        results.push({
          id: uniqueId,
          title: exam.title,
          subtitle: [exam.subjectName, exam.season, exam.year ? String(exam.year) : null]
            .filter(Boolean)
            .join(" • ") || "Practice Examination",
          category: "Exam",
          href,
          badge: exam.questionsCount ? `${exam.questionsCount} Questions` : "Exam",
          panelSlug: exam.panelSlug,
        });
      }
    }
  });

  // 2. Search registered subjects
  registeredSubjects.forEach((sub) => {
    const fullText = `${sub.name} ${sub.courseName} ${sub.panelSlug}`.toLowerCase();

    // Check if query matches subject (either full terms or non-exam terms if composite)
    const exactMatch = rawTerms.every((t) => fullText.includes(t));
    const compositeSubjectMatch = nonExamTerms.length > 0 && nonExamTerms.every((t) => fullText.includes(t));

    const identifier = sub.guidId || sub.id;
    const cleanSubName = sub.name.replace(/\s*\(.*?\)\s*/g, "").trim();
    const subjectHref = `/dashboards/${sub.panelSlug}/exams/${sub.courseSlug}/${sub.courseId}/exams/${identifier}?subjectName=${encodeURIComponent(sub.name)}`;

    // If the query specified an exam under this subject (e.g. "Pathophysiology Exam-2")
    if (compositeSubjectMatch && examNumber && sub.examCount && sub.examCount > 0) {
      const examTitle = `${cleanSubName} Exam-${examNumber}`;
      const examResultId = `inferred-exam-${identifier}-${examNumber}`;
      if (!seenIds.has(examResultId)) {
        seenIds.add(examResultId);
        results.unshift({
          id: examResultId,
          title: examTitle,
          subtitle: `${sub.name} • Exam ${examNumber} of ${sub.examCount}`,
          category: "Exam",
          href: subjectHref,
          badge: `Exam #${examNumber}`,
          panelSlug: sub.panelSlug,
        });
      }
    }

    // Add subject card result
    if ((exactMatch || compositeSubjectMatch) && !seenIds.has(`subject-${identifier}`)) {
      seenIds.add(`subject-${identifier}`);
      results.push({
        id: `subject-${identifier}`,
        title: sub.name,
        subtitle: `${sub.courseName ? `${sub.courseName} • ` : ""}${sub.examCount ?? 0} Exams available`,
        category: "Subject / Course",
        href: subjectHref,
        badge: sub.examCount ? `${sub.examCount} Exams` : "Subject",
        panelSlug: sub.panelSlug,
      });
    }
  });

  return results;
}
