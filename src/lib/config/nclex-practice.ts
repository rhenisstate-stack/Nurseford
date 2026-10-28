export type NclexExamType = "nclex-rn" | "nclex-pn";

export interface NclexPracticeGroup {
  domainsGroupId: string;
  label: string;
  subjectGuidId: string;
}

// NCLEX practice/readiness parents on the .NET backend.
//
// Real .NET backend Subject IDs:
//   NCLEX-RN  practice  -> Subject 120 -> "NCLEX RN (Practice Exams)"
//   NCLEX-RN  readiness -> Subject 121 -> "NCLEX RN- (Readiness Assessment Test)"
//   NCLEX-PN  practice  -> Subject 110 -> "NCLEX-PN (Practice Exams)"
//   NCLEX-PN  readiness -> Subject 111 -> "NCLEX PN-(Readiness Assessment Test)"
//
// Legacy PHP domain-group ids:
//   RN practice (27), RN readiness (28), PN practice (5), PN readiness (30).
export const NCLEX_PRACTICE_CONFIG: Record<NclexExamType, { practice: NclexPracticeGroup; readiness: NclexPracticeGroup }> = {
  "nclex-rn": {
    practice: {
      domainsGroupId: "120",
      label: "NCLEX RN (Practice Exams)",
      subjectGuidId: "120",
    },
    readiness: {
      domainsGroupId: "121",
      label: "NCLEX RN- (Readiness Assessment Test)",
      subjectGuidId: "121",
    },
  },
  "nclex-pn": {
    practice: {
      domainsGroupId: "110",
      label: "NCLEX-PN (Practice Exams)",
      subjectGuidId: "110",
    },
    readiness: {
      domainsGroupId: "111",
      label: "NCLEX PN-(Readiness Assessment Test)",
      subjectGuidId: "111",
    },
  },
};