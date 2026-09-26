'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { FormDetail, Question, QuestionType, QuestionUpdateInput } from '@/lib/types';
import { api } from '@/lib/api';
import { BuilderTopNav } from '@/components/builder/BuilderTopNav';
import { QuestionPalette } from '@/components/builder/QuestionPalette';
import { QuestionCanvas } from '@/components/builder/QuestionCanvas';
import { QuestionSettings } from '@/components/builder/QuestionSettings';
import { LivePreviewModal } from '@/components/builder/LivePreviewModal';
import { useToast } from '@/context/ToastContext';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FormEditPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const formId = parseInt(resolvedParams.id, 10);
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<FormDetail | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const formRef = useRef<FormDetail | null>(form);
  formRef.current = form;
  const saveVersionRef = useRef<Record<number, number>>({});
  const debounceTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const persistQuestionRef = useRef<(questionId: number, version: number) => Promise<void>>(
    async () => {}
  );

  const TEXT_SAVE_DEBOUNCE_MS = 600;

  const clearDebounce = (questionId: number) => {
    const timers = debounceTimersRef.current;
    if (timers[questionId]) {
      clearTimeout(timers[questionId]);
      delete timers[questionId];
    }
  };

  persistQuestionRef.current = async (questionId: number, version: number) => {
    const current = formRef.current?.questions.find((q) => q.id === questionId);
    if (!current) return;
    if (version !== saveVersionRef.current[questionId]) return;
    if (!current.title.trim()) return;

    const payload: QuestionUpdateInput = {
      title: current.title,
      description: current.description,
      type: current.type,
      required: current.required,
      position: current.position,
      options: current.options?.map((o, idx) => ({
        label: o.label,
        position: o.position ?? idx,
      })),
    };

    try {
      const updated = await api.updateQuestion(questionId, payload);

      if (version !== saveVersionRef.current[questionId]) return;

      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) => {
            if (q.id !== questionId) return q;
            return {
              ...updated,
              title: q.title.trim() === '' ? q.title : updated.title,
            };
          }),
        };
      });
    } catch (err: any) {
      if (version !== saveVersionRef.current[questionId]) return;
      toast.error(err.message || 'Failed to update question');
    }
  };

  useEffect(() => {
    return () => {
      const timers = debounceTimersRef.current;
      Object.keys(timers).forEach((id) => {
        clearTimeout(timers[Number(id)]);
        delete timers[Number(id)];
      });
    };
  }, []);

  useEffect(() => {
    async function loadForm() {
      try {
        const data = await api.getForm(formId);
        setForm(data);
        if (data.questions && data.questions.length > 0) {
          setSelectedQuestionId(data.questions[0].id);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load form');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }
    loadForm();
  }, [formId, router, toast]);

  if (isLoading || !form) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading Form Builder...
        </p>
      </div>
    );
  }

  const selectedQuestion =
    form.questions.find((q) => q.id === selectedQuestionId) ||
    form.questions[0] ||
    null;

  const handleAddQuestion = async (type: QuestionType) => {
    try {
      const defaultTitles: Record<QuestionType, string> = {
        short_text: 'What is your answer?',
        long_text: 'Please describe in detail...',
        multiple_choice: 'Which of the following options do you prefer?',
        dropdown: 'Please select one option from the list',
        email: 'What is your email address?',
        number: 'Enter a numeric quantity',
        yes_no: 'Do you agree with this statement?',
        rating: 'How would you rate this on a scale of 1 to 5?',
        date: 'Select a date',
      };

      const defaultOptions = ['multiple_choice', 'dropdown'].includes(type)
        ? [
            { label: 'Option 1', position: 0 },
            { label: 'Option 2', position: 1 },
            { label: 'Option 3', position: 2 },
          ]
        : undefined;

      const newQ = await api.createQuestion(form.id, {
        title: defaultTitles[type] || 'New Question',
        type,
        required: false,
        position: form.questions.length,
        options: defaultOptions,
      });

      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: [...prev.questions, newQ],
        };
      });
      setSelectedQuestionId(newQ.id);
      toast.success('Question added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add question');
    }
  };

  const handleUpdateQuestion = async (
    questionId: number,
    data: Partial<Question>
  ) => {
    const previous = formRef.current?.questions.find((q) => q.id === questionId);

    const version = (saveVersionRef.current[questionId] ?? 0) + 1;
    saveVersionRef.current[questionId] = version;

    const previousForm = formRef.current;
    if (!previousForm) return;

    const nextForm: FormDetail = {
      ...previousForm,
      questions: previousForm.questions.map((q) =>
        q.id === questionId ? { ...q, ...data } : q
      ),
    };

    setForm(nextForm);
    formRef.current = nextForm;

    const optionCountChanged =
      data.options !== undefined &&
      (previous?.options?.length ?? 0) !== data.options.length;

    const isTextEdit =
      data.type === undefined &&
      data.required === undefined &&
      data.position === undefined &&
      !optionCountChanged &&
      (data.title !== undefined ||
        data.description !== undefined ||
        data.options !== undefined);

    if (isTextEdit) {
      clearDebounce(questionId);

      const nextQuestion = formRef.current.questions.find((q) => q.id === questionId);
      if (nextQuestion && !nextQuestion.title.trim()) {
        return;
      }

      debounceTimersRef.current[questionId] = setTimeout(() => {
        delete debounceTimersRef.current[questionId];
        const latestVersion = saveVersionRef.current[questionId];
        void persistQuestionRef.current(questionId, latestVersion);
      }, TEXT_SAVE_DEBOUNCE_MS);
      return;
    }

    clearDebounce(questionId);
    await persistQuestionRef.current(questionId, version);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    clearDebounce(questionId);
    saveVersionRef.current[questionId] = (saveVersionRef.current[questionId] ?? 0) + 1;
    try {
      await api.deleteQuestion(questionId);
      setForm((prev) => {
        if (!prev) return prev;
        const remaining = prev.questions.filter((q) => q.id !== questionId);
        return {
          ...prev,
          questions: remaining,
        };
      });
      // Adjust selected question
      const remainingQuestions = form.questions.filter((q) => q.id !== questionId);
      if (remainingQuestions.length > 0) {
        setSelectedQuestionId(remainingQuestions[0].id);
      } else {
        setSelectedQuestionId(null);
      }
      toast.success('Question deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete question');
    }
  };

  const handleReorder = async (newQuestions: Question[]) => {
    setForm((prev) => (prev ? { ...prev, questions: newQuestions } : prev));
    try {
      const questionIds = newQuestions.map((q) => q.id);
      const reorderedFromBackend = await api.reorderQuestions(form.id, questionIds);
      setForm((prev) => (prev ? { ...prev, questions: reorderedFromBackend } : prev));
      toast.success('Question order saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reorder questions');
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    try {
      const updated = await api.updateForm(form.id, { title: newTitle });
      setForm((prev) => (prev ? { ...prev, title: updated.title } : prev));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update title');
    }
  };

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      if (form.status === 'published') {
        const updated = await api.unpublishForm(form.id);
        setForm(updated);
        toast.info('Form unpublished. Public access is now paused.');
      } else {
        const updated = await api.publishForm(form.id);
        setForm(updated);
        toast.success('Form published! Ready to collect responses.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle publish status');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Top Navigation */}
      <BuilderTopNav
        form={form}
        onUpdateTitle={handleUpdateTitle}
        onTogglePublish={handleTogglePublish}
        onOpenPreview={() => setIsPreviewOpen(true)}
        isPublishing={isPublishing}
      />

      {/* 3-Column Builder Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Palette */}
        <QuestionPalette onAddQuestion={handleAddQuestion} />

        {/* Center: Canvas */}
        <QuestionCanvas
          questions={form.questions}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={(id) => setSelectedQuestionId(id)}
          onReorder={handleReorder}
          onDeleteQuestion={handleDeleteQuestion}
          onAddQuestion={handleAddQuestion}
        />

        {/* Right: Inspector */}
        <QuestionSettings
          question={selectedQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
        />
      </div>

      {/* Live Preview Modal */}
      <LivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formTitle={form.title}
        questions={form.questions}
      />
    </div>
  );
}
