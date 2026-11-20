import { Calendar, MapPin, Receipt, X } from 'lucide-react';
import { BookingRecord } from '../types';
import { formatRupiah } from '../utils/format';

interface BookingsDrawerProps {
  isOpen: boolean;
  bookings: BookingRecord[];
  onClose: () => void;
}

export function BookingsDrawer({ isOpen, bookings, onClose }: BookingsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookings-drawer-title"
    >
      <div className="flex h-full w-full max-w-md flex-col bg-white border-l border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-medium text-red-600">Aktivitas Sewa</p>
            <h2 id="bookings-drawer-title" className="font-display text-lg font-bold text-slate-900">
              Riwayat Pemesanan ({bookings.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup riwayat pemesanan"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Receipt className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-900">Belum Ada Riwayat Sewa</p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Pilih pemain per jam atau coach harian/mingguan/bulanan untuk melihat rincian biaya dan status pesanan di sini.
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-red-600 font-medium">
                      {b.role === 'player' ? 'Sewa Pemain' : 'Sewa Coach'} · {b.sport}
                    </p>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      {b.targetName}
                    </h3>
                    <p className="text-xs text-slate-500">{b.positionOrCert}</p>
                  </div>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">#{b.id}</span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{b.scheduleDate} · {b.durationLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{b.venueName}</span>
                  </div>
                  {b.courtPaidByRenter && (
                    <p className="text-emerald-700 font-medium pt-0.5">
                      Pemain bebas biaya lapangan
                    </p>
                  )}
                </div>

                <div className="rounded-lg bg-slate-50 p-3 space-y-1 text-xs tabular-nums">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatRupiah(b.baseAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Fee ({Math.round(b.platformFeeRate * 100)}%)</span>
                    <span className="font-mono">{formatRupiah(b.platformFeeAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-semibold text-slate-900">
                    <span>Total</span>
                    <span className="font-mono">{formatRupiah(b.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
