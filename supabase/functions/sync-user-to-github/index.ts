import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") || "";
const GITHUB_OWNER = Deno.env.get("GITHUB_OWNER") || "";
const GITHUB_REPO = Deno.env.get("GITHUB_REPO") || "";
const GITHUB_BRANCH = Deno.env.get("GITHUB_BRANCH") || "main";
const GITHUB_SNAPSHOT_PATH = Deno.env.get("GITHUB_SNAPSHOT_PATH") || "data/profiles-snapshot.json";

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: corsHeaders,
  });
}

async function githubRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "indo-sejuk-sync-function",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }

  return response;
}

function encodeGitHubPath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
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
      message: "SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di Edge Function.",
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) {
    return jsonResponse(401, { ok: false, message: "Session pengguna dibutuhkan untuk memicu sinkronisasi." });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(jwt);
  if (authError || !authData.user) {
    return jsonResponse(401, { ok: false, message: "Session tidak valid untuk sinkronisasi snapshot." });
  }

  const body = await req.json().catch(() => ({}));
  const requestedBy = String(body?.requestedBy || authData.user.id || "").trim();
  const reason = String(body?.reason || "profile-upsert").trim();

  const { data: callerProfile, error: callerError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, status")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (callerError || !callerProfile) {
    return jsonResponse(403, { ok: false, message: "Profile pemanggil tidak ditemukan." });
  }

  if (!["admin", "konsumen", "teknisi"].includes(String(callerProfile.role || ""))) {
    return jsonResponse(403, { ok: false, message: "Role pemanggil tidak diizinkan memicu sinkronisasi." });
  }

  const { data: profiles, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, username, name, email, phone, address, age, birth_date, district, location_text, lat, lng, nik, specialization, experience, status, verified_at, verified_by, completed_jobs, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (profileError) {
    return jsonResponse(500, { ok: false, message: `Gagal membaca profiles dari Supabase: ${profileError.message}` });
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: "supabase",
    requestedBy,
    reason,
    profileCount: profiles?.length || 0,
    profiles: profiles || [],
  };

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return jsonResponse(202, {
      ok: true,
      skipped: true,
      message: "GitHub sync belum dikonfigurasi. Snapshot disiapkan, tetapi tidak di-push ke repo.",
      snapshot,
    });
  }

  let sha: string | undefined;
  try {
    const existing = await githubRequest(
      `/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${encodeGitHubPath(GITHUB_SNAPSHOT_PATH)}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,
    );
    const existingJson = await existing.json();
    sha = existingJson?.sha;
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error);
    if (!message.includes("404")) throw error;
  }

  const content = btoa(JSON.stringify(snapshot, null, 2));
  await githubRequest(
    `/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${encodeGitHubPath(GITHUB_SNAPSHOT_PATH)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore: sync profiles snapshot (${reason})`,
        content,
        branch: GITHUB_BRANCH,
        sha,
      }),
    },
  );

  return jsonResponse(200, {
    ok: true,
    skipped: false,
    message: `Snapshot profiles berhasil di-push ke ${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}.`,
    path: GITHUB_SNAPSHOT_PATH,
    count: snapshot.profileCount,
  });
});
