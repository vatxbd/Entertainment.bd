import React, { useState } from 'react';
import { Star, CheckCircle2, Bookmark, Play, ExternalLink, Film, Globe, Headphones, Smartphone, Tv } from 'lucide-react';
import { ContentItem } from '../types/platform';
import { LANGUAGE_LABELS, AGE_GROUP_LABELS, CONTENT_TYPE_LABELS } from '../data/seedData';

interface ContentCardProps {
  item: ContentItem;
  isBookmarked: boolean;
  onSelect: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onTagClick?: (tag: string) => void;
  layout?: 'grid' | 'list';
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  isBookmarked,
  onSelect,
  onToggleBookmark,
  onTagClick,
  layout = 'grid',
}) => {
  const [imgError, setImgError] = useState(false);

  const renderTypeIcon = () => {
    switch (item.contentType) {
      case 'video':
        return <Film className="w-3.5 h-3.5 text-[#0F5132]" />;
      case 'channel':
        return <Tv className="w-3.5 h-3.5 text-[#0F5132]" />;
      case 'podcast':
        return <Headphones className="w-3.5 h-3.5 text-[#0F5132]" />;
      case 'app':
        return <Smartphone className="w-3.5 h-3.5 text-[#0F5132]" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-[#0F5132]" />;
    }
  };

  if (layout === 'list') {
    return (
      <article className="group bg-white border border-stone-200/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:border-[#0F5132]/40 transition-colors">
        <div
          onClick={() => onSelect(item.id)}
          className="relative w-full sm:w-64 aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 shrink-0 cursor-pointer"
        >
          {!imgError && item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0F5132]/15 via-[#C9A227]/10 to-stone-100 p-4 text-center">
              {renderTypeIcon()}
              <span className="mt-2 text-xs font-medium text-stone-600 line-clamp-2">{item.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-3">
            <span className="text-[11px] font-medium text-white/95 tracking-wide">
              অটো-প্লে বন্ধ · শালীন থাম্বনেইল
            </span>
            <span className="w-8 h-8 rounded-full bg-white/95 text-[#0F5132] flex items-center justify-center shadow-sm">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Unboxed quiet metadata line following Zero-Pill Discipline */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-1.5">
              <span className="inline-flex items-center gap-1 font-medium text-[#0F5132]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132]" />
                যাচাইকৃত ✓
              </span>
              <span aria-hidden="true">·</span>
              <span>{CONTENT_TYPE_LABELS[item.contentType]}</span>
              <span aria-hidden="true">·</span>
              <span>{LANGUAGE_LABELS[item.language]?.nameBn || item.language}</span>
              <span aria-hidden="true">·</span>
              <span>{AGE_GROUP_LABELS[item.ageGroup]}</span>
            </div>

            <h3 className="text-lg font-semibold text-stone-900 group-hover:text-[#0F5132] transition-colors line-clamp-1">
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="text-left focus:outline-none focus-visible:underline"
              >
                {item.title}
              </button>
            </h3>

            <p className="mt-1.5 text-sm text-stone-600 line-clamp-2 leading-relaxed">{item.description}</p>

            <div className="mt-2.5 text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="text-[#0F5132] font-medium">শ্রবণমান: {item.audioPolicyNote}</span>
              <span aria-hidden="true">·</span>
              <span>{item.financialPolicyNote}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-stone-600 tabular-nums">
              <span className="inline-flex items-center gap-1 font-semibold text-stone-900">
                <Star className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                {item.avgRating.toFixed(1)}
              </span>
              <span>({item.ratingCount} রিভিউ)</span>
              {item.tags.slice(0, 3).map((tag) => (
                <React.Fragment key={tag}>
                  <span aria-hidden="true" className="text-stone-300">/</span>
                  <button
                    type="button"
                    onClick={() => onTagClick?.(tag)}
                    className="text-stone-500 hover:text-[#0F5132] transition-colors"
                  >
                    #{tag}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onToggleBookmark(item.id)}
                aria-label={`${item.title} বুকমার্ক করুন`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
                  isBookmarked
                    ? 'bg-[#0F5132]/10 border-[#0F5132]/30 text-[#0F5132]'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#0F5132]' : ''}`} />
                {isBookmarked ? 'সংরক্ষিত' : 'বুকমার্ক'}
              </button>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#0F5132] text-white hover:bg-[#0b3e26] transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1"
              >
                বিস্তারিত দেখুন
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white border border-stone-200/90 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#0F5132]/40 transition-colors">
      <div>
        {/* 4:3 Thumbnail with Auto-play disabled indicator & Play overlay */}
        <div
          onClick={() => onSelect(item.id)}
          className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer"
        >
          {!imgError && item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0F5132]/15 via-[#C9A227]/10 to-stone-100 p-5 text-center">
              {renderTypeIcon()}
              <span className="mt-2 text-xs font-medium text-stone-700 line-clamp-2">{item.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end justify-between p-3.5">
            <span className="text-[11px] font-medium text-white/90 tracking-wide">
              অটো-প্লে বন্ধ · {CONTENT_TYPE_LABELS[item.contentType]}
            </span>
            <span className="w-8 h-8 rounded-full bg-white/95 text-[#0F5132] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {/* Quiet 1-line unboxed metadata kicker (No Pill Sandwich) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-2">
            <span className="inline-flex items-center gap-1 font-medium text-[#0F5132]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132]" />
              যাচাইকৃত ✓
            </span>
            <span aria-hidden="true">·</span>
            <span>{LANGUAGE_LABELS[item.language]?.nameBn || item.language}</span>
            <span aria-hidden="true">·</span>
            <span>{AGE_GROUP_LABELS[item.ageGroup]}</span>
          </div>

          <h3 className="text-base font-semibold text-stone-900 group-hover:text-[#0F5132] transition-colors line-clamp-2 leading-snug">
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className="text-left focus:outline-none focus-visible:underline"
            >
              {item.title}
            </button>
          </h3>

          <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">{item.description}</p>

          <p className="mt-2.5 text-[11px] text-[#0F5132] font-medium truncate">
            মানদণ্ড: {item.audioPolicyNote}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-5 py-3 border-t border-stone-100 flex items-center justify-between gap-2 bg-stone-50/50">
        <div className="flex items-center gap-1.5 text-xs text-stone-600 tabular-nums">
          <Star className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
          <span className="font-semibold text-stone-900">{item.avgRating.toFixed(1)}</span>
          <span className="text-stone-400">({item.ratingCount})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleBookmark(item.id)}
            aria-label={`${item.title} বুকমার্ক করুন`}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
              isBookmarked
                ? 'bg-[#0F5132]/10 border-[#0F5132]/30 text-[#0F5132]'
                : 'border-stone-200 text-stone-600 hover:text-stone-900 bg-white'
            }`}
          >
            <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-[#0F5132]' : ''}`} />
            {isBookmarked ? 'সংরক্ষিত' : 'সংরক্ষণ'}
          </button>
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-[#0F5132] hover:bg-[#0F5132]/10 transition-colors whitespace-nowrap shrink-0"
          >
            বিস্তারিত →
          </button>
        </div>
      </div>
    </article>
  );
};
