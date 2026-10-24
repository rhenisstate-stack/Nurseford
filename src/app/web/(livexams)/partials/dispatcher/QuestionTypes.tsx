// src\app\web\(livexams)\ati-teas\vista\exam\(layout)\partials\dispatcher\QuestionTypes.tsx
'use client';

import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";

import { SingleChoiceQuestion } from "../questiontypes/standalone/singleChoice";
import { MultipleSelectQuestion } from "../questiontypes/standalone/multipleSelect";
import { TrueFalseQuestion } from "../questiontypes/standalone/trueFalse";
import { NumericResponseQuestion } from "../questiontypes/standalone/numericResponse";
import { MatchingQuestion } from "../questiontypes/standalone/matching";
import { OrderingNumberQuestion } from "../questiontypes/standalone/orderingNumber";
import { OrderingItemQuestion } from "../questiontypes/standalone/orderingItem";
import { OrderingDragDropQuestion } from "../questiontypes/standalone/orderingDragDrop";
import { DynamicImageQuestion } from "../questiontypes/standalone/dynamicImage";
import { MultipleImageQuestion } from "../questiontypes/standalone/multipleImage";
import { BlankSelectQuestion } from "../questiontypes/standalone/blankSelect";
import { BlankFillQuestion } from "../questiontypes/standalone/blankFill";
import { HotspotQuestion } from "../questiontypes/standalone/hotspot";
import { OpenEndedQuestion } from "../questiontypes/standalone/openEnded";
import { HighLightQuestion } from "../questiontypes/standalone/highLight";
import { AudioBasedQuestion } from "../questiontypes/standalone/audioBased";
import { VideoBasedQuestion } from "../questiontypes/standalone/videoBased";
import { MatrixSingleChoiceQuestion } from "../questiontypes/standalone/matrixSingleChoice";
import { MatrixMultipleSelectQuestion } from "../questiontypes/standalone/matrixMultipleSelect";

// Single linking component for ALL 19 CaseBased* variants — determines the correct
// standalone InnerQuestion internally from q.type. See merged/CaseBasedDynamics.tsx.
import { CaseBasedDynamics } from "../questiontypes/merged/CaseBasedDynamics";

const normalize = (type?: string) =>
  (type ?? "").toLocaleLowerCase().trim();

// Exam/Section context passed from the section renderer above
export interface QuestionRenderContext {
  examId: number;
  examGuidId: string;
  sectionId: number;
  sectionGuidId: string;
}

class QuestionRendererRegistry {
  render(
    q: StrataSessionQuestionFull,
    questionNumber?: number,
    mode?: string,
    ctx?: QuestionRenderContext   // optional so nothing else breaks
  ) {
    const type = normalize(q.type);

    const shared = {
      examId: ctx?.examId ?? 0,
      examGuidId: ctx?.examGuidId ?? "",
      sectionId: ctx?.sectionId ?? 0,
      sectionGuidId: ctx?.sectionGuidId ?? "",
    };

    switch (type) {

      // ═════════════════════════════════════════════════════════════════════════════════
      // BASE TYPES (19) — matches StrataQuestionType enum 1:1
      // ═════════════════════════════════════════════════════════════════════════════════
      case "":
      case "singlechoice":
        return <SingleChoiceQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "multipleselect":
        return <MultipleSelectQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "truefalse":
        return <TrueFalseQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "numericresponse":
        return <NumericResponseQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "matching":
        return <MatchingQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "orderingnumber":
        return <OrderingNumberQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "orderingitem":
        return <OrderingItemQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "orderingdragdrop":
        return <OrderingDragDropQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "dynamicimage":
        return <DynamicImageQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "multipleimage":
        return <MultipleImageQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "blankselect":
        return <BlankSelectQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "blankfill":
        return <BlankFillQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "hotspot":
        return <HotspotQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "openended":
        return <OpenEndedQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "highlight":
        return <HighLightQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "audiobased":
        return <AudioBasedQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "videobased":
        return <VideoBasedQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "matrixsinglechoice":
        return <MatrixSingleChoiceQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      case "matrixmultipleselect":
        return <MatrixMultipleSelectQuestion key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      // ═════════════════════════════════════════════════════════════════════════════════
      // CASE-BASED TYPES (19) — matches StrataQuestionType.CaseBased* enum 1:1.
      // Every case below routes to the SAME linking component; CaseBasedDynamics
      // determines internally (from q.type) which standalone InnerQuestion to use.
      // ═════════════════════════════════════════════════════════════════════════════════
      case "casebasedsinglechoice":
      case "casebasedmultipleselect":
      case "casebasedtruefalse":
      case "casebasednumericresponse":
      case "casebasedmatching":
      case "casebasedorderingnumber":
      case "casebasedorderingitem":
      case "casebasedorderingdragdrop":
      case "casebaseddynamicimage":
      case "casebasedmultipleimage":
      case "casebasedblankselect":
      case "casebasedblankfill":
      case "casebasedhotspot":
      case "casebasedopenended":
      case "casebasedmatrixsinglechoice":
      case "casebasedmatrixmultipleselect":
      case "casebasedhighlight":
      case "casebasedaudiobased":
      case "casebasedvideobased":
        return <CaseBasedDynamics key={q.id} q={q} questionNumber={questionNumber} mode={mode} {...shared} />;

      // ═════════════════════════════════════════════════════════════════════════════════
      default:
        return (
          <div key={q.id} className="p-3 border-b text-sm text-gray-400">
            Unsupported Type: {q.type}
          </div>
        );
    }
  }
}

export const QuestionTypes = new QuestionRendererRegistry();