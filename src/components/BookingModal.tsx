import { CheckCircle2, Info, Minus, Plus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { COACH_FEE_RATE, PLAYER_FEE_RATE } from '../data/catalog';
import { BookingRecord, CoachBillingUnit, CoachProfile, PlayerProfile } from '../types';
import { formatDistance, formatRupiah } from '../utils/format';

type BookingTarget =
  | { role: 'player'; profile: PlayerProfile; distanceKm: number }
  | { role: 'coach'; profile: CoachProfile; distanceKm: number; initialUnit: CoachBillingUnit };

interface BookingModalProps {
  target: BookingTarget | null;
  onClose: () => void;
  onConfirmBooking: (booking: BookingRecord) => void;
}

const UNIT_NAME: Record<CoachBillingUnit, string> = {
  daily: 'Hari',
  weekly: 'Minggu',
  monthly: 'Bulan',
};

export function BookingModal({ target, onClose, onConfirmBooking }: BookingModalProps) {
  const [hours, setHours] = useState(2);
  const [coachUnit, setCoachUnit] = useState<CoachBillingUnit>(
    target?.role === 'coach' ? target.initialUnit : 'weekly'
  );
  const [coachQty, setCoachQty] = useState(1);
  const [venueName, setVenueName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('2026-11-20');
  const [confirmedReceipt, setConfirmedReceipt] = useState<BookingRecord | null>(null);

  if (!target) return null;

  const isPlayer = target.role === 'player';
  const feeRate = isPlayer ? PLAYER_FEE_RATE : COACH_FEE_RATE;

  const baseAmount = isPlayer
    ? target.profile.hourlyRate * hours
    : target.profile.rates[coachUnit] * coachQty;

  const platformFeeAmount = Math.round(baseAmount * feeRate);
  const totalAmount = baseAmount + platformFeeAmount;

  const durationLabel = isPlayer
    ? `${hours} Jam`
    : `${coachQty} ${UNIT_NAME[coachUnit]}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const record: BookingRecord = {
      id: `GLR-${Math.floor(100000 + Math.random() * 900000)}`,
      role: target.role,
      targetId: target.profile.id,
      targetName: target.profile.name,
      sport: target.profile.sport,
      positionOrCert: isPlayer ? target.profile.position : target.profile.certification,
      durationLabel,
      baseAmount,
      platformFeeRate: feeRate,
      platformFeeAmount,
      totalAmount,
      venueName: venueName.trim() || 'Lapangan Utama (Konfirmasi via Chat)',
      scheduleDate,
      courtPaidByRenter: isPlayer,
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
    onConfirmBooking(record);
    setConfirmedReceipt(record);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-medium text-red-600">
              {isPlayer ? 'Sewa Pemain Per Jam' : 'Sewa Coach Profesional'}
            </p>
            <h2 id="booking-modal-title" className="font-display text-lg font-bold text-slate-900">
              {confirmedReceipt ? 'Pemesanan Terkonfirmasi' : target.profile.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal pemesanan"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {confirmedReceipt ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-950">
                <p className="font-semibold">
                  Booking #{confirmedReceipt.id} Berhasil Dibuat
                </p>
                <p className="mt-1 text-emerald-800">
                  {confirmedReceipt.targetName} telah dijadwalkan untuk {confirmedReceipt.durationLabel} pada {confirmedReceipt.scheduleDate}.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-sm border-t border-b border-slate-100 py-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Cabang &amp; Peran</span>
                <span className="font-medium text-slate-900">
                  {confirmedReceipt.sport} · {confirmedReceipt.positionOrCert}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi Latihan / Main</span>
                <span className="font-medium text-slate-900">{confirmedReceipt.venueName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durasi Sewa</span>
                <span className="font-medium text-slate-900 tabular-nums">
                  {confirmedReceipt.durationLabel}
                </span>
              </div>
              {confirmedReceipt.courtPaidByRenter && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Biaya Lapangan Pemain</span>
                  <span className="font-medium text-emerald-700">Ditanggung Penyewa (Rp 0 untuk pemain)</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm tabular-nums">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Jasa</span>
                <span className="font-mono">{formatRupiah(confirmedReceipt.baseAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Fee ({Math.round(confirmedReceipt.platformFeeRate * 100)}%)</span>
                <span className="font-mono">{formatRupiah(confirmedReceipt.platformFeeAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-bold text-slate-900">
                <span>Total Dibayar</span>
                <span className="font-mono">{formatRupiah(confirmedReceipt.totalAmount)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Profile summary */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">
                  {target.profile.sport} · {isPlayer ? target.profile.position : target.profile.certification}
                </span>
                <span className="font-mono tabular-nums text-slate-700">
                  {formatDistance(target.distanceKm)}
                </span>
              </div>
              <p>{target.profile.locationName} · {target.profile.gender} · {target.profile.experienceYears} thn pengalaman</p>
              {isPlayer ? (
                <div className="space-y-1.5 text-slate-700">
                  <p>
                    Fisik: {target.profile.physical.heightCm} cm / {target.profile.physical.weightKg} kg — {target.profile.physical.staminaNotes}
                  </p>
                  <div>
                    <span className="font-medium text-slate-900">Keahlian:</span>
                    <ul className="mt-1 space-y-0.5 pl-4 list-disc text-slate-700">
                      {target.profile.skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700">Spesialisasi: {target.profile.specialty}</p>
              )}
            </div>

            {/* Duration / Plan selector */}
            {isPlayer ? (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Durasi Sewa Pemain (Per Jam)
                </label>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5">
                  <span className="text-sm text-slate-600">
                    Tarif: <span className="font-mono font-semibold text-slate-900">{formatRupiah(target.profile.hourlyRate)}</span> / jam
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHours((h) => Math.max(1, h - 1))}
                      aria-label="Kurangi jam"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-mono text-sm font-bold tabular-nums text-slate-900">
                      {hours} jam
                    </span>
                    <button
                      type="button"
                      onClick={() => setHours((h) => Math.min(8, h + 1))}
                      aria-label="Tambah jam"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-900">
                  Pilih Paket Sewa Coach
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'monthly'] as CoachBillingUnit[]).map((unit) => {
                    const active = coachUnit === unit;
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setCoachUnit(unit)}
                        className={`rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-red-600 bg-red-50 text-red-950'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-semibold">
                          {unit === 'daily' ? 'Harian' : unit === 'weekly' ? 'Mingguan' : 'Bulanan'}
                        </div>
                        <div className="mt-0.5 font-mono text-xs font-semibold tabular-nums">
                          {formatRupiah(target.profile.rates[unit])}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5">
                  <span className="text-sm text-slate-600">Jumlah {UNIT_NAME[coachUnit]}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCoachQty((q) => Math.max(1, q - 1))}
                      aria-label="Kurangi durasi"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-16 text-center font-mono text-sm font-bold tabular-nums text-slate-900">
                      {coachQty} {UNIT_NAME[coachUnit].toLowerCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCoachQty((q) => Math.min(6, q + 1))}
                      aria-label="Tambah durasi"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="schedule-date" className="block text-xs font-medium text-slate-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  id="schedule-date"
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="venue-name" className="block text-xs font-medium text-slate-700 mb-1">
                  Nama GOR / Lapangan
                </label>
                <input
                  id="venue-name"
                  type="text"
                  required
                  placeholder="cth. GOR Senayan / Lapangan ABC"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Court fee exemption notice for player */}
            {isPlayer && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
                <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Aturan Sewa Pemain:</span> Pemain yang disewa tidak harus membayar biaya sewa lapangan. Seluruh biaya lapangan ditanggung oleh tim penyewa.
                </div>
              </div>
            )}

            {/* Cost breakdown */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm tabular-nums">
              <div className="flex justify-between text-slate-600">
                <span>
                  Biaya Sewa ({durationLabel})
                </span>
                <span className="font-mono font-medium text-slate-900">
                  {formatRupiah(baseAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Fee Golahraga ({isPlayer ? '5%' : '10%'})</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatRupiah(platformFeeAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-bold text-slate-900">
                <span>Total Pembayaran</span>
                <span className="font-mono text-red-600">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
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
                Konfirmasi Sewa
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
