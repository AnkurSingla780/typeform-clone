'use client';

import React from 'react';
import { Question } from '@/lib/types';
import { ShortTextQuestion } from './ShortTextQuestion';
import { LongTextQuestion } from './LongTextQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { DropdownQuestion } from './DropdownQuestion';
import { EmailQuestion } from './EmailQuestion';
import { NumberQuestion } from './NumberQuestion';
import { YesNoQuestion } from './YesNoQuestion';
import { RatingQuestion } from './RatingQuestion';
import { DateQuestion } from './DateQuestion';

interface QuestionRendererProps {
  question: Question;
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  isRespondent?: boolean;
  questionNumber?: number;
  totalQuestions?: number;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  disabled = false,
  isRespondent = false,
  questionNumber,
  totalQuestions,
}: QuestionRendererProps) {
  const renderInput = () => {
    const props = {
      question,
      value,
      onChange,
      onSubmit,
      autoFocus,
      disabled,
      isRespondent,
    };

    switch (question.type) {
      case 'short_text':
        return <ShortTextQuestion {...props} />;
      case 'long_text':
        return <LongTextQuestion {...props} />;
      case 'multiple_choice':
        return <MultipleChoiceQuestion {...props} />;
      case 'dropdown':
        return <DropdownQuestion {...props} />;
      case 'email':
        return <EmailQuestion {...props} />;
      case 'number':
        return <NumberQuestion {...props} />;
      case 'yes_no':
        return <YesNoQuestion {...props} />;
      case 'rating':
        return <RatingQuestion {...props} />;
      case 'date':
        return <DateQuestion {...props} />;
      default:
        return <ShortTextQuestion {...props} />;
    }
  };

  if (isRespondent) {
    const formattedNumber = questionNumber !== undefined ? (questionNumber < 10 ? `0${questionNumber}` : `${questionNumber}`) : '';
    const formattedTotal = totalQuestions !== undefined ? (totalQuestions < 10 ? `0${totalQuestions}` : `${totalQuestions}`) : '';

    return (
      <div className="w-full flex flex-col items-start text-left animate-slide-up">
        {/* Step indicator */}
        {formattedNumber && (
          <div className="flex items-center gap-2 text-sky-600 font-semibold text-sm tracking-widest uppercase mb-4">
            <span>{formattedNumber}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">{formattedTotal}</span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mb-2">
          {question.title}
          {question.required && <span className="text-sky-600 ml-1.5">*</span>}
        </h2>

        {/* Description / Help text */}
        {question.description && (
          <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-xl leading-relaxed">
            {question.description}
          </p>
        )}

        {!question.description && <div className="mb-8" />}

        {/* Input widget */}
        <div className="w-full mb-8">
          {renderInput()}
        </div>
      </div>
    );
  }

  // Builder preview or simple preview mode
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-slate-800">
          {question.title}
          {question.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        {question.description && (
          <p className="text-xs text-slate-500 mt-0.5">{question.description}</p>
        )}
      </div>
      <div>{renderInput()}</div>
    </div>
  );
}
