import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  cleanPhone,
  corsHeaders,
  normalizeCourtNo,
  normalizeDate,
  normalizeHour,
  normalizeSport,
  phoneOk,
  pick,
  readApiParams,
} from "@/lib/publicApiHelpers";

export const Route = createFileRoute("/api/public/book")({
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

        if (!nickname || !sport || !courtNo || hour === null) {
          return Response.json(
            { success: false, error: "ต้องระบุ nickname, sport, court_no และ hour/time (9-20)" },
            { status: 400, headers: corsHeaders },
          );
        }
        if (!phoneOk(phone)) {
          return Response.json(
            { success: false, error: "ต้องระบุ phone_number ที่ถูกต้อง (ตัวเลข 9-15 หลัก)" },
            { status: 400, headers: corsHeaders },
          );
        }

        const { data, error } = await supabaseAdmin
          .from("bookings")
          .insert({
            nickname: String(nickname).trim().slice(0, 40),
            sport,
            court_no: courtNo,
            booking_date: bookingDate,
            hour,
            phone_number: phone,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            return Response.json({ success: false, error: "สนามไม่ว่าง" }, { status: 409, headers: corsHeaders });
          }
          return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
        }

        return Response.json({ success: true, message: "จองสำเร็จ", booking: data }, { headers: corsHeaders });
      },
    },
  },
});
