'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ResponseDetail } from '@/lib/types';
import { api } from '@/lib/api';
import { ArrowLeft, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface PageProps {
  params: Promise<{ id: string; responseId: string }>;
}

export default function SingleResponsePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const formId = parseInt(resolvedParams.id, 10);
  const responseId = parseInt(resolvedParams.responseId, 10);
  const router = useRouter();
  const toast = useToast();

  const [response, setResponse] = useState<ResponseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResponse() {
      try {
        const data = await api.getResponseDetail(responseId);
        setResponse(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load response');
        router.push(`/forms/${formId}/responses`);
      } finally {
        setIsLoading(false);
      }
    }
    loadResponse();
  }, [formId, responseId, router, toast]);

  if (isLoading || !response) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Loading Response...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href={`/forms/${formId}/responses`}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Response #{response.id}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              Submitted {new Date(response.submitted_at).toLocaleString()}
            </p>
          </div>
        </div>
      </header>

      {/* Main Answers Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 space-y-4">
        {response.answers.map((ans, idx) => (
          <div
            key={ans.id || idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-600">Q{idx + 1}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                {ans.question_type.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{ans.question_title}</h3>
            <div className="pt-2 text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {ans.value ? (
                ans.value
              ) : (
                <span className="text-slate-400 italic">No answer provided</span>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
