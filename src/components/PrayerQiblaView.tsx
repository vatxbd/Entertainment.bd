import React, { useState } from 'react';
import { Compass, Clock, MapPin, Navigation } from 'lucide-react';
import { CITY_PRAYER_SCHEDULES } from '../data/seedData';
import { calculateQiblaBearing, getNextPrayer } from '../utils/directoryRules';
import { InteractiveQiblaMap } from './InteractiveQiblaMap';

interface PrayerQiblaViewProps {
  selectedCityId: string;
  onSelectCity: (cityId: string) => void;
}

export const PrayerQiblaView: React.FC<PrayerQiblaViewProps> = ({
  selectedCityId,
  onSelectCity,
}) => {
  const [customLat, setCustomLat] = useState<string>('23.8103');
  const [customLng, setCustomLng] = useState<string>('90.4125');
  const [SimulatedTime, setSimulatedTime] = useState<string>('14:30');

  const city =
    CITY_PRAYER_SCHEDULES.find((c) => c.id === selectedCityId) || CITY_PRAYER_SCHEDULES[0];

  const handleCityChange = (id: string) => {
    onSelectCity(id);
    const found = CITY_PRAYER_SCHEDULES.find((c) => c.id === id);
    if (found) {
      setCustomLat(String(found.lat));
      setCustomLng(String(found.lng));
    }
  };

  const parsedLat = parseFloat(customLat) || city.lat;
  const parsedLng = parseFloat(customLng) || city.lng;
  const qiblaDegrees = calculateQiblaBearing(parsedLat, parsedLng);
  const nextPrayer = getNextPrayer(city, SimulatedTime);

  const prayerList = [
    { labelBn: 'ফজর (Fajr)', time: city.fajr, note: 'সুবেহ সাদিক' },
    { labelBn: 'সূর্যোদয় (Sunrise)', time: city.sunrise, note: 'নামাজ নিষিদ্ধ সময়' },
    { labelBn: 'যোহর (Dhuhr)', time: city.dhuhr, note: 'মধ্যাহ্ন' },
    { labelBn: 'আসর (Asr)', time: city.asr, note: 'অপরাহ্ণ' },
    { labelBn: 'মাগরিব (Maghrib)', time: city.maghrib, note: 'সূর্যাস্তের পর' },
    { labelBn: 'ইশা (Isha)', time: city.isha, note: 'রাত্রিকালীন' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="border-b border-stone-200 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
            ইবাদত ও সময়ানুবর্তিতা টুলস (/tools/prayer-times)
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            নামাজের সময়সূচি ও কিবলা কম্পাস উইজেট
          </h1>
          <p className="text-sm text-stone-600 mt-2 max-w-2xl">
            হালাল বিনোদনের পাশাপাশি নামাজের জামাতের সময় যেন কখনোই ছুটে না যায়, সেজন্য আপনার শহর অনুযায়ী দৈনিক সালাতের সময়সূচি এবং মক্কার পবিত্র কাবা শরীফের নির্ভুল কিবলা কোণ নির্ণয় করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="city-select" className="block text-xs font-medium text-stone-600 mb-1">
              শহর নির্বাচন করুন
            </label>
            <select
              id="city-select"
              value={city.id}
              onChange={(e) => handleCityChange(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:border-[#0F5132]"
            >
              {CITY_PRAYER_SCHEDULES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cityBn} ({c.countryBn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sim-time-input" className="block text-xs font-medium text-stone-600 mb-1">
              বর্তমান সময় পরীক্ষা (২৪ ঘণ্টা)
            </label>
            <input
              id="sim-time-input"
              type="time"
              value={SimulatedTime}
              onChange={(e) => setSimulatedTime(e.target.value || '12:00')}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 tabular-nums focus:outline-none focus:border-[#0F5132]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 7 columns: Daily Prayer Schedule Table */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-[#0F5132]" />
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {city.cityBn}, {city.countryBn} — আজকের ওয়াক্তসমূহ
                  </h2>
                  <p className="text-xs text-stone-500 tabular-nums">
                    অক্ষাংশ: {city.lat.toFixed(4)}° N · দ্রাঘিমাংশ: {city.lng.toFixed(4)}° E
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-stone-500 block">পরবর্তী ওয়াক্ত</span>
                <span className="text-base font-bold text-[#0F5132] tabular-nums">
                  {nextPrayer.nameBn} — {nextPrayer.time}
                </span>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {prayerList.map((item) => {
                const isNext = item.labelBn.startsWith(nextPrayer.nameBn);
                return (
                  <div
                    key={item.labelBn}
                    className={`py-3.5 px-3 rounded-lg flex items-center justify-between transition-colors ${
                      isNext ? 'bg-[#0F5132]/8 font-semibold text-[#0F5132]' : 'text-stone-800'
                    }`}
                  >
                    <div>
                      <span className="text-sm">{item.labelBn}</span>
                      <span className="text-xs text-stone-500 ml-2">· {item.note}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {isNext && (
                        <span className="text-xs font-medium text-[#0F5132] underline">
                          আসন্ন জামাত
                        </span>
                      )}
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {item.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
            <span>গণনা পদ্ধতি: ইসলামিক ফাউন্ডেশন ও উম্মুল কুরা স্ট্যান্ডার্ড</span>
            <span>সকল সময় ২৪-ঘণ্টা ফরম্যাটে প্রদর্শিত</span>
          </div>
        </div>

        {/* Right 5 columns: Spherical Trigonometric Qibla Compass */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#C9A227]" />
                <h2 className="text-xl font-bold text-stone-900">কিবলা দিকনির্দেশক কম্পাস</h2>
              </div>
              <span className="font-mono text-sm font-bold text-[#0F5132] tabular-nums">
                {qiblaDegrees}° উত্তর থেকে
              </span>
            </div>

            {/* Interactive SVG Qibla Compass */}
            <div className="my-4 flex flex-col items-center justify-center">
              <div className="relative w-60 h-60 rounded-full border-2 border-stone-200 bg-[#FAF9F6] flex items-center justify-center shadow-inner">
                <span className="absolute top-2.5 text-[11px] font-bold text-stone-700 bg-[#FAF9F6] px-1.5 rounded">
                  উত্তর (N 0°)
                </span>
                <span className="absolute bottom-2.5 text-[11px] font-medium text-stone-500 bg-[#FAF9F6] px-1.5 rounded">
                  দক্ষিণ (S 180°)
                </span>
                <span className="absolute right-2 text-[11px] font-medium text-stone-500 bg-[#FAF9F6] px-1 rounded">
                  পূর্ব (E)
                </span>
                <span className="absolute left-2 text-[11px] font-medium text-stone-500 bg-[#FAF9F6] px-1 rounded">
                  পশ্চিম (W)
                </span>

                {/* Inner degree ring */}
                <div className="w-36 h-36 rounded-full border border-dashed border-stone-300 flex items-center justify-center relative">
                  {/* Rotating Qibla Pointer */}
                  <div
                    style={{ transform: `rotate(${qiblaDegrees}deg)` }}
                    className="w-full h-full flex items-center justify-center transition-transform duration-300"
                  >
                    <div className="flex flex-col items-center -mt-14">
                      <div className="px-1.5 py-0.5 rounded bg-[#0F5132] border border-[#C9A227] text-white text-[9px] font-bold shadow-xs">
                        কাবা
                      </div>
                      <Navigation className="w-5 h-5 text-[#0F5132] fill-[#0F5132] -mt-0.5" />
                    </div>
                  </div>
                  <div className="absolute w-3 h-3 rounded-full bg-[#C9A227] border-2 border-white z-10 shadow-xs" />
                </div>
              </div>

              <p className="mt-4 text-xs text-stone-600 text-center max-w-xs">
                পবিত্র কাবা ঘর (২১.৪২২৫° উত্তর, ৩৯.৮২৬২° পূর্ব) আপনার নির্বাচিত স্থান থেকে ঘড়ির কাঁটার দিকে{' '}
                <strong className="text-[#0F5132] tabular-nums">{qiblaDegrees}°</strong> কোণে অবস্থিত।
              </p>
            </div>
          </div>

          {/* Custom Coordinate Calculator */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0F5132]" />
              কাস্টম অক্ষাংশ ও দ্রাঘিমাংশ দিয়ে কিবলা যাচাই করুন:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="custom-lat" className="block text-[11px] text-stone-500 mb-1">
                  অক্ষাংশ (Latitude)
                </label>
                <input
                  id="custom-lat"
                  type="number"
                  step="0.01"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-stone-300 text-xs font-mono tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="custom-lng" className="block text-[11px] text-stone-500 mb-1">
                  দ্রাঘিমাংশ (Longitude)
                </label>
                <input
                  id="custom-lng"
                  type="number"
                  step="0.01"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-stone-300 text-xs font-mono tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Google Map with Qibla Geodesic Line & Places API (New) Search */}
      <InteractiveQiblaMap
        centerLat={parsedLat}
        centerLng={parsedLng}
        cityNameBn={city.cityEn}
        onLocationChange={(lat, lng) => {
          setCustomLat(String(lat));
          setCustomLng(String(lng));
        }}
      />
    </div>
  );
};

