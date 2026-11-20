import { MapPin } from 'lucide-react';
import { CoachBillingUnit, CoachProfile } from '../types';
import { formatDistance, formatRupiah } from '../utils/format';
import { TalentArtwork } from './TalentArtwork';

interface CoachCardProps {
  coach: CoachProfile;
  distanceKm: number;
  selectedUnit: CoachBillingUnit;
  onBook: (coach: CoachProfile, initialUnit: CoachBillingUnit) => void;
}

const UNIT_LABELS: Record<CoachBillingUnit, string> = {
  daily: 'hari',
  weekly: 'minggu',
  monthly: 'bulan',
};

export function CoachCard({ coach, distanceKm, selectedUnit, onBook }: CoachCardProps) {
  const activeRate = coach.rates[selectedUnit];

  return (
    <article className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <TalentArtwork
        name={coach.name}
        sport={coach.sport}
        roleLabel={`Coach ${coach.sport}`}
        imageUrl={coach.imageUrl}
      />

      <div className="flex min-w-0 flex-1 flex-col p-3.5">
        {/* Olahraga · Sertifikasi · Gender */}
        <div className="flex items-center justify-between gap-1.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate">
            <span className="font-semibold text-red-600">{coach.sport}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700 truncate">{coach.certification}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{coach.gender}</span>
          </div>
        </div>

        {/* Nama */}
        <h3 className="mt-1 font-display text-base font-semibold text-slate-900 truncate">
          {coach.name}
        </h3>

        {/* Lokasi + Jarak */}
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 truncate">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{coach.locationName}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-700 shrink-0">
            {formatDistance(distanceKm)}
          </span>
        </div>

        {/* Exp & Paket */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-600 tabular-nums">
          <span>
            Exp <strong className="font-semibold text-slate-900">{coach.experienceYears} thn</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="truncate">
            Harian / Mingguan / Bulanan
          </span>
        </div>

        {/* Deskripsi singkat */}
        <p className="mt-1.5 text-xs text-slate-600 leading-snug line-clamp-2">
          {coach.experienceSummary}
        </p>

        {/* Bottom pricing & action */}
        <div className="mt-auto pt-2.5">
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums truncate">
                {formatRupiah(activeRate)}
                <span className="font-sans text-[11px] font-normal text-slate-500">
                  {' '}
                  / {UNIT_LABELS[selectedUnit]}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 tabular-nums">
                + Fee platform 10%
              </div>
            </div>

            <button
              type="button"
              onClick={() => onBook(coach, selectedUnit)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sewa
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
