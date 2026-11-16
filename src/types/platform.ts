export type ContentType = 'video' | 'channel' | 'app' | 'website' | 'podcast';
export type AgeGroup = 'kids' | 'teens' | 'family' | 'adult';
export type ContentStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type LanguageCode = 'bn' | 'en' | 'ar' | 'ur' | 'tr' | 'id' | 'ms' | 'fa' | 'fr';
export type ReportReason = 'immodesty' | 'music_instruments' | 'financial_haram' | 'hate_speech' | 'other';
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type UserRole = 'user' | 'moderator' | 'admin';

export interface ModerationChecklist {
  visualModesty: boolean;         // দৃশ্যগত: নগ্নতা/অন্তরঙ্গ দৃশ্য/অশালীন পোশাক নেই
  audioCompliance: boolean;       // শ্রাব্যগত: সংগীতে যন্ত্রের ব্যবহার প্ল্যাটফর্মের নীতির সাথে সামঞ্জস্যপূর্ণ
  nonViolence: boolean;           // বিষয়বস্তুতে সহিংসতা/সন্ত্রাসবাদের প্রচার নেই
  noHateSpeech: boolean;          // ঘৃণাত্মক বক্তব্য বা ধর্মীয়/জাতিগত উস্কানি নেই
  ribaFreeAds: boolean;           // সুদভিত্তিক/জুয়াভিত্তিক বিজ্ঞাপন বা প্রচার নেই
  copyrightRespected: boolean;    // উৎস কপিরাইট সম্মানিত (নিজস্ব কন্টেন্ট বা অনুমোদিত লিংক)
  accurateMetadata: boolean;      // মেটাডেটা সঠিক ও বিভ্রান্তিকর নয়
  modestThumbnailNoAutoplay: boolean; // থাম্বনেইল শালীন ও অটো-প্লে নিষ্ক্রিয়
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  descriptionBn: string;
  count: number;
}

export interface ContentItem {
  id: string;
  title: string;
  titleEn?: string;
  url: string;
  contentType: ContentType;
  categoryId: string;
  categorySlug: string;
  language: LanguageCode;
  ageGroup: AgeGroup;
  countryOrigin: string;
  description: string;
  thumbnailUrl: string;
  submittedBy: string;
  status: ContentStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  avgRating: number;
  ratingCount: number;
  tags: string[];
  audioPolicyNote: string; // e.g., "কণ্ঠপ্রধান / দফ শুধুমাত্র" or "বাদ্যযন্ত্রমুক্ত প্রাকৃতিক ধ্বনি"
  financialPolicyNote: string; // e.g., "সুদ ও জুয়ার স্পনসরমুক্ত"
  isWeeklyPick?: boolean;
  isMonthlyPick?: boolean;
  requiresDualApproval?: boolean;
  firstModeratorApprovedBy?: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  contentId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  contentId: string;
  contentTitle: string;
  reportedBy: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  itemIds: string[];
  createdAt: string;
}

export interface ModerationLog {
  id: string;
  contentId: string;
  contentTitle: string;
  moderatorName: string;
  action: 'approved' | 'rejected' | 'flagged' | 'unflagged' | 'dual_step_1';
  checklistSnapshot: ModerationChecklist;
  notes: string;
  createdAt: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string[];
  authorName: string;
  authorRole: string;
  publishedAt: string;
  language: LanguageCode;
  readTimeMinutes: number;
  category: string;
}

export interface CityPrayerSchedule {
  id: string;
  cityBn: string;
  cityEn: string;
  countryBn: string;
  lat: number;
  lng: number;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}
