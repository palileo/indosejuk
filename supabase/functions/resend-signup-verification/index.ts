import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: corsHeaders,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, message: "Method not allowed." });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return jsonResponse(500, {
      ok: false,
      message: "SUPABASE_URL atau SUPABASE_ANON_KEY belum dikonfigurasi di Edge Function.",
    });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();
  const redirectTo = String(body?.redirectTo || "").trim();

  if (!email) {
    return jsonResponse(400, { ok: false, message: "Email wajib diisi." });
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/resend`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "signup",
      email,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return jsonResponse(response.status, {
      ok: false,
      message: result?.msg || result?.message || "Gagal mengirim ulang email verifikasi.",
      detail: result,
    });
  }

  return jsonResponse(200, {
    ok: true,
    message: "Email verifikasi signup berhasil dipicu ulang lewat endpoint resmi Supabase Auth.",
    result,
  });
});
