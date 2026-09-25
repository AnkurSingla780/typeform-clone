'use client';

import React, { useEffect, useRef } from 'react';
import { Question } from '@/lib/types';

interface QuestionProps {
  question: Question;
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  isRespondent?: boolean;
}

export function LongTextQuestion({
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  disabled = false,
  isRespondent = false,
}: QuestionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // For respondent mode, Shift+Enter makes newline, Enter without Shift submits/advances
    if (e.key === 'Enter' && !e.shiftKey && onSubmit && isRespondent) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (isRespondent) {
    return (
      <div className="w-full max-w-xl">
        <textarea
          ref={textareaRef}
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your answer here..."
          className="w-full text-xl md:text-2xl font-normal text-slate-800 placeholder-slate-300 bg-transparent border-b-2 border-slate-300 focus:border-sky-600 focus:outline-none pb-2 resize-none transition-colors duration-200"
        />
        <p className="text-xs text-slate-400 mt-2">
          Press <span className="font-semibold text-slate-600">Shift + Enter</span> for new line, <span className="font-semibold text-slate-600">Enter ↵</span> to continue
        </p>
      </div>
    );
  }

  return (
    <textarea
      rows={3}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Long answer text"
      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
    />
  );
}
