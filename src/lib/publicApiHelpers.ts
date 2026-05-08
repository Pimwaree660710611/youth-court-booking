export const SPORTS = ["badminton", "futsal", "tennis", "pingpong"] as const;
export type PublicSport = (typeof SPORTS)[number];

export const COURT_COUNT: Record<PublicSport, number> = {
  badminton: 4,
  futsal: 2,
  tennis: 2,
  pingpong: 4,
};

const SPORT_ALIASES: Record<PublicSport, string[]> = {
  badminton: ["badminton", "แบดมินตัน", "แบด"],
  futsal: ["futsal", "ฟุตซอล", "ฟุตบอล", "บอล"],
  tennis: ["tennis", "เทนนิส"],
  pingpong: ["pingpong", "ping-pong", "tabletennis", "table tennis", "ปิงปอง", "เทเบิลเทนนิส"],
};

export type ApiParams = Record<string, unknown>;

export const cleanPhone = (phone: unknown) => String(phone ?? "").replace(/[-\s]/g, "");
export const phoneOk = (phone: string) => /^[0-9]{9,15}$/.test(phone);
export const todayIsoDate = () => new Date().toISOString().slice(0, 10);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
  "Access-Control-Max-Age": "86400",
};

export async function readApiParams(request: Request): Promise<ApiParams> {
  const url = new URL(request.url);
  const params: ApiParams = Object.fromEntries(url.searchParams.entries());

  if (request.method === "GET") return params;

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  try {
    if (contentType.includes("application/json")) {
      return { ...params, ...((await request.json()) as ApiParams) };
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return { ...params, ...Object.fromEntries((await request.formData()).entries()) };
    }
    if (contentType.includes("multipart/form-data")) {
      return { ...params, ...Object.fromEntries((await request.formData()).entries()) };
    }

    const text = await request.text();
    if (!text.trim()) return params;
    try {
      return { ...params, ...(JSON.parse(text) as ApiParams) };
    } catch {
      return { ...params, ...Object.fromEntries(new URLSearchParams(text).entries()) };
    }
  } catch {
    return params;
  }
}

export function pick(params: ApiParams, names: string[]) {
  for (const name of names) {
    const value = params[name];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return undefined;
}

export function normalizeSport(value: unknown): PublicSport | null {
  const raw = String(value ?? "").trim().toLowerCase().replace(/[\s_]+/g, "");
  for (const sport of SPORTS) {
    if (SPORT_ALIASES[sport].some((alias) => alias.toLowerCase().replace(/[\s_]+/g, "") === raw)) {
      return sport;
    }
  }
  return null;
}

export function normalizeHour(value: unknown): number | null {
  const match = String(value ?? "").match(/\d{1,2}/);
  if (!match) return null;
  const hour = Number(match[0]);
  return Number.isInteger(hour) && hour >= 9 && hour <= 20 ? hour : null;
}

export function normalizeCourtNo(value: unknown) {
  const raw = String(value ?? "").trim();
  const num = Number(raw);
  if (Number.isInteger(num) && num > 0) return String(num).padStart(2, "0");
  return raw;
}

export function normalizeDate(value: unknown) {
  const raw = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : todayIsoDate();
}
