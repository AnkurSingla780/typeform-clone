'use client';

import React, { useEffect, useState, use } from 'react';
import { FormDetail, Question } from '@/lib/types';
import { api, ApiError } from '@/lib/api';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function PublicFormPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch published form
  useEffect(() => {
    async function loadPublicForm() {
      try {
        const data = await api.getPublicForm(slug);
        setForm(data);
      } catch (err: any) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          setLoadError('This form is either unpublished, does not exist, or is not taking responses.');
        } else {
          setLoadError(err.message || 'Unable to load form');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadPublicForm();
  }, [slug]);

  // Global keyboard navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || isLoading || !form) return;

      if (e.key === 'ArrowUp') {
        handlePrev();
      } else if (e.key === 'ArrowDown') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSubmitted, isLoading, form, currentIndex, answers]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Loading Form...
        </p>
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Form Not Available</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">{loadError}</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const questions = form.questions || [];
  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const progressPercent = total > 0 ? ((currentIndex + (isSubmitted ? 1 : 0)) / total) * 100 : 0;

  // Client-side validation for current question
  const validateCurrent = (): boolean => {
    if (!currentQuestion) return true;
    const rawVal = answers[currentQuestion.id] || '';
    const val = rawVal.trim();

    // Required check
    if (currentQuestion.required && !val) {
      setErrorMsg('Please complete this required question to proceed.');
      return false;
    }

    if (val) {
      if (currentQuestion.type === 'email') {
        if (!EMAIL_REGEX.test(val)) {
          setErrorMsg('Please enter a valid email address (e.g. name@example.com).');
          return false;
        }
      } else if (currentQuestion.type === 'number') {
        if (isNaN(Number(val))) {
          setErrorMsg('Please enter a valid number.');
          return false;
        }
      } else if (currentQuestion.type === 'rating') {
        const ratingNum = parseInt(val, 10);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
          setErrorMsg('Please select a rating between 1 and 5.');
          return false;
        }
      }
    }

    setErrorMsg(null);
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrent()) return;

    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Last question reached -> Submit
      await handleSubmit();
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrent()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payloadAnswers = questions.map((q) => ({
        question_id: q.id,
        value: answers[q.id] || null,
      }));

      await api.submitPublicResponse(slug, {
        answers: payloadAnswers,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setErrorMsg(null);
  };

  // Helper keyboard hint text
  const getKeyboardHint = () => {
    if (!currentQuestion) return 'press Enter ↵';
    if (currentQuestion.type === 'yes_no') return 'press Y or N';
    if (currentQuestion.type === 'rating') return 'press 1 - 5';
    if (currentQuestion.type === 'multiple_choice') return 'press key A - D or click';
    return 'press Enter ↵';
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Top Header & Progress Bar */}
      <header className="relative w-full z-20 bg-white/70 backdrop-blur-md border-b border-slate-200/80">
        <div className="w-full h-1.5 bg-slate-200">
          <div
            className="h-full bg-linear-to-r from-sky-500 to-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-slate-800 text-sm sm:text-base">
              {form.title}
            </span>
          </div>
          {total > 0 && !isSubmitted && (
            <div className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {total}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 overflow-y-auto">
        {total === 0 ? (
          <div className="text-center text-slate-400 p-8">
            <p className="text-base">This form currently has no questions.</p>
          </div>
        ) : isSubmitted ? (
          /* Thank You Screen */
          <div className="w-full max-w-lg text-center space-y-6 animate-slide-up bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Response Recorded
              </span>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Thank you!
              </h1>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Your response has been safely submitted. Thank you for your time.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Submit another response
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
              >
                Return to Workspace
              </Link>
            </div>
          </div>
        ) : (
          /* One-Question-At-A-Time Slide */
          <div
            key={currentQuestion.id}
            className="w-full max-w-2xl text-left animate-slide-up py-8"
          >
            {/* Question Renderer */}
            <div className="w-full">
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
            </div>

            {/* Validation Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium mb-4 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Button & Keyboard Hint */}
            <div className="flex items-center gap-4 mt-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNext}
                className="flex items-center gap-2 px-7 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>{currentIndex === total - 1 ? 'Submit' : 'OK'}</span>
                    {currentIndex === total - 1 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>

              <span className="text-xs text-slate-400 hidden sm:inline">
                {getKeyboardHint()}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation & Brand Footer */}
      {!isSubmitted && (
        <footer className="px-6 py-4 bg-white/70 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-400 z-20">
          <div className="flex items-center gap-2">
            <span>Powered by Typeform Clone</span>
          </div>

          {/* Stepper Chevrons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              disabled={currentIndex === 0 || isSubmitting}
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Previous question (Arrow Up)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Next question (Arrow Down)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
