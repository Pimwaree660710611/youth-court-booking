import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  cleanPhone,
  corsHeaders,
  normalizeCourtNo,
  normalizeDate,
  normalizeHour,
  normalizeSport,
  pick,
  readApiParams,
} from "@/lib/publicApiHelpers";

export const Route = createFileRoute("/api/public/cancel")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const params = await readApiParams(request);
        const nickname = pick(params, ["nickname", "nick_name", "name", "ชื่อเล่น", "ชื่อ"]);
        const sport = normalizeSport(pick(params, ["sport", "sport_type", "type", "กีฬา", "ประเภทกีฬา"]));
        const courtNo = normalizeCourtNo(pick(params, ["court_no", "court", "field", "สนาม", "เลขสนาม"]));
        const hour = normalizeHour(pick(params, ["hour", "time", "slot", "เวลา", "ชั่วโมง"]));
        const bookingDate = normalizeDate(pick(params, ["date", "booking_date", "วันที่"]));
        const phone = cleanPhone(pick(params, ["phone_number", "phoneNumber", "phone", "tel", "เบอร์โทรศัพท์", "เบอร์"]));

        if (!nickname || !sport || !courtNo || hour === null || !phone) {
          return Response.json(
            { success: false, error: "ต้องระบุ nickname, phone_number, sport, court_no, hour" },
            { status: 400, headers: corsHeaders },
          );
        }

        const { data, error } = await supabaseAdmin
          .from("bookings")
          .delete()
          .eq("sport", sport)
          .eq("court_no", courtNo)
          .eq("hour", hour)
          .eq("booking_date", bookingDate)
          .eq("nickname", String(nickname).trim())
          .eq("phone_number", phone)
          .select();

        if (error) return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });

        if (!data || data.length === 0) {
          return Response.json(
            { success: false, error: "ยกเลิกไม่ได้ — ชื่อเล่นหรือเบอร์โทรศัพท์ไม่ตรงกับการจอง" },
            { status: 404, headers: corsHeaders },
          );
        }

        return Response.json({ success: true, message: "ยกเลิกสำเร็จ" }, { headers: corsHeaders });
      },
    },
  },
});
