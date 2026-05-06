import { courtNumbers, HOURS, type Sport, getSport } from "@/lib/courts";
import type { Booking } from "@/hooks/useBookings";

export function CourtGrid({
  sport,
  bookings,
  myNick,
  onSlotClick,
}: {
  sport: Sport;
  bookings: Booking[];
  myNick: string;
  onSlotClick: (court: string, hour: number, booking?: Booking) => void;
}) {
  const meta = getSport(sport)!;
  const courts = courtNumbers(meta.count);

  const lookup = new Map<string, Booking>();
  bookings.forEach((b) => lookup.set(`${b.court_no}-${b.hour}`, b));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <Legend color="bg-success" label="ว่าง" />
        <Legend color="bg-busy" label="ไม่ว่าง" />
        <Legend color="bg-mine" label="ของฉัน" />
      </div>

      {courts.map((c) => (
        <div key={c} className="rounded-2xl bg-card border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">
              {meta.emoji} {meta.label} — {meta.unit} {c}
            </h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {HOURS.map((h) => {
              const b = lookup.get(`${c}-${h}`);
              const mine = b && myNick && b.nickname === myNick;
              const cls = !b
                ? "bg-success text-success-foreground hover:brightness-95"
                : mine
                  ? "bg-mine text-mine-foreground hover:brightness-110"
                  : "bg-busy text-busy-foreground cursor-not-allowed";
              return (
                <button
                  key={h}
                  disabled={!!b && !mine}
                  onClick={() => onSlotClick(c, h, b)}
                  className={`rounded-xl p-2 text-sm font-medium transition-all ${cls} flex flex-col items-center`}
                >
                  <span className="font-bold">
                    {String(h).padStart(2, "0")}:00
                  </span>
                  <span className="text-[11px] opacity-90 truncate max-w-full">
                    {b ? b.nickname : "ว่าง"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-4 h-4 rounded ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
