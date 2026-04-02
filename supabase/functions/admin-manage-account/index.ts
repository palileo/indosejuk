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
const PUBLIC_BUCKET = "app-public-uploads";
const PRIVATE_BUCKET = "app-private-documents";

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

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function normalizeTextArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeText(item)).filter(Boolean);
}

function extractAcUnitPaths(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .flatMap((item) => {
      const record = item as Record<string, unknown>;
      return [
        normalizeText(record.image_path),
        normalizeText(record.imagePath),
      ].filter(Boolean);
    });
}

async function requireAdminCaller(req: Request) {
  if (!supabaseAdmin) {
    throw new Error("Konfigurasi Supabase service role belum lengkap.");
  }

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, status: 401, message: "Session admin tidak ditemukan." };
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user) {
    return { ok: false, status: 401, message: "Session admin tidak valid." };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, status")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin" || normalizeText(profile.status).toLowerCase() === "nonaktif") {
    return { ok: false, status: 403, message: "Akses admin tidak diizinkan." };
  }

  return { ok: true, userId: authData.user.id };
}

async function removeStorageObjects(bucket: string, paths: string[]) {
  const uniquePaths = [...new Set(paths.map((item) => normalizeText(item)).filter(Boolean))];
  if (!uniquePaths.length) return;
  await supabaseAdmin!.storage.from(bucket).remove(uniquePaths);
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

  try {
    const caller = await requireAdminCaller(req);
    if (!caller.ok) {
      return jsonResponse(caller.status, { ok: false, message: caller.message });
    }

    const body = await req.json().catch(() => ({}));
    const action = normalizeText(body?.action).toLowerCase();
    if (action !== "delete_public_account") {
      return jsonResponse(400, { ok: false, message: "Aksi admin tidak didukung." });
    }

    const userId = normalizeText(body?.userId);
    const role = normalizeText(body?.role).toLowerCase();
    if (!userId || !["konsumen", "teknisi"].includes(role)) {
      return jsonResponse(400, { ok: false, message: "Payload hapus akun publik tidak valid." });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role, name, unit_image_paths, ac_units, profile_photo_path, ktp_photo_path, selfie_photo_path")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      return jsonResponse(404, { ok: false, message: "Profile user tidak ditemukan." });
    }
    if (normalizeText(profile.role).toLowerCase() !== role) {
      return jsonResponse(400, { ok: false, message: "Role profile target tidak cocok." });
    }

    if (role === "konsumen") {
      const { data: orders, error: orderFetchError } = await supabaseAdmin
        .from("orders")
        .select("id, proof_image_path")
        .eq("konsumen_id", userId);
      if (orderFetchError) throw orderFetchError;

      const proofPaths = (orders || []).map((item) => normalizeText(item.proof_image_path)).filter(Boolean);
      const { error: deleteOrdersError } = await supabaseAdmin
        .from("orders")
        .delete()
        .eq("konsumen_id", userId);
      if (deleteOrdersError) throw deleteOrdersError;

      await removeStorageObjects(PUBLIC_BUCKET, [
        normalizeText(profile.profile_photo_path),
        ...normalizeTextArray(profile.unit_image_paths),
        ...extractAcUnitPaths(profile.ac_units),
        ...proofPaths,
      ]).catch(() => {});
    } else {
      const { error: resetActiveOrdersError } = await supabaseAdmin
        .from("orders")
        .update({
          teknisi_id: null,
          teknisi_name: null,
          status: "Menunggu",
          admin_confirmation_text: null,
        })
        .eq("teknisi_id", userId)
        .neq("status", "Selesai");
      if (resetActiveOrdersError) throw resetActiveOrdersError;

      const { error: clearCompletedOrdersError } = await supabaseAdmin
        .from("orders")
        .update({
          teknisi_id: null,
        })
        .eq("teknisi_id", userId)
        .eq("status", "Selesai");
      if (clearCompletedOrdersError) throw clearCompletedOrdersError;

      await removeStorageObjects(PRIVATE_BUCKET, [
        normalizeText(profile.ktp_photo_path),
        normalizeText(profile.selfie_photo_path),
      ]).catch(() => {});
      await removeStorageObjects(PUBLIC_BUCKET, [
        normalizeText(profile.profile_photo_path),
      ]).catch(() => {});
    }

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) throw deleteAuthError;

    return jsonResponse(200, {
      ok: true,
      message: `Akun ${role} berhasil dihapus permanen.`,
      userId,
    });
  } catch (error) {
    console.error("Admin manage account gagal:", error);
    return jsonResponse(500, {
      ok: false,
      message: "Operasi admin akun publik gagal diproses.",
    });
  }
});
