'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/lib/types';
import { Star } from 'lucide-react';

interface QuestionProps {
  question: Question;
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  isRespondent?: boolean;
}

export function RatingQuestion({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isRespondent = false,
}: QuestionProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const currentRating = parseInt(value, 10) || 0;

  useEffect(() => {
    if (!isRespondent || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''))) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5) {
        e.preventDefault();
        onChange(num.toString());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRespondent, disabled, onChange]);

  if (isRespondent) {
    return (
      <div className="w-full max-w-xl flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = hovered !== null ? star <= hovered : star <= currentRating;
            const isSelected = star === currentRating;

            return (
              <button
                key={star}
                type="button"
                disabled={disabled}
                onClick={() => onChange(star.toString())}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(null)}
                className={`relative group flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-md scale-105'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <Star
                  className={`w-8 h-8 transition-transform duration-150 ${
                    isFilled
                      ? 'text-amber-400 fill-amber-400 scale-110'
                      : 'text-slate-300'
                  }`}
                />
                <span className="text-sm font-bold text-slate-700 mt-2">{star}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between w-full max-w-sm text-xs text-slate-400 px-1">
          <span>1 = Lowest</span>
          <span>5 = Highest</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= currentRating;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star.toString())}
            className="p-1 text-slate-300 hover:text-amber-400 transition"
          >
            <Star
              className={`w-6 h-6 ${
                isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
      {currentRating > 0 && (
        <span className="text-sm font-semibold text-slate-600 ml-2">
          {currentRating} / 5
        </span>
      )}
    </div>
  );
}
