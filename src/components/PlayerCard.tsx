import { MapPin } from 'lucide-react';
import { PlayerProfile } from '../types';
import { formatDistance, formatRupiah } from '../utils/format';
import { TalentArtwork } from './TalentArtwork';

interface PlayerCardProps {
  player: PlayerProfile;
  distanceKm: number;
  onBook: (player: PlayerProfile) => void;
}

export function PlayerCard({ player, distanceKm, onBook }: PlayerCardProps) {
  return (
    <article className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <TalentArtwork
        name={player.name}
        sport={player.sport}
        roleLabel={player.position}
        imageUrl={player.imageUrl}
      />

      <div className="flex min-w-0 flex-1 flex-col p-3.5">
        {/* Olahraga · Posisi · Gender */}
        <div className="flex items-center justify-between gap-1.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate">
            <span className="font-semibold text-red-600">{player.sport}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700 truncate">{player.position}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{player.gender}</span>
          </div>
        </div>

        {/* Nama */}
        <h3 className="mt-1 font-display text-base font-semibold text-slate-900 truncate">
          {player.name}
        </h3>

        {/* Lokasi + Jarak */}
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 truncate">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{player.locationName}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-700 shrink-0">
            {formatDistance(distanceKm)}
          </span>
        </div>

        {/* TB · BB · Exp */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-600 tabular-nums">
          <span>
            TB <strong className="font-semibold text-slate-900">{player.physical.heightCm} cm</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            BB <strong className="font-semibold text-slate-900">{player.physical.weightKg} kg</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            Exp <strong className="font-semibold text-slate-900">{player.experienceYears} thn</strong>
          </span>
        </div>

        {/* Deskripsi singkat */}
        <p className="mt-1.5 text-xs text-slate-600 leading-snug line-clamp-2">
          {player.experienceSummary}
        </p>

        {/* Bottom pricing & action */}
        <div className="mt-auto pt-2.5">
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums truncate">
                {formatRupiah(player.hourlyRate)}
                <span className="font-sans text-[11px] font-normal text-slate-500"> / jam</span>
              </div>
              <div className="text-[10px] text-slate-500 tabular-nums">
                + Fee platform 5%
              </div>
            </div>

            <button
              type="button"
              onClick={() => onBook(player)}
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
