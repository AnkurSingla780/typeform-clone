'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormSummary } from '@/lib/types';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Search,
  ExternalLink,
  Edit3,
  BarChart3,
  Copy,
  Trash2,
  CheckCircle2,
  FileText,
  Layers,
  ArrowRight,
  Loader2,
  Globe,
  Lock,
  MoreVertical,
  Share2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Create Form Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirmation Modal
  const [deleteTargetForm, setDeleteTargetForm] = useState<FormSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchForms = async () => {
    try {
      const data = await api.getForms();
      setForms(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a form title');
      return;
    }

    setIsCreating(true);
    try {
      const created = await api.createForm({
        title: newTitle.trim(),
        description: newDescription.trim() || null,
      });
      toast.success('Form created successfully!');
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      router.push(`/forms/${created.id}/edit`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create form');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (form: FormSummary) => {
    try {
      const duplicated = await api.duplicateForm(form.id);
      toast.success(`Duplicated "${form.title}"`);
      await fetchForms();
      router.push(`/forms/${duplicated.id}/edit`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate form');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetForm) return;
    setIsDeleting(true);
    try {
      await api.deleteForm(deleteTargetForm.id);
      toast.success(`Deleted "${deleteTargetForm.title}"`);
      setForms((prev) => prev.filter((f) => f.id !== deleteTargetForm.id));
      setDeleteTargetForm(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete form');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public form link copied to clipboard!');
  };

  // Filtered list
  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      filterStatus === 'all' ? true : f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalResponses = forms.reduce((acc, f) => acc + (f.response_count || 0), 0);
  const totalPublished = forms.filter((f) => f.status === 'published').length;

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Typeform <span className="text-sky-600 font-normal">Clone</span>
              </h1>
              <p className="text-xs text-slate-400">Workspace Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition hover:shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Form
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Forms</span>
              <FileText className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{forms.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalPublished}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Responses</span>
              <BarChart3 className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalResponses}</p>
          </div>
        </div>

        {/* Toolbar: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search forms by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({forms.length})
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'published'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Published ({totalPublished})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'draft'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drafts ({forms.length - totalPublished})
            </button>
          </div>
        </div>

        {/* Form List Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Loading forms...
            </p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {forms.length === 0 ? 'No forms created yet' : 'No matching forms found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              {forms.length === 0
                ? 'Create your first interactive conversational form to start collecting responses.'
                : 'Try adjusting your search query or status filter.'}
            </p>
            {forms.length === 0 && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Create New Form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Status & Responses Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                        form.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          form.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {form.status === 'published' ? 'Published' : 'Draft'}
                    </span>

                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {form.response_count} {form.response_count === 1 ? 'response' : 'responses'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-sky-600 transition line-clamp-1">
                    {form.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem] leading-relaxed mb-4">
                    {form.description || 'No description provided.'}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Slug: <code className="text-slate-600 font-mono text-[11px]">/{form.slug}</code></span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/forms/${form.id}/edit`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      Edit Form
                    </Link>

                    <Link
                      href={`/forms/${form.id}/responses`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                      Responses
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    {form.status === 'published' ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/f/${form.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Live
                        </Link>
                        <button
                          onClick={() => handleCopyLink(form.slug)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
                          title="Copy public link"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Link
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Publish to share link</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(form)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Duplicate form"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetForm(form)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete form"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Form Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create a New Form"
        description="Give your new form a title to get started. You can add questions right after."
      >
        <form onSubmit={handleCreateForm} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Form Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Product Feedback Survey, Job Application"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="A short note explaining the purpose of this form..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !newTitle.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create & Build'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Form Confirmation Modal */}
      <Modal
        isOpen={deleteTargetForm !== null}
        onClose={() => setDeleteTargetForm(null)}
        title="Delete Form"
        description={`Are you sure you want to permanently delete "${deleteTargetForm?.title}"? All questions and submitted responses will be removed.`}
      >
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setDeleteTargetForm(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
