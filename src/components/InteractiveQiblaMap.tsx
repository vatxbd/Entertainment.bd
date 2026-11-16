import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Compass, MapPin, Navigation, Search, ExternalLink } from 'lucide-react';
import { calculateQiblaBearing } from '../utils/directoryRules';

interface HalalPlaceResult {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
  rating?: number;
  userRatingCount?: number;
  googleMapsURI?: string;
}

interface InteractiveQiblaMapProps {
  centerLat: number;
  centerLng: number;
  cityNameBn: string;
  onLocationChange: (lat: number, lng: number, labelBn?: string) => void;
}

const KAABA_COORDS = { lat: 21.422487, lng: 39.826206 };

function QiblaGeodesicLine({ origin }: { origin: { lat: number; lng: number } }) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib) return;

    const polyline = new mapsLib.Polyline({
      path: [origin, KAABA_COORDS],
      geodesic: true,
      strokeColor: '#0F5132',
      strokeOpacity: 0.85,
      strokeWeight: 3,
      map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, mapsLib, origin.lat, origin.lng]);

  return null;
}

export const InteractiveQiblaMap: React.FC<InteractiveQiblaMapProps> = ({
  centerLat,
  centerLng,
  cityNameBn,
  onLocationChange,
}) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  const [searchInput, setSearchInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<HalalPlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<HalalPlaceResult | null>(null);
  const [activePlaceQuery, setActivePlaceQuery] = useState<string>('Mosque');
  const [isSearchingPlaces, setIsSearchingPlaces] = useState<boolean>(false);
  const [placesStatusMsg, setPlacesStatusMsg] = useState<string | null>(null);

  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const qiblaDegrees = calculateQiblaBearing(centerLat, centerLng);

  // Recenter map smoothly when city/coordinates change
  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: centerLat, lng: centerLng });
  }, [map, centerLat, centerLng]);

  // Tier 2 quota defense helper
  const checkAndDispatchQuotaError = (err: unknown) => {
    const msg = String(err instanceof Error ? err.message : err);
    if (
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('OVER_QUERY_LIMIT') ||
      msg.includes('429') ||
      msg.includes('QuotaExceeded')
    ) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  };

  // Modern Places API (New): AutocompleteSuggestion.fetchAutocompleteSuggestions
  useEffect(() => {
    if (!placesLib) return;
    const trimmed = searchInput.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    let cancelled = false;
    AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: trimmed,
      sessionToken: sessionTokenRef.current,
    })
      .then((res: { suggestions: google.maps.places.AutocompleteSuggestion[] }) => {
        if (!cancelled) {
          setSuggestions(res?.suggestions ?? []);
        }
      })
      .catch((err: unknown) => {
        checkAndDispatchQuotaError(err);
      });

    return () => {
      cancelled = true;
    };
  }, [placesLib, searchInput]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!placesLib || !suggestion.placePrediction) return;
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
        });

        const loc = place.location;
        if (loc) {
          const lat = loc.lat();
          const lng = loc.lng();
          onLocationChange(
            Number(lat.toFixed(4)),
            Number(lng.toFixed(4)),
            place.displayName || suggestion.placePrediction.text?.text
          );
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(14);
          }
        }
        setSearchInput('');
        setSuggestions([]);
        sessionTokenRef.current = null;
      } catch (err) {
        checkAndDispatchQuotaError(err);
      }
    },
    [placesLib, map, onLocationChange]
  );

  // Modern Places API (New): Place.searchByText for nearby Mosques, Islamic Centers & Halal Family Venues
  const runNearbyHalalSearch = useCallback(
    async (categoryKeyword: string) => {
      if (!placesLib) return;
      setIsSearchingPlaces(true);
      setPlacesStatusMsg(null);
      setActivePlaceQuery(categoryKeyword);

      try {
        const { Place } = placesLib;
        const response = await Place.searchByText({
          textQuery: `${categoryKeyword} near ${cityNameBn}`,
          locationBias: {
            center: { lat: centerLat, lng: centerLng },
            radius: 6000,
          },
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'googleMapsURI',
          ],
          maxResultCount: 8,
        });

        const placesList = response?.places ?? [];
        const mapped: HalalPlaceResult[] = [];
        for (const p of placesList) {
          if (p.location) {
            mapped.push({
              id: p.id || `${p.location.lat()}-${p.location.lng()}`,
              displayName: p.displayName || 'ইসলামিক কেন্দ্র / মসজিদ',
              formattedAddress: p.formattedAddress || '',
              location: { lat: p.location.lat(), lng: p.location.lng() },
              rating: p.rating ?? undefined,
              userRatingCount: p.userRatingCount ?? undefined,
              googleMapsURI: p.googleMapsURI ?? undefined,
            });
          }
        }
        setNearbyPlaces(mapped);
        if (mapped.length === 0) {
          setPlacesStatusMsg('এই এলাকায় কোনো স্থান পাওয়া যায়নি। অন্য শহর বা ক্যাটাগরি চেষ্টা করুন।');
        }
      } catch (err) {
        checkAndDispatchQuotaError(err);
        setPlacesStatusMsg('স্থানীয় তথ্যের জন্য ম্যাপে ক্লিক করুন অথবা সার্চ করুন।');
      } finally {
        setIsSearchingPlaces(false);
      }
    },
    [placesLib, centerLat, centerLng, cityNameBn]
  );

  useEffect(() => {
    if (placesLib) {
      void runNearbyHalalSearch(activePlaceQuery);
    }
  }, [placesLib, centerLat, centerLng]);

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mt-8">
      {/* Top Map Toolbar: Places Autocomplete & Category Discovery */}
      <div className="p-5 border-b border-stone-200 bg-[#FAF9F6] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold">
            Google Maps Platform লাইভ ম্যাপ ও স্থান অন্বেষণ
          </p>
          <h2 className="text-xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0F5132]" />
            ইন্টারঅ্যাক্টিভ কিবলা জিওডেসিক রেখা ও নিকটস্থ মসজিদ / ইসলামিক সেন্টার
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            ম্যাপের যেকোনো স্থানে ক্লিক করে অথবা ঠিকানা সার্চ করে আপনার নির্ভুল কিবলা রেখা ({qiblaDegrees}°) এবং আশেপাশের মসজিদ ও ইসলামিক লাইব্রেরি খুঁজুন।
          </p>
        </div>

        {/* Places API (New) Autocomplete Search Box */}
        <div className="relative w-full lg:w-96">
          <label htmlFor="gmp-place-search" className="sr-only">
            শহর, মসজিদ বা ঠিকানা খুঁজুন
          </label>
          <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-lg px-3 py-2 focus-within:border-[#0F5132]">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              id="gmp-place-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="আপনার এলাকা বা মসজিদের নাম লিখুন..."
              className="w-full text-xs sm:text-sm text-stone-900 bg-transparent focus:outline-none"
            />
          </div>

          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto divide-y divide-stone-100">
              {suggestions.map((s, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => void handleSelectSuggestion(s)}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-stone-800 hover:bg-[#0F5132]/8 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0F5132] shrink-0" />
                    <span className="truncate">{s.placePrediction?.text?.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Category Filter Buttons for Places API (New) Text Search */}
      <div className="px-5 py-3 bg-white border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">নিকটস্থ স্থান খুঁজুন:</span>
          {[
            { query: 'Mosque', labelBn: 'মসজিদ (Mosques)' },
            { query: 'Islamic Cultural Center Library', labelBn: 'ইসলামিক লাইব্রেরি ও সেন্টার' },
            { query: 'Halal Family Restaurant', labelBn: 'হালাল পারিবারিক রেস্তোরাঁ' },
          ].map((btn) => (
            <button
              key={btn.query}
              type="button"
              onClick={() => void runNearbyHalalSearch(btn.query)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activePlaceQuery === btn.query
                  ? 'bg-[#0F5132] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {btn.labelBn}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-[#0F5132] font-semibold tabular-nums">
          নির্বাচিত স্থান: {centerLat.toFixed(4)}° N, {centerLng.toFixed(4)}° E · কিবলা: {qiblaDegrees}°
        </span>
      </div>

      {/* Map Viewport + Side Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 8 Columns: Explicit Sized Container for <Map> (CF2 & CF9 compliance) */}
        <div className="lg:col-span-8 h-[440px] w-full relative bg-stone-100">
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={{ lat: centerLat, lng: centerLng }}
            defaultZoom={13}
            gestureHandling="greedy"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            onClick={(ev) => {
              const latLng = ev.detail.latLng;
              if (latLng) {
                onLocationChange(
                  Number(latLng.lat.toFixed(4)),
                  Number(latLng.lng.toFixed(4))
                );
              }
            }}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Geodesic Qibla Line toward Makkah */}
            <QiblaGeodesicLine origin={{ lat: centerLat, lng: centerLng }} />

            {/* User Selected Origin AdvancedMarker */}
            <AdvancedMarker
              position={{ lat: centerLat, lng: centerLng }}
              title={`আপনার নির্বাচিত অবস্থান (কিবলা কোণ: ${qiblaDegrees}°)`}
            >
              <Pin
                background="#0F5132"
                borderColor="#C9A227"
                glyphColor="#FFFFFF"
                scale={1.25}
              />
            </AdvancedMarker>

            {/* Makkah Kaaba Destination AdvancedMarker */}
            <AdvancedMarker
              position={KAABA_COORDS}
              title="পবিত্র কাবা শরীফ, মক্কা আল-মুকাররমা"
            >
              <Pin
                background="#C9A227"
                borderColor="#0F5132"
                glyphColor="#1C1917"
                scale={1.2}
              />
            </AdvancedMarker>

            {/* Live Places API (New) Results AdvancedMarkers */}
            {nearbyPlaces.map((place) => (
              <AdvancedMarker
                key={place.id}
                position={place.location}
                title={place.displayName}
                onClick={() => setSelectedPlace(place)}
              >
                <Pin
                  background="#1E3A8A"
                  borderColor="#FFFFFF"
                  glyphColor="#FFFFFF"
                  scale={1.0}
                />
              </AdvancedMarker>
            ))}

            {selectedPlace && (
              <InfoWindow
                position={selectedPlace.location}
                onCloseClick={() => setSelectedPlace(null)}
                maxWidth={260}
              >
                <div className="p-1 text-stone-900">
                  <h3 className="text-xs font-bold">{selectedPlace.displayName}</h3>
                  {selectedPlace.formattedAddress && (
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      {selectedPlace.formattedAddress}
                    </p>
                  )}
                  <p className="text-[11px] font-semibold text-[#0F5132] mt-1 tabular-nums">
                    এখান থেকে কিবলা কোণ:{' '}
                    {calculateQiblaBearing(
                      selectedPlace.location.lat,
                      selectedPlace.location.lng
                    )}
                    °
                  </p>
                  {selectedPlace.googleMapsURI && (
                    <a
                      href={selectedPlace.googleMapsURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
                    >
                      Google Maps-এ দেখুন <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>

        {/* Right 4 Columns: Live Places API (New) Results List */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-stone-200 p-4 flex flex-col justify-between max-h-[440px] overflow-y-auto bg-white">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#0F5132]" />
                লাইভ গুগল ম্যাপস ফলাফল ({nearbyPlaces.length})
              </h3>
              {isSearchingPlaces && (
                <span className="text-[11px] text-stone-500">অনুসন্ধান চলছে...</span>
              )}
            </div>

            {placesStatusMsg && nearbyPlaces.length === 0 && (
              <p className="text-xs text-stone-500 py-4">{placesStatusMsg}</p>
            )}

            <div className="space-y-2.5">
              {nearbyPlaces.map((place) => {
                const placeQibla = calculateQiblaBearing(
                  place.location.lat,
                  place.location.lng
                );
                return (
                  <div
                    key={place.id}
                    className="p-3 rounded-lg border border-stone-200/90 hover:border-[#0F5132] transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlace(place);
                        if (map) {
                          map.panTo(place.location);
                          map.setZoom(15);
                        }
                      }}
                      className="text-left w-full"
                    >
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                        {place.displayName}
                      </h4>
                      {place.formattedAddress && (
                        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                          {place.formattedAddress}
                        </p>
                      )}
                    </button>
                    <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600 tabular-nums">
                      <span className="text-[#0F5132] font-semibold inline-flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        কিবলা: {placeQibla}°
                      </span>
                      {place.rating && (
                        <span>
                          ★ {place.rating.toFixed(1)} ({place.userRatingCount || 0})
                        </span>
                      )}
                      {place.googleMapsURI && (
                        <a
                          href={place.googleMapsURI}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-700 hover:text-[#0F5132] underline"
                        >
                          ম্যাপ লিংক
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            তথ্যসূত্র: Google Maps Platform (Places API New) — লাইভ জিওস্পেশিয়াল ডেটা
          </p>
        </div>
      </div>
    </div>
  );
};
