import { ContentItem, ContentType, AgeGroup, LanguageCode, ModerationChecklist, CityPrayerSchedule } from '../types/platform';

export interface FilterCriteria {
  query?: string;
  categorySlug?: string;
  language?: LanguageCode | 'all';
  ageGroup?: AgeGroup | 'all';
  contentType?: ContentType | 'all';
  minRating?: number;
  tag?: string;
  sortBy?: 'popular' | 'newest' | 'rating';
}

/**
 * Normalizes a URL for duplicate checking (strips protocol, www, trailing slashes, and query tracking parameters).
 */
export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().toLowerCase();
  if (!trimmed) return '';
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname.replace(/\/+$/, '');
    const videoId = parsed.searchParams.get('v');
    return videoId ? `${host}${path}?v=${videoId}` : `${host}${path}`;
  } catch {
    return trimmed.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');
  }
}

/**
 * Checks if a submitted URL already exists in the directory (Approved, Pending, or Flagged).
 */
export function findDuplicateByUrl(items: ContentItem[], candidateUrl: string): ContentItem | undefined {
  const normCandidate = normalizeUrl(candidateUrl);
  if (!normCandidate) return undefined;
  return items.find((item) => normalizeUrl(item.url) === normCandidate);
}

/**
 * Filters and sorts directory content items based on user criteria.
 */
export function filterAndSortContent(items: ContentItem[], criteria: FilterCriteria): ContentItem[] {
  const approvedOnly = items.filter((item) => item.status === 'approved');

  const filtered = approvedOnly.filter((item) => {
    if (criteria.categorySlug && criteria.categorySlug !== 'all' && item.categorySlug !== criteria.categorySlug) {
      return false;
    }
    if (criteria.language && criteria.language !== 'all' && item.language !== criteria.language) {
      return false;
    }
    if (criteria.ageGroup && criteria.ageGroup !== 'all' && item.ageGroup !== criteria.ageGroup) {
      return false;
    }
    if (criteria.contentType && criteria.contentType !== 'all' && item.contentType !== criteria.contentType) {
      return false;
    }
    if (typeof criteria.minRating === 'number' && criteria.minRating > 0 && item.avgRating < criteria.minRating) {
      return false;
    }
    if (criteria.tag && criteria.tag.trim() !== '') {
      const normalizedTag = criteria.tag.trim().toLowerCase();
      const hasTag = item.tags.some((t) => t.toLowerCase() === normalizedTag);
      if (!hasTag) return false;
    }
    if (criteria.query && criteria.query.trim() !== '') {
      const q = criteria.query.trim().toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q) || (item.titleEn?.toLowerCase().includes(q) ?? false);
      const inDesc = item.description.toLowerCase().includes(q);
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inTags) return false;
    }
    return true;
  });

  const sortBy = criteria.sortBy || 'popular';
  return [...filtered].sort((a, b) => {
    if (sortBy === 'rating') {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      return b.ratingCount - a.ratingCount;
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // default: popular (by ratingCount * avgRating)
    const scoreA = a.ratingCount * a.avgRating;
    const scoreB = b.ratingCount * b.avgRating;
    return scoreB - scoreA;
  });
}

/**
 * Evaluates whether all 8 mandatory Shariah & Quality checklist criteria are satisfied.
 */
export function evaluateModerationChecklist(checklist: ModerationChecklist): {
  isComplete: boolean;
  passedCount: number;
  totalCount: number;
  failedKeys: (keyof ModerationChecklist)[];
} {
  const keys: (keyof ModerationChecklist)[] = [
    'visualModesty',
    'audioCompliance',
    'nonViolence',
    'noHateSpeech',
    'ribaFreeAds',
    'copyrightRespected',
    'accurateMetadata',
    'modestThumbnailNoAutoplay',
  ];
  const failedKeys = keys.filter((k) => !checklist[k]);
  return {
    isComplete: failedKeys.length === 0,
    passedCount: keys.length - failedKeys.length,
    totalCount: keys.length,
    failedKeys,
  };
}

/**
 * Calculates updated average rating and count when a new review is added.
 */
export function calculateUpdatedRating(
  currentAvg: number,
  currentCount: number,
  newRating: number
): { avgRating: number; ratingCount: number } {
  const clamped = Math.max(1, Math.min(5, Math.round(newRating)));
  const totalScore = currentAvg * currentCount + clamped;
  const nextCount = currentCount + 1;
  const nextAvg = Number((totalScore / nextCount).toFixed(1));
  return { avgRating: nextAvg, ratingCount: nextCount };
}

/**
 * Calculates the Qibla compass bearing in degrees from True North (0° - 360°)
 * toward the Kaaba in Makkah (21.4225° N, 39.8262° E) using spherical trigonometry.
 */
export function calculateQiblaBearing(latDeg: number, lngDeg: number): number {
  const kaabaLat = (21.422487 * Math.PI) / 180;
  const kaabaLng = (39.826206 * Math.PI) / 180;
  const phi = (latDeg * Math.PI) / 180;
  const lambda = (lngDeg * Math.PI) / 180;

  const deltaLambda = kaabaLng - lambda;
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(kaabaLat) - Math.sin(phi) * Math.cos(deltaLambda);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  return Number(bearing.toFixed(1));
}

/**
 * Determines the next upcoming prayer from a city schedule given a current HH:MM (24h) string.
 */
export function getNextPrayer(
  schedule: CityPrayerSchedule,
  currentTime24h: string
): { nameBn: string; nameEn: string; time: string } {
  const prayers = [
    { nameBn: 'ফজর', nameEn: 'Fajr', time: schedule.fajr },
    { nameBn: 'যোহর', nameEn: 'Dhuhr', time: schedule.dhuhr },
    { nameBn: 'আসর', nameEn: 'Asr', time: schedule.asr },
    { nameBn: 'মাগরিব', nameEn: 'Maghrib', time: schedule.maghrib },
    { nameBn: 'ইশা', nameEn: 'Isha', time: schedule.isha },
  ];

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const nowMins = toMinutes(currentTime24h);
  for (const p of prayers) {
    if (toMinutes(p.time) > nowMins) {
      return p;
    }
  }
  return prayers[0]; // Next day's Fajr
}

export const PLATFORM_DOMAIN = 'entertainment.bd';
export const PLATFORM_ORIGIN = `https://${PLATFORM_DOMAIN}`;

/**
 * Builds the canonical shareable URL on entertainment.bd for a content item.
 */
export function buildContentShareUrl(contentId: string): string {
  const cleanId = encodeURIComponent(contentId.trim());
  return `${PLATFORM_ORIGIN}/content/${cleanId}`;
}

