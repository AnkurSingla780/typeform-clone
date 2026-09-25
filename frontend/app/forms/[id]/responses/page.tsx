'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormDetail, ResponseDetail, FormStatistics } from '@/lib/types';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Download,
  BarChart2,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  Star,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FormResponsesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const formId = parseInt(resolvedParams.id, 10);
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<FormDetail | null>(null);
  const [responses, setResponses] = useState<ResponseDetail[]>([]);
  const [statistics, setStatistics] = useState<FormStatistics | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'responses'>('stats');
  const [selectedResponse, setSelectedResponse] = useState<ResponseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [formData, respData, statsData] = await Promise.all([
          api.getForm(formId),
          api.getFormResponses(formId),
          api.getFormStatistics(formId),
        ]);
        setForm(formData);
        setResponses(respData);
        setStatistics(statsData);
        if (respData.length > 0) {
          setSelectedResponse(respData[0]);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load responses');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [formId, router, toast]);

  if (isLoading || !form || !statistics) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Loading Responses & Statistics...
        </p>
      </div>
    );
  }

  // Bonus CSV Export
  const handleExportCSV = () => {
    if (responses.length === 0) {
      toast.info('No responses to export.');
      return;
    }

    // Build headers from form questions
    const questionHeaders = form.questions.map((q) => `"${q.title.replace(/"/g, '""')}"`);
    const csvRows: string[] = [
      ['"Response ID"', '"Submitted At"', ...questionHeaders].join(','),
    ];

    responses.forEach((r) => {
      const answerMap: Record<number, string> = {};
      r.answers.forEach((a) => {
        answerMap[a.question_id] = a.value || '';
      });

      const rowAnswers = form.questions.map((q) => {
        const val = answerMap[q.id] || '';
        return `"${val.replace(/"/g, '""')}"`;
      });

      const formattedDate = new Date(r.submitted_at).toISOString();
      csvRows.push([`"${r.id}"`, `"${formattedDate}"`, ...rowAnswers].join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${form.slug}-responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Responses exported to CSV successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href={`/forms/${form.id}/edit`}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Back to Form Builder"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{form.title}</h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  form.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {form.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Results & Analytics Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            href={`/forms/${form.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Edit Form
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Submissions
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {statistics.total_responses}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Questions
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {form.questions.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Last Activity
              </p>
              <h3 className="text-sm font-bold text-slate-800 mt-2 truncate">
                {responses.length > 0
                  ? new Date(responses[0].submitted_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'No submissions yet'}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'stats'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Summary & Question Breakdown</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('responses')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'responses'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Individual Responses ({responses.length})</span>
          </button>
        </div>

        {/* TAB 1: Summary Statistics */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {statistics.question_stats.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                No question data available.
              </div>
            ) : (
              statistics.question_stats.map((qs, idx) => (
                <div
                  key={qs.question_id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-sky-600">Q{idx + 1}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                          {qs.type.replace('_', ' ')}
                        </span>
                        {qs.required && (
                          <span className="text-[10px] font-bold text-rose-500 uppercase">
                            Required
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{qs.title}</h4>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {qs.total_answers} {qs.total_answers === 1 ? 'answer' : 'answers'}
                    </span>
                  </div>

                  {/* Render Aggregation based on type */}
                  {['multiple_choice', 'dropdown', 'yes_no'].includes(qs.type) && (
                    <div className="space-y-2.5 pt-2">
                      {Object.entries(qs.breakdown.counts || {}).map(([label, count]) => {
                        const pct = qs.breakdown.percentages?.[label] || 0;
                        return (
                          <div key={label} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                              <span>{label}</span>
                              <span className="font-mono text-slate-500">
                                {count} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {qs.type === 'rating' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-slate-900">
                          {qs.breakdown.average || 0}
                        </span>
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(qs.breakdown.average || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">Average rating</span>
                      </div>
                      <div className="space-y-2 pt-2">
                        {['5', '4', '3', '2', '1'].map((star) => {
                          const count = qs.breakdown.counts?.[star] || 0;
                          const pct = qs.breakdown.percentages?.[star] || 0;
                          return (
                            <div key={star} className="flex items-center gap-3 text-xs">
                              <span className="w-8 font-semibold text-slate-600 flex items-center gap-1">
                                {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              </span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-16 text-right font-mono text-slate-400">
                                {count} ({pct}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {qs.type === 'number' && (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Average</span>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{qs.breakdown.average || 0}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Min</span>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{qs.breakdown.min || 0}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Max</span>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{qs.breakdown.max || 0}</p>
                      </div>
                    </div>
                  )}

                  {['short_text', 'long_text', 'email', 'date'].includes(qs.type) && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase">
                        Recent Submissions ({qs.breakdown.sample_answers?.length || 0})
                      </p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(qs.breakdown.sample_answers || []).map((ans: string, i: number) => (
                          <div
                            key={i}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700"
                          >
                            {ans}
                          </div>
                        ))}
                        {(!qs.breakdown.sample_answers || qs.breakdown.sample_answers.length === 0) && (
                          <p className="text-xs text-slate-400 italic">No text answers submitted yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Individual Responses */}
        {activeTab === 'responses' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Responses List */}
            <div className="md:col-span-1 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Submissions ({responses.length})
              </h4>
              {responses.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                  No submissions recorded yet.
                </div>
              ) : (
                responses.map((r, idx) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedResponse(r)}
                    className={`w-full p-4 rounded-xl border text-left transition cursor-pointer ${
                      selectedResponse?.id === r.id
                        ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Response #{r.id}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.submitted_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {new Date(r.submitted_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* Individual Response Detail View */}
            <div className="md:col-span-2">
              {selectedResponse ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Response #{selectedResponse.id}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Submitted: {new Date(selectedResponse.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/forms/${form.id}/responses/${selectedResponse.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Dedicated View
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {selectedResponse.answers.map((ans, idx) => (
                      <div
                        key={ans.id || idx}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1"
                      >
                        <p className="text-xs font-semibold text-slate-500">
                          {ans.question_title}
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {ans.value ? ans.value : <span className="text-slate-400 italic">No answer provided</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                  Select a response to view its answers.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
