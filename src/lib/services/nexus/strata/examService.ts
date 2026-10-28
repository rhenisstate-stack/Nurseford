import { apiFetch } from "@/lib/api/api/api";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ACTION GROUPS

export type ExamActionGroup =
  | "ExamAnswers"
  | "ExamActions"
  | "QuestionActions"
  | "ExamLifecycle"
  | "ExamPreferences";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// EXAM SUBMISSION TYPES

export type ExamSubmissionType =

  // Question Types
  | "ActionSingleChoice"
  | "ActionMultipleSelect"
  | "ActionTrueFalse"
  | "ActionNumericResponse"
  | "ActionMatching"
  | "ActionOrderingNumber"
  | "ActionOrderingItem"
  | "ActionOrderingDragDrop"
  | "ActionDynamicImage"
  | "ActionMultipleImage"
  | "ActionBlankSelect"
  | "ActionBlankFill"
  | "ActionHotspot"
  | "ActionOpenEnded"
  | "ActionHighLight"
  | "ActionAudioBased"
  | "ActionVideoBased"
  | "ActionMatrixSingleChoice"
  | "ActionMatrixMultipleSelect"

  // Question Types — case-based
  | "ActionCaseBased"
  | "ActionCaseBasedSingleChoice"
  | "ActionCaseBasedMultipleSelect"
  | "ActionCaseBasedTrueFalse"
  | "ActionCaseBasedNumericResponse"
  | "ActionCaseBasedMatching"
  | "ActionCaseBasedOrderingNumber"
  | "ActionCaseBasedOrderingItem"
  | "ActionCaseBasedOrderingDragDrop"
  | "ActionCaseBasedDynamicImage"
  | "ActionCaseBasedMultipleImage"
  | "ActionCaseBasedBlankSelect"
  | "ActionCaseBasedBlankFill"
  | "ActionCaseBasedHotspot"
  | "ActionCaseBasedOpenEnded"
  | "ActionCaseBasedMatrixSingleChoice"
  | "ActionCaseBasedMatrixMultipleSelect"
  | "ActionCaseBasedHighLight"
  | "ActionCaseBasedAudioBased"
  | "ActionCaseBasedVideoBased"

  // Exam Tools
  | "ActionExamFlag"
  | "ActionExamBookmark"
  | "ActionExamStar"
  | "ActionExamPin"
  | "ActionExamFeedback"

  // Question Tools
  | "ActionQuestionFlag"
  | "ActionQuestionBookmark"
  | "ActionQuestionStar"
  | "ActionQuestionPin"
  | "ActionQuestionFeedback"

  // Lifecycle
  | "ActionExamDuration"
  | "ActionExamTerminate"
  | "ActionExamPause"
  | "ActionExamResume"
  | "ActionExamSubmit"

  // Preferences
  | "ActionExamLayout"
  | "ActionExamTheme"
  | "ActionExamMode"
  | "ActionExamStatus";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// INTERNAL BASE ROUTE

const INTERNAL_BASE_URL =  "/api/nexus/strata/assessment/exam/upserts";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// SUBMISSION → GROUP

const SUBMISSION_TO_GROUP: Record<
  ExamSubmissionType,
  ExamActionGroup
