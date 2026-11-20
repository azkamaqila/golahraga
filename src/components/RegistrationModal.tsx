import { X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { POSITIONS_BY_SPORT } from '../data/catalog';
import { CoachProfile, GenderType, PlayerProfile, SportType, UserLocation } from '../types';
import { LOCATION_PRESETS } from '../utils/geo';

interface RegistrationModalProps {
  isOpen: boolean;
  initialRole?: 'player' | 'coach';
  activeLocation: UserLocation;
  onClose: () => void;
  onRegisterPlayer: (player: PlayerProfile) => void;
  onRegisterCoach: (coach: CoachProfile) => void;
}

export function RegistrationModal({
  isOpen,
  initialRole = 'player',
  activeLocation,
  onClose,
  onRegisterPlayer,
  onRegisterCoach,
}: RegistrationModalProps) {
  const [role, setRole] = useState<'player' | 'coach'>(initialRole);
  const [name, setName] = useState('');
  const [sport, setSport] = useState<SportType>('Basket');
  const [gender, setGender] = useState<GenderType>('Laki-laki');
  const [locationId, setLocationId] = useState<string>(activeLocation.id || 'senayan');

  // Player specific
  const [position, setPosition] = useState(POSITIONS_BY_SPORT.Basket[0]);
  const [experienceYears, setExperienceYears] = useState('3');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('70');
  const [staminaNotes, setStaminaNotes] = useState('');
  const [hourlyRate, setHourlyRate] = useState('120000');

  // Coach specific
  const [certification, setCertification] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [dailyRate, setDailyRate] = useState('350000');
  const [weeklyRate, setWeeklyRate] = useState('1850000');
  const [monthlyRate, setMonthlyRate] = useState('6500000');

  if (!isOpen) return null;

  const selectedLoc =
    LOCATION_PRESETS.find((l) => l.id === locationId) ?? activeLocation ?? LOCATION_PRESETS[0];

  const handleSportChange = (nextSport: SportType) => {
    setSport(nextSport);
    setPosition(POSITIONS_BY_SPORT[nextSport][0]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const expNum = Math.max(1, Number(experienceYears) || 1);

    if (role === 'player') {
      const parsedSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const newPlayer: PlayerProfile = {
        id: `ply-${Date.now()}`,
        name: name.trim(),
        sport,
        position,
        experienceYears: expNum,
        experienceSummary:
          experienceSummary.trim() || `Pemain aktif ${sport} dengan ${expNum} tahun pengalaman bertanding.`,
        skills: parsedSkills.length > 0 ? parsedSkills : ['Team Play', 'Stamina Terjaga', 'Disiplin Posisi'],
        physical: {
          heightCm: Math.max(140, Number(heightCm) || 170),
          weightKg: Math.max(40, Number(weightKg) || 65),
          staminaNotes:
            staminaNotes.trim() || 'Kondisi fisik prima, siap bermain penuh sesuai durasi sewa.',
        },
        gender,
        hourlyRate: Math.max(50000, Number(hourlyRate) || 100000),
        locationName: selectedLoc.label,
        lat: selectedLoc.lat + (Math.random() - 0.5) * 0.008,
        lng: selectedLoc.lng + (Math.random() - 0.5) * 0.008,
        rating: 5.0,
        completedMatches: 0,
        courtFeeExempt: true,
      };
      onRegisterPlayer(newPlayer);
    } else {
      const newCoach: CoachProfile = {
        id: `cch-${Date.now()}`,
        name: name.trim().startsWith('Coach') ? name.trim() : `Coach ${name.trim()}`,
        sport,
        experienceYears: expNum,
        experienceSummary:
          experienceSummary.trim() || `Pelatih ${sport} berpengalaman ${expNum} tahun membina tim komunitas dan akademi.`,
        specialty: specialty.trim() || `Taktikal Tim, Teknik Dasar & Conditioning ${sport}`,
        certification: certification.trim() || `Sertifikasi Pelatih ${sport}`,
        gender,
        rates: {
          daily: Math.max(100000, Number(dailyRate) || 350000),
          weekly: Math.max(500000, Number(weeklyRate) || 1800000),
          monthly: Math.max(1500000, Number(monthlyRate) || 6500000),
        },
        locationName: selectedLoc.label,
        lat: selectedLoc.lat + (Math.random() - 0.5) * 0.008,
        lng: selectedLoc.lng + (Math.random() - 0.5) * 0.008,
        rating: 5.0,
        sessionsLed: 0,
      };
      onRegisterCoach(newCoach);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-medium text-red-600">Bergabung di Golahraga</p>
            <h2 id="register-modal-title" className="font-display text-lg font-bold text-slate-900">
              Pendaftaran Pemain &amp; Coach
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form pendaftaran"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role switch */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                role === 'player'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Sebagai Pemain
            </button>
            <button
              type="button"
              onClick={() => setRole('coach')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                role === 'coach'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Sebagai Coach
            </button>
          </div>

          {/* Core Identity & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-medium text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                id="reg-name"
                type="text"
                required
                placeholder={role === 'player' ? 'cth. Ardiansyah Putra' : 'cth. CoachBudi Santoso'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-sport" className="block text-xs font-medium text-slate-700 mb-1">
                Cabang Olahraga
              </label>
              <select
                id="reg-sport"
                value={sport}
                onChange={(e) => handleSportChange(e.target.value as SportType)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:border-red-600 focus:outline-none"
              >
                <option value="Basket">Basket</option>
                <option value="Futsal">Futsal</option>
                <option value="Bola">Bola (Sepak Bola)</option>
              </select>
            </div>

            <div>
              <label htmlFor="reg-gender" className="block text-xs font-medium text-slate-700 mb-1">
                Gender
              </label>
              <select
                id="reg-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as GenderType)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:border-red-600 focus:outline-none"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label htmlFor="reg-location" className="block text-xs font-medium text-slate-700 mb-1">
                Area Lokasi Utama
              </label>
              <select
                id="reg-location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:border-red-600 focus:outline-none"
              >
                {LOCATION_PRESETS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {role === 'player' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="reg-position" className="block text-xs font-medium text-slate-700 mb-1">
                    Posisi Bermain
                  </label>
                  <select
                    id="reg-position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:border-red-600 focus:outline-none"
                  >
                    {POSITIONS_BY_SPORT[sport].map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="reg-exp-years" className="block text-xs font-medium text-slate-700 mb-1">
                    Pengalaman (Tahun)
                  </label>
                  <input
                    id="reg-exp-years"
                    type="number"
                    min={1}
                    max={40}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="reg-hourly" className="block text-xs font-medium text-slate-700 mb-1">
                    Tarif Per Jam (Rp)
                  </label>
                  <input
                    id="reg-hourly"
                    type="number"
                    min={50000}
                    step={5000}
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Physical description */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-900">Deskripsi Fisik Pemain</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-height" className="block text-xs font-medium text-slate-700 mb-1">
                      Tinggi Badan (cm)
                    </label>
                    <input
                      id="reg-height"
                      type="number"
                      min={140}
                      max={230}
                      required
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-weight" className="block text-xs font-medium text-slate-700 mb-1">
                      Berat Badan (kg)
                    </label>
                    <input
                      id="reg-weight"
                      type="number"
                      min={40}
                      max={160}
                      required
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-stamina" className="block text-xs font-medium text-slate-700 mb-1">
                    Catatan Postur &amp; Stamina
                  </label>
                  <input
                    id="reg-stamina"
                    type="text"
                    required
                    placeholder="cth. Atletis, sprint cepat, kuat bermain 2x45 menit"
                    value={staminaNotes}
                    onChange={(e) => setStaminaNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-skills" className="block text-xs font-medium text-slate-700 mb-1">
                  Keahlian / Spesialisasi (pisahkan dengan koma)
                </label>
                <input
                  id="reg-skills"
                  type="text"
                  required
                  placeholder="cth. Playmaking, 3-Point Shooting, Man-to-Man Defense"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="reg-exp-summary" className="block text-xs font-medium text-slate-700 mb-1">
                  Pengalaman di Bidang Olahraga Tersebut
                </label>
                <textarea
                  id="reg-exp-summary"
                  rows={2}
                  required
                  placeholder="cth. Eks pemain tim universitas, juara liga komunitas 2025..."
                  value={experienceSummary}
                  onChange={(e) => setExperienceSummary(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
                Pemain yang terdaftar di Golahraga bebas dari kewajiban membayar biaya lapangan saat disewa, dengan potongan/biaya platform 5% dibebankan pada transaksi sewa.
              </p>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="coach-exp-years" className="block text-xs font-medium text-slate-700 mb-1">
                    Pengalaman Melatih (Tahun)
                  </label>
                  <input
                    id="coach-exp-years"
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="coach-cert" className="block text-xs font-medium text-slate-700 mb-1">
                    Lisensi / Sertifikasi
                  </label>
                  <input
                    id="coach-cert"
                    type="text"
                    required
                    placeholder="cth. Lisensi B PSSI / Lisensi A PERBASI"
                    value={certification}
                    onChange={(e) => setCertification(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="coach-specialty" className="block text-xs font-medium text-slate-700 mb-1">
                  Fokus &amp; Spesialisasi Melatih
                </label>
                <input
                  id="coach-specialty"
                  type="text"
                  required
                  placeholder="cth. Taktikal Formasi, Shooting Mechanics, Conditioning Tim"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="coach-exp-summary" className="block text-xs font-medium text-slate-700 mb-1">
                  Pengalaman Melatih di Bidang Olahraga Tersebut
                </label>
                <textarea
                  id="coach-exp-summary"
                  rows={2}
                  required
                  placeholder="cth. Pernah melatih akademi U-18 dan tim korporat Jakarta..."
                  value={experienceSummary}
                  onChange={(e) => setExperienceSummary(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-900">
                  Skema Tarif Sewa Coach (Harian / Mingguan / Bulanan)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="coach-daily" className="block text-xs font-medium text-slate-700 mb-1">
                      Tarif Harian (Rp)
                    </label>
                    <input
                      id="coach-daily"
                      type="number"
                      min={100000}
                      step={25000}
                      required
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="coach-weekly" className="block text-xs font-medium text-slate-700 mb-1">
                      Tarif Mingguan (Rp)
                    </label>
                    <input
                      id="coach-weekly"
                      type="number"
                      min={300000}
                      step={50000}
                      required
                      value={weeklyRate}
                      onChange={(e) => setWeeklyRate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="coach-monthly" className="block text-xs font-medium text-slate-700 mb-1">
                      Tarif Bulanan (Rp)
                    </label>
                    <input
                      id="coach-monthly"
                      type="number"
                      min={1000000}
                      step={100000}
                      required
                      value={monthlyRate}
                      onChange={(e) => setMonthlyRate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
                Setiap transaksi sewa coach dikenakan platform fee sebesar 10%. Profil coach akan langsung muncul di pencarian lokasi terdekat.
              </p>
            </>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
            >
              {role === 'player' ? 'Daftarkan Pemain' : 'Daftarkan Coach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
