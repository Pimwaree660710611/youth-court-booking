import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  COURT_COUNT,
  corsHeaders,
  normalizeDate,
  normalizeHour,
  normalizeSport,
  pick,
  readApiParams,
} from "@/lib/publicApiHelpers";

export const Route = createFileRoute("/api/public/available")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: async ({ request }) => {
        const params = await readApiParams(request);
        const sport = normalizeSport(pick(params, ["sport", "sport_type", "type", "กีฬา", "ประเภทกีฬา"]));
        const hour = normalizeHour(pick(params, ["hour", "time", "slot", "เวลา", "ชั่วโมง"]));
        const date = normalizeDate(pick(params, ["date", "booking_date", "วันที่"]));

        if (!sport || hour === null) {
          return Response.json(
            { error: "ต้องระบุ sport (badminton|futsal|tennis|pingpong) และ hour/time (9-20)" },
            { status: 400, headers: corsHeaders },
          );
        }

        const { data, error } = await supabaseAdmin
          .from("bookings")
          .select("court_no")
          .eq("sport", sport)
          .eq("booking_date", date)
          .eq("hour", hour);

        if (error) return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });

        const taken = new Set((data ?? []).map((r) => r.court_no));
        const all = Array.from({ length: COURT_COUNT[sport] }, (_, i) => String(i + 1).padStart(2, "0"));
        const available = all.filter((c) => !taken.has(c));

        return Response.json(
          { success: true, sport, date, hour, available_courts: available, total: COURT_COUNT[sport] },
          { headers: corsHeaders },
        );
      },
    },
  },
});
