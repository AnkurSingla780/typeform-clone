'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FormDetail } from '@/lib/types';
import {
  ArrowLeft,
  Eye,
  Share2,
  Check,
  Globe,
  ExternalLink,
  BarChart3,
  Copy,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';

interface BuilderTopNavProps {
  form: FormDetail;
  onUpdateTitle: (newTitle: string) => Promise<void>;
  onTogglePublish: () => Promise<void>;
  onOpenPreview: () => void;
  isPublishing?: boolean;
}

export function BuilderTopNav({
  form,
  onUpdateTitle,
  onTogglePublish,
  onOpenPreview,
  isPublishing = false,
}: BuilderTopNavProps) {
  const toast = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(form.title);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== form.title) {
      await onUpdateTitle(titleInput.trim());
      toast.success('Form renamed successfully');
    } else {
      setTitleInput(form.title);
    }
  };

  const getPublicUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/f/${form.slug}`;
    }
    return `/f/${form.slug}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPublicUrl());
    setHasCopied(true);
    toast.success('Shareable link copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  const isPublished = form.status === 'published';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-2.5 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(form.title);
                  setIsEditingTitle(false);
                }
              }}
              className="text-base font-bold text-slate-800 border-b-2 border-sky-600 focus:outline-none px-1 py-0.5"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleInput(form.title);
                setIsEditingTitle(true);
              }}
              className="text-base font-bold text-slate-800 hover:text-sky-600 truncate max-w-xs md:max-w-md cursor-pointer transition text-left"
              title="Click to rename"
            >
              {form.title}
            </button>
          )}

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isPublished
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPublished ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Results Link */}
        <Link
          href={`/forms/${form.id}/responses`}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <span>Responses</span>
          {form.response_count > 0 && (
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
              {form.response_count}
            </span>
          )}
        </Link>

        {/* Live Preview Button */}
        <button
          type="button"
          onClick={onOpenPreview}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
        >
          <Eye className="w-4 h-4 text-slate-500" />
          <span>Preview</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>Share</span>
        </button>

        {/* Publish / Unpublish Button */}
        <button
          type="button"
          disabled={isPublishing}
          onClick={onTogglePublish}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer ${
            isPublished
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isPublishing ? 'Updating...' : isPublished ? 'Unpublish' : 'Publish'}</span>
        </button>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share your form"
        description="Anyone with this link can fill out your form without authentication."
      >
        <div className="space-y-4">
          {!isPublished ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-2">
              <p className="font-semibold">This form is currently in Draft mode.</p>
              <p className="text-amber-800">
                Respondents will not be able to open or submit this form until you publish it.
              </p>
              <button
                type="button"
                onClick={async () => {
                  await onTogglePublish();
                  setIsShareModalOpen(false);
                }}
                className="mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition"
              >
                Publish Form Now
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Public Share URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getPublicUrl()}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 select-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <a
                  href={`/f/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Respondent Form in New Tab
                </a>
              </div>
            </>
          )}
        </div>
      </Modal>
    </header>
  );
}
