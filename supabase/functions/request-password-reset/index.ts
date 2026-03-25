import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

const supabaseAuth = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

const genericMessage =
  "Jika akun ditemukan dan memiliki kanal pemulihan yang aktif, tautan reset sudah dikirim. Untuk akun konsumen tanpa email, hubungi CS agar sandi direset manual.";

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: corsHeaders,
  });
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value: unknown) {
  let digits = String(value || "").trim().replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) {
    digits = `0${digits.slice(2)}`;
  } else if (digits.startsWith("8")) {
    digits = `0${digits}`;
  }
  return digits;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, message: "Method not allowed." });
  }

  if (!supabaseAdmin || !supabaseAuth) {
    return jsonResponse(500, {
      ok: false,
      message: "Konfigurasi Supabase untuk reset password belum lengkap.",
    });
  }

  const body = await req.json().catch(() => ({}));
  const role = String(body?.role || "konsumen").trim().toLowerCase();
  const identifierRaw = String(body?.identifier || "").trim();
  const redirectTo = String(body?.redirectTo || "").trim();
  if (!identifierRaw) {
    return jsonResponse(400, { ok: false, message: "Identifier reset password wajib diisi." });
  }

  let targetEmail = identifierRaw.includes("@") ? normalizeEmail(identifierRaw) : "";

  if (!targetEmail && role === "konsumen") {
    const phone = normalizePhone(identifierRaw);
    if (!phone) {
      return jsonResponse(200, { ok: true, message: genericMessage });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("auth_email")
      .eq("role", "konsumen")
      .eq("phone", phone)
      .limit(2);

    if (error) {
      console.error("Gagal mencari auth email untuk reset password konsumen:", error);
      return jsonResponse(500, { ok: false, message: "Reset password sementara tidak dapat diproses." });
    }

    if (!Array.isArray(data) || data.length !== 1) {
      return jsonResponse(200, { ok: true, message: genericMessage });
    }

    targetEmail = normalizeEmail(data[0]?.auth_email);
  }

  if (targetEmail) {
    const { error } = await supabaseAuth.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: redirectTo || undefined,
    });

    if (error) {
      console.error("Gagal memicu reset password email:", error);
      return jsonResponse(500, { ok: false, message: "Reset password email gagal dipicu." });
    }
  }

  return jsonResponse(200, {
    ok: true,
    message: genericMessage,
  });
});
