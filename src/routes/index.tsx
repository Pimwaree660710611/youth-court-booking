import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SPORTS, type Sport, todayStr, NICK_KEY, getSport } from "@/lib/courts";
import { SportSelector } from "@/components/SportSelector";
import { CourtGrid } from "@/components/CourtGrid";
import { NicknameDialog } from "@/components/NicknameDialog";
import { useBookings, type Booking } from "@/hooks/useBookings";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "จองสนามกีฬา — ศูนย์เยาวชนกรุงเทพมหานคร" },
      { name: "description", content: "ระบบจองสนามกีฬาเอนกประสงค์ แบบ Real-time" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [sport, setSport] = useState<Sport>("badminton");
  const [date] = useState(todayStr());
  const [nick, setNick] = useState("");
  const bookings = useBookings(sport, date);

  const [pending, setPending] = useState<{ court: string; hour: number } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [askNick, setAskNick] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(NICK_KEY) : null;
    if (saved) setNick(saved);
  }, []);

  const meta = getSport(sport)!;

  const book = async (nickname: string, court: string, hour: number) => {
    const { error } = await supabase.from("bookings").insert({
      sport, court_no: court, booking_date: date, hour, nickname,
    });
    if (error) {
      if (error.code === "23505") toast.error("สนามไม่ว่าง — มีคนจองไปแล้ว");
      else toast.error(error.message);
      return;
    }
    localStorage.setItem(NICK_KEY, nickname);
    setNick(nickname);
    toast.success(`จองสำเร็จ! ${meta.label} ${meta.unit} ${court} เวลา ${String(hour).padStart(2,"0")}:00`);
  };

  const onSlotClick = (court: string, hour: number, b?: Booking) => {
    if (b) {
      if (b.nickname === nick) setCancelTarget(b);
      else toast.info(`สนามนี้ถูกจองโดย ${b.nickname}`);
      return;
    }
    setPending({ court, hour });
    if (!nick) setAskNick(true);
  };

  const confirmBooking = async (nickname: string) => {
    if (!pending) return;
    await book(nickname, pending.court, pending.hour);
    setPending(null);
    setAskNick(false);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", cancelTarget.id)
      .eq("nickname", nick);
    if (error) toast.error(error.message);
    else toast.success("ยกเลิกการจองแล้ว");
    setCancelTarget(null);
  };

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-center" />
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              🏟️ จองสนามกีฬา
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              ศูนย์เยาวชนกรุงเทพมหานคร • วันที่ {date}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {nick ? (
              <>
                <span className="text-muted-foreground">ชื่อเล่น:</span>
                <span className="font-semibold px-3 py-1 rounded-full bg-mine text-mine-foreground">
                  {nick}
                </span>
                <Button size="sm" variant="ghost" onClick={() => { localStorage.removeItem(NICK_KEY); setNick(""); }}>
                  เปลี่ยน
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setAskNick(true)}>ตั้งชื่อเล่น</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">เลือกประเภทกีฬา</h2>
          <SportSelector value={sport} onChange={setSport} />
        </section>

        <section>
          <CourtGrid
            sport={sport}
            bookings={bookings}
            myNick={nick}
            onSlotClick={onSlotClick}
          />
        </section>

        <footer className="text-center text-xs text-muted-foreground pt-4 pb-8">
          เปิดบริการ 09:00 – 21:00 • ไม่เช็คอินภายใน 15 นาทีหลังเริ่ม ระบบจะปลดสนามอัตโนมัติ
        </footer>
      </main>

      <NicknameDialog
        open={askNick}
        title={pending ? "กรอกชื่อเล่นเพื่อจอง" : "ตั้งชื่อเล่นของคุณ"}
        description={pending ? `${meta.label} ${meta.unit} ${pending.court} เวลา ${String(pending.hour).padStart(2,"0")}:00 - ${String(pending.hour+1).padStart(2,"0")}:00` : undefined}
        defaultNick={nick}
        confirmText={pending ? "จองเลย" : "บันทึก"}
        onConfirm={(n) => {
          if (pending) confirmBooking(n);
          else { localStorage.setItem(NICK_KEY, n); setNick(n); setAskNick(false); }
        }}
        onCancel={() => { setAskNick(false); setPending(null); }}
      />

      <NicknameDialog
        open={!!cancelTarget}
        title="ยืนยันยกเลิกการจอง?"
        description={cancelTarget ? `${getSport(cancelTarget.sport)?.label} ${getSport(cancelTarget.sport)?.unit} ${cancelTarget.court_no} เวลา ${String(cancelTarget.hour).padStart(2,"0")}:00` : ""}
        defaultNick={nick}
        confirmText="ยืนยันยกเลิก"
        onConfirm={() => confirmCancel()}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
