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

export function EmailQuestion({
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  disabled = false,
  isRespondent = false,
}: QuestionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (isRespondent) {
    return (
      <div className="w-full max-w-xl">
        <input
          ref={inputRef}
          type="email"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="name@example.com"
          className="w-full text-2xl md:text-3xl font-normal text-slate-800 placeholder-slate-300 bg-transparent border-b-2 border-slate-300 focus:border-sky-600 focus:outline-none pb-3 transition-colors duration-200"
        />
      </div>
    );
  }

  return (
    <input
      type="email"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="name@example.com"
      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
    />
  );
}
