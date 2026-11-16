import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckSquare, FileCheck2, Users, Eye } from 'lucide-react';
import { ContentItem, ReportItem, ModerationLog, ModerationChecklist } from '../types/platform';
import { evaluateModerationChecklist } from '../utils/directoryRules';
import { LANGUAGE_LABELS, CONTENT_TYPE_LABELS } from '../data/seedData';

interface AdminModerationViewProps {
  pendingItems: ContentItem[];
  reports: ReportItem[];
  logs: ModerationLog[];
  onApproveContent: (contentId: string, checklist: ModerationChecklist, notes: string, isDualStep1?: boolean) => void;
  onRejectContent: (contentId: string, checklist: ModerationChecklist, notes: string) => void;
  onResolveReport: (reportId: string, resolution: 'resolved' | 'dismissed', unpublishContent: boolean) => void;
}

const DEFAULT_CHECKLIST: ModerationChecklist = {
  visualModesty: true,
  audioCompliance: true,
  nonViolence: true,
  noHateSpeech: true,
  ribaFreeAds: true,
  copyrightRespected: true,
  accurateMetadata: true,
  modestThumbnailNoAutoplay: true,
};

const CHECKLIST_LABELS: { key: keyof ModerationChecklist; labelBn: string }[] = [
  { key: 'visualModesty', labelBn: 'দৃশ্যগত: নগ্নতা/অন্তরঙ্গ দৃশ্য/অশালীন পোশাক নেই' },
  { key: 'audioCompliance', labelBn: 'শ্রাব্যগত: সংগীতে যন্ত্রের ব্যবহার প্ল্যাটফর্মের নীতির সাথে সামঞ্জস্যপূর্ণ' },
  { key: 'nonViolence', labelBn: 'বিষয়বস্তুতে সহিংসতা/সন্ত্রাসবাদের প্রচার নেই' },
  { key: 'noHateSpeech', labelBn: 'বিষয়বস্তুতে ঘৃণাত্মক বক্তব্য বা কোনো ধর্মীয়/জাতিগত গোষ্ঠীর বিরুদ্ধে উস্কানি নেই' },
  { key: 'ribaFreeAds', labelBn: 'সুদভিত্তিক/জুয়াভিত্তিক বিজ্ঞাপন বা প্রচার নেই' },
  { key: 'copyrightRespected', labelBn: 'উৎস কপিরাইট সম্মানিত (নিজস্ব কন্টেন্ট বা অনুমোদিত লিংক)' },
  { key: 'accurateMetadata', labelBn: 'মেটাডেটা (শিরোনাম, বিবরণ, ট্যাগ) সঠিক ও বিভ্রান্তিকর নয়' },
  { key: 'modestThumbnailNoAutoplay', labelBn: 'থাম্বনেইল শালীন ও অটো-প্লে নিষ্ক্রিয়' },
];

