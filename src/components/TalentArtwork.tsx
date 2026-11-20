import { useState } from 'react';
import { SportType } from '../types';
import { getInitials } from '../utils/format';

interface TalentArtworkProps {
  name: string;
  sport: SportType;
  roleLabel: string;
  imageUrl?: string;
}

const SPORT_BG: Record<SportType, string> = {
  Basket: 'from-slate-900 via-red-950 to-slate-950',
  Futsal: 'from-red-950 via-slate-900 to-slate-950',
  Bola: 'from-slate-950 via-slate-900 to-red-950',
};

export function TalentArtwork({ name, sport, roleLabel, imageUrl }: TalentArtworkProps) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={`${name} — ${roleLabel} ${sport}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br ${SPORT_BG[sport]} flex flex-col justify-between p-4 text-white`}
    >
      {/* Subtle athletic court geometry SVG */}
      <svg
        aria-hidden="true"
        viewBox="0 0 240 300"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
        fill="none"
      >
        {sport === 'Basket' && (
          <>
            <circle cx="180" cy="150" r="56" stroke="white" strokeWidth="1.5" />
            <rect x="135" y="80" width="105" height="140" stroke="white" strokeWidth="1.5" />
          </>
        )}
        {sport === 'Futsal' && (
          <>
            <line x1="0" y1="150" x2="240" y2="150" stroke="white" strokeWidth="1.5" />
            <circle cx="120" cy="150" r="44" stroke="white" strokeWidth="1.5" />
          </>
        )}
        {sport === 'Bola' && (
          <>
            <line x1="0" y1="150" x2="240" y2="150" stroke="white" strokeWidth="1.5" />
            <circle cx="120" cy="150" r="48" stroke="white" strokeWidth="1.5" />
          </>
        )}
      </svg>

      <div className="relative z-10 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-300">
        <span>{sport}</span>
        <span className="truncate text-slate-400">{roleLabel}</span>
      </div>

      <div className="relative z-10">
        <p className="font-display text-2xl font-bold tracking-tight text-white">
          {getInitials(name)}
        </p>
        <p className="mt-0.5 text-xs text-slate-300 truncate">{name}</p>
      </div>
    </div>
  );
}
