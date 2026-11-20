import { CheckCircle2, Compass, LocateFixed, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BookingModal } from './components/BookingModal';
import { BookingsDrawer } from './components/BookingsDrawer';
import { CoachCard } from './components/CoachCard';
import { PlayerCard } from './components/PlayerCard';
import { RegistrationModal } from './components/RegistrationModal';
import {
  HERO_COURT_IMAGE,
  INITIAL_COACHES,
  INITIAL_PLAYERS,
  POSITIONS_BY_SPORT,
} from './data/catalog';
import {
  BookingRecord,
  CoachBillingUnit,
  CoachProfile,
  GenderType,
  PlayerProfile,
  SportType,
  UserLocation,
} from './types';
import { calculateDistanceKm, LOCATION_PRESETS } from './utils/geo';

const STORAGE_PLAYERS_KEY = 'golahraga_players_v1';
const STORAGE_COACHES_KEY = 'golahraga_coaches_v1';
const STORAGE_BOOKINGS_KEY = 'golahraga_bookings_v1';
const GOLAHRAGA_LOGO_URL =
  '/assets/aistudio/Gemini_Generated_Image_t941ypt941ypt941_c13ec477.jpeg';

type ActiveTab = 'players' | 'coaches';

export default function App() {
  // Persistent catalog & bookings
  const [players, setPlayers] = useState<PlayerProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLAYERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return INITIAL_PLAYERS;
  });

  const [coaches, setCoaches] = useState<CoachProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COACHES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return INITIAL_COACHES;
  });

  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BOOKINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(players));
    } catch {
      // ignore
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COACHES_KEY, JSON.stringify(coaches));
    } catch {
      // ignore
    }
  }, [coaches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  // Workspace navigation & location state
  const [activeTab, setActiveTab] = useState<ActiveTab>('players');
  const [userLocation, setUserLocation] = useState<UserLocation>(LOCATION_PRESETS[0]);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Filters
  const [sportFilter, setSportFilter] = useState<SportType>('Basket');
  const [genderFilter, setGenderFilter] = useState<'Semua' | GenderType>('Semua');
  const [positionFilter, setPositionFilter] = useState<string>('Semua');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [coachUnit, setCoachUnit] = useState<CoachBillingUnit>('weekly');

  // Modals & drawers
  const [bookingTarget, setBookingTarget] = useState<
    | { role: 'player'; profile: PlayerProfile; distanceKm: number }
    | { role: 'coach'; profile: CoachProfile; distanceKm: number; initialUnit: CoachBillingUnit }
    | null
  >(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerInitialRole, setRegisterInitialRole] = useState<'player' | 'coach'>('player');
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [heroImgError, setHeroImgError] = useState(false);
  const [logoImgError, setLogoImgError] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Automatic nearest-location GPS detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Browser tidak mendukung deteksi GPS. Pilih area terdekat secara manual.');
      return;
    }
    setIsLocating(true);
    setGeoStatus('Mendeteksi koordinat lokasi Anda...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          id: 'gps-current',
          label: `Lokasi Saya (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
          city: 'Lokasi GPS Aktif',
          lat: latitude,
          lng: longitude,
          isGps: true,
        });
        setIsLocating(false);
        setGeoStatus('Lokasi terdeteksi. Daftar otomatis diurutkan dari jarak terdekat.');
      },
      () => {
        setIsLocating(false);
        setGeoStatus(
          'Izin GPS tidak tersedia. Menggunakan area referensi terpilih untuk mencari jarak terdekat.'
        );
      },
      { timeout: 6000 }
    );
  };

  // Available positions based on selected sport sub-category
  const availablePositions = useMemo(() => {
    return POSITIONS_BY_SPORT[sportFilter];
  }, [sportFilter]);

  // Reset position filter when switching sport if incompatible
  const handleSportChange = (nextSport: SportType) => {
    setSportFilter(nextSport);
    if (!POSITIONS_BY_SPORT[nextSport].includes(positionFilter)) {
      setPositionFilter('Semua');
    }
  };

  // Players with distance & price filter (ordered nearest automatically)
  const filteredPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const withDist = players
      .map((p) => ({
        profile: p,
        distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng),
      }))
      .filter(({ profile }) => {
        if (profile.sport !== sportFilter) return false;
        if (genderFilter !== 'Semua' && profile.gender !== genderFilter) return false;
        if (positionFilter !== 'Semua' && profile.position !== positionFilter) return false;
        if (priceFilter === 'low' && profile.hourlyRate >= 125000) return false;
        if (
          priceFilter === 'mid' &&
          (profile.hourlyRate < 125000 || profile.hourlyRate > 150000)
        ) {
          return false;
        }
        if (priceFilter === 'high' && profile.hourlyRate <= 150000) return false;
        if (q) {
          const hay = `${profile.name} ${profile.position} ${profile.locationName} ${profile.skills.join(' ')} ${profile.experienceSummary}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

    return withDist.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [players, userLocation, sportFilter, genderFilter, positionFilter, priceFilter, searchQuery]);

  // Coaches with distance & price filter (ordered nearest automatically)
  const filteredCoaches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const withDist = coaches
      .map((c) => ({
        profile: c,
        distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, c.lat, c.lng),
      }))
      .filter(({ profile }) => {
        if (profile.sport !== sportFilter) return false;
        if (genderFilter !== 'Semua' && profile.gender !== genderFilter) return false;
        const activeRate = profile.rates[coachUnit];
        const lowBound =
          coachUnit === 'daily' ? 400000 : coachUnit === 'weekly' ? 2000000 : 7000000;
        const highBound =
          coachUnit === 'daily' ? 430000 : coachUnit === 'weekly' ? 2250000 : 7600000;
        if (priceFilter === 'low' && activeRate >= lowBound) return false;
        if (priceFilter === 'mid' && (activeRate < lowBound || activeRate > highBound)) {
          return false;
        }
        if (priceFilter === 'high' && activeRate <= highBound) return false;
        if (q) {
          const hay = `${profile.name} ${profile.certification} ${profile.specialty} ${profile.locationName} ${profile.experienceSummary}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

    return withDist.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [coaches, userLocation, sportFilter, genderFilter, priceFilter, searchQuery, coachUnit]);

  const jumpToWorkspace = (tab: ActiveTab) => {
    setActiveTab(tab);
    const el = document.getElementById('eksplorasi');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const openRegistration = (role: 'player' | 'coach') => {
    setRegisterInitialRole(role);
    setIsRegisterOpen(true);
  };

  const handleRegisterPlayer = (newPlayer: PlayerProfile) => {
    setPlayers((prev) => [newPlayer, ...prev]);
    setActiveTab('players');
    setSportFilter(newPlayer.sport);
    setPositionFilter('Semua');
    setGenderFilter('Semua');
    setPriceFilter('all');
    showToast(`${newPlayer.name} berhasil terdaftar sebagai pemain ${newPlayer.sport}.`);
    jumpToWorkspace('players');
  };

  const handleRegisterCoach = (newCoach: CoachProfile) => {
    setCoaches((prev) => [newCoach, ...prev]);
    setActiveTab('coaches');
    setSportFilter(newCoach.sport);
    setGenderFilter('Semua');
    setPriceFilter('all');
    showToast(`${newCoach.name} berhasil terdaftar sebagai coach ${newCoach.sport}.`);
    jumpToWorkspace('coaches');
  };

  const handleConfirmBooking = (record: BookingRecord) => {
    setBookings((prev) => [record, ...prev]);
    showToast(`Pesanan #${record.id} untuk ${record.targetName} telah dikonfirmasi.`);
  };

  const resetAllFilters = () => {
    setGenderFilter('Semua');
    setPositionFilter('Semua');
    setPriceFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Logo */}
          <a
            href="#"
            aria-label="Golahraga Beranda"
            className="flex items-center whitespace-nowrap shrink-0"
          >
            {!logoImgError ? (
              <span className="block h-10 w-36 sm:w-40 overflow-hidden bg-white">
                <img
                  src={GOLAHRAGA_LOGO_URL}
                  alt="Golahraga"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoImgError(true)}
                  className="h-full w-full object-cover object-center scale-110"
                />
              </span>
            ) : (
              <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                <span className="text-red-600">Gol</span>ahraga
              </span>
            )}
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => jumpToWorkspace('players')}
              className="hover:text-red-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sewa Pemain
            </button>
            <button
              type="button"
              onClick={() => jumpToWorkspace('coaches')}
              className="hover:text-red-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sewa Coach
            </button>
            <a
              href="#benefit"
              className="hover:text-red-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Benefit
            </a>
            <a
              href="#ketentuan"
              className="hover:text-red-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ketentuan
            </a>
            <button
              type="button"
              onClick={() => setIsBookingsOpen(true)}
              className="hover:text-red-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
            >
              Riwayat Sewa{bookings.length > 0 ? ` (${bookings.length})` : ''}
            </button>
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => openRegistration(activeTab === 'coaches' ? 'coach' : 'player')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Daftar Talent
            </button>
          </div>
        </div>
      </header>

      {/* Toast confirmation */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Split */}
        <section className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left Copy */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <p className="text-xs font-semibold text-red-600 tracking-wide">
                  Basket · Futsal · Sepak Bola
                </p>
                <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
                  Sewa Pemain &amp; Coach Olahraga Terdekat dalam Hitungan Menit.
                </h1>
                <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
                  Lengkapi skuad tanding Anda dengan pemain berpengalaman per jam tanpa membebani mereka biaya lapangan, atau jadwalkan pelatih profesional secara harian, mingguan, hingga bulanan.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => jumpToWorkspace('players')}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Cari Pemain Terdekat
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToWorkspace('coaches')}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:border-red-300 hover:bg-red-50/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Cari Coach Profesional
                  </button>
                  <button
                    type="button"
                    onClick={() => openRegistration('player')}
                    className="px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Daftar sebagai Pemain / Coach
                  </button>
                </div>
              </div>

              {/* Right Photography */}
              <div className="lg:col-span-6">
                <div className="relative h-64 sm:h-80 lg:h-full min-h-[300px] w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-200">
                  {!heroImgError ? (
                    <img
                      src={HERO_COURT_IMAGE}
                      alt="Lapangan basket dan futsal modern Golahraga"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-red-950 text-white p-8">
                      <p className="font-display text-2xl font-bold">Arena Golahraga</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4-column feature/rules strip below hero split */}
            <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-red-600">01. Lokasi Otomatis</p>
                <p className="mt-1 font-display text-base font-semibold text-slate-900">
                  Pencarian Jarak Terdekat
                </p>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Pemain dan coach langsung diurutkan otomatis berdasarkan jarak terdekat dari posisi Anda.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600">02. Sewa Pemain Per Jam</p>
                <p className="mt-1 font-display text-base font-semibold text-slate-900 tabular-nums">
                  Platform Fee 5% · Bebas Lapangan
                </p>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Pemain yang disewa tidak harus membayar lapangan, dilengkapi data fisik, keahlian, &amp; posisi.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600">03. Sewa Coach Fleksibel</p>
                <p className="mt-1 font-display text-base font-semibold text-slate-900 tabular-nums">
                  Harian / Mingguan / Bulanan
                </p>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Tersedia opsi durasi lengkap dengan pengalaman melatih terverifikasi dan platform fee 10%.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600">04. Sorting Lengkap</p>
                <p className="mt-1 font-display text-base font-semibold text-slate-900">
                  Posisi, Harga, Pengalaman, Gender
                </p>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Saring kandidat secara presisi untuk Basket, Futsal, maupun Sepak Bola.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace Exploration Workspace */}
        <section id="eksplorasi" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Mode Switch + Location Selector Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            {/* Mode Switch */}
            <div className="inline-flex rounded-xl bg-slate-200/75 p-1 self-start">
              <button
                type="button"
                onClick={() => setActiveTab('players')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'players'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cari Pemain ({players.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('coaches')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'coaches'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cari Coach ({coaches.length})
              </button>
            </div>

            {/* Active Location & Auto-Detect Control */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                <Compass className="h-4 w-4 text-red-600 shrink-0" />
                <label htmlFor="location-preset" className="text-slate-500 whitespace-nowrap">
                  Lokasi Anda:
                </label>
                <select
                  id="location-preset"
                  value={userLocation.isGps ? 'gps-current' : userLocation.id}
                  onChange={(e) => {
                    const found = LOCATION_PRESETS.find((l) => l.id === e.target.value);
                    if (found) {
                      setUserLocation(found);
                      setGeoStatus(null);
                    }
                  }}
                  className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {userLocation.isGps && (
                    <option value="gps-current">{userLocation.label}</option>
                  )}
                  {LOCATION_PRESETS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:border-red-300 hover:bg-red-50/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
              >
                <LocateFixed className="h-3.5 w-3.5 text-red-600" />
                <span>{isLocating ? 'Mendeteksi...' : 'Deteksi Lokasi Terdekat'}</span>
              </button>
            </div>
          </div>

          {geoStatus && (
            <p className="mt-3 text-xs text-red-600 font-medium">{geoStatus}</p>
          )}

          {/* Filter & Sorting Toolbar */}
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Sport sub-category tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['Basket', 'Futsal', 'Bola'] as const).map((sport) => {
                  const active = sportFilter === sport;
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleSportChange(sport)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'players'
                      ? 'Cari nama, keahlian, posisi...'
                      : 'Cari coach, lisensi, spesialisasi...'
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Attribute Filters */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filter:</span>
                </div>

                {/* Position filter (Player only) */}
                {activeTab === 'players' && (
                  <select
                    aria-label="Filter posisi pemain"
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-red-600 focus:outline-none cursor-pointer"
                  >
                    <option value="Semua">Semua Posisi</option>
                    {availablePositions.map((pos) => (
                      <option key={pos} value={pos}>
                        Posisi: {pos}
                      </option>
                    ))}
                  </select>
                )}

                {/* Billing Unit selector (Coach only) */}
                {activeTab === 'coaches' && (
                  <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                    {(
                      [
                        { id: 'daily', label: 'Harian' },
                        { id: 'weekly', label: 'Mingguan' },
                        { id: 'monthly', label: 'Bulanan' },
                      ] as const
                    ).map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => setCoachUnit(unit.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          coachUnit === unit.id
                            ? 'bg-white text-red-600 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Gender filter (Both) */}
                <select
                  aria-label="Filter gender"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as 'Semua' | GenderType)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-red-600 focus:outline-none cursor-pointer"
                >
                  <option value="Semua">Semua Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>

                {/* Price filter (Both) */}
                <select
                  aria-label="Filter harga"
                  value={priceFilter}
                  onChange={(e) =>
                    setPriceFilter(e.target.value as 'all' | 'low' | 'mid' | 'high')
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-red-600 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Harga</option>
                  {activeTab === 'players' ? (
                    <>
                      <option value="low">&lt; Rp 125.000 / jam</option>
                      <option value="mid">Rp 125.000 – Rp 150.000 / jam</option>
                      <option value="high">&gt; Rp 150.000 / jam</option>
                    </>
                  ) : coachUnit === 'daily' ? (
                    <>
                      <option value="low">&lt; Rp 400.000 / hari</option>
                      <option value="mid">Rp 400.000 – Rp 430.000 / hari</option>
                      <option value="high">&gt; Rp 430.000 / hari</option>
                    </>
                  ) : coachUnit === 'weekly' ? (
                    <>
                      <option value="low">&lt; Rp 2.000.000 / minggu</option>
                      <option value="mid">Rp 2.000.000 – Rp 2.250.000 / minggu</option>
                      <option value="high">&gt; Rp 2.250.000 / minggu</option>
                    </>
                  ) : (
                    <>
                      <option value="low">&lt; Rp 7.000.000 / bulan</option>
                      <option value="mid">Rp 7.000.000 – Rp 7.600.000 / bulan</option>
                      <option value="high">&gt; Rp 7.600.000 / bulan</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary Line */}
          <div className="mt-6 mb-4 flex items-center justify-between text-xs text-slate-500">
            <p className="tabular-nums">
              Menampilkan{' '}
              <strong className="font-semibold text-slate-900">
                {activeTab === 'players' ? filteredPlayers.length : filteredCoaches.length}
              </strong>{' '}
              {activeTab === 'players' ? 'pemain' : 'coach'} di sekitar{' '}
              <span className="font-medium text-slate-700">{userLocation.label}</span>
            </p>
            {(genderFilter !== 'Semua' ||
              positionFilter !== 'Semua' ||
              priceFilter !== 'all' ||
              searchQuery.trim() !== '') && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="font-medium text-red-600 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Talent Grid */}
          {activeTab === 'players' ? (
            filteredPlayers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredPlayers.map(({ profile, distanceKm }) => (
                  <PlayerCard
                    key={profile.id}
                    player={profile}
                    distanceKm={distanceKm}
                    onBook={(p) =>
                      setBookingTarget({ role: 'player', profile: p, distanceKm })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <p className="font-display text-base font-semibold text-slate-900">
                  Tidak ada pemain yang sesuai filter
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Coba ubah cabang olahraga, posisi, atau kata kunci pencarian Anda.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
                >
                  Tampilkan Semua Pemain
                </button>
              </div>
            )
          ) : filteredCoaches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredCoaches.map(({ profile, distanceKm }) => (
                <CoachCard
                  key={profile.id}
                  coach={profile}
                  distanceKm={distanceKm}
                  selectedUnit={coachUnit}
                  onBook={(c, unit) =>
                    setBookingTarget({
                      role: 'coach',
                      profile: c,
                      distanceKm,
                      initialUnit: unit,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="font-display text-base font-semibold text-slate-900">
                Tidak ada coach yang sesuai filter
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Coba ubah cabang olahraga, gender, atau kata kunci pencarian Anda.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                Tampilkan Semua Coach
              </button>
            </div>
          )}
        </section>

        {/* Benefit Section: Pemain & Coach */}
        <section id="benefit" className="bg-white border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-red-600">Keuntungan Bergabung</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
                Benefit Menjadi Pemain &amp; Coach di Golahraga
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Ubah pengalaman dan keahlian olahraga Anda menjadi peluang bertanding serta melatih secara profesional bersama tim terdekat.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Benefit Pemain Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Benefit untuk Pemain yang Disewakan
                    </h3>
                    <span className="font-mono text-xs font-semibold text-red-600 shrink-0">
                      Sewa Per Jam
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    <li>01. Bebas biaya sewa lapangan karena seluruh biaya lapangan ditanggung oleh tim penyewa.</li>
                    <li>02. Penghasilan fleksibel per jam sesuai tarif yang Anda tetapkan sendiri.</li>
                    <li>03. Profil otomatis direkomendasikan kepada tim yang mencari pemain di lokasi terdekat.</li>
                    <li>04. Menampilkan profil fisik, posisi, keahlian, dan riwayat tanding untuk menarik tim kompetitif.</li>
                  </ul>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openRegistration('player')}
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Daftar Sebagai Pemain →
                  </button>
                </div>
              </div>

              {/* Benefit Coach Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Benefit untuk Coach
                    </h3>
                    <span className="font-mono text-xs font-semibold text-red-600 shrink-0">
                      Harian / Mingguan / Bulanan
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    <li>01. Skema pendapatan berlapis melalui paket latihan harian, mingguan, maupun bulanan.</li>
                    <li>02. Menjangkau tim komunitas, korporat, hingga akademi olahraga di sekitar lokasi Anda.</li>
                    <li>03. Menunjukkan kredibilitas lewat pengalaman melatih, lisensi, dan spesialisasi taktikal.</li>
                    <li>04. Sistem pemesanan terstruktur dengan rincian jadwal dan nilai sewa yang transparan.</li>
                  </ul>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openRegistration('coach')}
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Daftar Sebagai Coach →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Platform Rules / Ketentuan Section */}
        <section id="ketentuan" className="bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-red-600">Ketentuan Platform</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
                Ketentuan Umum Sewa Pemain &amp; Coach
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Aturan standar Golahraga yang berlaku untuk seluruh transaksi penyewaan pemain maupun pelatih di cabang Basket, Futsal, dan Sepak Bola.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <dl className="divide-y divide-slate-100">
                <div className="py-4 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6">
                  <dt className="md:col-span-4 text-sm font-semibold text-slate-900">
                    01. Biaya Platform (Platform Fee)
                  </dt>
                  <dd className="md:col-span-8 text-sm text-slate-600 tabular-nums">
                    Setiap penyewaan pemain dikenakan platform fee sebesar <strong className="font-semibold text-red-600">5%</strong>, sedangkan setiap penyewaan coach dikenakan platform fee sebesar <strong className="font-semibold text-red-600">10%</strong> dari nilai transaksi.
                  </dd>
                </div>

                <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6">
                  <dt className="md:col-span-4 text-sm font-semibold text-slate-900">
                    02. Durasi &amp; Skema Sewa
                  </dt>
                  <dd className="md:col-span-8 text-sm text-slate-600">
                    Pemain disewa berdasarkan hitungan durasi <strong className="font-semibold text-slate-900">per jam</strong>, sedangkan coach dapat disewa berdasarkan paket <strong className="font-semibold text-slate-900">harian, mingguan, atau bulanan</strong>.
                  </dd>
                </div>

                <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6">
                  <dt className="md:col-span-4 text-sm font-semibold text-slate-900">
                    03. Biaya Lapangan Pemain
                  </dt>
                  <dd className="md:col-span-8 text-sm text-slate-600">
                    Pemain yang disewa tidak harus membayar biaya sewa lapangan. Seluruh biaya pemakaian GOR atau lapangan menjadi tanggung jawab pihak penyewa atau tim.
                  </dd>
                </div>

                <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6">
                  <dt className="md:col-span-4 text-sm font-semibold text-slate-900">
                    04. Kelengkapan Data Pendaftaran
                  </dt>
                  <dd className="md:col-span-8 text-sm text-slate-600">
                    Calon pemain wajib mendaftarkan pengalaman olahraga, keahlian, dan deskripsi fisik (tinggi badan, berat badan, kondisi stamina). Calon coach wajib mendaftarkan pengalaman melatih di cabang olahraga terkait.
                  </dd>
                </div>

                <div className="py-4 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6">
                  <dt className="md:col-span-4 text-sm font-semibold text-slate-900">
                    05. Lokasi Terdekat &amp; Penyaringan
                  </dt>
                  <dd className="md:col-span-8 text-sm text-slate-600">
                    Pencarian pemain dan coach otomatis mengurutkan kandidat berdasarkan lokasi terdekat dari penyewa serta dapat disaring menurut sub cabang olahraga, posisi (khusus pemain), gender, dan rentang harga.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            {!logoImgError && (
              <span className="block h-7 w-28 overflow-hidden bg-white shrink-0">
                <img
                  src={GOLAHRAGA_LOGO_URL}
                  alt="Golahraga"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center scale-110"
                />
              </span>
            )}
            <p>© 2026 Golahraga. Platform sewa pemain &amp; coach basket, futsal, dan sepak bola.</p>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => jumpToWorkspace('players')}
              className="hover:text-red-600 cursor-pointer"
            >
              Sewa Pemain
            </button>
            <button
              type="button"
              onClick={() => jumpToWorkspace('coaches')}
              className="hover:text-red-600 cursor-pointer"
            >
              Sewa Coach
            </button>
            <button
              type="button"
              onClick={() => setIsBookingsOpen(true)}
              className="hover:text-red-600 cursor-pointer"
            >
              Riwayat Sewa
            </button>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        key={bookingTarget ? `${bookingTarget.role}-${bookingTarget.profile.id}` : 'empty'}
        target={bookingTarget}
        onClose={() => setBookingTarget(null)}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* Registration Modal */}
      <RegistrationModal
        key={isRegisterOpen ? `reg-${registerInitialRole}` : 'reg-closed'}
        isOpen={isRegisterOpen}
        initialRole={registerInitialRole}
        activeLocation={userLocation}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterPlayer={handleRegisterPlayer}
        onRegisterCoach={handleRegisterCoach}
      />

      {/* Bookings Drawer */}
      <BookingsDrawer
        isOpen={isBookingsOpen}
        bookings={bookings}
        onClose={() => setIsBookingsOpen(false)}
      />
    </div>
  );
}
