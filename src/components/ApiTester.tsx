import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SPORTS, todayStr } from "@/lib/courts";

type EndpointKey = "available" | "book" | "cancel";

const ENDPOINTS: Record<EndpointKey, { method: "GET" | "POST"; path: string; label: string }> = {
  available: { method: "GET", path: "/api/public/available", label: "1. ดูสนามที่ว่าง" },
  book: { method: "POST", path: "/api/public/book", label: "2. จองสนาม" },
  cancel: { method: "POST", path: "/api/public/cancel", label: "3. ยกเลิกการจอง" },
};

export function ApiTester() {
  const [key, setKey] = useState<EndpointKey>("available");
  const [sport, setSport] = useState("badminton");
  const [court, setCourt] = useState("01");
  const [hour, setHour] = useState(14);
  const [date, setDate] = useState(todayStr());
  const [nickname, setNickname] = useState("ทดสอบ");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [resp, setResp] = useState<string>("");

  const ep = ENDPOINTS[key];

  const run = async () => {
    setLoading(true);
    setResp("");
    setStatus(null);
    try {
      let url = ep.path;
      const init: RequestInit = { method: ep.method, headers: { "Content-Type": "application/json" } };
      if (ep.method === "GET") {
        const params = new URLSearchParams({ sport, hour: String(hour), date });
        url += "?" + params.toString();
      } else {
        init.body = JSON.stringify({ nickname, sport, court_no: court, hour, date });
      }
      const r = await fetch(url, init);
      setStatus(r.status);
      const text = await r.text();
      try {
        setResp(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResp(text);
      }
    } catch (e: any) {
      setResp(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const needsNickname = key !== "available";
  const needsCourt = key !== "available";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-xl font-bold">🧪 ทดสอบ API</h2>
        <p className="text-sm text-muted-foreground mt-1">
          เลือก endpoint แล้วกรอกค่าเพื่อยิงคำขอจริงไปยังเซิร์ฟเวอร์
        </p>
      </div>

      <div>
        <Label className="text-xs">Endpoint</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
          {(Object.keys(ENDPOINTS) as EndpointKey[]).map((k) => (
            <button
              key={k}
              onClick={() => { setKey(k); setStatus(null); setResp(""); }}
              className={`text-left rounded-lg border p-2 text-xs transition ${
                k === key ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className="font-semibold">{ENDPOINTS[k].label}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">
                {ENDPOINTS[k].method} {ENDPOINTS[k].path}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">sport</Label>
          <select
            className="w-full mt-1 h-9 rounded-md border bg-background px-2 text-sm"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          >
            {SPORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.id} ({s.label})</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">hour (9–20)</Label>
          <Input type="number" min={9} max={20} value={hour} onChange={(e) => setHour(Number(e.target.value))} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
        </div>
        {needsCourt && (
          <div>
            <Label className="text-xs">court_no</Label>
            <Input value={court} onChange={(e) => setCourt(e.target.value)} placeholder="01" className="mt-1" />
          </div>
        )}
        {needsNickname && (
          <div className="col-span-2">
            <Label className="text-xs">nickname</Label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-1" />
          </div>
        )}
      </div>

      <Button onClick={run} disabled={loading} className="w-full sm:w-auto">
        {loading ? "กำลังส่ง..." : `ส่งคำขอ ${ep.method}`}
      </Button>

      {(status !== null || resp) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">สถานะ:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded ${
                status && status < 300
                  ? "bg-success text-success-foreground"
                  : "bg-destructive text-destructive-foreground"
              }`}
            >
              {status ?? "—"}
            </span>
          </div>
          <pre className="bg-muted text-foreground rounded-xl p-4 overflow-x-auto text-xs leading-relaxed border max-h-96">
            <code>{resp || "(ไม่มีข้อมูลตอบกลับ)"}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
