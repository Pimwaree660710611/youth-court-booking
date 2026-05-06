import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SPORTS = ["badminton", "futsal", "tennis", "pingpong"];
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/book")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({})) as any;
        const { nickname, sport, court_no, hour, date } = body;
        const bookingDate = date ?? new Date().toISOString().slice(0, 10);

        if (!nickname || !sport || !SPORTS.includes(sport) || !court_no || !hour || hour < 9 || hour > 20) {
          return Response.json(
            { success: false, error: "ต้องระบุ nickname, sport, court_no, hour (9-20)" },
            { status: 400, headers: cors },
          );
        }

        const { data, error } = await supabaseAdmin
          .from("bookings")
          .insert({ nickname: String(nickname).trim().slice(0, 40), sport, court_no: String(court_no), booking_date: bookingDate, hour: Number(hour) })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            return Response.json({ success: false, error: "สนามไม่ว่าง" }, { status: 409, headers: cors });
          }
          return Response.json({ success: false, error: error.message }, { status: 500, headers: cors });
        }

        return Response.json({ success: true, message: "จองสำเร็จ", booking: data }, { headers: cors });
      },
    },
  },
});
