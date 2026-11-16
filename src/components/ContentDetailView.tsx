import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Flag,
  Bookmark,
  Star,
  ShieldCheck,
  FolderPlus,
  Send,
  Share2,
} from 'lucide-react';
import { ContentItem, ReviewItem, Playlist, ReportReason } from '../types/platform';
import { LANGUAGE_LABELS, AGE_GROUP_LABELS, CONTENT_TYPE_LABELS } from '../data/seedData';
import { buildContentShareUrl } from '../utils/directoryRules';
import { ContentCard } from './ContentCard';

interface ContentDetailViewProps {
  item: ContentItem;
  reviews: ReviewItem[];
  relatedItems: ContentItem[];
  playlists: Playlist[];
  isBookmarked: boolean;
  onBack: () => void;
  onSelectContent: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onAddReview: (contentId: string, rating: number, comment: string, userName: string) => void;
  onSubmitReport: (contentId: string, reason: ReportReason, details: string, reporterName: string) => void;
  onAddToPlaylist: (playlistId: string, contentId: string) => void;
}

export const ContentDetailView: React.FC<ContentDetailViewProps> = ({
  item,
  reviews,
  relatedItems,
  playlists,
  isBookmarked,
  onBack,
  onSelectContent,
  onToggleBookmark,
  onAddReview,
  onSubmitReport,
  onAddToPlaylist,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const [showReportForm, setShowReportForm] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<ReportReason>('immodesty');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [reportMessage, setReportMessage] = useState<string | null>(null);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || '');
  const [playlistFeedback, setPlaylistFeedback] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const shareUrl = buildContentShareUrl(item.id);

  const handleShareCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      // Fallback if clipboard API is restricted in iframe context
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setShareFeedback(`লিংকটি ক্লিপবোর্ডে কপি করা হয়েছে: ${shareUrl}`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);
    if (!reviewerName.trim()) {
      setReviewError('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }
    if (reviewComment.trim().length < 5) {
      setReviewError('অনুগ্রহ করে অন্তত ৫ অক্ষরের একটি গঠনমূলক মতামত লিখুন।');
      return;
    }
    onAddReview(item.id, rating, reviewComment.trim(), reviewerName.trim());
    setReviewComment('');
    setReviewSuccess('আপনার রিভিউ ও রেটিং সফলভাবে যুক্ত হয়েছে। জাযাকাল্লাহু খাইরান!');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) {
      setReportMessage('অনুগ্রহ করে অভিযোগের সুনির্দিষ্ট বিবরণ লিখুন।');
      return;
    }
    onSubmitReport(
      item.id,
      reportReason,
      reportDetails.trim(),
      reporterName.trim() || 'সচেতন পাঠক'
    );
    setReportDetails('');
    setShowReportForm(false);
    setReportMessage(
      'আপনার রিপোর্টটি মডারেশন কিউতে গৃহীত হয়েছে। ২৪-৪৮ ঘণ্টার মধ্যে প্রাথমিক পর্যালোচনা সম্পন্ন হবে।'
    );
  };

  const handlePlaylistAdd = () => {
    if (!selectedPlaylistId) return;
    onAddToPlaylist(selectedPlaylistId, item.id);
    const pl = playlists.find((p) => p.id === selectedPlaylistId);
    setPlaylistFeedback(`"${pl?.name}" প্লেলিস্টে কন্টেন্টটি সংরক্ষিত হয়েছে।`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#0F5132] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ডিরেক্টরি তালিকায় ফিরে যান
        </button>

        <span className="text-xs font-mono text-stone-500">{shareUrl}</span>
      </div>

      {/* Main Content Accession Frame */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left 5 columns: Modest Thumbnail Frame */}
          <div className="lg:col-span-5 bg-stone-900 relative min-h-[280px] flex flex-col justify-between">
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 flex flex-col justify-between">
              <div className="text-xs font-medium text-white/90">
                <span>অটো-প্লে নিষ্ক্রিয় · শালীন থাম্বনেইল যাচাইকৃত</span>
              </div>
              <div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-lg bg-[#C9A227] text-stone-950 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#b8921f] transition-colors shadow-sm"
                >
                  মূল উৎসে কন্টেন্টটি দেখুন / শুনুন
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-[11px] text-white/75 mt-2 text-center">
                  কপিরাইট সুরক্ষার স্বার্থে entertainment.bd নিজস্ব সার্ভারে ভিডিও হোস্ট করে না; যাচাইকৃত মূল লিংকে নিয়ে যায়।
                </p>
              </div>
            </div>
          </div>

          {/* Right 7 columns: Metadata & Verification Record */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Quiet unboxed metadata line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-3">
                <span className="inline-flex items-center gap-1 font-semibold text-[#0F5132]">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5132]" />
                  যাচাইকৃত ✓ ({item.verifiedAt || '২০২৬-১১'})
                </span>
                <span aria-hidden="true">·</span>
                <span>{CONTENT_TYPE_LABELS[item.contentType]}</span>
                <span aria-hidden="true">·</span>
                <span>ভাষা: {LANGUAGE_LABELS[item.language]?.nameBn || item.language}</span>
                <span aria-hidden="true">·</span>
                <span>{AGE_GROUP_LABELS[item.ageGroup]}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                {item.title}
              </h1>
              {item.titleEn && (
                <p className="text-sm text-stone-500 mt-1 font-serif italic">{item.titleEn}</p>
              )}

              <p className="mt-4 text-sm sm:text-base text-stone-700 leading-relaxed">
                {item.description}
              </p>

              {/* Verification Accession Definition List */}
              <dl className="mt-6 pt-5 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-stone-500">শ্রবণগত ও সংগীত মানদণ্ড</dt>
                  <dd className="font-semibold text-[#0F5132] mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    {item.audioPolicyNote}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">অর্থনৈতিক ও বিজ্ঞাপন বৈধতা</dt>
                  <dd className="font-semibold text-stone-900 mt-0.5">{item.financialPolicyNote}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">যাচাইকারী মডারেটর</dt>
                  <dd className="font-medium text-stone-800 mt-0.5">
                    {item.verifiedBy || 'শরিয়াহ মডারেশন বোর্ড'}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">গড় ব্যবহারকারী রেটিং</dt>
                  <dd className="font-semibold text-stone-900 mt-0.5 tabular-nums inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                    {item.avgRating.toFixed(1)} / ৫.০ ({item.ratingCount}টি রিভিউ)
                  </dd>
                </div>
              </dl>
            </div>

            {/* Action Bar: Bookmark, Share, Add to Playlist, Report */}
            <div className="mt-6 pt-5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleBookmark(item.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                    isBookmarked
                      ? 'bg-[#0F5132] text-white border-[#0F5132]'
                      : 'border-stone-300 text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isBookmarked ? 'বুকমার্ক করা হয়েছে' : 'বুকমার্ক করুন'}
                </button>

                <button
                  type="button"
                  onClick={handleShareCopy}
                  aria-label="শেয়ার করুন (Share)"
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-stone-300 text-stone-800 hover:bg-stone-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#0F5132]" />
                  শেয়ার করুন (Share)
                </button>

                {playlists.length > 0 && (
                  <div className="inline-flex items-center gap-1.5">
                    <select
                      aria-label="প্লেলিস্ট নির্বাচন করুন"
                      value={selectedPlaylistId}
                      onChange={(e) => setSelectedPlaylistId(e.target.value)}
                      className="px-2.5 py-2 rounded-lg border border-stone-300 bg-white text-xs text-stone-800"
                    >
                      {playlists.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handlePlaylistAdd}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-[#0F5132]" />
                      প্লেলিস্টে যোগ
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowReportForm((prev) => !prev)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Flag className="w-3.5 h-3.5" />
                কন্টেন্ট রিপোর্ট / ফ্ল্যাগ করুন
              </button>
            </div>

            {shareFeedback && (
              <div
                role="status"
                className="mt-3 p-3 rounded-lg bg-[#0F5132]/10 border border-[#0F5132]/30 text-xs font-semibold text-[#0F5132] flex items-center justify-between gap-2"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {shareFeedback}
                </span>
                <button
                  type="button"
                  onClick={() => setShareFeedback(null)}
                  className="text-[11px] underline whitespace-nowrap"
                >
                  বন্ধ করুন
                </button>
              </div>
            )}
            {playlistFeedback && (
              <p className="mt-2 text-xs font-medium text-[#0F5132]">{playlistFeedback}</p>
            )}
            {reportMessage && (
              <p className="mt-2 text-xs font-medium text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                {reportMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Conditional Report Form (/report/:id inline workflow) */}
      {showReportForm && (
        <form
          onSubmit={handleReportSubmit}
          className="mt-6 bg-white border border-red-200 rounded-xl p-6"
        >
          <h2 className="text-lg font-bold text-stone-900">
            কন্টেন্ট মানদণ্ড বিচ্যুতি রিপোর্ট ফর্ম (/report/{item.id})
          </h2>
          <p className="text-xs text-stone-600 mt-1 mb-4">
            লিংকড কন্টেন্ট পরবর্তীতে পরিবর্তিত হয়ে গেলে বা কোনো অশালীন/সুদভিত্তিক বিজ্ঞাপন দেখা গেলে আমাদের জানান। ২৪-৪৮ ঘণ্টার মধ্যে মডারেটর টিম ব্যবস্থা নেবে।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="report-reason" className="block text-xs font-semibold text-stone-700 mb-1">
                অভিযোগের কারণ
              </label>
              <select
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ReportReason)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
              >
                <option value="immodesty">দৃশ্যগত অশালীনতা বা পর্দার খেলাপ (immodesty)</option>
                <option value="music_instruments">নীতিবহির্ভূত বাদ্যযন্ত্রের ব্যবহার (music_instruments)</option>
                <option value="financial_haram">সুদ/জুয়া বা হারাম স্পনসরশিপ (financial_haram)</option>
                <option value="hate_speech">ঘৃণাত্মক বা উস্কানিমূলক বক্তব্য (hate_speech)</option>
                <option value="other">অন্যান্য / অকেজো লিংক (other)</option>
              </select>
            </div>
            <div>
              <label htmlFor="reporter-name" className="block text-xs font-semibold text-stone-700 mb-1">
                আপনার নাম
              </label>
              <input
                id="reporter-name"
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="report-details" className="block text-xs font-semibold text-stone-700 mb-1">
              বিস্তারিত বিবরণ (কোন মিনিটে বা কী সমস্যা দেখা গেছে)
            </label>
            <textarea
              id="report-details"
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="সুনির্দিষ্ট বিবরণ দিন..."
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReportForm(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-700 text-white hover:bg-red-800"
            >
              রিপোর্ট জমা দিন
            </button>
          </div>
        </form>
      )}

      {/* Reviews & 5-Star Rating Section */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <h2 className="text-xl font-bold text-stone-900 mb-4">
            পাঠক ও অভিভাবকদের রিভিউ ({reviews.length})
          </h2>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-6 text-sm text-stone-500">
                এখনও কোনো রিভিউ জমা পড়েনি। প্রথম রিভিউটি আপনিই লিখুন!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-stone-200 rounded-xl p-5">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span className="font-bold text-stone-900 text-sm">{rev.userName}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-stone-800 tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                      {rev.rating}.০ / ৫ · {rev.createdAt}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Review Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white border border-stone-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-stone-900 mb-1">আপনার রেটিং ও মতামত দিন</h3>
            <p className="text-xs text-stone-500 mb-4">
              কন্টেন্টটির মান ও পারিবারিক উপযোগিতা সম্পর্কে অন্যদের জানান।
            </p>

            {reviewError && (
              <p className="mb-3 text-xs font-medium text-red-700 bg-red-50 p-2.5 rounded-lg">
                {reviewError}
              </p>
            )}
            {reviewSuccess && (
              <p className="mb-3 text-xs font-medium text-[#0F5132] bg-[#0F5132]/10 p-2.5 rounded-lg">
                {reviewSuccess}
              </p>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                তারকা রেটিং নির্বাচন করুন (১ - ৫)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`${star} তারকা রেটিং`}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                      rating >= star
                        ? 'bg-[#C9A227]/20 border-[#C9A227] text-stone-900'
                        : 'border-stone-200 text-stone-400'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        rating >= star ? 'fill-[#C9A227] text-[#C9A227]' : ''
                      }`}
                    />
                    {star}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="reviewer-name" className="block text-xs font-semibold text-stone-700 mb-1">
                আপনার নাম
              </label>
              <input
                id="reviewer-name"
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="উদাঃ মাহমুদ হাসান"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#0F5132]"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="review-comment" className="block text-xs font-semibold text-stone-700 mb-1">
                আপনার রিভিউ
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="কন্টেন্টটি কেন আপনার ভালো লেগেছে তা সংক্ষেপে লিখুন..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#0F5132]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#0F5132] text-white text-xs font-semibold hover:bg-[#0b3e26] transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              রিভিউ জমা দিন
            </button>
          </form>
        </div>
      </div>

      {/* Related Content Suggestions */}
      {relatedItems.length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-200">
          <h2 className="text-2xl font-bold text-stone-900 mb-5">সংশ্লিষ্ট যাচাইকৃত কন্টেন্ট</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedItems.slice(0, 3).map((rel) => (
              <ContentCard
                key={rel.id}
                item={rel}
                isBookmarked={false}
                onSelect={onSelectContent}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
