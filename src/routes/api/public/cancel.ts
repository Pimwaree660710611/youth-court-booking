import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SPORTS = ["badminton", "futsal", "tennis", "pingpong"];
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const cleanPhone = (p: unknown) => String(p ?? "").replace(/[-\s]/g, "");

export const Route = createFileRoute("/api/public/cancel")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({})) as any;
        const { nickname, sport, court_no, hour, date, phone_number } = body;
        const bookingDate = date ?? new Date().toISOString().slice(0, 10);
        const phone = cleanPhone(phone_number);

        if (!nickname || !sport || !SPORTS.includes(sport) || !court_no || !hour || !phone) {
          return Response.json(
            { success: false, error: "ต้องระบุ nickname, phone_number, sport, court_no, hour" },
            { status: 400, headers: cors },
          );
        }

        const { data, error } = await supabaseAdmin
          .from("bookings")
          .delete()
          .eq("sport", sport)
          .eq("court_no", String(court_no))
          .eq("hour", Number(hour))
          .eq("booking_date", bookingDate)
          .eq("nickname", String(nickname).trim())
          .eq("phone_number", phone)
          .select();

        if (error) return Response.json({ success: false, error: error.message }, { status: 500, headers: cors });

        if (!data || data.length === 0) {
          return Response.json(
            { success: false, error: "ยกเลิกไม่ได้ — ชื่อเล่นหรือเบอร์โทรศัพท์ไม่ตรงกับการจอง" },
            { status: 404, headers: cors },
          );
        }

        return Response.json({ success: true, message: "ยกเลิกสำเร็จ" }, { headers: cors });
      },
    },
  },
});
