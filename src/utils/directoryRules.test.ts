import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrl,
  findDuplicateByUrl,
  filterAndSortContent,
  evaluateModerationChecklist,
  calculateUpdatedRating,
  calculateQiblaBearing,
  getNextPrayer,
  buildContentShareUrl,
} from './directoryRules';
import { ContentItem, ModerationChecklist, CityPrayerSchedule } from '../types/platform';

const mockItems: ContentItem[] = [
  {
    id: 'c1',
    title: 'ইসলামের স্বর্ণযুগের বিজ্ঞান ও সমরকন্দ মানমন্দির',
    titleEn: 'Golden Age Astronomy of Samarkand',
    url: 'https://www.youtube.com/watch?v=samarkand101',
    contentType: 'video',
    categoryId: 'cat-doc',
    categorySlug: 'documentary',
    language: 'bn',
    ageGroup: 'family',
    countryOrigin: 'BD',
    description: 'সমরকন্দের প্রাচীন মানমন্দির ও মুসলিম বিজ্ঞানীদের জ্যোতির্বিজ্ঞান গবেষণার প্রামাণ্যচিত্র।',
    thumbnailUrl: '/src/assets/images/thumb_ottoman_history_series_1794834984885.jpg',
    submittedBy: 'u1',
    status: 'approved',
    avgRating: 4.9,
    ratingCount: 120,
    tags: ['ইতিহাস', 'বিজ্ঞান', 'প্রামাণ্যচিত্র'],
    audioPolicyNote: 'বাদ্যযন্ত্রমুক্ত প্রাকৃতিক ধ্বনি',
    financialPolicyNote: 'সুদ ও জুয়ার স্পনসরমুক্ত',
    createdAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'c2',
    title: 'জলপাই বাগানের কৌতূহলী নৌকা — শিশুতোষ অ্যানিমেশন',
    titleEn: 'The Curious Boat of Olive Courtyard',
    url: 'https://tayyibkids.org/shows/olive-courtyard',
    contentType: 'channel',
    categoryId: 'cat-kids',
    categorySlug: 'kids',
    language: 'ar',
    ageGroup: 'kids',
    countryOrigin: 'QA',
    description: 'শিশুদের নৈতিক শিক্ষা ও প্রকৃতির প্রতি ভালোবাসা জাগাতে সম্পূর্ণ বাদ্যযন্ত্রমুক্ত থ্রিডি অ্যানিমেশন।',
    thumbnailUrl: '/src/assets/images/thumb_kids_animation_garden_1794834986474.jpg',
    submittedBy: 'u2',
    status: 'approved',
    avgRating: 4.7,
    ratingCount: 250,
    tags: ['শিশুতোষ', 'অ্যানিমেশন', 'নৈতিকতা'],
    audioPolicyNote: 'কণ্ঠপ্রধান নাশিদ ও পাখির কলতান',
    financialPolicyNote: 'সম্পূর্ণ বিজ্ঞাপনমুক্ত',
    createdAt: '2026-11-01T12:00:00Z',
  },
  {
    id: 'c3',
    title: 'অপ্রকাশিত পেন্ডিং ভিডিও',
    url: 'https://vimeo.com/99887766',
    contentType: 'video',
    categoryId: 'cat-doc',
    categorySlug: 'documentary',
    language: 'bn',
    ageGroup: 'family',
    countryOrigin: 'BD',
    description: 'পেন্ডিং সাবমিশন।',
    thumbnailUrl: '',
    submittedBy: 'u3',
    status: 'pending',
    avgRating: 0,
    ratingCount: 0,
    tags: ['ইতিহাস'],
    audioPolicyNote: 'যাচাইাধীন',
    financialPolicyNote: 'যাচাইাধীন',
    createdAt: '2026-11-12T10:00:00Z',
  },
];

