'use client';

import React, { useEffect } from 'react';
import { Question } from '@/lib/types';
import { Check, CheckCircle2, XCircle } from 'lucide-react';

interface QuestionProps {
  question: Question;
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  isRespondent?: boolean;
}

export function YesNoQuestion({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isRespondent = false,
}: QuestionProps) {
  useEffect(() => {
    if (!isRespondent || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''))) return;

      if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        onChange('Yes');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onChange('No');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRespondent, disabled, onChange]);

  if (isRespondent) {
    const isYes = value === 'Yes';
    const isNo = value === 'No';

    return (
      <div className="w-full max-w-xl flex flex-col sm:flex-row gap-4">
        {/* Yes Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('Yes')}
          className={`flex-1 flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
            isYes
              ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                isYes
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              Y
            </span>
            <span className="text-xl font-semibold">Yes</span>
          </div>
          {isYes && <Check className="w-6 h-6 text-emerald-600" />}
        </button>

        {/* No Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('No')}
          className={`flex-1 flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
            isNo
              ? 'bg-rose-50/90 border-rose-500 text-rose-950 shadow-md ring-2 ring-rose-500/20'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                isNo
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              N
            </span>
            <span className="text-xl font-semibold">No</span>
          </div>
          {isNo && <Check className="w-6 h-6 text-rose-600" />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {['Yes', 'No'].map((opt) => (
        <label
          key={opt}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium cursor-pointer transition ${
            value === opt
              ? 'bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-500'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <input
            type="radio"
            name="yes_no_choice"
            value={opt}
            checked={value === opt}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="sr-only"
          />
          {opt === 'Yes' ? (
            <CheckCircle2 className={`w-4 h-4 ${value === 'Yes' ? 'text-sky-600' : 'text-slate-400'}`} />
          ) : (
            <XCircle className={`w-4 h-4 ${value === 'No' ? 'text-rose-500' : 'text-slate-400'}`} />
          )}
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}
