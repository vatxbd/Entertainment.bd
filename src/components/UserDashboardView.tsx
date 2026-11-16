import React, { useState } from 'react';
import { FolderHeart, FileCheck, MessageSquare, Bookmark, Plus, Trash2, Globe, Lock } from 'lucide-react';
import { ContentItem, Playlist, ReviewItem } from '../types/platform';
import { LANGUAGE_LABELS } from '../data/seedData';

interface UserDashboardViewProps {
  allItems: ContentItem[];
  bookmarkedIds: string[];
  playlists: Playlist[];
  userReviews: ReviewItem[];
  preferredLanguage: string;
  onChangePreferredLanguage: (lang: string) => void;
  onCreatePlaylist: (name: string, description: string, isPublic: boolean) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onSelectContent: (id: string) => void;
  onDeleteReview: (reviewId: string) => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  allItems,
  bookmarkedIds,
  playlists,
  userReviews,
  preferredLanguage,
  onChangePreferredLanguage,
  onCreatePlaylist,
  onDeletePlaylist,
  onSelectContent,
  onDeleteReview,
}) => {
  const [activeSection, setActiveSection] = useState<'playlists' | 'bookmarks' | 'submissions' | 'reviews' | 'settings'>('playlists');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(true);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  const bookmarkedItems = allItems.filter((i) => bookmarkedIds.includes(i.id));

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      setFormNotice('অনুগ্রহ করে প্লেলিস্টের একটি নাম দিন।');
      return;
    }
    onCreatePlaylist(
      newPlaylistName.trim(),
      newPlaylistDesc.trim() || 'পারিবারিক কিউরেটেড প্লেলিস্ট',
      newPlaylistPublic
    );
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setFormNotice('নতুন প্লেলিস্ট সফলভাবে তৈরি হয়েছে!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="border-b border-stone-200 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
            ইউজার প্রোফাইল ও পারিবারিক ড্যাশবোর্ড (/dashboard)
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            আস-সালামু আলাইকুম, পারিবারিক কিউরেশন স্পেস
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            আপনার সংরক্ষিত প্লেলিস্ট, বুকমার্ক, সাবমিশন ট্র্যাকিং এবং রিভিউ ইতিহাস এখানে পরিচালনা করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/75 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSection('playlists')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeSection === 'playlists' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            আমার প্লেলিস্ট ({playlists.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('bookmarks')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeSection === 'bookmarks' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            বুকমার্ক ({bookmarkedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('submissions')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeSection === 'submissions' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            আমার সাবমিশন ({allItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('reviews')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeSection === 'reviews' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            আমার রিভিউ ({userReviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('settings')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeSection === 'settings' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            সেটিংস
          </button>
        </div>
      </div>

      {activeSection === 'playlists' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-[#0F5132]" />
              আমার কিউরেটেড প্লেলিস্টসমূহ
            </h2>

            {playlists.map((pl) => {
              const itemsInPl = allItems.filter((item) => pl.itemIds.includes(item.id));
              return (
                <div key={pl.id} className="bg-white border border-stone-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                        {pl.isPublic ? (
                          <span className="inline-flex items-center gap-1 text-[#0F5132] font-medium">
                            <Globe className="w-3.5 h-3.5" /> পাবলিক প্লেলিস্ট
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-stone-600 font-medium">
                            <Lock className="w-3.5 h-3.5" /> প্রাইভেট প্লেলিস্ট
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{itemsInPl.length}টি কন্টেন্ট</span>
                        <span aria-hidden="true">·</span>
                        <span>তৈরি: {pl.createdAt}</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900">{pl.name}</h3>
                      <p className="text-xs text-stone-600 mt-1">{pl.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeletePlaylist(pl.id)}
                      aria-label={`${pl.name} মুছে ফেলুন`}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                    {itemsInPl.length === 0 ? (
                      <p className="text-xs text-stone-400">
                        এই প্লেলিস্টে এখনও কোনো কন্টেন্ট যোগ করা হয়নি। কন্টেন্ট বিস্তারিত পেইজ থেকে যোগ করুন।
                      </p>
                    ) : (
                      itemsInPl.map((ci) => (
                        <div
                          key={ci.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-stone-50"
                        >
                          <button
                            type="button"
                            onClick={() => onSelectContent(ci.id)}
                            className="font-medium text-stone-800 hover:text-[#0F5132] text-left truncate"
                          >
                            {ci.title}
                          </button>
                          <span className="text-stone-400 shrink-0 ml-2">{ci.audioPolicyNote}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleCreatePlaylist}
              className="bg-white border border-stone-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#0F5132]" />
                নতুন প্লেলিস্ট তৈরি করুন
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                শিশুদের কার্টুন, সাপ্তাহিক তাফসির বা পারিবারিক প্রামাণ্যচিত্রের জন্য আলাদা তালিকা বানান।
              </p>

              {formNotice && (
                <p className="mb-3 text-xs font-medium text-[#0F5132] bg-[#0F5132]/10 p-2.5 rounded-lg">
                  {formNotice}
                </p>
              )}

              <div className="mb-4">
                <label htmlFor="pl-name" className="block text-xs font-semibold text-stone-700 mb-1">
                  প্লেলিস্টের নাম *
                </label>
                <input
                  id="pl-name"
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="উদাঃ রমজান প্রস্তুতি লেকচার সিরিজ"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#0F5132]"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="pl-desc" className="block text-xs font-semibold text-stone-700 mb-1">
                  বিবরণ
                </label>
                <textarea
                  id="pl-desc"
                  rows={2}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="সংক্ষিপ্ত নোট..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#0F5132]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-700 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPlaylistPublic}
                  onChange={(e) => setNewPlaylistPublic(e.target.checked)}
                  className="rounded border-stone-300 text-[#0F5132]"
                />
                পাবলিক প্লেলিস্ট (অন্যান্য পরিবার দেখতে ও উপকৃত হতে পারবে)
              </label>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F5132] text-white text-xs font-semibold hover:bg-[#0b3e26] transition-colors"
              >
                প্লেলিস্ট সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSection === 'bookmarks' && (
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#0F5132]" />
            সংরক্ষিত বুকমার্কসমূহ ({bookmarkedItems.length})
          </h2>
          {bookmarkedItems.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-sm text-stone-500">
              আপনি এখনও কোনো কন্টেন্ট বুকমার্ক করেননি। ডিরেক্টরি ব্রাউজ করার সময় বুকমার্ক বাটনে ক্লিক করে সংরক্ষণ করুন।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs text-[#0F5132] font-semibold">যাচাইকৃত ✓ · {item.audioPolicyNote}</span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">{item.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectContent(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#0F5132] text-white text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    দেখুন
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'submissions' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#0F5132]" />
              সাবমিশন হিস্ট্রি ও মডারেশন স্ট্যাটাস ট্র্যাকার
            </h2>
          </div>
          <div className="divide-y divide-stone-100">
            {allItems.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span>সাবমিটার: {item.submittedBy}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{item.url}</span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                </div>
                <span
                  className={`text-xs font-bold uppercase tabular-nums shrink-0 ${
                    item.status === 'approved'
                      ? 'text-[#0F5132]'
                      : item.status === 'pending'
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  {item.status === 'approved'
                    ? 'Approved ✓'
                    : item.status === 'pending'
                    ? 'Pending Review'
                    : item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'reviews' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0F5132]" />
            প্রদত্ত রিভিউ হিস্ট্রি ({userReviews.length})
          </h2>
          {userReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-stone-200 rounded-xl p-5 flex items-start justify-between gap-4"
            >
              <div>
                <div className="text-xs text-stone-500 mb-1">
                  রেটিং: <strong className="text-stone-900">{rev.rating}/৫</strong> · লেখক: {rev.userName} · {rev.createdAt}
                </div>
                <p className="text-sm text-stone-800">{rev.comment}</p>
              </div>
              <button
                type="button"
                onClick={() => onDeleteReview(rev.id)}
                className="text-xs text-red-600 hover:underline shrink-0"
              >
                ডিলিট
              </button>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 max-w-xl">
          <h2 className="text-xl font-bold text-stone-900 mb-4">প্রোফাইল ও বহুভাষিক পছন্দ সেটিংস</h2>
          <div className="mb-4">
            <label htmlFor="pref-lang" className="block text-xs font-bold text-stone-700 mb-1.5">
              প্রাথমিক কন্টেন্ট ভাষা (৯টি বৈশ্বিক ভাষা সমর্থিত)
            </label>
            <select
              id="pref-lang"
              value={preferredLanguage}
              onChange={(e) => onChangePreferredLanguage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm bg-white"
            >
              <option value="all">সকল ভাষা (All Languages)</option>
              {Object.entries(LANGUAGE_LABELS).map(([code, obj]) => (
                <option key={code} value={code}>
                  {obj.nameBn} — {obj.native}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-stone-500">
            আরবি (العربية), উর্দু (اردو) ও ফার্সি (فارسی) ভাষার ক্ষেত্রে স্বয়ংক্রিয়ভাবে RTL (ডান-থেকে-বাম) ফন্ট সাপোর্ট কার্যকর হয়।
          </p>
        </div>
      )}
    </div>
  );
};