test('normalizeUrl strips protocol, www, and trailing slashes while preserving YouTube video IDs', () => {
  assert.equal(
    normalizeUrl('https://www.youtube.com/watch?v=samarkand101&feature=youtu.be'),
    'youtube.com/watch?v=samarkand101'
  );
  assert.equal(
    normalizeUrl('http://TayyibKids.org/shows/olive-courtyard/'),
    'tayyibkids.org/shows/olive-courtyard'
  );
});

test('findDuplicateByUrl detects existing content item regardless of protocol or www prefix', () => {
  const dup = findDuplicateByUrl(mockItems, 'http://youtube.com/watch?v=samarkand101');
  assert.ok(dup);
  assert.equal(dup.id, 'c1');

  const nonDup = findDuplicateByUrl(mockItems, 'https://example.org/new-halal-podcast');
  assert.equal(nonDup, undefined);
});

test('filterAndSortContent returns only approved items matching category, language, and sort order', () => {
  const allApproved = filterAndSortContent(mockItems, { sortBy: 'popular' });
  assert.equal(allApproved.length, 2);
  assert.equal(allApproved[0].id, 'c2'); // 250 * 4.7 > 120 * 4.9

  const byRating = filterAndSortContent(mockItems, { sortBy: 'rating' });
  assert.equal(byRating[0].id, 'c1'); // 4.9 > 4.7

  const kidsOnly = filterAndSortContent(mockItems, { ageGroup: 'kids' });
  assert.equal(kidsOnly.length, 1);
  assert.equal(kidsOnly[0].id, 'c2');
});

test('evaluateModerationChecklist requires all 8 Shariah & quality checks to pass', () => {
  const fullChecklist: ModerationChecklist = {
    visualModesty: true,
    audioCompliance: true,
    nonViolence: true,
    noHateSpeech: true,
    ribaFreeAds: true,
    copyrightRespected: true,
    accurateMetadata: true,
    modestThumbnailNoAutoplay: true,
  };
  const res1 = evaluateModerationChecklist(fullChecklist);
  assert.equal(res1.isComplete, true);
  assert.equal(res1.passedCount, 8);

  const partialChecklist: ModerationChecklist = {
    ...fullChecklist,
    ribaFreeAds: false,
  };
  const res2 = evaluateModerationChecklist(partialChecklist);
  assert.equal(res2.isComplete, false);
  assert.deepEqual(res2.failedKeys, ['ribaFreeAds']);
});

test('calculateUpdatedRating computes accurate weighted average', () => {
  const updated = calculateUpdatedRating(4.5, 10, 5);
  assert.equal(updated.ratingCount, 11);
  assert.equal(updated.avgRating, 4.5);
});

test('calculateQiblaBearing computes Dhaka Qibla direction (~277.7 degrees West-Northwest)', () => {
  const dhakaBearing = calculateQiblaBearing(23.8103, 90.4125);
  assert.ok(dhakaBearing > 276 && dhakaBearing < 279, `Expected ~277.7, got ${dhakaBearing}`);
});

test('getNextPrayer selects upcoming prayer and wraps around after Isha', () => {
  const dhaka: CityPrayerSchedule = {
    id: 'dhaka',
    cityBn: 'ঢাকা',
    cityEn: 'Dhaka',
    countryBn: 'বাংলাদেশ',
    lat: 23.8103,
    lng: 90.4125,
    fajr: '05:02',
    sunrise: '06:18',
    dhuhr: '11:55',
    asr: '15:50',
    maghrib: '17:14',
    isha: '18:32',
  };
  assert.equal(getNextPrayer(dhaka, '14:10').nameEn, 'Asr');
  assert.equal(getNextPrayer(dhaka, '21:00').nameEn, 'Fajr');
});

test('buildContentShareUrl generates canonical entertainment.bd content URL', () => {
  assert.equal(
    buildContentShareUrl('item-samarkand-observatory'),
    'https://entertainment.bd/content/item-samarkand-observatory'
  );
});

