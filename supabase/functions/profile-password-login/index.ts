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

function looksLikePhone(value: string) {
  if (!value || value.includes("@")) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && /^[+\d\s().-]+$/.test(value);
}

type Candidate = {
  id: string;
  role: string;
  username: string | null;
  email: string | null;
  auth_email: string | null;
  phone: string | null;
};

async function fetchCandidates(identifier: string) {
  if (!supabaseAdmin) return [];

  if (identifier.includes("@")) {
    const email = normalizeEmail(identifier);
    const [authEmailResult, publicEmailResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, role, username, email, auth_email, phone").eq("auth_email", email),
      supabaseAdmin.from("profiles").select("id, role, username, email, auth_email, phone").eq("email", email),
    ]);
    if (authEmailResult.error) throw authEmailResult.error;
    if (publicEmailResult.error) throw publicEmailResult.error;
    return [...(authEmailResult.data || []), ...(publicEmailResult.data || [])] as Candidate[];
  }

  if (looksLikePhone(identifier)) {
    const phone = normalizePhone(identifier);
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, role, username, email, auth_email, phone")
      .eq("phone", phone);
    if (error) throw error;
    return (data || []) as Candidate[];
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, role, username, email, auth_email, phone")
    .ilike("username", identifier);
  if (error) throw error;
  return (data || []) as Candidate[];
}

function resolveCandidate(candidates: Candidate[], requestedRole: string) {
  const uniqueCandidates = Array.from(
    new Map(candidates.map((candidate) => [candidate.id, candidate])).values(),
  );

  if (uniqueCandidates.length === 1) return uniqueCandidates[0];

  const requestedMatches = requestedRole
    ? uniqueCandidates.filter((candidate) => candidate.role === requestedRole)
    : [];

  if (requestedMatches.length === 1) return requestedMatches[0];
  return null;
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
      message: "Konfigurasi Supabase untuk login belum lengkap.",
    });
  }

  const body = await req.json().catch(() => ({}));
  const identifier = String(body?.identifier || "").trim();
  const password = String(body?.password || "").trim();
  const requestedRole = String(body?.requestedRole || "").trim().toLowerCase();
  if (!identifier || !password) {
    return jsonResponse(401, { ok: false, message: "Login gagal. Periksa identifier dan password Anda." });
  }

  try {
    const candidates = await fetchCandidates(identifier);
    const resolved = resolveCandidate(candidates, requestedRole);
    const authEmail = normalizeEmail(resolved?.auth_email || resolved?.email);

    if (!resolved || !authEmail) {
      return jsonResponse(401, { ok: false, message: "Login gagal. Periksa identifier dan password Anda." });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (error || !data.session) {
      return jsonResponse(401, { ok: false, message: "Login gagal. Periksa identifier dan password Anda." });
    }

    return jsonResponse(200, {
      ok: true,
      session: data.session,
      user: data.user,
      resolved_role: resolved.role,
    });
  } catch (error) {
    console.error("Gagal memproses login multi-identifier:", error);
    return jsonResponse(500, {
      ok: false,
      message: "Login sementara tidak dapat diproses.",
    });
  }
});
