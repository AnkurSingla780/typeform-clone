'use client';

import React, { useState } from 'react';
import { Question } from '@/lib/types';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';
import { X, ArrowRight, ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  questions: Question[];
}

export function LivePreviewModal({
  isOpen,
  onClose,
  formTitle,
  questions,
}: LivePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const progressPercent = total > 0 ? ((currentIndex + (isFinished ? 1 : 0)) / total) * 100 : 0;

  const handleNext = () => {
    if (!currentQuestion) return;

    // Check required
    const currentVal = answers[currentQuestion.id] || '';
    if (currentQuestion.required && !currentVal.trim()) {
      setErrorMsg('This question is required.');
      return;
    }
    setErrorMsg(null);

    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (isFinished) {
      setIsFinished(false);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-slide-up">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live Interactive Preview
            </span>
            <span className="text-xs text-slate-400">• {formTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
              title="Restart preview"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restart
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-100">
          <div
            className="h-full bg-sky-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-20 overflow-y-auto">
          {total === 0 ? (
            <div className="text-center text-slate-400">
              <p>No questions to preview yet.</p>
            </div>
          ) : isFinished ? (
            <div className="text-center space-y-4 max-w-md animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Thank you!</h3>
              <p className="text-slate-500 text-sm">
                In actual respondent mode, the response is submitted to the backend database.
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition"
              >
                Test Again
              </button>
            </div>
          ) : (
            <div className="w-full max-w-xl">
              <QuestionRenderer
                question={currentQuestion}
                value={answers[currentQuestion.id] || ''}
                onChange={(val) => {
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
                  setErrorMsg(null);
                }}
                onSubmit={handleNext}
                autoFocus
                isRespondent
                questionNumber={currentIndex + 1}
                totalQuestions={total}
              />

              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 mt-2 animate-fade-in">
                  {errorMsg}
                </div>
              )}

              {/* Action button */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer"
                >
                  <span>{currentIndex === total - 1 ? 'Finish Preview' : 'OK'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400">
                  press <span className="font-semibold text-slate-600">Enter ↵</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Question {currentIndex + 1} of {total}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentIndex === 0 || isFinished}
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={isFinished}
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
