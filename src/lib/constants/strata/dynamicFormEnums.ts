// frontend/src/lib/constants/strata/dynamicFormEnums.ts

export const STRATA_TYPE = [
  'Category','SubCategory','Domain','Program','Course','Subject','Unit','Lesson','Topic','Concept','Fact','Assessment', 
  'Exam','Section','Concept','Question','Institution','School','Department','Division','Cohort','Class','Document','Cognition', 
  'Content','SystemUser'
  ] as const;

export const STRATA_STATUS = [
    'Draft', 
    'Published', 
    'Archived', 
    'Inactive', 
    'Active',
    'Inception',
    'Expired',
    'Destroyed',
    'Online',
    'Offline'
] as const;

export const STRATA_LEVEL = ['Beginner', 'Intermediate', 'Advanced'] as const;
export const STRATA_DIFFICULTY = ['Easy', 'Medium', 'Hard', 'Beginner', 'Intermediate', 'Advanced'] as const;
export const STRATA_TARGET = [
    'Cognition', 
    'Students', 
    'Praxis',
    'Admin', 
    'Exams', 
    'Institution'
] as const;
export const STRATA_SEGMENT = ['Exam', 'Practice', 'Theory'] as const;
export const STRATA_FRAGMENT = ['Module', 'Lesson', 'Unit'] as const;

export const STRATA_ORDER = [
  'AscendingNumerics',      // 1, 2, 3, 4
  'DescendingNumerics',     // 4, 3, 2, 1
  'AscendingRomans',        // I, II, III
  'DescendingRomans',       // III, II, I
  'Bulleted',               // •, •, •
  'Random',                 // Random order each reload
  'Alphabetical',           // A, B, C
  'ReverseAlphabetical',    // Z, Y, X
  'EvenFirst',              // Sort by even numbers first
  'OddFirst',               // Sort by odd numbers first
  'Custom'                  // Allow custom sequence provided externally
] as const;

export const STRATA_SEASON = ['Spring', 'Summer', 'Fall', 'Winter'] as const;
export const STRATA_LANGUAGE = ['English', 'French', 'Spanish'] as const;

export const STRATA_ACCESS_TYPE = ['Public', 'Restricted', 'Private'] as const;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────





// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// frontend\src\app\dashboards\admin\(resourcesbank)\nexus\cognition\forms\sphere1\page.tsx

// TOP-LEVEL GENERATION MODE - the strategy used by the engine to create questions
export enum STRATA_GENERATION_MODE {
  DOCUMENT_BASED = 'document_based',    // Generated strictly from provided document(s)
  KNOWLEDGE_BASED = 'knowledge_based',  // Generated from general subject knowledge
  API_BASED = 'api_based',              // Generated from external API / data source
  HYBRID_BASED= 'hybrid_based',         // Document + general knowledge
}


// SOURCE CONTROL - how strictly the exam enforces that questions and answers come from the provided source(s)
export enum STRATA_SOURCE_CONTROL {
  STRICT_SOURCE = 'strict_source',       // Questions must match source exactly
  LIBERAL_SOURCE = 'liberal_source',     // Minor paraphrasing or reasoning allowed
  EXTERNAL_SOURCE = 'external_source',   // External knowledge can be used freely
  HYBRID_SOURCE = 'hybrid_source',       // Document + general knowledge freely combined
}

// QUESTION TYPES
export enum STRATA_QUESTION_TYPE {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_SELECT = 'multiple_select',
  TRUE_FALSE = 'true_false',
  CASE_BASED = 'case_based',
  HYBRID = 'hybrid',                
}

// DIFFICULTY LEVEL
export enum STRATA_DIFFICULTY_LEVEL {
  VERY_EASY = 'very_easy',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  VERY_HARD = 'very_hard',
  ADAPTIVE = 'adaptive',         
  COMPLEX = 'complex',              
  PROGRESSIVE = 'progressive',  
  HYBRID = 'hybrid',                
}

// BLOOM'S TAXONOMY (COGNITIVE DEPTH)
export enum STRATA_COGNITIVE_DEPTH {
  // ------------------------------
  // Core Bloom’s levels
  // ------------------------------
  REMEMBER = 'remember',       // Recall facts, definitions
  UNDERSTAND = 'understand',   // Comprehend meaning and concepts
  APPLY = 'apply',             // Use knowledge in context
  ANALYZE = 'analyze',         // Break information into parts
  EVALUATE = 'evaluate',       // Judge or assess based on criteria
  CREATE = 'create',           // Produce new ideas or solutions

  // ------------------------------
  // Optional Meta / Advanced Levels
  // ------------------------------
  MULTI_LEVEL = 'multi_level',       // Spans multiple Bloom levels
  PROGRESSIVE = 'progressive',       // Moves through levels sequentially (e.g., remember → analyze)
  ADAPTIVE = 'adaptive',             // Adjusts cognitive level based on learner responses
  CONDITIONAL = 'conditional',       // Next question depends on previous answer
  RANDOMIZED = 'randomized',         // Cognitive level selected randomly for practice/exams
  CUSTOM = 'custom',                 // Instructor-defined cognitive pattern
  SEQUENTIAL = 'sequential',         // Questions intentionally ordered for scaffolding
  PROBABILISTIC = 'probabilistic',   // Cognitive level selected based on probability/algorithm
  EXPERIMENTAL = 'experimental',     // For testing new cognitive structures
  HYBRID = 'hybrid',                 // Combines multiple cognitive approaches in a single question
}


// CONTENT SCOPE CONTROL - How broadly the question content may extend/cover.
export enum STRATA_CONTENT_SCOPE {
  STRICT_SCOPE = 'strict_scope',       // Questions must match source exactly
  LIBERAL_SCOPE = 'liberal_scope',     // Minor paraphrasing or reasoning allowed
  EXTERNAL_SCOPE = 'external_scope',   // External knowledge can be used freely
  HYBRID_SCOPE = 'hybrid_scope',       // Document + general knowledge freely combined
}


// EXAM LAYOUT
export enum STRATA_EXAM_LAYOUT {
  GENERIC_LAYOUT = 'generic_layout',
  GLACIAL_LAYOUT = 'glacial_layout',
}


// OUTPUT & DELIVERY
export enum STRATA_OUTPUT_DELIVERY {
  DATABASE = 'database',        // Stored in DB
  TEXT = 'text',                // Plain text output
  WEB = 'web',                  // Rendered in web UI
  PDF = 'pdf',                  // Downloadable PDF
  WORD = 'word',                // .docx file
  JSON = 'json',                // Structured JSON output
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

