/**
 * Utility to sanitize text strings from database records where values like
 * "NULL", "(NULL)", "undefined", or empty strings might inadvertently leak into UI labels.
 */
export function isValidExamText(val?: string | null): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  return !(
    lower === "" ||
    lower === "null" ||
    lower === "(null)" ||
    lower === "- (null)" ||
    lower === "-- (null)" ||
    lower === "- - (null)" ||
    lower === "— (null)" ||
    lower === "undefined" ||
    lower === "(undefined)" ||
    lower === "none" ||
    lower === "(none)" ||
    lower === "n/a" ||
    lower === "(n/a)" ||
    lower === "nan" ||
    /^\s*[-–—]?\s*\(?\s*null\s*\)?\s*$/i.test(trimmed)
  );
}

export function stripHtmlTags(val?: string | null): string {
  if (!val) return "";
  return String(val)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanExamText(val?: string | null): string {
  if (!isValidExamText(val)) return "";
  return val!.trim();
}

/**
 * Sanitizes and dynamically formats exhibit description content:
 * 1. If HTML:
 *    - Strips Word/editor HTML comments (e.g. `<!--[if !supportEmptyParas]-->`).
 *    - Strips synthetic serializer newlines & whitespace between closing and opening HTML tags
 *      (e.g. `</p>\r\n\r\n<p>`) so browsers don't create phantom vertical empty boxes.
 *    - Normalizes soft line-breaks inside inline text (`\r\n` within sentences) into single spaces.
 *    - Strips intrusive Word inline margins (`margin: 0in 0in 11px;`, etc.) from `<p>` style attributes
 *      so dynamic line spacing responds cleanly to user/admin controls.
 *    - Recognizes any ghost empty paragraphs (including those with `<span>&nbsp;</span>`, `<br>`, etc.),
 *      stripping leading/trailing ghost paragraphs and collapsing consecutive empty paragraphs into a clean single spacer.
 * 2. If Plain Text:
 *    - Normalizes newlines and converts double-newlines into `<p>` blocks and single newlines into `<br/>`,
 *      allowing clean dynamic spacing without needing `whitespace-pre-line`.
 */
export function formatExhibitHtml(val?: string | null): string {
  if (!val || typeof val !== "string") return "";
  const trimmed = val.trim();
  if (!trimmed || /^(null|undefined)$/i.test(trimmed)) return "";

  const hasHtml = /<[a-z][\s\S]*>/i.test(trimmed);

  if (!hasHtml) {
    // Plain text: normalize excessive blank lines (collapse 3+ newlines -> 2)
    const normalized = trimmed
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return normalized
      .split(/\n\n+/)
      .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }

  // HTML content:
  // 1. Remove HTML comments (e.g. Word/editor comments like <!--[if !supportEmptyParas]-->)
  let cleaned = trimmed.replace(/<!--[\s\S]*?-->/g, "");

  // 2. Strip synthetic serializer newlines & whitespace between closing and opening HTML tags
  cleaned = cleaned.replace(/>\s*[\r\n]+\s*</g, "><");

  // Helper to test if a paragraph has any visible text
  const isParagraphEmpty = (inner: string): boolean => {
    const textOnly = inner
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, "")
      .replace(/&#160;/gi, "")
      .replace(/\u00A0/g, "")
      .trim();
    return textOnly.length === 0;
  };

  // 3. Parse <p> tags, strip intrusive Word inline margins, collapse consecutive empty paragraphs,
  // and eliminate leading/trailing empty ghost paragraphs
  const pRegex = /<p\b([^>]*)>([\s\S]*?)<\/p>/gi;
  interface Part {
    type: "p" | "other";
    attrs?: string;
    inner?: string;
    empty?: boolean;
    content?: string;
  }
  const parts: Part[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "other", content: cleaned.slice(lastIndex, match.index) });
    }
    const attrs = match[1];
    const inner = match[2];
    const empty = isParagraphEmpty(inner);
    parts.push({ type: "p", attrs, inner, empty });
    lastIndex = pRegex.lastIndex;
  }
  if (lastIndex < cleaned.length) {
    parts.push({ type: "other", content: cleaned.slice(lastIndex) });
  }

  // Strip leading empty paragraphs
  while (parts.length > 0 && parts[0].type === "p" && parts[0].empty) {
    parts.shift();
  }
  // Strip trailing empty paragraphs
  while (parts.length > 0 && parts[parts.length - 1].type === "p" && parts[parts.length - 1].empty) {
    parts.pop();
  }

  // Build sanitized markup: single empty paragraph becomes intentional spacer, consecutive empty paragraphs collapse
  const result: string[] = [];
  let prevWasEmpty = false;
  for (const part of parts) {
    if (part.type === "p") {
      if (part.empty) {
        if (!prevWasEmpty) {
          result.push('<p class="exhibit-spacer"><br/></p>');
          prevWasEmpty = true;
        }
      } else {
        // Strip intrusive Word/editor inline margins & fixed line-height from attrs
        const cleanAttrs = (part.attrs || "").replace(/style=(["'])(.*?)\1/gi, (_, quote, styleStr) => {
          const cleanedStyle = styleStr
            .replace(/\bmargin(-top|-bottom|-left|-right)?\s*:\s*[^;]+;?/gi, "")
            .replace(/\bline-height\s*:\s*[^;]+;?/gi, "")
            .trim();
          return cleanedStyle ? `style=${quote}${cleanedStyle}${quote}` : "";
        });
        // Normalize soft breaks inside paragraph text
        const normalizedInner = (part.inner || "").replace(/\s*[\r\n]+\s*/g, " ");
        result.push(`<p${cleanAttrs}>${normalizedInner}</p>`);
        prevWasEmpty = false;
      }
    } else {
      result.push(part.content || "");
      prevWasEmpty = false;
    }
  }

  return result.join("").trim();
}

