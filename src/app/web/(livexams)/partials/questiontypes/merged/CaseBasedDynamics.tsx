// src\app\web\(livexams)\ati-teas\vista\exam\(layout)\partials\questiontypes\merged\CaseBasedDynamics.tsx
'use client';

import type { ComponentType } from "react";
import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { CaseBasedStencil, type InnerQuestionProps } from "../stencil/caseBased";

import { SingleChoiceQuestion } from "../standalone/singleChoice";
import { MultipleSelectQuestion } from "../standalone/multipleSelect";
import { TrueFalseQuestion } from "../standalone/trueFalse";
import { NumericResponseQuestion } from "../standalone/numericResponse";
import { MatchingQuestion } from "../standalone/matching";
import { OrderingNumberQuestion } from "../standalone/orderingNumber";
import { OrderingItemQuestion } from "../standalone/orderingItem";
import { OrderingDragDropQuestion } from "../standalone/orderingDragDrop";
import { DynamicImageQuestion } from "../standalone/dynamicImage";
import { MultipleImageQuestion } from "../standalone/multipleImage";
import { BlankSelectQuestion } from "../standalone/blankSelect";
import { BlankFillQuestion } from "../standalone/blankFill";
import { HotspotQuestion } from "../standalone/hotspot";
import { OpenEndedQuestion } from "../standalone/openEnded";
import { HighLightQuestion } from "../standalone/highLight";
import { AudioBasedQuestion } from "../standalone/audioBased";
import { VideoBasedQuestion } from "../standalone/videoBased";
import { MatrixSingleChoiceQuestion } from "../standalone/matrixSingleChoice";
import { MatrixMultipleSelectQuestion } from "../standalone/matrixMultipleSelect";

interface Props {
  q: StrataSessionQuestionFull;
  questionNumber?: number;
  mode?: string;
  examId: number;
  examGuidId: string;
  sectionId: number;
  sectionGuidId: string;
}

// Maps the BASE portion of a CaseBased* type (StrataQuestionType with the "CaseBased"
// prefix stripped) to its standalone answer-UI component. One entry per every
// StrataQuestionType.CaseBased* enum value (19 total) — this is the single source
// of truth for case-based → base-component pairing. Add a new CaseBased* backend
// enum value → add one line here, nothing else.
const BASE_TYPE_MAP: Record<string, ComponentType<InnerQuestionProps>> = {
  singlechoice: SingleChoiceQuestion,
  multipleselect: MultipleSelectQuestion,
  truefalse: TrueFalseQuestion,
  numericresponse: NumericResponseQuestion,
  matching: MatchingQuestion,
  orderingnumber: OrderingNumberQuestion,
  orderingitem: OrderingItemQuestion,
  orderingdragdrop: OrderingDragDropQuestion,
  dynamicimage: DynamicImageQuestion,
  multipleimage: MultipleImageQuestion,
  blankselect: BlankSelectQuestion,
  blankfill: BlankFillQuestion,
  hotspot: HotspotQuestion,
  openended: OpenEndedQuestion,
  highlight: HighLightQuestion,
  audiobased: AudioBasedQuestion,
  videobased: VideoBasedQuestion,
  matrixsinglechoice: MatrixSingleChoiceQuestion,
  matrixmultipleselect: MatrixMultipleSelectQuestion,
};

const normalize = (type?: string) => (type ?? "").toLocaleLowerCase().trim();

// The single linking component for every StrataQuestionType.CaseBased* variant 
export const CaseBasedDynamics = ({
  q,
  questionNumber,
  mode,
  examId,
  examGuidId,
  sectionId,
  sectionGuidId,
}: Props) => {

  const rawType = normalize(q.type);
  const baseType = rawType.startsWith("casebased")
    ? rawType.slice("casebased".length)
    : rawType;

  const InnerQuestion = BASE_TYPE_MAP[baseType];

  if (!InnerQuestion) {
    return (
      <div className="p-3 border-b text-sm text-amber-600 bg-amber-50 rounded-md">
        ⚠️ No standalone component registered for case-based type: <strong>{q.type}</strong>
      </div>
    );
  }

  return (
    <CaseBasedStencil
      q={q}
      questionNumber={questionNumber}
      mode={mode}
      examId={examId}
      examGuidId={examGuidId}
      sectionId={sectionId}
      sectionGuidId={sectionGuidId}
      InnerQuestion={InnerQuestion}
    />
  );
};