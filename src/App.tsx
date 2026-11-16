/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  Search,
  LayoutGrid,
  List,
  Compass,
  Clock,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Film,
  Tv,
  Headphones,
  Smartphone,
  Globe,
  PlusCircle,
  User,
  Sparkles,
  Mail,
  MapPin,
} from 'lucide-react';
import {
  ContentItem,
  ReviewItem,
  ReportItem,
  Playlist,
  ModerationLog,
  ModerationChecklist,
  ContentType,
  AgeGroup,
  LanguageCode,
  ReportReason,
} from './types/platform';
import {
  HERO_IMAGE_URL,
  INITIAL_CATEGORIES,
  INITIAL_CONTENT_ITEMS,
  INITIAL_REVIEWS,
  INITIAL_REPORTS,
  INITIAL_PLAYLISTS,
  INITIAL_MODERATION_LOGS,
  INITIAL_BLOG_ARTICLES,
  CITY_PRAYER_SCHEDULES,
  LANGUAGE_LABELS,
  AGE_GROUP_LABELS,
  CONTENT_TYPE_LABELS,
} from './data/seedData';
import {
  filterAndSortContent,
  calculateUpdatedRating,
  calculateQiblaBearing,
  getNextPrayer,
} from './utils/directoryRules';
import { ContentCard } from './components/ContentCard';
import { ContentDetailView } from './components/ContentDetailView';
import { SubmitContentView } from './components/SubmitContentView';
import { AdminModerationView } from './components/AdminModerationView';
import { UserDashboardView } from './components/UserDashboardView';
import { PrayerQiblaView } from './components/PrayerQiblaView';
import { StandardsAndInfoView } from './components/StandardsAndInfoView';

type ActiveRoute =
  | 'home'
  | 'browse'
  | 'curated'
  | 'detail'
  | 'submit'
  | 'dashboard'
  | 'admin'
  | 'prayer-times'
  | 'standards'
  | 'about'
  | 'blog'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'contact';

