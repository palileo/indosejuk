import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const CONSUMER_AUTH_EMAIL_DOMAIN = (Deno.env.get("CONSUMER_AUTH_EMAIL_DOMAIN") || "consumer-login.indosejuk.local")
  .trim()
  .toLowerCase();

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: corsHeaders,
  });
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

  if (!supabaseAdmin) {
    return jsonResponse(500, {
      ok: false,
      message: "Konfigurasi Supabase service role belum lengkap.",
    });
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body?.username || "").trim();
  const name = String(body?.name || "").trim();
  const password = String(body?.password || "").trim();
  const phone = normalizePhone(body?.phone);

  if (!username || !name || !password || !phone) {
    return jsonResponse(400, { ok: false, message: "Data konsumen wajib belum lengkap." });
  }

  const syntheticEmail = `${phone}@${CONSUMER_AUTH_EMAIL_DOMAIN}`;

  try {
    const [usernameCheck, phoneCheck] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("username", username),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "konsumen")
        .eq("phone", phone),
    ]);

    if (usernameCheck.error) throw usernameCheck.error;
    if (phoneCheck.error) throw phoneCheck.error;

    if ((usernameCheck.count || 0) > 0) {
      return jsonResponse(409, { ok: false, message: "Username konsumen sudah digunakan." });
    }
    if ((phoneCheck.count || 0) > 0) {
      return jsonResponse(409, { ok: false, message: "Nomor telepon konsumen sudah digunakan." });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
      user_metadata: {
        role: "konsumen",
        username,
        name,
        phone,
        address: String(body?.address || "").trim(),
        age: body?.age ?? null,
        birth_date: String(body?.birth_date || "").trim(),
        district: String(body?.district || "").trim(),
        location_text: String(body?.location_text || "").trim(),
        lat: String(body?.lat || "").trim(),
        lng: String(body?.lng || "").trim(),
        status: String(body?.status || "Aktif").trim(),
        contact_email: "",
        auth_email: syntheticEmail,
      },
    });

    if (error) {
      return jsonResponse(400, {
        ok: false,
        message: error.message || "Pendaftaran konsumen tanpa email gagal.",
      });
    }

    return jsonResponse(200, {
      ok: true,
      message: "Akun konsumen berhasil dibuat tanpa email publik.",
      user: data.user
        ? {
            id: data.user.id,
            auth_email: syntheticEmail,
          }
        : null,
    });
  } catch (error) {
    console.error("Gagal membuat akun konsumen tanpa email:", error);
    return jsonResponse(500, {
      ok: false,
      message: "Pendaftaran konsumen tanpa email belum dapat diproses.",
    });
  }
});
