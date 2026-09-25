export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'dropdown'
  | 'email'
  | 'number'
  | 'yes_no'
  | 'rating'
  | 'date';

export interface Option {
  id?: number;
  question_id?: number;
  label: string;
  position: number;
}

export interface Question {
  id: number;
  form_id: number;
  title: string;
  description: string | null;
  type: QuestionType;
  position: number;
  required: boolean;
  created_at: string;
  updated_at: string;
  options: Option[];
}

export interface QuestionCreateInput {
  title: string;
  description?: string | null;
  type: QuestionType;
  required?: boolean;
  position?: number;
  options?: { label: string; position?: number }[];
}

export interface QuestionUpdateInput {
  title?: string;
  description?: string | null;
  type?: QuestionType;
  required?: boolean;
  position?: number;
  options?: { label: string; position?: number }[];
}

export interface FormSummary {
  id: number;
  creator_id: number;
  title: string;
  description: string | null;
  slug: string;
  status: 'draft' | 'published';
  response_count: number;
  created_at: string;
  updated_at: string;
}

export interface FormDetail extends FormSummary {
  questions: Question[];
}

export interface FormCreateInput {
  title: string;
  description?: string | null;
  slug?: string;
}

export interface FormUpdateInput {
  title?: string;
  description?: string | null;
  status?: 'draft' | 'published';
}

export interface AnswerSubmit {
  question_id: number;
  value: string | null;
}

export interface ResponseSubmit {
  answers: AnswerSubmit[];
}

export interface AnswerDetail {
  id: number;
  question_id: number;
  question_title: string;
  question_type: string;
  value: string | null;
}

export interface ResponseDetail {
  id: number;
  form_id: number;
  submitted_at: string;
  answers: AnswerDetail[];
}

export interface QuestionStatistics {
  question_id: number;
  title: string;
  type: QuestionType | string;
  required: boolean;
  total_answers: number;
  breakdown: {
    counts?: Record<string, number>;
    percentages?: Record<string, number>;
    average?: number;
    min?: number;
    max?: number;
    count?: number;
    sample_answers?: string[];
  };
}

export interface FormStatistics {
  form_id: number;
  title: string;
  status: string;
  total_responses: number;
  question_stats: QuestionStatistics[];
}