export default function App() {
  const [route, setRoute] = useState<ActiveRoute>('home');
  const [selectedContentId, setSelectedContentId] = useState<string>(INITIAL_CONTENT_ITEMS[0].id);

  // Core Database State
  const [items, setItems] = useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>(INITIAL_MODERATION_LOGS);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    'item-samarkand-observatory',
    'item-olive-courtyard-kids',
  ]);

  // Browse & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | 'all'>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | 'all'>('all');
  const [selectedContentType, setSelectedContentType] = useState<ContentType | 'all'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [curatedPeriod, setCuratedPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // Prayer & Newsletter State
  const [selectedCityId, setSelectedCityId] = useState<string>('dhaka');
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterLang, setNewsletterLang] = useState<string>('bn');
  const [newsletterConfirmed, setNewsletterConfirmed] = useState<boolean>(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const isRtlLanguage =
    selectedLanguage === 'ar' || selectedLanguage === 'ur' || selectedLanguage === 'fa';

  const filteredItems = useMemo(
    () =>
      filterAndSortContent(items, {
        query: searchQuery,
        categorySlug: selectedCategory,
        language: selectedLanguage,
        ageGroup: selectedAgeGroup,
        contentType: selectedContentType,
        minRating,
        tag: selectedTag,
        sortBy,
      }),
    [
      items,
      searchQuery,
      selectedCategory,
      selectedLanguage,
      selectedAgeGroup,
      selectedContentType,
      minRating,
      selectedTag,
      sortBy,
    ]
  );

  const weeklyCuratedItems = useMemo(
    () => items.filter((i) => i.status === 'approved' && i.isWeeklyPick),
    [items]
  );
  const monthlyCuratedItems = useMemo(
    () => items.filter((i) => i.status === 'approved' && i.isMonthlyPick),
    [items]
  );
  const pendingItems = useMemo(() => items.filter((i) => i.status === 'pending'), [items]);

  const activeCitySchedule =
    CITY_PRAYER_SCHEDULES.find((c) => c.id === selectedCityId) || CITY_PRAYER_SCHEDULES[0];
  const nextPrayerInfo = getNextPrayer(activeCitySchedule, '14:30');
  const currentQibla = calculateQiblaBearing(activeCitySchedule.lat, activeCitySchedule.lng);

  // Handlers
  const handleOpenDetail = (id: string) => {
    setSelectedContentId(id);
    setRoute('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRoute('browse');
  };

  const handleSelectCategoryCard = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedTag('');
    setRoute('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setRoute('browse');
  };

  const handleAddReview = (
    contentId: string,
    rating: number,
    comment: string,
    userName: string
  ) => {
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      contentId,
      userId: 'current-user',
      userName,
      rating,
      comment,
      createdAt: '২০২৬-১১-১৬',
    };
    setReviews((prev) => [newRev, ...prev]);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== contentId) return item;
        const updated = calculateUpdatedRating(item.avgRating, item.ratingCount, rating);
        return { ...item, ...updated };
      })
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const handleSubmitReport = (
    contentId: string,
    reason: ReportReason,
    details: string,
    reporterName: string
  ) => {
    const target = items.find((i) => i.id === contentId);
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      contentId,
      contentTitle: target?.title || 'ডিরেক্টরি আইটেম',
      reportedBy: reporterName,
      reason,
      details,
      status: 'open',
      createdAt: '২০২৬-১১-১৬',
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const handleSubmitNewContent = (
    newItemData: Omit<ContentItem, 'id' | 'status' | 'avgRating' | 'ratingCount' | 'createdAt'>
  ) => {
    const created: ContentItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
      status: 'pending',
      avgRating: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [created, ...prev]);
  };

  const handleApproveContent = (
    contentId: string,
    checklist: ModerationChecklist,
    notes: string,
    isDualStep1 = false
  ) => {
    const target = items.find((i) => i.id === contentId);
    if (!target) return;

    if (isDualStep1) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === contentId
            ? { ...item, firstModeratorApprovedBy: 'জুনিয়র মডারেটর (১ম ধাপ)' }
            : item
        )
      );
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === contentId
            ? {
                ...item,
                status: 'approved',
                verifiedAt: '২০২৬-১১-১৬',
                verifiedBy: 'সিনিয়র শরিয়াহ মডারেটর',
                avgRating: 5.0,
                ratingCount: 1,
              }
            : item
        )
      );
    }

    const newLog: ModerationLog = {
      id: `log-${Date.now()}`,
      contentId,
      contentTitle: target.title,
      moderatorName: isDualStep1 ? 'জুনিয়র মডারেটর' : 'সিনিয়র শরিয়াহ মডারেটর',
      action: isDualStep1 ? 'dual_step_1' : 'approved',
      checklistSnapshot: { ...checklist },
      notes,
      createdAt: '২০২৬-১১-১৬',
    };
    setModerationLogs((prev) => [newLog, ...prev]);
  };

  const handleRejectContent = (
    contentId: string,
    checklist: ModerationChecklist,
    notes: string
  ) => {
    const target = items.find((i) => i.id === contentId);
    if (!target) return;

    setItems((prev) =>
      prev.map((item) => (item.id === contentId ? { ...item, status: 'rejected' } : item))
    );

    const newLog: ModerationLog = {
      id: `log-${Date.now()}`,
      contentId,
      contentTitle: target.title,
      moderatorName: 'সিনিয়র শরিয়াহ মডারেটর',
      action: 'rejected',
      checklistSnapshot: { ...checklist },
      notes,
      createdAt: '২০২৬-১১-১৬',
    };
    setModerationLogs((prev) => [newLog, ...prev]);
  };

  const handleResolveReport = (
    reportId: string,
    resolution: 'resolved' | 'dismissed',
    unpublishContent: boolean
  ) => {
    const targetRep = reports.find((r) => r.id === reportId);
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: resolution, resolvedAt: '২০২৬-১১-১৬' } : r
      )
    );
    if (unpublishContent && targetRep) {
      setItems((prev) =>
        prev.map((i) => (i.id === targetRep.contentId ? { ...i, status: 'flagged' } : i))
      );
    }
  };

  const handleCreatePlaylist = (name: string, description: string, isPublic: boolean) => {
    const created: Playlist = {
      id: `pl-${Date.now()}`,
      userId: 'current-user',
      name,
      description,
      isPublic,
      itemIds: [],
      createdAt: '২০২৬-১১-১৬',
    };
    setPlaylists((prev) => [created, ...prev]);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const handleAddToPlaylist = (playlistId: string, contentId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        if (p.itemIds.includes(contentId)) return p;
        return { ...p, itemIds: [...p.itemIds, contentId] };
      })
    );
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError(null);
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      setNewsletterError('অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা প্রদান করুন।');
      return;
    }
    setNewsletterConfirmed(true);
    setNewsletterEmail('');
  };

  const selectedDetailItem =
    items.find((i) => i.id === selectedContentId) || INITIAL_CONTENT_ITEMS[0];

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      libraries={['places', 'marker', 'maps']}
      language="bn"
      region="BD"
    >
      <div dir={isRtlLanguage ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C1917]">
        {gmpQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
        {/* Strict 3-Zone Top Bar Contract */}
        <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 border-b border-stone-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setRoute('home');
          }}
          className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F5132] font-editorial whitespace-nowrap shrink-0"
        >
          entertainment.bd
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav aria-label="প্রধান নেভিগেশন" className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
          <a
            href="#browse"
            onClick={(e) => {
              e.preventDefault();
              setRoute('browse');
            }}
            className={`hover:text-[#0F5132] transition-colors whitespace-nowrap shrink-0 ${
              route === 'browse' ? 'text-[#0F5132] underline underline-offset-4 font-semibold' : ''
            }`}
          >
            ডিরেক্টরি ব্রাউজ
          </a>
          <a
            href="#curated"
            onClick={(e) => {
              e.preventDefault();
              setRoute('curated');
            }}
            className={`hover:text-[#0F5132] transition-colors whitespace-nowrap shrink-0 ${
              route === 'curated' ? 'text-[#0F5132] underline underline-offset-4 font-semibold' : ''
            }`}
          >
            সাপ্তাহিক বাছাই
          </a>
          <a
            href="#standards"
            onClick={(e) => {
              e.preventDefault();
              setRoute('standards');
            }}
            className={`hover:text-[#0F5132] transition-colors whitespace-nowrap shrink-0 ${
              route === 'standards' ? 'text-[#0F5132] underline underline-offset-4 font-semibold' : ''
            }`}
          >
            মানদণ্ড নীতিমালা
          </a>
          <a
            href="#prayer-times"
            onClick={(e) => {
              e.preventDefault();
              setRoute('prayer-times');
            }}
            className={`hover:text-[#0F5132] transition-colors whitespace-nowrap shrink-0 ${
              route === 'prayer-times' ? 'text-[#0F5132] underline underline-offset-4 font-semibold' : ''
            }`}
          >
            নামাজ ও কিবলা
          </a>
          <a
            href="#admin"
            onClick={(e) => {
              e.preventDefault();
              setRoute('admin');
            }}
            className={`hover:text-[#0F5132] transition-colors whitespace-nowrap shrink-0 ${
              route === 'admin' ? 'text-[#0F5132] underline underline-offset-4 font-semibold' : ''
            }`}
          >
            মডারেশন প্যানেল ({pendingItems.length})
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setRoute('submit')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F5132] rounded-lg hover:bg-[#0b3e26] transition-colors whitespace-nowrap shrink-0"
          >
            কন্টেন্ট সাবমিট করুন
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 pb-20 md:pb-12">
        {route === 'home' && (
          <div>
            {/* Section 3.1 & 6: Hero Section with Dark Green & Gold Gradient + Geometric Pattern Border */}
            <section className="relative bg-gradient-to-br from-[#093420] via-[#0F5132] to-[#13402c] text-white border-b-4 border-[#C9A227] overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                {/* Left 7 Cols: Value Proposition + Search Bar + Language Switcher */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#C9A227] font-semibold mb-3">
                      বৈশ্বিক হালাল বিনোদন ডিরেক্টরি ও কিউরেশন প্ল্যাটফর্ম
                    </p>
                    <h1
                      style={{ fontSize: 'clamp(2.15rem, 3.8vw, 3.5rem)' }}
                      className="font-bold leading-[1.15] text-white"
                    >
                      এক জায়গায়, যাচাইকৃত ও রেটিংসহ হালাল বিনোদনের সবচেয়ে বড় ডিরেক্টরি
                    </h1>
                    <p className="mt-4 text-sm sm:text-base text-emerald-50/90 leading-relaxed max-w-2xl">
                      দৃশ্যগত শালীনতা, কণ্ঠপ্রধান শ্রবণমান এবং সুদ-জুয়ামুক্ত অর্থনৈতিক বৈধতার ৮-দফা মানদণ্ডে যাচাইকৃত ইউটিউব চ্যানেল, প্রামাণ্যচিত্র, শিশুতোষ অ্যানিমেশন, পডকাস্ট ও অ্যাপের নির্ভরযোগ্য পারিবারিক সংগ্রহশালা।
                    </p>

                    {/* Central Wide Search Bar */}
                    <form onSubmit={handleHeroSearchSubmit} className="mt-7 max-w-2xl">
                      <label htmlFor="hero-search" className="sr-only">
                        হালাল কন্টেন্ট খুঁজুন
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5 bg-white/10 p-2 rounded-xl border border-white/20">
                        <div className="flex-1 flex items-center gap-2.5 bg-white rounded-lg px-3.5 py-2.5 text-stone-900">
                          <Search className="w-4 h-4 text-stone-400 shrink-0" />
                          <input
                            id="hero-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="প্রামাণ্যচিত্র, শিশুতোষ কার্টুন, তাফসির বা পডকাস্ট খুঁজুন..."
                            className="w-full text-sm bg-transparent focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-[#C9A227] text-stone-950 font-bold text-xs sm:text-sm hover:bg-[#d8b132] transition-colors whitespace-nowrap shrink-0"
                        >
                          ডিরেক্টরিতে খুঁজুন
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Multilingual Quick Selector & User Dashboard Entry */}
                  <div className="mt-8 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[#C9A227] font-semibold">বহুভাষিক ফিল্টার (৯টি ভাষা):</span>
                      {(['all', 'bn', 'en', 'ar', 'ur', 'tr', 'id'] as const).map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(code);
                            setRoute('browse');
                          }}
                          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                            selectedLanguage === code
                              ? 'bg-[#C9A227] text-stone-950 font-bold'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {code === 'all' ? 'সব ভাষা' : LANGUAGE_LABELS[code].native}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setRoute('dashboard')}
                      className="text-white hover:text-[#C9A227] font-semibold underline underline-offset-4 inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <User className="w-3.5 h-3.5" />
                      আমার প্লেলিস্ট ও ড্যাশবোর্ড →
                    </button>
                  </div>
                </div>

                {/* Right 5 Cols: Architectural Visual Frame */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="relative flex-1 min-h-[280px] rounded-xl overflow-hidden border border-[#C9A227]/40 shadow-lg">
                    <img
                      src={HERO_IMAGE_URL}
                      alt="Tayyib Vista ইসলামিক সাংস্কৃতিক গ্রন্থাগার ও মিডিয়া আর্কাইভ"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 flex flex-col justify-end">
                      <p className="text-xs text-[#C9A227] font-semibold uppercase tracking-wider">
                        কন্টেন্ট-স্ট্যান্ডার্ড ভিত্তিক কিউরেশন
                      </p>
                      <p className="text-base font-bold text-white mt-1">
                        ১০০% অটো-প্লে মুক্ত থাম্বনেইল · ৮-দফা শরিয়াহ চেকলিস্ট · ৬ মাস অন্তর রি-অডিট
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-emerald-100 tabular-nums">
                        <span>যাচাইকৃত কন্টেন্ট: ২৩৫+</span>
                        <span aria-hidden="true">·</span>
                        <span>ভাষা: ৯টি</span>
                        <span aria-hidden="true">·</span>
                        <span>ভলান্টিয়ার মডারেটর: ৪৮ জন</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Operational Utility Bar: Live Prayer Time & Qibla Strip */}
            <div className="bg-white border-b border-stone-200 px-4 sm:px-8 py-3">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-stone-700">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#0F5132]">
                    <Clock className="w-3.5 h-3.5" />
                    নামাজের সময়সূচি ({activeCitySchedule.cityBn}):
                  </span>
                  <span className="tabular-nums">ফজর {activeCitySchedule.fajr}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">যোহর {activeCitySchedule.dhuhr}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums font-semibold text-[#0F5132]">
                    আসর {activeCitySchedule.asr} (পরবর্তী: {nextPrayerInfo.nameBn})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">মাগরিব {activeCitySchedule.maghrib}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">ইশা {activeCitySchedule.isha}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1 font-semibold text-stone-800 tabular-nums">
                    <Compass className="w-3.5 h-3.5 text-[#C9A227]" />
                    কিবলা কোণ: {currentQibla}° (পশ্চিম-উত্তরপশ্চিম)
                  </span>
                  <button
                    type="button"
                    onClick={() => setRoute('prayer-times')}
                    className="inline-flex items-center gap-1 text-[#0F5132] font-semibold hover:underline whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    গুগল ম্যাপ, কিবলা ও মসজিদ খুঁজুন →
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3.1: Featured Categories Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
                    বিষয়ভিত্তিক ডিরেক্টরি (/browse/category)
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                    ফিচারড হালাল বিনোদন ক্যাটাগরিসমূহ
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setRoute('browse');
                  }}
                  className="text-xs font-semibold text-[#0F5132] hover:underline whitespace-nowrap"
                >
                  সম্পূর্ণ ডিরেক্টরি ব্রাউজ করুন ({items.filter((i) => i.status === 'approved').length}টি আইটেম) →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {INITIAL_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategoryCard(cat.slug)}
                    className={`text-left p-5 rounded-xl bg-white border border-stone-200/90 hover:border-[#0F5132] transition-colors flex flex-col justify-between ${
                      idx === 0 ? 'lg:col-span-2 bg-gradient-to-br from-white to-[#0F5132]/5' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                        <span className="font-mono font-semibold text-[#0F5132] tabular-nums">
                          {`0${idx + 1}`}. {cat.nameEn}
                        </span>
                        <span className="tabular-nums font-medium">{cat.count}টি এন্ট্রি</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900">{cat.nameBn}</h3>
                      <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                        {cat.descriptionBn}
                      </p>
                    </div>
                    <span className="mt-4 text-xs font-semibold text-[#0F5132] inline-block">
                      ক্যাটাগরি দেখুন →
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Section 3.1: "এই সপ্তাহের বাছাই" (Weekly Curated Picks) */}
            <section className="bg-stone-100/80 border-y border-stone-200/90 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
                      সম্পাদকীয় কিউরেশন (/curated/weekly)
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                      এই সপ্তাহের বাছাইকৃত হালাল কন্টেন্ট
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1">
                      আমাদের শরিয়াহ ও শালীনতা মডারেশন বোর্ড কর্তৃক সপরিবারে দেখার জন্য বিশেষভাবে নির্বাচিত।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRoute('curated')}
                    className="px-4 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-50 whitespace-nowrap self-start sm:self-auto"
                  >
                    সাপ্তাহিক ও মাসিক আর্কাইভ দেখুন
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {weeklyCuratedItems.map((item) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onSelect={handleOpenDetail}
                      onToggleBookmark={handleToggleBookmark}
                      onTagClick={handleTagClick}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Recent Blog Posts & Editorial Standards Preview */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
                    গবেষণা ও ব্লগ (/blog)
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                    সাম্প্রতিক প্রবন্ধ ও কন্টেন্ট মানদণ্ড বিশ্লেষণ
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setRoute('blog')}
                  className="text-xs font-semibold text-[#0F5132] hover:underline whitespace-nowrap"
                >
                  সকল প্রবন্ধ পড়ুন →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {INITIAL_BLOG_ARTICLES.map((art) => (
                  <article
                    key={art.id}
                    className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs text-stone-500 mb-2">
                        <span className="font-semibold text-[#0F5132]">{art.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{art.publishedAt}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{art.readTimeMinutes} মিনিট পাঠ</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 leading-snug">
                        <button
                          type="button"
                          onClick={() => setRoute('blog')}
                          className="text-left hover:text-[#0F5132] transition-colors"
                        >
                          {art.title}
                        </button>
                      </h3>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-500">{art.authorName}</span>
                      <button
                        type="button"
                        onClick={() => setRoute('blog')}
                        className="font-semibold text-[#0F5132] hover:underline"
                      >
                        পড়ুন →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Newsletter Subscription CTA Section (/newsletter) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-6">
              <div className="bg-[#0F5132] text-white rounded-2xl p-6 sm:p-10 border border-[#C9A227]/40 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7">
                  <p className="text-xs uppercase tracking-widest text-[#C9A227] font-semibold">
                    সাপ্তাহিক পারিবারিক ডাইজেস্ট (/newsletter)
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-1">
                    প্রতি শুক্রবার নতুন যাচাইকৃত হালাল কন্টেন্টের তালিকা ইমেইলে পান
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-xl">
                    কোনো স্প্যাম বা সুদভিত্তিক বিজ্ঞাপন নয়—শুধুমাত্র আপনার পরিবারের ভাষা ও বয়স অনুযায়ী বাছাইকৃত সেরা ৫টি নতুন শিক্ষামূলক ভিডিও, পডকাস্ট ও অ্যাপের আপডেট।
                  </p>
                </div>

                <div className="lg:col-span-5">
                  {newsletterConfirmed ? (
                    <div className="p-4 rounded-xl bg-white/10 border border-[#C9A227] text-sm text-white">
                      <p className="font-bold text-[#C9A227]">আলহামদুলিল্লাহ! সাবস্ক্রিপশন সম্পন্ন হয়েছে।</p>
                      <p className="text-xs text-emerald-100 mt-1">
                        আপনার নির্বাচিত ভাষায় ({LANGUAGE_LABELS[newsletterLang]?.nameBn}) সাপ্তাহিক নিউজলেটার পাঠানো হবে।
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                      {newsletterError && (
                        <p className="text-xs text-amber-300 font-medium">{newsletterError}</p>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          aria-label="ইমেইল ঠিকানা"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder="আপনার ইমেইল ঠিকানা লিখুন..."
                          className="flex-1 px-3.5 py-2.5 rounded-lg bg-white text-stone-900 text-sm focus:outline-none"
                        />
                        <select
                          aria-label="নিউজলেটারের ভাষা"
                          value={newsletterLang}
                          onChange={(e) => setNewsletterLang(e.target.value)}
                          className="px-3 py-2.5 rounded-lg bg-emerald-950 text-white border border-white/20 text-xs"
                        >
                          <option value="bn">বাংলা</option>
                          <option value="en">English</option>
                          <option value="ar">العربية</option>
                          <option value="ur">اردو</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-lg bg-[#C9A227] text-stone-950 font-bold text-xs sm:text-sm hover:bg-[#d8b132] transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-4 h-4" />
                        নিউজলেটারে যুক্ত হোন
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Section 3.2: Browse / Directory Page (/browse) */}
        {route === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
            <div className="border-b border-stone-200 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
                  যাচাইকৃত হালাল ডিরেক্টরি (/browse)
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
                  সকল কন্টেন্ট ব্রাউজ ও ফিল্টার করুন
                </h1>
                <p className="text-sm text-stone-600 mt-1">
                  ভাষা, বয়স গ্রুপ, কন্টেন্টের ধরন ও ন্যূনতম রেটিং অনুযায়ী আপনার পরিবারের উপযোগী বিনোদন বেছে নিন।
                </p>
              </div>

              {/* Sort & Grid/List View Toggle */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <label htmlFor="sort-select" className="text-stone-600 font-medium">
                    সর্টিং:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800"
                  >
                    <option value="popular">জনপ্রিয়তা (সর্বাধিক রিভিউ)</option>
                    <option value="rating">সর্বোচ্চ রেটিং (৫★ প্রথম)</option>
                    <option value="newest">নতুন সংযোজন</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 p-1 bg-stone-200/75 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('grid')}
                    aria-label="গ্রিড ভিউ"
                    className={`p-1.5 rounded-md transition-colors ${
                      layoutMode === 'grid' ? 'bg-white text-[#0F5132] shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('list')}
                    aria-label="লিস্ট ভিউ"
                    className={`p-1.5 rounded-md transition-colors ${
                      layoutMode === 'list' ? 'bg-white text-[#0F5132] shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 3 Columns: Faceted Filter Panel */}
              <aside className="lg:col-span-3 space-y-5">
                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900">ফিল্টার প্যানেল</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedLanguage('all');
                        setSelectedAgeGroup('all');
                        setSelectedContentType('all');
                        setMinRating(0);
                        setSelectedTag('');
                      }}
                      className="text-xs font-semibold text-[#0F5132] hover:underline"
                    >
                      রিসেট করুন
                    </button>
                  </div>

                  {/* Keyword Input */}
                  <div>
                    <label htmlFor="browse-search" className="block text-xs font-semibold text-stone-700 mb-1">
                      শিরোনাম বা ট্যাগ খুঁজুন
                    </label>
                    <input
                      id="browse-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="শব্দ লিখুন..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:border-[#0F5132]"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label htmlFor="filter-cat" className="block text-xs font-semibold text-stone-700 mb-1">
                      ক্যাটাগরি
                    </label>
                    <select
                      id="filter-cat"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs text-stone-800"
                    >
                      <option value="all">সকল ক্যাটাগরি</option>
                      {INITIAL_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <label htmlFor="filter-lang" className="block text-xs font-semibold text-stone-700 mb-1">
                      ভাষা (৯টি ভাষা)
                    </label>
                    <select
                      id="filter-lang"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs text-stone-800"
                    >
                      <option value="all">সকল ভাষা</option>
                      {Object.entries(LANGUAGE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.nameBn} ({v.native})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Age Group Filter */}
                  <div>
                    <label htmlFor="filter-age" className="block text-xs font-semibold text-stone-700 mb-1">
                      বয়স গ্রুপ
                    </label>
                    <select
                      id="filter-age"
                      value={selectedAgeGroup}
                      onChange={(e) => setSelectedAgeGroup(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs text-stone-800"
                    >
                      <option value="all">সকল বয়স</option>
                      {Object.entries(AGE_GROUP_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Content Type Filter */}
                  <div>
                    <label htmlFor="filter-type" className="block text-xs font-semibold text-stone-700 mb-1">
                      কন্টেন্ট টাইপ
                    </label>
                    <select
                      id="filter-type"
                      value={selectedContentType}
                      onChange={(e) => setSelectedContentType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs text-stone-800"
                    >
                      <option value="all">সকল মাধ্যম (ভিডিও/অ্যাপ/পডকাস্ট)</option>
                      {Object.entries(CONTENT_TYPE_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Minimum Rating Filter */}
                  <div>
                    <label htmlFor="filter-rating" className="block text-xs font-semibold text-stone-700 mb-1">
                      ন্যূনতম রেটিং
                    </label>
                    <select
                      id="filter-rating"
                      value={minRating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs text-stone-800"
                    >
                      <option value={0}>যেকোনো রেটিং</option>
                      <option value={4.5}>৪.৫★ ও তদূর্ধ্ব</option>
                      <option value={4.8}>৪.৮★ ও তদূর্ধ্ব</option>
                    </select>
                  </div>

                  {selectedTag && (
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-[#0F5132] font-semibold">ট্যাগ: #{selectedTag}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTag('')}
                        className="text-stone-500 hover:text-stone-800 underline"
                      >
                        মুছুন
                      </button>
                    </div>
                  )}
                </div>
              </aside>

              {/* Right 9 Columns: Directory Results */}
              <div className="lg:col-span-9">
                <div className="mb-4 flex items-center justify-between text-xs text-stone-600">
                  <span className="tabular-nums font-medium">
                    মোট <strong className="text-stone-900">{filteredItems.length}টি</strong> যাচাইকৃত হালাল কন্টেন্ট পাওয়া গেছে
                  </span>
                  <span>সকল থাম্বনেইল শালীন ও অটো-প্লে নিষ্ক্রিয়</span>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
                    <p className="text-base font-bold text-stone-800">
                      আপনার নির্বাচিত ফিল্টারে কোনো কন্টেন্ট পাওয়া যায়নি।
                    </p>
                    <p className="text-xs text-stone-500 mt-1 mb-4">
                      ফিল্টারগুলো শিথিল করুন অথবা নতুন কন্টেন্ট ডিরেক্টরিতে যুক্ত করার জন্য সাবমিট করুন।
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedLanguage('all');
                        setSelectedAgeGroup('all');
                        setSelectedContentType('all');
                        setMinRating(0);
                        setSelectedTag('');
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0F5132] text-white text-xs font-semibold"
                    >
                      সকল ফিল্টার রিসেট করুন
                    </button>
                  </div>
                ) : layoutMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        isBookmarked={bookmarkedIds.includes(item.id)}
                        onSelect={handleOpenDetail}
                        onToggleBookmark={handleToggleBookmark}
                        onTagClick={handleTagClick}
                        layout="grid"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredItems.map((item) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        isBookmarked={bookmarkedIds.includes(item.id)}
                        onSelect={handleOpenDetail}
                        onToggleBookmark={handleToggleBookmark}
                        onTagClick={handleTagClick}
                        layout="list"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Curated Weekly / Monthly Page (/curated/weekly, /curated/monthly) */}
        {route === 'curated' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
            <div className="border-b border-stone-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
                  সম্পাদকীয় বাছাই (/curated/{curatedPeriod})
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
                  {curatedPeriod === 'weekly'
                    ? 'এই সপ্তাহের সেরা হালাল বিনোদন সংকলন'
                    : 'এই মাসের শীর্ষ রেটিংপ্রাপ্ত পারিবারিক সংকলন'}
                </h1>
                <p className="text-sm text-stone-600 mt-1">
                  শরিয়াহ মানদণ্ড, নির্মাণশৈলী এবং পারিবারিক শিক্ষার বিচারে আমাদের কিউরেশন টিমের বিশেষ নির্বাচন।
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-stone-200/75 rounded-lg self-start">
                <button
                  type="button"
                  onClick={() => setCuratedPeriod('weekly')}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    curatedPeriod === 'weekly'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600'
                  }`}
                >
                  সাপ্তাহিক বাছাই (/weekly)
                </button>
                <button
                  type="button"
                  onClick={() => setCuratedPeriod('monthly')}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    curatedPeriod === 'monthly'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600'
                  }`}
                >
                  মাসিক বাছাই (/monthly)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(curatedPeriod === 'weekly' ? weeklyCuratedItems : monthlyCuratedItems).map(
                (item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    isBookmarked={bookmarkedIds.includes(item.id)}
                    onSelect={handleOpenDetail}
                    onToggleBookmark={handleToggleBookmark}
                    onTagClick={handleTagClick}
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* Content Detail View (/content/:id & /report/:id) */}
        {route === 'detail' && (
          <ContentDetailView
            item={selectedDetailItem}
            reviews={reviews.filter((r) => r.contentId === selectedDetailItem.id)}
            relatedItems={items.filter(
              (i) =>
                i.status === 'approved' &&
                i.id !== selectedDetailItem.id &&
                i.categorySlug === selectedDetailItem.categorySlug
            )}
            playlists={playlists}
            isBookmarked={bookmarkedIds.includes(selectedDetailItem.id)}
            onBack={() => setRoute('browse')}
            onSelectContent={handleOpenDetail}
            onToggleBookmark={handleToggleBookmark}
            onAddReview={handleAddReview}
            onSubmitReport={handleSubmitReport}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}

        {/* Submit New Content View (/submit) */}
        {route === 'submit' && (
          <SubmitContentView
            existingItems={items}
            onSubmitNewContent={handleSubmitNewContent}
            onSelectExistingContent={handleOpenDetail}
          />
        )}

        {/* User Profile & Dashboard (/dashboard) */}
        {route === 'dashboard' && (
          <UserDashboardView
            allItems={items}
            bookmarkedIds={bookmarkedIds}
            playlists={playlists}
            userReviews={reviews}
            preferredLanguage={selectedLanguage}
            onChangePreferredLanguage={(lang) => setSelectedLanguage(lang as any)}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onSelectContent={handleOpenDetail}
            onDeleteReview={handleDeleteReview}
          />
        )}

        {/* Admin & Moderation Queue Panel (/admin) */}
        {route === 'admin' && (
          <AdminModerationView
            pendingItems={pendingItems}
            reports={reports}
            logs={moderationLogs}
            onApproveContent={handleApproveContent}
            onRejectContent={handleRejectContent}
            onResolveReport={handleResolveReport}
          />
        )}

        {/* Prayer Times & Qibla Compass Page (/tools/prayer-times) */}
        {route === 'prayer-times' && (
          <PrayerQiblaView
            selectedCityId={selectedCityId}
            onSelectCity={setSelectedCityId}
          />
        )}

        {/* Standards, About/Roadmap, Blog, FAQ, Privacy, Terms, Contact */}
        {(route === 'standards' ||
          route === 'about' ||
          route === 'blog' ||
          route === 'faq' ||
          route === 'privacy' ||
          route === 'terms' ||
          route === 'contact') && (
          <StandardsAndInfoView
            activePage={route}
            articles={INITIAL_BLOG_ARTICLES}
            onNavigate={(target) => setRoute(target)}
          />
        )}
      </main>

      {/* Quiet Editorial Footer with Prayer Widget & Complete Sitemap Links */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-stone-800">
          <div className="lg:col-span-4">
            <span className="text-2xl font-bold text-white font-editorial">entertainment.bd</span>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed max-w-sm">
              এক জায়গায়, যাচাইকৃত ও রেটিংসহ হালাল বিনোদনের সবচেয়ে বড় বৈশ্বিক ডিরেক্টরি। দৃশ্যগত শালীনতা, কণ্ঠপ্রধান সংগীত এবং সুদ-জুয়ামুক্ত অর্থনৈতিক বৈধতার মানদণ্ডে পরিচালিত।
            </p>
            <p className="text-xs text-[#C9A227] mt-3 font-medium">
              কন্টেন্ট-স্ট্যান্ডার্ড ভিত্তিক স্বচ্ছ কিউরেশন · কোনো নিজস্ব পাইরেটেড হোস্টিং নয়
            </p>
          </div>

          <div className="lg:col-span-3 space-y-2 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider mb-3">
              ডিরেক্টরি ও ইউজার পেইজসমূহ
            </h3>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => setRoute('browse')} className="hover:text-white">
                  ডিরেক্টরি ব্রাউজ (/browse)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRoute('curated')} className="hover:text-white">
                  সাপ্তাহিক ও মাসিক বাছাই (/curated/weekly)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRoute('submit')} className="hover:text-white">
                  নতুন কন্টেন্ট সাবমিট (/submit)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRoute('dashboard')} className="hover:text-white">
                  আমার প্লেলিস্ট ও ড্যাশবোর্ড (/dashboard)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRoute('admin')} className="hover:text-white">
                  অ্যাডমিন ও মডারেশন প্যানেল (/admin)
                </button>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-2 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider mb-3">
              নীতিমালা ও তথ্য
            </h3>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => setRoute('standards')} className="hover:text-white">
                  কন্টেন্ট মানদণ্ড (/standards)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRoute('about')} className="hover:text-white">
                  রোডম্যাপ ও ব্লুপ্রিন্ট (/about)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRoute('blog')} className="hover:text-white">
                  গবেষণা ব্লগ (/blog)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRoute('faq')} className="hover:text-white">
                  সাধারণ জিজ্ঞাসা (/faq)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRoute('privacy')} className="hover:text-white">
                  গোপনীয়তা ও শর্তাবলী (/privacy)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRoute('contact')} className="hover:text-white">
                  যোগাযোগ (/contact)
                </button>
              </li>
            </ul>
          </div>

          {/* Footer Mini Prayer & Qibla Widget */}
          <div className="lg:col-span-3 bg-stone-800/70 border border-stone-700 rounded-xl p-4 text-xs">
            <div className="flex items-center justify-between text-[#C9A227] font-semibold mb-2">
              <span>নামাজ ও কিবলা মিনি-উইজেট</span>
              <Compass className="w-4 h-4" />
            </div>
            <p className="text-white font-bold">
              {activeCitySchedule.cityBn} — পরবর্তী: {nextPrayerInfo.nameBn} ({nextPrayerInfo.time})
            </p>
            <p className="text-stone-400 mt-1 tabular-nums">
              কিবলা দিক: উত্তর থেকে {currentQibla}° ঘড়ির কাঁটার দিকে
            </p>
            <button
              type="button"
              onClick={() => setRoute('prayer-times')}
              className="mt-3 w-full py-1.5 px-3 rounded bg-[#0F5132] text-white font-semibold hover:bg-[#0b3e26] transition-colors"
            >
              পূর্ণাঙ্গ সময়সূচি ও কম্পাস খুলুন
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <span>© ২০২৬ entertainment.bd (Tayyib Vista Global Halal Curation). সর্বস্বত্ব সংরক্ষিত।</span>
          <span>শরিয়াহ-সঙ্গতিপূর্ণ সুদ ও জুয়ামুক্ত প্ল্যাটফর্ম আর্কিটেকচার</span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Section 6 Mobile-first spec: হোম, ব্রাউজ, সাবমিট, প্লেলিস্ট, প্রোফাইল) */}
      <nav
        aria-label="মোবাইল নিচের ট্যাব বার"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 px-2 py-1.5 flex items-center justify-around text-[11px] font-medium text-stone-600"
      >
        <button
          type="button"
          onClick={() => setRoute('home')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded ${
            route === 'home' ? 'text-[#0F5132] font-bold' : ''
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>হোম</span>
        </button>
        <button
          type="button"
          onClick={() => setRoute('browse')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded ${
            route === 'browse' ? 'text-[#0F5132] font-bold' : ''
          }`}
        >
          <Search className="w-4 h-4" />
          <span>ব্রাউজ</span>
        </button>
        <button
          type="button"
          onClick={() => setRoute('submit')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded ${
            route === 'submit' ? 'text-[#0F5132] font-bold' : ''
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>সাবমিট</span>
        </button>
        <button
          type="button"
          onClick={() => setRoute('dashboard')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded ${
            route === 'dashboard' ? 'text-[#0F5132] font-bold' : ''
          }`}
        >
          <User className="w-4 h-4" />
          <span>প্লেলিস্ট</span>
        </button>
        <button
          type="button"
          onClick={() => setRoute('admin')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded ${
            route === 'admin' ? 'text-[#0F5132] font-bold' : ''
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>মডারেশন</span>
        </button>
      </nav>
      </div>
    </APIProvider>
  );
}
