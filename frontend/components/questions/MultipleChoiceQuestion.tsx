'use client';

import React, { useEffect } from 'react';
import { Question } from '@/lib/types';
import { Check } from 'lucide-react';

interface QuestionProps {
  question: Question;
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  isRespondent?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  onSubmit,
  disabled = false,
  isRespondent = false,
}: QuestionProps) {
  const options = question.options || [];

  // Key press shortcuts (A, B, C, etc.)
  useEffect(() => {
    if (!isRespondent || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if active element is an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''))) return;

      const key = e.key.toUpperCase();
      const index = LETTERS.indexOf(key);
      if (index !== -1 && index < options.length) {
        e.preventDefault();
        const selectedLabel = options[index].label;
        onChange(selectedLabel);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRespondent, disabled, options, onChange]);

  if (isRespondent) {
    return (
      <div className="w-full max-w-xl flex flex-col gap-3">
        {options.map((opt, idx) => {
          const letter = LETTERS[idx] || (idx + 1).toString();
          const isSelected = value === opt.label;
          return (
            <button
              key={opt.id || idx}
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange(opt.label);
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-sky-50/80 border-sky-600 text-sky-950 shadow-sm'
                  : 'bg-white hover:bg-slate-50/90 border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-base font-medium">{opt.label}</span>
              </div>
              {isSelected && <Check className="w-5 h-5 text-sky-600" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {options.map((opt, idx) => (
        <label
          key={opt.id || idx}
          className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm cursor-pointer transition ${
            value === opt.label
              ? 'bg-sky-50 border-sky-400 text-sky-900'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <input
            type="radio"
            name={`q_${question.id}`}
            value={opt.label}
            checked={value === opt.label}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="text-sky-600 focus:ring-sky-500"
          />
          <span>{opt.label}</span>
        </label>
      ))}
      {options.length === 0 && (
        <p className="text-xs text-slate-400 italic">No options defined yet. Add options in question settings.</p>
      )}
    </div>
  );
}
