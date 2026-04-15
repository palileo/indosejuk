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
const GITHUB_UPLOADS_SNAPSHOT_PATH = Deno.env.get("GITHUB_UPLOADS_SNAPSHOT_PATH") || "data/uploads-snapshot.json";

const REQUIRED_PROFILE_COLUMNS = ["id", "role", "email", "updated_at"];
const OPTIONAL_PROFILE_COLUMNS = [
  "ktp_photo_path",
  "ktp_photo_url",
  "selfie_photo_path",
  "selfie_photo_url",
];
const REQUIRED_ORDER_COLUMNS = ["id", "order_number", "status", "konsumen_id", "teknisi_id", "updated_at"];
const OPTIONAL_ORDER_COLUMNS: string[] = [];

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
      "User-Agent": "indo-sejuk-storage-sync-function",
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

function extractMissingColumnName(error: unknown) {
  const message = String(error instanceof Error ? error.message : error || "");
  const patterns = [
    /column ["']?([a-z_]+)["']? of relation/i,
    /column\s+(?:(?:["']?[a-z_]+["']?\.)+["']?([a-z_]+)["']?)\s+does not exist/i,
    /column ["']?([a-z_]+)["']? does not exist/i,
    /Could not find the ['"]([a-z_]+)['"] column/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

async function fetchWithColumnFallback(
  table: "profiles" | "orders",
  requiredColumns: string[],
  optionalColumns: string[],
) {
  const missingColumns = new Set<string>();
  const maxAttempts = optionalColumns.length + 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const selectClause = [...requiredColumns, ...optionalColumns]
      .filter((column) => !missingColumns.has(column))
      .join(", ");

    const { data, error } = await supabaseAdmin!
      .from(table)
      .select(selectClause)
      .order("updated_at", { ascending: false });

    if (!error) return data || [];

    const missingColumn = extractMissingColumnName(error);
    if (missingColumn && optionalColumns.includes(missingColumn)) {
      missingColumns.add(missingColumn);
      console.warn(`Optional ${table} column "${missingColumn}" belum tersedia. Snapshot retry tanpa kolom itu.`);
      continue;
    }

    throw error;
  }

  throw new Error(`Gagal membaca ${table} setelah retry fallback kolom optional.`);
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
    return jsonResponse(401, { ok: false, message: "Session pengguna dibutuhkan untuk memicu sinkronisasi asset." });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(jwt);
  if (authError || !authData.user) {
    return jsonResponse(401, { ok: false, message: "Session tidak valid untuk sinkronisasi asset." });
  }

  const { data: callerProfile, error: callerError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, status")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (callerError || !callerProfile) {
    return jsonResponse(403, { ok: false, message: "Profile pemanggil tidak ditemukan." });
  }

  if (!["admin", "konsumen", "teknisi"].includes(String(callerProfile.role || ""))) {
    return jsonResponse(403, { ok: false, message: "Role pemanggil tidak diizinkan memicu sinkronisasi asset." });
  }

  const body = await req.json().catch(() => ({}));
  const requestedBy = String(body?.requestedBy || authData.user.id || "").trim();
  const reason = String(body?.action || body?.reason || "storage-change").trim();

  let profiles: unknown[] = [];
  let orders: unknown[] = [];
  try {
    profiles = await fetchWithColumnFallback("profiles", REQUIRED_PROFILE_COLUMNS, OPTIONAL_PROFILE_COLUMNS);
    orders = await fetchWithColumnFallback("orders", REQUIRED_ORDER_COLUMNS, OPTIONAL_ORDER_COLUMNS);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Unknown error");
    return jsonResponse(500, { ok: false, message: `Gagal membaca snapshot asset dari Supabase: ${message}` });
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: "supabase",
    requestedBy,
    reason,
    profileAssetCount: profiles.length,
    orderAssetCount: orders.length,
    profiles,
    orders,
  };

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return jsonResponse(202, {
      ok: true,
      skipped: true,
      message: "GitHub sync asset belum dikonfigurasi. Snapshot disiapkan, tetapi tidak di-push ke repo.",
      snapshot,
    });
  }

  let sha: string | undefined;
  try {
    const existing = await githubRequest(
      `/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${encodeGitHubPath(GITHUB_UPLOADS_SNAPSHOT_PATH)}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,
    );
    const existingJson = await existing.json();
    sha = existingJson?.sha;
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error);
    if (!message.includes("404")) throw error;
  }

  const content = btoa(JSON.stringify(snapshot, null, 2));
  await githubRequest(
    `/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${encodeGitHubPath(GITHUB_UPLOADS_SNAPSHOT_PATH)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore: sync uploads snapshot (${reason})`,
        content,
        branch: GITHUB_BRANCH,
        sha,
      }),
    },
  );

  return jsonResponse(200, {
    ok: true,
    skipped: false,
    message: `Snapshot asset berhasil di-push ke ${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}.`,
    path: GITHUB_UPLOADS_SNAPSHOT_PATH,
    profiles: snapshot.profileAssetCount,
    orders: snapshot.orderAssetCount,
  });
});
