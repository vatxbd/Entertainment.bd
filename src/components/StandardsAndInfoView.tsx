import React, { useState } from 'react';
import { Shield, CheckCircle2, BookOpen, Calendar, HelpCircle, Scale, Mail, Lock } from 'lucide-react';
import { BlogArticle } from '../types/platform';

interface StandardsAndInfoViewProps {
  activePage: 'standards' | 'about' | 'blog' | 'faq' | 'privacy' | 'terms' | 'contact';
  articles: BlogArticle[];
  onNavigate: (page: any) => void;
}

export const StandardsAndInfoView: React.FC<StandardsAndInfoViewProps> = ({
  activePage,
  articles,
  onNavigate,
}) => {
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  if (activePage === 'blog') {
    const activeArticle = articles.find((a) => a.slug === selectedArticleSlug);
    if (activeArticle) {
      return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <button
            type="button"
            onClick={() => setSelectedArticleSlug(null)}
            className="text-xs font-semibold text-[#0F5132] hover:underline mb-6 inline-block"
          >
            ← সকল ব্লগ আর্টিকেলে ফিরে যান
          </button>
          <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-10">
            <div className="text-xs text-stone-500 mb-2">
              <span>{activeArticle.category}</span>
              <span aria-hidden="true"> · </span>
              <span>{activeArticle.publishedAt}</span>
              <span aria-hidden="true"> · </span>
              <span>{activeArticle.readTimeMinutes} মিনিট পাঠ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-stone-900 leading-tight">
              {activeArticle.title}
            </h1>
            <p className="text-xs text-stone-600 mt-2 border-b border-stone-100 pb-5">
              লেখক: <strong>{activeArticle.authorName}</strong> ({activeArticle.authorRole})
            </p>
            <div className="mt-6 space-y-4 text-base text-stone-800 leading-relaxed max-w-prose">
              {activeArticle.body.map((para, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-[#0F5132] first-letter:mr-2'
                      : ''
                  }
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="border-b border-stone-200 pb-6 mb-8">
          <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
            গবেষণা ও প্রবন্ধ (/blog)
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            হালাল ডিজিটাল সংস্কৃতি ও পারিবারিক শিক্ষা জার্নাল
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            কন্টেন্ট মডারেশন নীতিমালা, শিশুদের স্ক্রিন-টাইম এবং সুদমুক্ত ডিজিটাল অর্থনীতি নিয়ে আমাদের সম্পাদকীয় প্রবন্ধসমূহ।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <article
              key={art.id}
              className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between hover:border-[#0F5132]/40 transition-colors"
            >
              <div>
                <div className="text-xs text-stone-500 mb-2">
                  <span className="text-[#0F5132] font-semibold">{art.category}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{art.publishedAt}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{art.readTimeMinutes} মি.</span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 leading-snug">
                  <button
                    type="button"
                    onClick={() => setSelectedArticleSlug(art.slug)}
                    className="text-left hover:text-[#0F5132] transition-colors"
                  >
                    {art.title}
                  </button>
                </h2>
                <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">{art.excerpt}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">{art.authorName}</span>
                <button
                  type="button"
                  onClick={() => setSelectedArticleSlug(art.slug)}
                  className="font-semibold text-[#0F5132] hover:underline"
                >
                  পূর্ণ প্রবন্ধ পড়ুন →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Sub-navigation bar for institutional pages */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4 mb-8">
        {[
          { id: 'standards', label: 'কন্টেন্ট মানদণ্ড (/standards)', icon: Shield },
          { id: 'about', label: 'প্রজেক্ট ব্লুপ্রিন্ট ও রোডম্যাপ (/about)', icon: BookOpen },
          { id: 'faq', label: 'সাধারণ জিজ্ঞাসা (/faq)', icon: HelpCircle },
          { id: 'privacy', label: 'গোপনীয়তা নীতি (/privacy)', icon: Lock },
          { id: 'terms', label: 'ব্যবহারের শর্তাবলী (/terms)', icon: Scale },
          { id: 'contact', label: 'যোগাযোগ (/contact)', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                activePage === tab.id
                  ? 'bg-[#0F5132] text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activePage === 'standards' && (
        <div className="space-y-8">
          <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
              স্বচ্ছ শরিয়াহ ও শালীনতা নীতিমালা (/standards)
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
              কন্টেন্ট-স্ট্যান্ডার্ড ভিত্তিক কিউরেশন ও ৮-দফা যাচাই মানদণ্ড
            </h1>
            <p className="text-sm sm:text-base text-stone-700 mt-3 leading-relaxed max-w-3xl">
              Tayyib Vista কোনো নির্দিষ্ট মাযহাব বা সম্প্রদায়কে পরিচয় ধরে বাদ দেওয়ার পরিবর্তে <strong>কন্টেন্ট কী মানদণ্ড মেনে চলে</strong> তার ভিত্তিতে শতভাগ স্বচ্ছ ও ধারাবাহিক কিউরেশন পরিচালনা করে। এতে প্ল্যাটফর্মটি রক্ষণশীল ইসলামী পারিবারিক মূল্যবোধ অক্ষুণ্ণ রেখেই আন্তর্জাতিক আইনি ও প্ল্যাটফর্ম-নিরপেক্ষতা বজায় রাখে।
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: '১. দৃশ্যগত শালীনতা (Visual Modesty)',
                  desc: 'পর্দা ও শালীন পোশাকের মানদণ্ড কঠোরভাবে পালিত। কোনো নগ্নতা, অন্তরঙ্গ দৃশ্য বা প্রলুব্ধকর থাম্বনেইল অনুমোদিত নয়।',
                },
                {
                  title: '২. শ্রবণগত মান (Vocal-First Audio)',
                  desc: 'কণ্ঠপ্রধান নাশিদ, কুরআন তিলাওয়াত এবং প্রাকৃতিক আবহধ্বনি অগ্রাধিকারপ্রাপ্ত। দফ ব্যবহৃত হলে দ্বৈত-অনুমোদন ও স্পষ্ট লেবেলিং আবশ্যক।',
                },
                {
                  title: '৩. অর্থনৈতিক বৈধতা (Riba & Gambling Free)',
                  desc: 'সুদভিত্তিক ব্যাংকিং, ক্রিপ্টো-ফাটকা, লুটবক্স বা জুয়া সংক্রান্ত কোনো স্পনসরশিপ ও বিজ্ঞাপন থাকা চলবে না।',
                },
                {
                  title: '৪. অহিংসা ও ঘৃণাত্মক বক্তব্য পরিহার',
                  desc: 'সহিংসতা, উগ্রবাদ কিংবা কোনো ধর্মীয় বা জাতিগত গোষ্ঠীর বিরুদ্ধে উস্কানিমূলক বক্তব্য সম্পূর্ণ নিষিদ্ধ।',
                },
                {
                  title: '৫. কপিরাইট ও মেধাস্বত্ব সম্মান',
                  desc: 'নিজস্ব সার্ভারে পাইরেটেড কপি হোস্ট না করে মূল নির্মাতার বৈধ লিংক ও মেটাডেটা সংরক্ষণ করা হয়।',
                },
                {
                  title: '৬. ৬ মাস অন্তর র্যান্ডম রি-অডিট',
                  desc: 'থার্ড-পার্টি চ্যানেল পরবর্তীতে পরিবর্তিত হয়ে গেলে তা শনাক্ত করতে ষান্মাসিক পুনঃযাচাই ও ২৪-৪৮ ঘণ্টার রিপোর্ট এসএলএ।',
                },
              ].map((rule) => (
                <div key={rule.title} className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] shrink-0" />
                    {rule.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activePage === 'about' && (
        <div className="space-y-8">
          <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0F5132]" />
              বাস্তবায়ন রোডম্যাপ (৩ মাস → ৬ মাস → ১ বছর)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="p-5 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-xs font-bold uppercase text-[#0F5132]">পর্যায় ১: ৩ মাস (MVP লঞ্চ)</span>
                <ul className="mt-3 space-y-2 text-xs text-stone-700">
                  <li>· কোর ডিরেক্টরি (ব্রাউজ, সার্চ, ফিল্টার)</li>
                  <li>· বেসিক ইউজার অ্যাকাউন্ট ও প্লেলিস্ট</li>
                  <li>· সাবমিশন ফর্ম + ম্যানুয়াল মডারেশন প্যানেল</li>
                  <li>· ইংরেজি, আরবি ও বাংলা ভাষা সাপোর্ট</li>
                  <li>· ১০০-২০০ প্রি-কিউরেটেড এন্ট্রি দিয়ে সফট লঞ্চ</li>
                </ul>
              </div>
              <div className="p-5 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-xs font-bold uppercase text-[#C9A227]">পর্যায় ২: ৬ মাস (সম্প্রসারণ)</span>
                <ul className="mt-3 space-y-2 text-xs text-stone-700">
                  <li>· পূর্ণাঙ্গ ৫-তারকা রিভিউ ও রেটিং সিস্টেম</li>
                  <li>· সাপ্তাহিক/মাসিক কিউরেটেড লিস্ট + নিউজলেটার</li>
                  <li>· ব্লগ/আর্টিকেল সেকশন ও অতিরিক্ত ৪টি ভাষা</li>
                  <li>· কমিউনিটি ভলান্টিয়ার মডারেটর নেটওয়ার্ক</li>
                </ul>
              </div>
              <div className="p-5 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-xs font-bold uppercase text-stone-800">পর্যায় ৩: ১ বছর (বৈশ্বিক স্কেল)</span>
                <ul className="mt-3 space-y-2 text-xs text-stone-700">
                  <li>· নেটিভ মোবাইল অ্যাপ (iOS/Android) ও PWA</li>
                  <li>· শরিয়াহ উপদেষ্টা বোর্ড (Advisory Board) গঠন</li>
                  <li>· ১০,০০০+ যাচাইকৃত হালাল কন্টেন্ট লক্ষ্যমাত্রা</li>
                  <li>· হালাল ব্র্যান্ড স্পনসরশিপ ও প্রিমিয়াম সদস্যপদ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technical Challenges & Architecture Matrix from Section 8 */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              প্রযুক্তিগত চ্যালেঞ্জ ও আর্কিটেকচারাল সমাধান (সেকশন ৪, ৫ ও ৮)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="py-3 pr-4 font-semibold">প্রযুক্তিগত চ্যালেঞ্জ</th>
                    <th className="py-3 pl-4 font-semibold">বাস্তবায়িত ও প্রস্তাবিত সমাধান</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-stone-900">হাজার হাজার সাবমিশন যাচাই</td>
                    <td className="py-3 pl-4">স্বয়ংক্রিয় ডুপ্লিকেট/মেটাডেটা প্রি-স্ক্রিনিং + কমিউনিটি ভলান্টিয়ার মডারেটর নেটওয়ার্ক</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-stone-900">লিংকড কন্টেন্ট পরিবর্তন হয়ে যাওয়া</td>
                    <td className="py-3 pl-4">৬ মাস অন্তর র্যান্ডম রি-অডিট + ব্যবহারকারী রিপোর্টিং (২৪-৪৮ ঘণ্টা এসএলএ)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-stone-900">ফিকহি মতভেদ (যেমন বাদ্যযন্ত্র)</td>
                    <td className="py-3 pl-4">/standards পেইজে স্বচ্ছ নীতিমালা প্রকাশ ও প্রতিটি কার্ডে শ্রবণমান লেবেলিং</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-stone-900">কপিরাইট লঙ্ঘনের ঝুঁকি</td>
                    <td className="py-3 pl-4">নিজস্ব হোস্টিং নয়; শুধুমাত্র যাচাইকৃত বহিঃসংযোগ (External Link) ও DMCA প্রসেস</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activePage === 'faq' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">সাধারণ জিজ্ঞাসা (FAQ)</h1>
          {[
            {
              q: '১. Tayyib Vista কি নিজস্ব সার্ভারে ভিডিও বা মুভি আপলোড করে?',
              a: 'না। কপিরাইট আইনকে পূর্ণ সম্মান জানিয়ে আমরা শুধুমাত্র ইন্টারনেটে বিদ্যমান বৈধ ইউটিউব চ্যানেল, ওয়েবসাইট, পডকাস্ট ও অ্যাপগুলো যাচাই করে সেগুলোর ডিরেক্টরি লিংক ও রেটিং উপস্থাপন করি।',
            },
            {
              q: '২. নাশিদ বা সংগীতে বাদ্যযন্ত্রের ক্ষেত্রে আপনাদের অবস্থান কী?',
              a: 'আমরা কণ্ঠপ্রধান (Vocal-only) এবং প্রাকৃতিক আবহধ্বনি সম্বলিত কন্টেন্টকে সর্বোচ্চ অগ্রাধিকার দিই। যেসব কন্টেন্টে দফ (Duff) ব্যবহৃত হয়েছে, সেগুলো আমাদের দ্বৈত-অনুমোদন (Dual Approval) প্রক্রিয়ায় যাচাই করা হয় এবং কার্ডের ওপরেই অডিওর ধরন স্পষ্টভাবে লিখে দেওয়া হয়।',
            },
            {
              q: '৩. কোনো অনুমোদিত চ্যানেল যদি ভবিষ্যতে অনৈসলামিক ভিডিও আপলোড করে তখন কী হয়?',
              a: 'যেকোনো ব্যবহারকারী "রিপোর্ট করুন" বাটনে ক্লিক করে অভিযোগ জানালে ২৪-৪৮ ঘণ্টার মধ্যে আমাদের মডারেটর টিম সেটি সাময়িকভাবে আনপাবলিশ করে এবং ৭ দিনের মধ্যে চূড়ান্ত সিদ্ধান্ত নেয়।',
            },
          ].map((item) => (
            <div key={item.q} className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">{item.q}</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      )}

      {(activePage === 'privacy' || activePage === 'terms') && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            {activePage === 'privacy'
              ? 'গোপনীয়তা নীতি (Privacy-by-Design & GDPR Compliance)'
              : 'ব্যবহারের শর্তাবলী ও শরিয়াহ-সঙ্গতিপূর্ণ নীতিমালা'}
          </h1>
          <p className="text-sm text-stone-700 leading-relaxed">
            আমরা ব্যবহারকারীদের ব্যক্তিগত তথ্যের গোপনীয়তা (ডেটা এনক্রিপশন at rest ও in transit) রক্ষা করি এবং কোনো থার্ড-পার্টি সুদভিত্তিক বা অনৈতিক অ্যাড-ট্র্যাকারের কাছে তথ্য বিক্রি করি না। প্ল্যাটফর্মে কন্টেন্ট জমা বা রিভিউ দেওয়ার ক্ষেত্রে সত্যবাদিতা, শালীন ভাষা এবং কপিরাইট নীতিমালা মেনে চলা সকল সদস্যের জন্য বাধ্যতামূলক।
          </p>
        </div>
      )}

      {activePage === 'contact' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">আমাদের সাথে যোগাযোগ করুন (/contact)</h1>
          <p className="text-xs text-stone-600 mb-5">
            শরিয়াহ উপদেষ্টা বোর্ড, ভলান্টিয়ার মডারেটর প্রোগ্রাম বা হালাল ব্র্যান্ড স্পনসরশিপের জন্য বার্তা পাঠান।
          </p>
          {contactSent && (
            <div className="mb-4 p-3 rounded-lg bg-[#0F5132]/10 text-[#0F5132] text-xs font-semibold">
              আপনার বার্তা সফলভাবে প্রেরিত হয়েছে। ইনশাআল্লাহ আমাদের টিম দ্রুত উত্তর দেবে।
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!contactEmail.trim() || !contactMessage.trim()) return;
              setContactSent(true);
              setContactName('');
              setContactEmail('');
              setContactMessage('');
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="c-name" className="block text-xs font-bold text-stone-700 mb-1">
                আপনার নাম
              </label>
              <input
                id="c-name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="c-email" className="block text-xs font-bold text-stone-700 mb-1">
                ইমেইল ঠিকানা *
              </label>
              <input
                id="c-email"
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="c-msg" className="block text-xs font-bold text-stone-700 mb-1">
                বার্তা *
              </label>
              <textarea
                id="c-msg"
                rows={3}
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#0F5132] text-white text-xs font-semibold hover:bg-[#0b3e26]"
            >
              বার্তা পাঠান
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
