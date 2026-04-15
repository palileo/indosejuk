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
const AUTH_EMAIL_DOMAIN = (Deno.env.get("AUTH_EMAIL_DOMAIN") || "auth.indosejuk.local").trim().toLowerCase();
const PROFILE_STATUS_PENDING = "Menunggu Verifikasi";

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

function normalizeAcUnits(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const record = item as Record<string, unknown>;
      return {
        key: String(record.key || record.id || "").trim(),
        brand: String(record.brand || "").trim(),
        type: String(record.type || record.ac_type || record.acType || "").trim(),
        refrigerant: String(record.refrigerant || "").trim(),
        capacity: String(record.capacity || record.pk || record.ac_capacity || record.acCapacity || "").trim(),
        created_at: String(record.created_at || record.createdAt || "").trim(),
      };
    })
    .filter((item) => Object.values(item).some(Boolean));
}

async function isUsernameTaken(username: string) {
  const { count, error } = await supabaseAdmin!
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .ilike("username", username);

  if (error) throw error;
  return (count || 0) > 0;
}

async function isPhoneTaken(role: string, phone: string) {
  const { count, error } = await supabaseAdmin!
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", role)
    .eq("phone", phone);

  if (error) throw error;
  return (count || 0) > 0;
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
  const role = String(body?.role || "").trim().toLowerCase();
  const username = String(body?.username || "").trim();
  const name = String(body?.name || "").trim();
  const password = String(body?.password || "").trim();
  const publicEmail = normalizeEmail(body?.email);
  const phone = normalizePhone(body?.phone);

  if (!["konsumen", "teknisi"].includes(role)) {
    return jsonResponse(400, { ok: false, message: "Role register tidak valid." });
  }
  if (!username || !name || !password || !phone) {
    return jsonResponse(400, { ok: false, message: "Data akun wajib belum lengkap." });
  }
  if (role === "teknisi") {
    const nik = String(body?.nik || "").trim();
    const birthDate = String(body?.birth_date || "").trim();
    const specialization = String(body?.specialization || "").trim();
    const address = String(body?.address || "").trim();
    if (!nik || !birthDate || !specialization || !address) {
      return jsonResponse(400, { ok: false, message: "Data teknisi wajib belum lengkap." });
    }
  }

  const authEmail = publicEmail || `${role}.${phone}@${AUTH_EMAIL_DOMAIN}`;
  const referral = String(body?.referral || body?.referal || "").trim();
  const acUnits = normalizeAcUnits(body?.ac_units);

  try {
    if (await isUsernameTaken(username)) {
      return jsonResponse(409, { ok: false, message: `Username ${role} sudah digunakan.` });
    }
    if (await isPhoneTaken(role, phone)) {
      return jsonResponse(409, { ok: false, message: `Nomor telepon ${role} sudah digunakan.` });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        username,
        name,
        contact_email: publicEmail,
        auth_email: authEmail,
        phone,
        address: String(body?.address || "").trim(),
        age: body?.age ?? null,
        birth_date: String(body?.birth_date || "").trim(),
        district: String(body?.district || "").trim(),
        referral,
        ac_units: acUnits,
        location_text: String(body?.location_text || "").trim(),
        lat: String(body?.lat || "").trim(),
        lng: String(body?.lng || "").trim(),
        nik: String(body?.nik || "").trim(),
        specialization: String(body?.specialization || "").trim(),
        experience: body?.experience ?? null,
        status: PROFILE_STATUS_PENDING,
      },
    });

    if (error) {
      return jsonResponse(400, {
        ok: false,
        message: error.message || "Pendaftaran akun belum dapat diproses.",
      });
    }

    return jsonResponse(200, {
      ok: true,
      message: "Akun berhasil dibuat dan menunggu verifikasi admin.",
      user: data.user
        ? {
            id: data.user.id,
            email: publicEmail,
            auth_email: authEmail,
            role,
          }
        : null,
      auth_email: authEmail,
    });
  } catch (error) {
    console.error("Gagal membuat akun publik:", error);
    return jsonResponse(500, {
      ok: false,
      message: "Pendaftaran akun belum dapat diproses.",
    });
  }
});
