export type Sport = "badminton" | "futsal" | "tennis" | "pingpong";

export const SPORTS: { id: Sport; label: string; emoji: string; count: number; unit: string }[] = [
  { id: "badminton", label: "แบดมินตัน", emoji: "🏸", count: 4, unit: "คอร์ท" },
  { id: "futsal", label: "ฟุตซอล", emoji: "⚽", count: 2, unit: "สนาม" },
  { id: "tennis", label: "เทนนิส", emoji: "🎾", count: 2, unit: "คอร์ท" },
  { id: "pingpong", label: "ปิงปอง", emoji: "🏓", count: 4, unit: "โต๊ะ" },
];

export const HOURS = Array.from({ length: 12 }, (_, i) => 9 + i); // 9..20 (slots end at 21)

export const courtNumbers = (count: number) =>
  Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, "0"));

export const getSport = (id: string) => SPORTS.find((s) => s.id === id);

export const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const NICK_KEY = "court_nickname";
