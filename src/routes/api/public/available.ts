import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SPORTS = ["badminton", "futsal", "tennis", "pingpong"] as const;
const COUNT: Record<string, number> = { badminton: 4, futsal: 2, tennis: 2, pingpong: 4 };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/available")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sport = url.searchParams.get("sport");
        const hour = Number(url.searchParams.get("hour"));
        const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

        if (!sport || !SPORTS.includes(sport as any) || !hour || hour < 9 || hour > 20) {
          return Response.json(
            { error: "ต้องระบุ sport (badminton|futsal|tennis|pingpong) และ hour (9-20)" },
            { status: 400, headers: cors },
          );
        }

        const { data, error } = await supabaseAdmin
          .from("bookings")
          .select("court_no")
          .eq("sport", sport)
          .eq("booking_date", date)
          .eq("hour", hour);

        if (error) return Response.json({ error: error.message }, { status: 500, headers: cors });

        const taken = new Set((data ?? []).map((r) => r.court_no));
        const all = Array.from({ length: COUNT[sport] }, (_, i) => String(i + 1).padStart(2, "0"));
        const available = all.filter((c) => !taken.has(c));

        return Response.json(
          { sport, date, hour, available_courts: available, total: COUNT[sport] },
          { headers: cors },
        );
      },
    },
  },
});
