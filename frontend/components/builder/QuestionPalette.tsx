'use client';

import React from 'react';
import { QuestionType } from '@/lib/types';
import {
  Type,
  AlignLeft,
  CheckSquare,
  ListFilter,
  Mail,
  Hash,
  ToggleLeft,
  Star,
  Plus,
  Calendar,
} from 'lucide-react';

interface QuestionPaletteProps {
  onAddQuestion: (type: QuestionType) => void;
  disabled?: boolean;
}

interface PaletteItem {
  type: QuestionType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'short_text', label: 'Short Text', description: 'Single line text input', icon: Type },
  { type: 'long_text', label: 'Long Text', description: 'Multi-line detailed answer', icon: AlignLeft },
  { type: 'multiple_choice', label: 'Multiple Choice', description: 'Pick from predefined choices', icon: CheckSquare },
  { type: 'dropdown', label: 'Dropdown', description: 'Select an option from a list', icon: ListFilter },
  { type: 'email', label: 'Email', description: 'Validated email address', icon: Mail },
  { type: 'number', label: 'Number', description: 'Numeric input only', icon: Hash },
  { type: 'yes_no', label: 'Yes / No', description: 'Binary choice buttons', icon: ToggleLeft },
  { type: 'rating', label: 'Rating', description: '1 to 5 star rating scale', icon: Star },
  { type: 'date', label: 'Date', description: 'Select date on calendar', icon: Calendar },
];

export function QuestionPalette({ onAddQuestion, disabled = false }: QuestionPaletteProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Questions</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Click to insert question</p>
        </div>
      </div>
      <div className="p-3 space-y-1.5 overflow-y-auto flex-1">
        {PALETTE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              disabled={disabled}
              onClick={() => onAddQuestion(item.type)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 text-left transition-all duration-150 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>{item.label}</span>
                  <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400 truncate">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
