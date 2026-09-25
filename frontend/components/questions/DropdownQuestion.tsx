'use client';

import React from 'react';
import { Question } from '@/lib/types';
import { ChevronDown } from 'lucide-react';

interface QuestionProps {
  question: Question;
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  isRespondent?: boolean;
}

export function DropdownQuestion({
  question,
  value,
  onChange,
  onSubmit,
  disabled = false,
  isRespondent = false,
}: QuestionProps) {
  const options = question.options || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  if (isRespondent) {
    return (
      <div className="w-full max-w-xl relative">
        <select
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className="w-full text-xl md:text-2xl font-normal text-slate-800 bg-white border-2 border-slate-300 rounded-xl px-5 py-3.5 pr-12 focus:border-sky-600 focus:outline-none appearance-none cursor-pointer shadow-xs transition"
        >
          <option value="" disabled>Select an option...</option>
          {options.map((opt, idx) => (
            <option key={opt.id || idx} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-6 h-6 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
      >
        <option value="" disabled>Select an option...</option>
        {options.map((opt, idx) => (
          <option key={opt.id || idx} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