export function cleanTabTitle(title?: string | null): string {
  if (!title) return "";
  const plain = stripHtmlTags(title);
  return isValidExamText(plain) ? plain : "";
}

export function cleanOptionText(text?: string | null): string {
  if (!text) return "";
  let cleaned = text
    .replace(/\s*[-–—]?\s*\((?:null|undefined|none|nan|n\/a)\)/gi, "")
    .replace(/\s*[-–—]?\s*\b(?:null|undefined)\b/gi, "")
    .trim();

  // If text contains HTML tags (like <div>, <p>, <strong>), strip them so raw tags don't leak into options
  if (/<[^>]+>/.test(cleaned)) {
    cleaned = stripHtmlTags(cleaned);
  }

  return isValidExamText(cleaned) ? cleaned : "";
}

export interface CaseContentLike {
  id: number;
  title?: string | null;
  description?: string | null;
  prerequisites?: string | null;
}

/**
 * Filters and sanitizes case study / exhibit tabs:
 * 1. Rejects internal question sentence metadata (e.g. BlankSelectData)
 * 2. Rejects duplicate entries of the main question prompt
 * 3. Rejects entries where both title and description are empty/null
 * 4. Deduplicates tabs by normalized title (resolves duplicate tabs when both CaseBasedData and CaseStudyData exist)
 */
export function filterExhibitTabs<T extends CaseContentLike>(
  contents: T[] = [],
  questionText?: string | null
): T[] {
  const cleanQText = stripHtmlTags(questionText).toLowerCase().trim();

  const valid = contents.filter((c) => {
    const rawTitle = (c.title ?? "").trim();
    const rawDesc = (c.description ?? "").trim();
    const cleanTitle = cleanTabTitle(rawTitle);
    const cleanDesc = stripHtmlTags(rawDesc);

    // 1. Must have valid title or description
    if (!cleanTitle && !cleanDesc) return false;

    // 2. Reject internal question data markers (like BlankSelect question sentence)
    const prereq = (c.prerequisites ?? "").toLowerCase().trim();
    if (prereq === "blankselectdata" || prereq.includes("blankselect")) return false;
    if (cleanDesc.toLowerCase().includes("blank select question sentence")) return false;

    // 3. Reject duplicate of the question prompt/stem
    if (cleanQText && cleanQText.length >= 10) {
      if (cleanTitle.toLowerCase() === cleanQText) return false;
      if (cleanDesc.toLowerCase() === cleanQText && !cleanTitle) return false;
    }

    return true;
  });

  // Deduplicate twin clone exhibits:
  // Only filters out entries that are TRUE duplicates (identical title AND identical content).
  // If two exhibits share the same title but have DIFFERENT descriptions (e.g. multiple progress notes),
  // BOTH are kept so nothing legitimate is ever blocked.
  const result: T[] = [];
  const seenSignatures = new Set<string>();

  for (const c of valid) {
    const titleKey = cleanTabTitle(c.title).toLowerCase().trim() || "clinical notes";
    const descKey = stripHtmlTags(c.description ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    const signature = `${titleKey}:::${descKey}`;

    if (seenSignatures.has(signature)) {
      // Identical twin clone (same title and identical text) -> safe to omit
      continue;
    }

    seenSignatures.add(signature);
    result.push(c);
  }

  return result;
}

/**
 * Resolves the display text and optional rationale for a question option.
 * If option/answerContent is a generic placeholder like "Option 1", "Option A", "1", "A",
 * and description contains the actual answer text, it promotes description to the primary text.
 */
export function resolveOptionDisplay(
  opt: {
    answerContent?: string | null;
    option?: string | null;
    description?: string | null;
  },
  showFeedback: boolean = false
): { primaryText: string; secondaryText?: string } {
  const isGeneric = (s?: string | null) => {
    if (!s) return true;
    const t = s.trim().toLowerCase();
    return !t || /^(option|item|choice|finding|row|column)\s*[\d\w]*$/i.test(t) || /^[a-z\d]$/i.test(t);
  };

  const primaryCandidate = cleanOptionText(opt.answerContent || opt.option);
  const descCandidate = cleanOptionText(opt.description);

  // If primary candidate is generic or empty, and description has meaningful text, promote description
  if ((!primaryCandidate || isGeneric(primaryCandidate)) && descCandidate && !isGeneric(descCandidate)) {
    return {
      primaryText: descCandidate,
    };
  }

  // Otherwise, use primaryCandidate (or fallback to descCandidate)
  const primary = primaryCandidate || descCandidate || opt.answerContent || opt.option || "";
  const secondary = showFeedback && descCandidate && descCandidate !== primary ? descCandidate : undefined;

  return {
    primaryText: primary,
    secondaryText: secondary,
  };
}
