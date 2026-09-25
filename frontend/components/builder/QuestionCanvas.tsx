'use client';

import React, { useState } from 'react';
import { Question, QuestionType } from '@/lib/types';
import { CanvasQuestionCard } from './CanvasQuestionCard';
import { PlusCircle, HelpCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface QuestionCanvasProps {
  questions: Question[];
  selectedQuestionId: number | null;
  onSelectQuestion: (id: number) => void;
  onReorder: (newQuestions: Question[]) => Promise<void>;
  onDeleteQuestion: (id: number) => Promise<void>;
  onAddQuestion: (type: QuestionType) => void;
}

export function QuestionCanvas({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onReorder,
  onDeleteQuestion,
  onAddQuestion,
}: QuestionCanvasProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const reordered = [...questions];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    // Update positions locally
    const updated = reordered.map((q, idx) => ({ ...q, position: idx }));
    setDraggedIndex(null);
    await onReorder(updated);
  };

  const handleMove = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= questions.length) return;
    const reordered = [...questions];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);
    const updated = reordered.map((q, idx) => ({ ...q, position: idx }));
    await onReorder(updated);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await onDeleteQuestion(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <main className="flex-1 bg-slate-50/50 flex flex-col h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-2xl w-full mx-auto space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Form Questions Canvas
            </h2>
            <p className="text-xs text-slate-400">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'} • Drag or use arrows to reorder
            </p>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-white/60 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Your canvas is empty</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add question types from the left panel to begin building your conversational form.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddQuestion('short_text')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Add First Question
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <CanvasQuestionCard
                key={q.id}
                question={q}
                index={idx}
                total={questions.length}
                isSelected={selectedQuestionId === q.id}
                onSelect={() => onSelectQuestion(q.id)}
                onMoveUp={() => handleMove(idx, idx - 1)}
                onMoveDown={() => handleMove(idx, idx + 1)}
                onDelete={() => setDeleteTargetId(q.id)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Question"
        description="Are you sure you want to remove this question? This action cannot be undone."
      >
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => setDeleteTargetId(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs"
          >
            Delete Question
          </button>
        </div>
      </Modal>
    </main>
  );
}
