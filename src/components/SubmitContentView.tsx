import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Send, ShieldCheck, Search } from 'lucide-react';
import { ContentItem, ContentType, AgeGroup, LanguageCode } from '../types/platform';
import { INITIAL_CATEGORIES, LANGUAGE_LABELS, AGE_GROUP_LABELS, CONTENT_TYPE_LABELS } from '../data/seedData';
import { findDuplicateByUrl } from '../utils/directoryRules';

interface SubmitContentViewProps {
  existingItems: ContentItem[];
  onSubmitNewContent: (newItem: Omit<ContentItem, 'id' | 'status' | 'avgRating' | 'ratingCount' | 'createdAt'>) => void;
  onSelectExistingContent: (id: string) => void;
}

export const SubmitContentView: React.FC<SubmitContentViewProps> = ({
  existingItems,
  onSubmitNewContent,
  onSelectExistingContent,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [categorySlug, setCategorySlug] = useState('documentary');
  const [contentType, setContentType] = useState<ContentType>('video');
  const [language, setLanguage] = useState<LanguageCode>('bn');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('family');
  const [audioPolicyNote, setAudioPolicyNote] = useState('বাদ্যযন্ত্রমুক্ত প্রাকৃতিক ধ্বনি ও কণ্ঠ');
  const [requiresDualApproval, setRequiresDualApproval] = useState(false);
  const [description, setDescription] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Live automatic duplicate check
  const duplicateItem = url.trim().length > 5 ? findDuplicateByUrl(existingItems, url) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmittedSuccess(false);

    if (!title.trim() || !url.trim() || !description.trim()) {
      setErrorMsg('অনুগ্রহ করে কন্টেন্টের শিরোনাম, বৈধ URL এবং সংক্ষিপ্ত বিবরণ পূরণ করুন।');
      return;
    }

    if (duplicateItem) {
      setErrorMsg(
        `এই URL টি ইতিমধ্যে আমাদের ডাটাবেসে "${duplicateItem.title}" নামে (${duplicateItem.status}) অবস্থায় রয়েছে।`
      );
      return;
    }

    const matchedCategory =
      INITIAL_CATEGORIES.find((c) => c.slug === categorySlug) || INITIAL_CATEGORIES[0];

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmitNewContent({
      title: title.trim(),
      url: url.trim(),
      contentType,
      categoryId: matchedCategory.id,
      categorySlug: matchedCategory.slug,
      language,
      ageGroup,
      countryOrigin: 'BD',
      description: description.trim(),
      thumbnailUrl: '/src/assets/images/hero_tayyib_curated_library_1794834982339.jpg',
      submittedBy: submitterName.trim() || 'কমিউনিটি সদস্য',
      tags: parsedTags.length > 0 ? parsedTags : [matchedCategory.nameBn],
      audioPolicyNote,
      financialPolicyNote: 'প্রাথমিক যাচাইয়ে সুদ/জুয়ার বিজ্ঞাপনমুক্ত',
      requiresDualApproval,
    });

    setTitle('');
    setUrl('');
    setDescription('');
    setTagsInput('');
    setSubmittedSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="border-b border-stone-200 pb-6 mb-8">
        <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
          কমিউনিটি কন্ট্রিবিউশন (/submit)
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          নতুন হালাল কন্টেন্ট ডিরেক্টরিতে জমা দিন
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          ইন্টারনেটে আপনার সন্ধান পাওয়া মানসম্মত ইসলামী লেকচার, প্রামাণ্যচিত্র, শিশুতোষ অ্যানিমেশন বা হালাল অ্যাপ আমাদের সাথে শেয়ার করুন। স্বয়ংক্রিয় ডুপ্লিকেট-চেক শেষে আমাদের শরিয়াহ মডারেশন টিম এটি যাচাই করবে।
        </p>
      </div>

      {/* Status Tracking Pipeline Indicator */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
          সাবমিশন স্ট্যাটাস ট্র্যাকিং ওয়ার্কফ্লো
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-[#0F5132]/8 border border-[#0F5132]/20">
            <span className="font-bold text-[#0F5132] block">১. Pending (জমা ও ডুপ্লিকেট চেক)</span>
            <span className="text-stone-600 mt-0.5 block">
              URL ডুপ্লিকেট ও স্প্যাম ফিল্টারিং স্বয়ংক্রিয়ভাবে সম্পন্ন হয়।
            </span>
          </div>
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-800 block">২. Under Review (৮-দফা নিরীক্ষা)</span>
            <span className="text-stone-600 mt-0.5 block">
              দৃশ্যগত শালীনতা, শ্রবণমান ও বিজ্ঞাপন নীতিমালা পরীক্ষা করা হয়।
            </span>
          </div>
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-800 block">৩. Approved / Published ✓</span>
            <span className="text-stone-600 mt-0.5 block">
              মডারেশন ব্যাজসহ মূল ডিরেক্টরিতে ও আপনার ড্যাশবোর্ডে যুক্ত হয়।
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-2.5"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {submittedSuccess && (
        <div
          role="status"
          className="mb-6 p-5 rounded-xl bg-[#0F5132]/10 border border-[#0F5132]/30 text-sm text-[#0F5132]"
        >
          <div className="flex items-center gap-2 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            আলহামদুলিল্লাহ! আপনার কন্টেন্ট সাবমিশনটি পেন্ডিং মডারেশন কিউতে জমা হয়েছে।
          </div>
          <p className="mt-1 text-stone-700">
            আপনি ইউজার ড্যাশবোর্ড (/dashboard) অথবা অ্যাডমিন মডারেশন প্যানেল (/admin) থেকে এটির লাইভ স্ট্যাটাস ও অনুমোদন প্রক্রিয়া দেখতে পারবেন।
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-5">
        {/* URL input with real-time duplicate checker */}
        <div>
          <label htmlFor="submit-url" className="block text-xs font-bold text-stone-800 mb-1.5">
            কন্টেন্টের বহিঃসংযোগ লিংক (URL) *
          </label>
          <div className="relative">
            <input
              id="submit-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... অথবা ওয়েবসাইট লিংক"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm font-mono focus:outline-none focus:border-[#0F5132]"
            />
          </div>

          {url.trim().length > 5 && (
            <div className="mt-2 text-xs">
              {duplicateItem ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-2">
                  <span>
                    সতর্কবার্তা: এই লিংকটি ইতিমধ্যে <strong>"{duplicateItem.title}"</strong> নামে তালিকাভুক্ত আছে ({duplicateItem.status})।
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectExistingContent(duplicateItem.id)}
                    className="px-2.5 py-1 rounded bg-amber-800 text-white font-semibold whitespace-nowrap"
                  >
                    কন্টেন্টটি দেখুন
                  </button>
                </div>
              ) : (
                <p className="text-[#0F5132] font-medium inline-flex items-center gap-1">
                  <Search className="w-3.5 h-3.5" />
                  স্বয়ংক্রিয় ডুপ্লিকেট-চেক উত্তীর্ণ: এই URL টি ডাটাবেসে নতুন।
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="submit-title" className="block text-xs font-bold text-stone-800 mb-1.5">
              কন্টেন্টের শিরোনাম *
            </label>
            <input
              id="submit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="উদাঃ মুসলিম বিজ্ঞানীদের আবিষ্কার প্রামাণ্যচিত্র"
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#0F5132]"
            />
          </div>

          <div>
            <label htmlFor="submit-name" className="block text-xs font-bold text-stone-800 mb-1.5">
              সাবমিটারের নাম
            </label>
            <input
              id="submit-name"
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="আপনার নাম"
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#0F5132]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="submit-category" className="block text-xs font-bold text-stone-800 mb-1.5">
              ক্যাটাগরি
            </label>
            <select
              id="submit-category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
            >
              {INITIAL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nameBn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="submit-type" className="block text-xs font-bold text-stone-800 mb-1.5">
              কন্টেন্ট টাইপ
            </label>
            <select
              id="submit-type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
            >
              {Object.entries(CONTENT_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="submit-lang" className="block text-xs font-bold text-stone-800 mb-1.5">
              ভাষা
            </label>
            <select
              id="submit-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
            >
              {Object.entries(LANGUAGE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.nameBn} ({v.native})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="submit-age" className="block text-xs font-bold text-stone-800 mb-1.5">
              বয়স গ্রুপ
            </label>
            <select
              id="submit-age"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
            >
              {Object.entries(AGE_GROUP_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="submit-audio" className="block text-xs font-bold text-stone-800 mb-1.5">
              শ্রবণগত মান ও অডিও ট্র্যাকের ধরন
            </label>
            <select
              id="submit-audio"
              value={audioPolicyNote}
              onChange={(e) => {
                setAudioPolicyNote(e.target.value);
                setRequiresDualApproval(e.target.value.includes('দফ'));
              }}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
            >
              <option value="বাদ্যযন্ত্রমুক্ত প্রাকৃতিক ধ্বনি ও কণ্ঠ">
                ১০০% বাদ্যযন্ত্রমুক্ত (শুধুমাত্র কণ্ঠ ও প্রাকৃতিক শব্দ)
              </option>
              <option value="বিশুদ্ধ কুরআন তিলাওয়াত ও দারস">
                বিশুদ্ধ কুরআন তিলাওয়াত ও একাডেমিক আলোচনা
              </option>
              <option value="কণ্ঠপ্রধান নাশিদ (শুধুমাত্র দফ ব্যবহৃত)">
                কণ্ঠপ্রধান নাশিদ (দফ ব্যবহৃত — দ্বৈত অনুমোদন প্রযোজ্য)
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="submit-tags" className="block text-xs font-bold text-stone-800 mb-1.5">
              ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
            </label>
            <input
              id="submit-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ইতিহাস, বিজ্ঞান, পরিবার"
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#0F5132]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="submit-desc" className="block text-xs font-bold text-stone-800 mb-1.5">
            সংক্ষিপ্ত বিবরণ ও সাবমিটারের মন্তব্য *
          </label>
          <textarea
            id="submit-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="কন্টেন্টটির মূল বিষয়বস্তু এবং কেন এটি মুসলিম পরিবারের জন্য উপকারী তা লিখুন..."
            className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#0F5132]"
          />
        </div>

        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0F5132] shrink-0" />
            জমা দেওয়ার মাধ্যমে আপনি নিশ্চিত করছেন যে কন্টেন্টটিতে কোনো অশালীনতা বা সুদ/জুয়ার প্রচার নেই।
          </p>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#0F5132] text-white text-xs font-bold hover:bg-[#0b3e26] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            মডারেশন কিউতে সাবমিট করুন
          </button>
        </div>
      </form>
    </div>
  );
};