> = {

  // Answers
 ActionSingleChoice: "ExamAnswers",
  ActionMultipleSelect: "ExamAnswers",
  ActionTrueFalse: "ExamAnswers",
  ActionNumericResponse: "ExamAnswers",
  ActionMatching: "ExamAnswers",
  ActionOrderingNumber: "ExamAnswers",
  ActionOrderingItem: "ExamAnswers",
  ActionOrderingDragDrop: "ExamAnswers",
  ActionDynamicImage: "ExamAnswers",
  ActionMultipleImage: "ExamAnswers",
  ActionBlankSelect: "ExamAnswers",
  ActionBlankFill: "ExamAnswers",
  ActionHotspot: "ExamAnswers",
  ActionOpenEnded: "ExamAnswers",
  ActionHighLight: "ExamAnswers",
  ActionAudioBased: "ExamAnswers",
  ActionVideoBased: "ExamAnswers",
  ActionMatrixSingleChoice: "ExamAnswers",
  ActionMatrixMultipleSelect: "ExamAnswers",

  // Answers — case-based
  ActionCaseBased: "ExamAnswers",
  ActionCaseBasedSingleChoice: "ExamAnswers",
  ActionCaseBasedMultipleSelect: "ExamAnswers",
  ActionCaseBasedTrueFalse: "ExamAnswers",
  ActionCaseBasedNumericResponse: "ExamAnswers",
  ActionCaseBasedMatching: "ExamAnswers",
  ActionCaseBasedOrderingNumber: "ExamAnswers",
  ActionCaseBasedOrderingItem: "ExamAnswers",
  ActionCaseBasedOrderingDragDrop: "ExamAnswers",
  ActionCaseBasedDynamicImage: "ExamAnswers",
  ActionCaseBasedMultipleImage: "ExamAnswers",
  ActionCaseBasedBlankSelect: "ExamAnswers",
  ActionCaseBasedBlankFill: "ExamAnswers",
  ActionCaseBasedHotspot: "ExamAnswers",
  ActionCaseBasedOpenEnded: "ExamAnswers",
  ActionCaseBasedMatrixSingleChoice: "ExamAnswers",
  ActionCaseBasedMatrixMultipleSelect: "ExamAnswers",
  ActionCaseBasedHighLight: "ExamAnswers",
  ActionCaseBasedAudioBased: "ExamAnswers",
  ActionCaseBasedVideoBased: "ExamAnswers",


  // Exam Tools
  ActionExamFlag: "ExamActions",
  ActionExamBookmark: "ExamActions",
  ActionExamStar: "ExamActions",
  ActionExamPin: "ExamActions",
  ActionExamFeedback: "ExamActions",

  // Question Tools
  ActionQuestionFlag: "QuestionActions",
  ActionQuestionBookmark: "QuestionActions",
  ActionQuestionStar: "QuestionActions",
  ActionQuestionPin: "QuestionActions",
  ActionQuestionFeedback: "QuestionActions",

  // Lifecycle
  ActionExamDuration: "ExamLifecycle",
  ActionExamTerminate: "ExamLifecycle",
  ActionExamPause: "ExamLifecycle",
  ActionExamResume: "ExamLifecycle",
  ActionExamSubmit: "ExamLifecycle",

  // Preferences
  ActionExamLayout: "ExamPreferences",
  ActionExamTheme: "ExamPreferences",
  ActionExamMode: "ExamPreferences",
  ActionExamStatus: "ExamPreferences",
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// RESPONSE

export interface ExamServiceResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// PAYLOAD TYPES

export type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, unknown>
  | null;

export interface SubmitAnswerPayload {
  examId?: number;
  examGuidId?: string;
  sectionId?: number;
  sectionGuidId?: string;
  questionId?: number;
  questionGuidId?: string;
  answer: AnswerValue;
}

export interface ExamUxPayload {
  examId?: number;
  examGuidId?: string;
  value: string;
}

export interface ExamLifecyclePayload {
  examId?: number;
  examGuidId?: string;
  reason?: string;
  status?: string;
  residualDuration?: number;
}

export interface ExamActionPayload {
  examId?: number;
  examGuidId?: string;
  sectionId?: number;
  sectionGuidId?: string;
  questionId?: number;
  questionGuidId?: string;
  value?: string | boolean | number;
  actionValue?: string | boolean | number;
  actionContent?: string;
  AationContent?: string;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// CORE SERVICE FUNCTION

export const examServiceCall = async <T = unknown>(
  submissionType: ExamSubmissionType,
  payload?: object
): Promise<ExamServiceResponse<T>> => {

  try {

    // ── Guard: catch unknown submissionType before it becomes a silent 400 ──
    const actionGroup = SUBMISSION_TO_GROUP[submissionType];

    if (!actionGroup) {
      console.error(
        `❌ [examService] Unknown submissionType: "${submissionType}". ` +
        `Must be one of: ${Object.keys(SUBMISSION_TO_GROUP).join(", ")}`
      );
      return {
        error: `Unknown submissionType: "${submissionType}" — check that you are passing the full "Action..." prefix.`,
      };
    }

    // Spread payload first, then enforce submissionType + actionGroup last  ──
    // This prevents a payload key named "actionGroup" from overwriting ours.
    const flatPayload = (payload as Record<string, unknown>) ?? {};

    const rawValue = flatPayload.value !== undefined ? flatPayload.value : flatPayload.actionValue;
    const rawContent =
      flatPayload.actionContent !== undefined ? flatPayload.actionContent : flatPayload.AationContent;

    const bodyObject = {
      ...flatPayload,
      ...(rawValue !== undefined && rawValue !== null
        ? { value: String(rawValue), actionValue: rawValue }
        : {}),
      ...(rawContent !== undefined && rawContent !== null
        ? { actionContent: String(rawContent), AationContent: String(rawContent) }
        : {}),
      submissionType,   // always wins
      actionGroup,      // always wins
    };

    // console.log(`📤 [examService] Submitting → submissionType: "${submissionType}" | actionGroup: "${actionGroup}"`);
    // console.log(`📦 [examService] Full body:`, bodyObject);

    const headers: HeadersInit = {
      ...renderSystemSessionHeaders(),
      "Content-Type": "application/json",
    };

    const result =
      await apiFetch<ExamServiceResponse<T>>(
        INTERNAL_BASE_URL,
        {
          method: "POST",
          headers,
          body: JSON.stringify(bodyObject),
          credentials: "include",
        }
      );

      // console.log( `[examService] Response for "${submissionType}":`,  result  );
    return result;

  } catch (err: unknown) {

    console.error(
      `❌ [examService] "${submissionType}" failed:`,
      err
    );

    return {
      error:
        err instanceof Error
          ? err.message
          : "Unknown exam service error",
    };
  }
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// SERVICE SURFACE

export const examService = {

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // ANSWERS

  submitAnswer(
    submissionType: Extract<
      ExamSubmissionType,
      | "ActionSingleChoice"
      | "ActionMultipleSelect"
      | "ActionTrueFalse"
      | "ActionNumericResponse"
      | "ActionMatching"
      | "ActionOrderingNumber"
      | "ActionOrderingItem"
      | "ActionOrderingDragDrop"
      | "ActionDynamicImage"
      | "ActionMultipleImage"
      | "ActionBlankSelect"
      | "ActionBlankFill"
      | "ActionHotspot"
      | "ActionOpenEnded"
      | "ActionHighLight"
      | "ActionAudioBased"
      | "ActionVideoBased"
      | "ActionMatrixSingleChoice"
      | "ActionMatrixMultipleSelect"
      | "ActionCaseBasedSingleChoice"
      | "ActionCaseBasedMultipleSelect"
      | "ActionCaseBasedTrueFalse"
      | "ActionCaseBasedNumericResponse"
      | "ActionCaseBasedMatching"
      | "ActionCaseBasedOrderingNumber"
      | "ActionCaseBasedOrderingItem"
      | "ActionCaseBasedOrderingDragDrop"
      | "ActionCaseBasedDynamicImage"
      | "ActionCaseBasedMultipleImage"
      | "ActionCaseBasedBlankSelect"
      | "ActionCaseBasedBlankFill"
      | "ActionCaseBasedHotspot"
      | "ActionCaseBasedOpenEnded"
      | "ActionCaseBasedMatrixSingleChoice"
      | "ActionCaseBasedMatrixMultipleSelect"
      | "ActionCaseBasedHighLight"
      | "ActionCaseBasedAudioBased"
      | "ActionCaseBasedVideoBased"
    >,
    payload: SubmitAnswerPayload
  ) {

    return examServiceCall(
      submissionType,
      payload
    );
  },

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // TOOLS
  submitTool(
    submissionType: Extract<
      ExamSubmissionType,
      | "ActionExamFlag"
      | "ActionExamBookmark"
      | "ActionExamStar"
      | "ActionExamPin"
      | "ActionExamFeedback"
      | "ActionQuestionFlag"
      | "ActionQuestionBookmark"
      | "ActionQuestionStar"
      | "ActionQuestionPin"
      | "ActionQuestionFeedback"
    >,
    payload: ExamActionPayload
  ) {
    return examServiceCall(submissionType, payload);
  },

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // LIFECYCLE

  saveResidualDuration(payload: ExamLifecyclePayload) {
    return examServiceCall("ActionExamDuration", payload);
  },

  pauseExam(
    payload: ExamLifecyclePayload
  ) {

    return examServiceCall(
      "ActionExamPause",
      payload
    );
  },

  resumeExam(
    payload: ExamLifecyclePayload
  ) {

    return examServiceCall(
      "ActionExamResume",
      payload
    );
  },

  terminateExam(
    payload: ExamLifecyclePayload
  ) {

    return examServiceCall(
      "ActionExamTerminate",
      payload
    );
  },

  submitExam(
    payload: ExamLifecyclePayload
  ) {

    return examServiceCall(
      "ActionExamSubmit",
      payload
    );
  },

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // PREFERENCES

  updateLayout(
    payload: ExamUxPayload
  ) {

    return examServiceCall(
      "ActionExamLayout",
      payload
    );
  },

  updateTheme(
    payload: ExamUxPayload
  ) {

    return examServiceCall(
      "ActionExamTheme",
      payload
    );
  },

  updateMode(
    payload: ExamUxPayload
  ) {

    return examServiceCall(
      "ActionExamMode",
      payload
    );
  },

  updateStatus(
    payload: ExamUxPayload
  ) {

    return examServiceCall(
      "ActionExamStatus",
      payload
    );
  },
};