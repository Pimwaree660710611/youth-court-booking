import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const copy = () => {
    navigator.clipboard.writeText(code);
    toast.success("คัดลอกแล้ว");
  };
  return (
    <div className="relative group">
      <pre className="bg-muted text-foreground rounded-xl p-4 overflow-x-auto text-xs leading-relaxed border">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-xs px-2 py-1 rounded bg-background border"
      >
        คัดลอก
      </button>
      <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        {lang}
      </span>
    </div>
  );
}

function Method({ m }: { m: "GET" | "POST" }) {
  const cls =
    m === "GET"
      ? "bg-success text-success-foreground"
      : "bg-mine text-mine-foreground";
  return (
    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${cls}`}>
      {m}
    </span>
  );
}

function Endpoint({
  method,
  path,
  title,
  description,
  params,
  request,
  responseOk,
  responseErr,
  curl,
  base,
}: {
  method: "GET" | "POST";
  path: string;
  title: string;
  description: string;
  params: { name: string; type: string; required: boolean; desc: string }[];
  request?: string;
  responseOk: string;
  responseErr?: string;
  curl: string;
  base: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <Method m={method} />
          <code className="text-sm font-mono break-all">{base}{path}</code>
        </div>
        <h3 className="font-bold mt-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          พารามิเตอร์
        </h4>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold">ชื่อ</th>
                <th className="px-3 py-2 font-semibold">ชนิด</th>
                <th className="px-3 py-2 font-semibold">จำเป็น</th>
                <th className="px-3 py-2 font-semibold">คำอธิบาย</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr key={p.name} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{p.name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{p.type}</td>
                  <td className="px-3 py-2 text-xs">
                    {p.required ? (
                      <span className="text-destructive">ใช่</span>
                    ) : (
                      <span className="text-muted-foreground">ไม่</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {request && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            ตัวอย่าง Request Body
          </h4>
          <CodeBlock code={request} lang="json" />
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          ตัวอย่าง cURL
        </h4>
        <CodeBlock code={curl} lang="bash" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <h4 className="text-xs font-semibold text-success uppercase tracking-wider mb-2">
            ตอบกลับ (สำเร็จ)
          </h4>
          <CodeBlock code={responseOk} lang="json" />
        </div>
        {responseErr && (
          <div>
            <h4 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">
              ตอบกลับ (ไม่สำเร็จ)
            </h4>
            <CodeBlock code={responseErr} lang="json" />
          </div>
        )}
      </div>
    </div>
  );
}

const PRODUCTION_BASE = "https://youth-court-booking.lovable.app";

export function ApiDocs() {
  const [previewBase, setPreviewBase] = useState("");
  const [useProduction, setUseProduction] = useState(true);
  useEffect(() => {
    setPreviewBase(window.location.origin);
  }, []);

  const baseDisplay = useProduction ? PRODUCTION_BASE : (previewBase || PRODUCTION_BASE);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-bold">📡 API สำหรับเชื่อมต่อระบบภายนอก</h2>
        <p className="text-sm text-muted-foreground mt-1">
          ระบบเปิดให้เรียกผ่าน HTTP โดยไม่ต้องยืนยันตัวตน รองรับ CORS จากทุก origin
        </p>
        <div className="mt-3 text-sm">
          <span className="text-muted-foreground">Base URL: </span>
          <code className="font-mono bg-muted px-2 py-1 rounded">{baseDisplay}</code>
        </div>
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>
            • <code className="font-mono">sport</code> ที่รองรับ:{" "}
            <code>badminton</code>, <code>futsal</code>, <code>tennis</code>,{" "}
            <code>pingpong</code>
          </p>
          <p>
            • <code className="font-mono">hour</code> เป็นเลขชั่วโมง 9–20 (เช่น 14 = 14:00–15:00)
          </p>
          <p>
            • <code className="font-mono">court_no</code> เป็นเลขสนามรูปแบบ 2 หลัก เช่น{" "}
            <code>"01"</code>, <code>"02"</code>
          </p>
          <p>
            • <code className="font-mono">date</code> รูปแบบ YYYY-MM-DD (ไม่ส่ง = วันนี้)
          </p>
        </div>
      </div>

      <Endpoint
        base={baseDisplay}
        method="GET"
        path="/api/public/available"
        title="1. ดูสนามที่ว่าง"
        description="ตรวจสอบว่าสนามไหนยังว่างในประเภทกีฬาและเวลาที่ระบุ"
        params={[
          { name: "sport", type: "string", required: true, desc: "ประเภทกีฬา" },
          { name: "hour", type: "number", required: true, desc: "ชั่วโมง 9-20" },
          { name: "date", type: "string", required: false, desc: "วันที่ (default: วันนี้)" },
        ]}
        curl={`curl "${baseDisplay}/api/public/available?sport=badminton&hour=14"`}
        responseOk={`{
  "sport": "badminton",
  "date": "2026-05-06",
  "hour": 14,
  "available_courts": ["01", "03", "04"],
  "total": 4
}`}
        responseErr={`{
  "error": "ต้องระบุ sport และ hour (9-20)"
}`}
      />

      <Endpoint
        base={baseDisplay}
        method="POST"
        path="/api/public/book"
        title="2. จองสนาม"
        description="จองสนามที่ว่าง คืนค่าสำเร็จ หรือ 409 ถ้าสนามไม่ว่าง"
        params={[
          { name: "nickname", type: "string", required: true, desc: "ชื่อเล่นผู้จอง" },
          { name: "sport", type: "string", required: true, desc: "ประเภทกีฬา" },
          { name: "court_no", type: "string", required: true, desc: 'เลขสนาม เช่น "01"' },
          { name: "hour", type: "number", required: true, desc: "ชั่วโมง 9-20" },
          { name: "date", type: "string", required: false, desc: "วันที่ (default: วันนี้)" },
        ]}
        request={`{
  "nickname": "สมชาย",
  "sport": "badminton",
  "court_no": "01",
  "hour": 14
}`}
        curl={`curl -X POST "${baseDisplay}/api/public/book" \\
  -H "Content-Type: application/json" \\
  -d '{"nickname":"สมชาย","sport":"badminton","court_no":"01","hour":14}'`}
        responseOk={`{
  "success": true,
  "message": "จองสำเร็จ",
  "booking": {
    "id": "...",
    "sport": "badminton",
    "court_no": "01",
    "hour": 14,
    "nickname": "สมชาย"
  }
}`}
        responseErr={`{
  "success": false,
  "error": "สนามไม่ว่าง"
}`}
      />

      <Endpoint
        base={baseDisplay}
        method="POST"
        path="/api/public/cancel"
        title="3. ยกเลิกการจอง"
        description="ยกเลิกได้เฉพาะเมื่อชื่อเล่นและรายละเอียดตรงกับการจองในระบบ"
        params={[
          { name: "nickname", type: "string", required: true, desc: "ชื่อเล่นที่ใช้จอง" },
          { name: "sport", type: "string", required: true, desc: "ประเภทกีฬา" },
          { name: "court_no", type: "string", required: true, desc: "เลขสนาม" },
          { name: "hour", type: "number", required: true, desc: "ชั่วโมง" },
          { name: "date", type: "string", required: false, desc: "วันที่ (default: วันนี้)" },
        ]}
        request={`{
  "nickname": "สมชาย",
  "sport": "badminton",
  "court_no": "01",
  "hour": 14
}`}
        curl={`curl -X POST "${baseDisplay}/api/public/cancel" \\
  -H "Content-Type: application/json" \\
  -d '{"nickname":"สมชาย","sport":"badminton","court_no":"01","hour":14}'`}
        responseOk={`{
  "success": true,
  "message": "ยกเลิกสำเร็จ"
}`}
        responseErr={`{
  "success": false,
  "error": "ยกเลิกไม่ได้ — ข้อมูลไม่ตรงกัน หรือไม่มีการจอง"
}`}
      />
    </div>
  );
}