export const AdminModerationView: React.FC<AdminModerationViewProps> = ({
  pendingItems,
  reports,
  logs,
  onApproveContent,
  onRejectContent,
  onResolveReport,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'logs'>('pending');
  const [selectedId, setSelectedId] = useState<string>(pendingItems[0]?.id || '');
  const [checklist, setChecklist] = useState<ModerationChecklist>(DEFAULT_CHECKLIST);
  const [moderatorNotes, setModeratorNotes] = useState<string>('');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const activePending = pendingItems.find((i) => i.id === selectedId) || pendingItems[0];
  const evaluation = evaluateModerationChecklist(checklist);

  const toggleCheck = (key: keyof ModerationChecklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = (isDualStep1 = false) => {
    if (!activePending) return;
    if (!evaluation.isComplete) {
      setFeedbackBanner('অনুমোদনের পূর্বে ৮টি শরিয়াহ ও মানদণ্ড চেকলিস্টের প্রতিটি ধাপ সম্পন্ন (✓) হতে হবে।');
      return;
    }
    const notes =
      moderatorNotes.trim() ||
      'সকল ৮-দফা শরিয়াহ ও শালীনতা মানদণ্ড যাচাইকৃত এবং ডিরেক্টরিতে প্রকাশের জন্য অনুমোদিত।';
    onApproveContent(activePending.id, checklist, notes, isDualStep1);
    setModeratorNotes('');
    setFeedbackBanner(
      isDualStep1
        ? `"${activePending.title}" ১ম মডারেটর কর্তৃক উত্তীর্ণ হয়েছে। সংগীত/দফ ক্যাটাগরি হওয়ায় ২য় মডারেটরের চূড়ান্ত অনুমোদনের জন্য প্রস্তুত।`
        : `"${activePending.title}" সফলভাবে অনুমোদিত ও পাবলিক ডিরেক্টরিতে প্রকাশিত হয়েছে!`
    );
  };

  const handleReject = () => {
    if (!activePending) return;
    if (!moderatorNotes.trim()) {
      setFeedbackBanner('কন্টেন্ট বাতিল করার ক্ষেত্রে সুনির্দিষ্ট কারণ (মডারেটর নোট) উল্লেখ করা আবশ্যক।');
      return;
    }
    onRejectContent(activePending.id, checklist, moderatorNotes.trim());
    setModeratorNotes('');
    setFeedbackBanner(`"${activePending.title}" বাতিল করা হয়েছে এবং অডিট লগে সংরক্ষিত হয়েছে।`);
  };

  const openReports = reports.filter((r) => r.status === 'open' || r.status === 'reviewing');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="border-b border-stone-200 pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
            অ্যাডমিন ও শরিয়াহ মডারেশন প্যানেল (/admin)
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            কন্টেন্ট যাচাইকরণ, দ্বৈত-অনুমোদন ও অডিট কনসোল
          </h1>
          <p className="text-sm text-stone-600 mt-2 max-w-3xl">
            সাবমিশন গ্রহণ → প্রাথমিক স্ক্রিনিং → ৮-দফা মানদণ্ড চেকলিস্ট যাচাই → সংগীত/সংবেদনশীল কন্টেন্টে দ্বৈত-অনুমোদন (Dual Approval) → ৬ মাস অন্তর র্যান্ডম রি-অডিট।
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/75 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'pending' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            পেন্ডিং কিউ ({pendingItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'reports' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            রিপোর্টেড কন্টেন্ট ({openReports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'logs' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            মডারেশন অডিট লগ ({logs.length})
          </button>
        </div>
      </div>

      {feedbackBanner && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl bg-[#0F5132]/10 border border-[#0F5132]/30 text-sm text-[#0F5132] font-medium flex items-center justify-between"
        >
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-xs underline ml-4 whitespace-nowrap"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 5 columns: Queue list */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#0F5132]" />
              অপেক্ষমাণ সাবমিশন তালিকা ({pendingItems.length})
            </h2>

            {pendingItems.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
                <ShieldCheck className="w-8 h-8 text-[#0F5132] mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-800">পেন্ডিং কিউ সম্পূর্ণ পরিষ্কার!</p>
                <p className="text-xs text-stone-500 mt-1">
                  সকল অপেক্ষমাণ কন্টেন্ট যাচাই সম্পন্ন হয়েছে। নতুন সাবমিশন আসলে এখানে প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              pendingItems.map((item) => {
                const isSelected = activePending?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-white border-[#0F5132] ring-1 ring-[#0F5132]'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span>{CONTENT_TYPE_LABELS[item.contentType]} · {LANGUAGE_LABELS[item.language]?.nameBn}</span>
                      <span className="font-mono tabular-nums">জমাদানকারী: {item.submittedBy}</span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">{item.description}</p>
                    {item.requiresDualApproval && (
                      <p className="mt-2 text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        দ্বৈত-অনুমোদন আবশ্যক (সংগীত/দফ ক্যাটাগরি)
                        {item.firstModeratorApprovedBy && ` · ১ম ধাপ সম্পন্ন (${item.firstModeratorApprovedBy})`}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Right 7 columns: 8-Point Shariah & Quality Checklist Inspector */}
          <div className="lg:col-span-7">
            {activePending ? (
              <div className="bg-white border border-stone-200 rounded-xl p-6">
                <div className="border-b border-stone-100 pb-4 mb-5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>আইটেম আইডি: {activePending.id}</span>
                    <a
                      href={activePending.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0F5132] font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      উৎস লিংক পরীক্ষা করুন
                    </a>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 mt-1">{activePending.title}</h2>
                  <p className="text-sm text-stone-600 mt-1">{activePending.description}</p>
                  <p className="text-xs text-stone-500 mt-2 font-mono">{activePending.url}</p>
                </div>

                {/* 8-Point Checklist */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-[#0F5132]" />
                      মডারেশন মানদণ্ড চেকলিস্ট (৮-দফা শরিয়াহ ও শালীনতা নিরীক্ষা)
                    </h3>
                    <span className="text-xs font-mono font-semibold text-[#0F5132] tabular-nums">
                      উত্তীর্ণ: {evaluation.passedCount}/{evaluation.totalCount}
                    </span>
                  </div>

                  <div className="space-y-2 bg-[#FAF9F6] p-4 rounded-xl border border-stone-200/80">
                    {CHECKLIST_LABELS.map((c) => (
                      <label
                        key={c.key}
                        className="flex items-start gap-3 py-1.5 cursor-pointer text-xs sm:text-sm text-stone-800 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checklist[c.key]}
                          onChange={() => toggleCheck(c.key)}
                          className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#0F5132] focus:ring-[#0F5132]"
                        />
                        <span>{c.labelBn}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Moderator Audit Notes */}
                <div className="mb-6">
                  <label htmlFor="mod-notes" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    মডারেটর অডিট নোট (JSONB স্ন্যাপশটের সাথে সংরক্ষিত হবে)
                  </label>
                  <textarea
                    id="mod-notes"
                    rows={2}
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    placeholder="উদাঃ সম্পূর্ণ ভিডিও নিরীক্ষা করা হয়েছে, কোনো যন্ত্রসংগীত বা সুদভিত্তিক বিজ্ঞাপন নেই..."
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#0F5132]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleReject}
                    className="px-4 py-2 rounded-lg text-xs font-semibold border border-red-300 text-red-700 hover:bg-red-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    বাতিল করুন (Reject)
                  </button>

                  {activePending.requiresDualApproval && !activePending.firstModeratorApprovedBy && (
                    <button
                      type="button"
                      onClick={() => handleApprove(true)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#C9A227] text-stone-950 hover:bg-[#b5901f] transition-colors whitespace-nowrap shrink-0"
                    >
                      ১ম মডারেটর অনুমোদন (Dual Step 1)
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleApprove(false)}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#0F5132] text-white hover:bg-[#0b3e26] transition-colors whitespace-nowrap shrink-0"
                  >
                    চূড়ান্ত অনুমোদন ও প্রকাশ (Approve ✓)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-10 text-center text-stone-500 text-sm">
                বাম পাশের কিউ থেকে যেকোনো একটি পেন্ডিং সাবমিশন নির্বাচন করুন।
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                ব্যবহারকারী কর্তৃক রিপোর্টেড কন্টেন্ট কিউ (২৪-৪৮ ঘণ্টা এসএলএ)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                লিংকড কন্টেন্ট পরিবর্তন বা নীতিমালা বিচ্যুতির অভিযোগ দ্রুত পর্যালোচনা করে সাময়িক আনপাবলিশ অথবা নিষ্পত্তি করুন।
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {reports.map((rep) => (
              <div key={rep.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-stone-800">অভিযোগের ধরন: {rep.reason}</span>
                    <span aria-hidden="true">·</span>
                    <span>রিপোর্টকারী: {rep.reportedBy}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{rep.createdAt}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#0F5132]">স্ট্যাটাস: {rep.status}</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">{rep.contentTitle}</h3>
                  <p className="text-sm text-stone-600 mt-1">{rep.details}</p>
                </div>

                {rep.status !== 'resolved' && rep.status !== 'dismissed' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onResolveReport(rep.id, 'dismissed', false);
                        setFeedbackBanner(`"${rep.contentTitle}"-এর রিপোর্টটি যাচাই শেষে নিষ্পত্তি (কন্টেন্ট বহাল) করা হয়েছে।`);
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-stone-300 text-stone-700 hover:bg-stone-50 whitespace-nowrap"
                    >
                      কন্টেন্ট বহাল রাখুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onResolveReport(rep.id, 'resolved', true);
                        setFeedbackBanner(`"${rep.contentTitle}" সাময়িকভাবে আনপাবলিশ (Flagged) করা হয়েছে।`);
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-red-700 text-white hover:bg-red-800 whitespace-nowrap"
                    >
                      সাময়িক আনপাবলিশ করুন
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-stone-500 shrink-0">
                    নিষ্পত্তিকৃত ({rep.resolvedAt || 'সম্পন্ন'})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-900">
              মডারেশন অডিট লগ (Moderation Audit Trail & Checklist Snapshots)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              প্রতিটি অনুমোদিত বা বাতিলকৃত কন্টেন্টের যাচাইয়ের সময়ের চেকলিস্ট ফলাফল (JSONB Snapshot) ও মডারেটর নোট।
            </p>
          </div>
          <div className="divide-y divide-stone-100">
            {logs.map((log) => {
              const evalSnap = evaluateModerationChecklist(log.checklistSnapshot);
              return (
                <div key={log.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 mb-1.5">
                    <span>
                      মডারেটর: <strong className="text-stone-800">{log.moderatorName}</strong> · অ্যাকশন:{' '}
                      <strong className="text-[#0F5132] uppercase">{log.action}</strong>
                    </span>
                    <span className="font-mono tabular-nums">
                      চেকলিস্ট স্ন্যাপশট: {evalSnap.passedCount}/{evalSnap.totalCount} উত্তীর্ণ · {log.createdAt}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">{log.contentTitle}</h3>
                  <p className="text-xs text-stone-600 mt-1">{log.notes}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
