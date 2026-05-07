import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SPORTS, type Sport, todayStr, NICK_KEY, PHONE_KEY, getSport } from "@/lib/courts";
import { SportSelector } from "@/components/SportSelector";
import { CourtGrid } from "@/components/CourtGrid";
import { NicknameDialog } from "@/components/NicknameDialog";
import { useBookings, type Booking } from "@/hooks/useBookings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApiDocs } from "@/components/ApiDocs";
import { ApiTester } from "@/components/ApiTester";

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
  const [date, setDate] = useState("");
  const [nick, setNick] = useState("");
  const [phone, setPhone] = useState("");
  const bookings = useBookings(sport, date);

  useEffect(() => {
    setDate(todayStr());
  }, []);

  const [pending, setPending] = useState<{ court: string; hour: number } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [askDialog, setAskDialog] = useState<"profile" | "book" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const n = localStorage.getItem(NICK_KEY);
    const p = localStorage.getItem(PHONE_KEY);
    if (n) setNick(n);
    if (p) setPhone(p);
  }, []);

  const meta = getSport(sport)!;

  const book = async (nickname: string, phoneNumber: string, court: string, hour: number) => {
    const { error } = await supabase.from("bookings").insert({
      sport, court_no: court, booking_date: date, hour, nickname, phone_number: phoneNumber,
    });
    if (error) {
      if (error.code === "23505") toast.error("สนามไม่ว่าง — มีคนจองไปแล้ว");
      else toast.error(error.message);
      return;
    }
    localStorage.setItem(NICK_KEY, nickname);
    localStorage.setItem(PHONE_KEY, phoneNumber);
    setNick(nickname);
    setPhone(phoneNumber);
    toast.success(`จองสำเร็จ! ${meta.label} ${meta.unit} ${court} เวลา ${String(hour).padStart(2,"0")}:00`);
  };

  const onSlotClick = (court: string, hour: number, b?: Booking) => {
    if (b) {
      if (b.nickname === nick) setCancelTarget(b);
      else toast.info(`สนามนี้ถูกจองโดย ${b.nickname}`);
      return;
    }
    setPending({ court, hour });
    setAskDialog("book");
  };

  const confirmBooking = async (nickname: string, phoneNumber: string) => {
    if (!pending) return;
    await book(nickname, phoneNumber, pending.court, pending.hour);
    setPending(null);
    setAskDialog(null);
  };

  const confirmCancel = async (_nick: string, phoneNumber: string) => {
    if (!cancelTarget) return;
    if (cancelTarget.phone_number && cancelTarget.phone_number !== phoneNumber) {
      toast.error("เบอร์โทรศัพท์ไม่ตรงกับที่ใช้ตอนจอง");
      return;
    }
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", cancelTarget.id)
      .eq("nickname", nick)
      .eq("phone_number", phoneNumber);
    if (error) toast.error(error.message);
    else {
      toast.success("ยกเลิกการจองแล้ว");
      setCancelTarget(null);
    }
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
                <Button size="sm" variant="ghost" onClick={() => {
                  localStorage.removeItem(NICK_KEY);
                  localStorage.removeItem(PHONE_KEY);
                  setNick(""); setPhone("");
                }}>
                  เปลี่ยน
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setAskDialog("profile")}>ตั้งชื่อเล่น</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="booking">🏟️ จองสนาม</TabsTrigger>
            <TabsTrigger value="api">📡 API Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="space-y-6 mt-6">
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
          </TabsContent>

          <TabsContent value="api" className="mt-6 space-y-6">
            <ApiTester />
            <ApiDocs />
          </TabsContent>
        </Tabs>
      </main>

      <NicknameDialog
        open={askDialog !== null}
        title={askDialog === "book" ? "กรอกข้อมูลเพื่อจอง" : "ตั้งชื่อเล่นและเบอร์โทรศัพท์"}
        description={
          askDialog === "book" && pending
            ? `${meta.label} ${meta.unit} ${pending.court} เวลา ${String(pending.hour).padStart(2,"0")}:00 - ${String(pending.hour+1).padStart(2,"0")}:00`
            : "ใช้สำหรับยืนยันตัวตนเมื่อต้องการยกเลิกการจอง"
        }
        defaultNick={nick}
        defaultPhone={phone}
        confirmText={askDialog === "book" ? "จองเลย" : "บันทึก"}
        onConfirm={(n, p) => {
          if (askDialog === "book") confirmBooking(n, p);
          else {
            localStorage.setItem(NICK_KEY, n);
            localStorage.setItem(PHONE_KEY, p);
            setNick(n); setPhone(p); setAskDialog(null);
          }
        }}
        onCancel={() => { setAskDialog(null); setPending(null); }}
      />

      <NicknameDialog
        open={!!cancelTarget}
        title="ยืนยันยกเลิกการจอง"
        description={cancelTarget ? `${getSport(cancelTarget.sport)?.label} ${getSport(cancelTarget.sport)?.unit} ${cancelTarget.court_no} เวลา ${String(cancelTarget.hour).padStart(2,"0")}:00 — กรอกเบอร์โทรศัพท์ที่ใช้ตอนจองเพื่อยืนยัน` : ""}
        defaultNick={nick}
        defaultPhone=""
        confirmText="ยืนยันยกเลิก"
        onConfirm={(n, p) => confirmCancel(n, p)}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
