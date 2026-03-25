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
      message: "Konfigurasi Supabase untuk login konsumen belum lengkap.",
    });
  }

  const body = await req.json().catch(() => ({}));
  const identifierRaw = String(body?.identifier || "").trim();
  const password = String(body?.password || "").trim();
  if (!identifierRaw || !password) {
    return jsonResponse(400, { ok: false, message: "Nomor telepon atau password salah." });
  }

  const identifierIsEmail = identifierRaw.includes("@");
  const normalizedPhone = identifierIsEmail ? "" : normalizePhone(identifierRaw);
  const normalizedEmail = identifierIsEmail ? normalizeEmail(identifierRaw) : "";

  let authEmail = "";
  try {
    let query = supabaseAdmin
      .from("profiles")
      .select("id, role, auth_email, email, phone")
      .eq("role", "konsumen")
      .limit(2);

    if (identifierIsEmail) {
      query = query.or(`auth_email.eq.${normalizedEmail},email.eq.${normalizedEmail}`);
    } else {
      query = query.eq("phone", normalizedPhone);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!Array.isArray(data) || data.length !== 1) {
      return jsonResponse(401, { ok: false, message: "Nomor telepon atau password salah." });
    }

    authEmail = normalizeEmail(data[0]?.auth_email || data[0]?.email);
    if (!authEmail) {
      return jsonResponse(401, { ok: false, message: "Nomor telepon atau password salah." });
    }
  } catch (error) {
    console.error("Gagal mencari auth email konsumen:", error);
    return jsonResponse(500, {
      ok: false,
      message: "Login konsumen sementara tidak dapat diproses.",
    });
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error || !data.session) {
    return jsonResponse(401, { ok: false, message: "Nomor telepon atau password salah." });
  }

  return jsonResponse(200, {
    ok: true,
    session: data.session,
    user: data.user,
  });
});
