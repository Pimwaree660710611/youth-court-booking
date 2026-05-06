import { SPORTS, type Sport } from "@/lib/courts";

export function SportSelector({ value, onChange }: { value: Sport; onChange: (s: Sport) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {SPORTS.map((s) => {
        const active = value === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`rounded-2xl p-4 text-left transition-all border-2 ${
              active
                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                : "bg-card border-border hover:border-primary/40"
            }`}
          >
            <div className="text-3xl">{s.emoji}</div>
            <div className="mt-1 font-semibold">{s.label}</div>
            <div className={`text-xs ${active ? "opacity-90" : "text-muted-foreground"}`}>
              {s.count} {s.unit}
            </div>
          </button>
        );
      })}
    </div>
  );
}
