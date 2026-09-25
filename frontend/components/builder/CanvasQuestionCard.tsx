'use client';

import React from 'react';
import { Question } from '@/lib/types';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Type,
  AlignLeft,
  CheckSquare,
  ListFilter,
  Mail,
  Hash,
  ToggleLeft,
  Star,
  Calendar,
} from 'lucide-react';

interface CanvasQuestionCardProps {
  question: Question;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  short_text: Type,
  long_text: AlignLeft,
  multiple_choice: CheckSquare,
  dropdown: ListFilter,
  email: Mail,
  number: Hash,
  yes_no: ToggleLeft,
  rating: Star,
  date: Calendar,
};

const TYPE_LABELS: Record<string, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  multiple_choice: 'Multiple Choice',
  dropdown: 'Dropdown',
  email: 'Email',
  number: 'Number',
  yes_no: 'Yes / No',
  rating: 'Rating',
  date: 'Date',
};

export function CanvasQuestionCard({
  question,
  index,
  total,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: CanvasQuestionCardProps) {
  const Icon = TYPE_ICONS[question.type] || Type;
  const typeLabel = TYPE_LABELS[question.type] || question.type;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={onSelect}
      className={`group relative flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-white border-sky-600 shadow-md ring-4 ring-sky-500/10'
          : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Drag Handle */}
      <div
        className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-500 p-1 rounded transition"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Number Badge */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition ${
          isSelected
            ? 'bg-sky-600 text-white'
            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
        }`}
      >
        {index + 1}
      </div>

      {/* Question Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
            <Icon className="w-3 h-3 text-slate-500" />
            {typeLabel}
          </span>
          {question.required && (
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
              Required
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-800 truncate">
          {question.title || 'Untitled question'}
        </p>
        {question.description && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {question.description}
          </p>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Reorder Up */}
        <button
          type="button"
          disabled={index === 0}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Move up"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* Reorder Down */}
        <button
          type="button"
          disabled={index === total - 1}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Move down"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer ml-1"
          title="Delete question"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
