'use client';

import React, { useState } from 'react';
import { Question, QuestionType } from '@/lib/types';
import { Trash2, Plus, Sparkles, SlidersHorizontal, Layers, GitBranch, HeartHandshake } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface QuestionSettingsProps {
  question: Question | null;
  onUpdateQuestion: (questionId: number, data: Partial<Question>) => Promise<void>;
  onDeleteQuestion: (questionId: number) => Promise<void>;
}

const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
  { type: 'short_text', label: 'Short Text' },
  { type: 'long_text', label: 'Long Text' },
  { type: 'multiple_choice', label: 'Multiple Choice' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'yes_no', label: 'Yes / No' },
  { type: 'rating', label: 'Rating' },
  { type: 'date', label: 'Date' },
];

export function QuestionSettings({
  question,
  onUpdateQuestion,
  onDeleteQuestion,
}: QuestionSettingsProps) {
  const [activeTab, setActiveTab] = useState<'question' | 'theme' | 'logic' | 'integrations'>('question');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!question) {
    return (
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 p-6 text-center justify-center items-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <SlidersHorizontal className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">No Question Selected</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
          Click on any question card in the center canvas to configure its properties.
        </p>
      </aside>
    );
  }

  const hasOptions = ['multiple_choice', 'dropdown'].includes(question.type);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateQuestion(question.id, { title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateQuestion(question.id, { description: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as QuestionType;
    let newOptions = question.options;
    if (['multiple_choice', 'dropdown'].includes(newType) && (!newOptions || newOptions.length === 0)) {
      newOptions = [
        { label: 'Option 1', position: 0 },
        { label: 'Option 2', position: 1 },
      ];
    }
    onUpdateQuestion(question.id, { type: newType, options: newOptions });
  };

  const handleRequiredToggle = () => {
    onUpdateQuestion(question.id, { required: !question.required });
  };

  const handleOptionChange = (idx: number, newLabel: string) => {
    const updated = [...(question.options || [])];
    updated[idx] = { ...updated[idx], label: newLabel };
    onUpdateQuestion(question.id, { options: updated });
  };

  const handleAddOption = () => {
    const updated = [...(question.options || [])];
    updated.push({
      label: `Option ${updated.length + 1}`,
      position: updated.length,
    });
    onUpdateQuestion(question.id, { options: updated });
  };

  const handleRemoveOption = (idx: number) => {
    const updated = (question.options || []).filter((_, i) => i !== idx);
    onUpdateQuestion(question.id, { options: updated });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteQuestion(question.id);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 select-none">
      {/* Top Header & Settings Tabs */}
      <div className="border-b border-slate-100 p-2">
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('question')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'question'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Field
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'theme'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Theme
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logic')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'logic'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Logic
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'question' && (
          <div className="space-y-5">
            {/* Question Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Question Type
              </label>
              <select
                value={question.type}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Question Title
              </label>
              <input
                type="text"
                value={question.title}
                onChange={handleTitleChange}
                placeholder="What would you like to ask?"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Description / Help text */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Description / Help text
              </label>
              <textarea
                rows={2}
                value={question.description || ''}
                onChange={handleDescriptionChange}
                placeholder="Add optional clarification or instructions..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            {/* Required Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Required Question</span>
                <span className="text-[11px] text-slate-400">Respondent must answer to continue</span>
              </div>
              <button
                type="button"
                onClick={handleRequiredToggle}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  question.required ? 'bg-sky-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full shadow-xs absolute top-0.5 transition-transform ${
                    question.required ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Options Manager (Multiple Choice & Dropdown) */}
            {hasOptions && (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Choices / Options
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Option
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(question.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      {(question.options || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rating configuration note */}
            {question.type === 'rating' && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-semibold block mb-0.5">Rating Scale</span>
                Configured on an interactive 1 to 5 star rating scale with hover previews.
              </div>
            )}

            {/* Delete Question Section */}
            <div className="pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete this Question
              </button>
            </div>
          </div>
        )}

        {/* Placeholder Tabs */}
        {activeTab === 'theme' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-800 mb-1">
                Coming Soon
              </span>
              <h4 className="text-sm font-semibold text-slate-800">Custom Brand Themes</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto">
                Custom font styles, primary brand hex colors, and custom background gradients will be available soon.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'logic' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 mb-1">
                Coming Soon
              </span>
              <h4 className="text-sm font-semibold text-slate-800">Logic Jumps & Branching</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto">
                Conditionally skip or route respondents to specific questions based on their answers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Question Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Question"
        description="Are you sure you want to delete this question? Any existing respondent answers for this question will also be removed."
      >
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={confirmDelete}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs"
          >
            {isDeleting ? 'Deleting...' : 'Delete Question'}
          </button>
        </div>
      </Modal>
    </aside>
  );
}
