const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_REQUEST_OVERHEAD = 256 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const PDF_MIME_TYPES = new Set(["application/pdf", "application/x-pdf"]);
const ALLOWED_EXPERIENCE = new Set([
  "أقل من سنة",
  "1 - 3 سنوات",
  "3 - 5 سنوات",
  "أكثر من 5 سنوات",
]);
const ALLOWED_SPECIALIZATIONS = new Set([
  "Scratch / Block Coding",
  "Python",
  "Web Development",
  "Artificial Intelligence",
  "أخرى",
]);

// Adds abuse friction without persisting raw IP addresses or adding another data processor.
const attemptBuckets = new Map();
const rateLimitSalt = globalThis.crypto?.randomUUID?.() || String(Math.random());

const PRIVATE_RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function hasConfiguredRecipient() {
  const recipient = process.env.INSTRUCTOR_FORM_RECIPIENT;
  return Boolean(recipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient));
}

function redirect(request, result, extraHeaders = {}) {
  const url = new URL("/become-instructor.html", request.url);
  url.searchParams.set("application", result);
  url.hash = "application-form";
  return new Response(null, {
    status: 303,
    headers: {
      ...PRIVATE_RESPONSE_HEADERS,
      ...extraHeaders,
      Location: url.toString(),
    },
  });
}

function field(formData, name, maxLength) {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function clientAddress(request) {
  const value =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "";
  return value.split(",")[0].trim().slice(0, 64);
}

async function rateLimitKey(request) {
  const address = clientAddress(request);
  if (!address || !globalThis.crypto?.subtle) return "";
  const payload = new TextEncoder().encode(`${rateLimitSalt}:${address}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", payload);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function isRateLimited(request) {
  const key = await rateLimitKey(request);
  if (!key) return false;

  const now = Date.now();
  if (attemptBuckets.size > 2_000) {
    for (const [bucketKey, bucket] of attemptBuckets) {
      if (bucket.resetAt <= now) attemptBuckets.delete(bucketKey);
    }
  }

  const bucket = attemptBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    attemptBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX_ATTEMPTS;
}

async function isPdf(file) {
  if (
    !file ||
    typeof file !== "object" ||
    typeof file.name !== "string" ||
    typeof file.size !== "number" ||
    typeof file.slice !== "function" ||
    !file.name.toLowerCase().endsWith(".pdf") ||
    !PDF_MIME_TYPES.has(String(file.type).toLowerCase()) ||
    file.size <= 0 ||
    file.size > MAX_FILE_BYTES
  ) {
    return false;
  }

  try {
    const header = new Uint8Array(await file.slice(0, Math.min(1024, file.size)).arrayBuffer());
    const trailer = new Uint8Array(
      await file.slice(Math.max(0, file.size - 4096), file.size).arrayBuffer(),
    );
    const decoder = new TextDecoder("latin1");
    return decoder.decode(header).includes("%PDF-") && decoder.decode(trailer).includes("%%EOF");
  } catch {
    return false;
  }
}

async function sendToRecruitmentInbox(recipient, formData) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
      signal: controller.signal,
    });
    const result = await upstream.json().catch(() => null);
    const rejected = result?.success === false || result?.success === "false";
    return upstream.ok && !rejected;
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request) {
    if (request.method === "HEAD") {
      return new Response(null, {
        status: hasConfiguredRecipient() ? 204 : 503,
        headers: PRIVATE_RESPONSE_HEADERS,
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          ...PRIVATE_RESPONSE_HEADERS,
          Allow: "POST, HEAD",
        },
      });
    }

    const requestUrl = new URL(request.url);
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    const contentType = request.headers.get("content-type") || "";
    if (
      origin !== requestUrl.origin ||
      (fetchSite && !["same-origin", "same-site"].includes(fetchSite)) ||
      !contentType.toLowerCase().startsWith("multipart/form-data;")
    ) {
      return new Response("Forbidden", {
        status: 403,
        headers: PRIVATE_RESPONSE_HEADERS,
      });
    }

    if (await isRateLimited(request)) {
      return redirect(request, "rate-limited", { "Retry-After": "3600" });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_FILE_BYTES + MAX_REQUEST_OVERHEAD) {
      return redirect(request, "file-too-large");
    }

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return redirect(request, "invalid");
    }

    if (field(formData, "_honey", 200)) {
      return redirect(request, "sent");
    }
    formData.delete("_honey");

    const fullName = field(formData, "Full Name", 120);
    const email = field(formData, "Email", 254);
    const phone = field(formData, "Phone", 30);
    const experience = field(formData, "Years of Experience", 40);
    const specialization = field(formData, "Specialization", 80);
    const privacyConsent = field(formData, "privacy_consent", 20);
    const attachment = formData.get("attachment");
    const fileSize =
      attachment && typeof attachment === "object" && "size" in attachment
        ? Number(attachment.size)
        : 0;

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPhone = /^[0-9+()\-\s]{7,30}$/.test(phone);
    const validFile = await isPdf(attachment);

    if (
      fullName.length < 2 ||
      !validEmail ||
      !validPhone ||
      !ALLOWED_EXPERIENCE.has(experience) ||
      !ALLOWED_SPECIALIZATIONS.has(specialization) ||
      privacyConsent !== "accepted" ||
      !validFile
    ) {
      return redirect(request, fileSize > MAX_FILE_BYTES ? "file-too-large" : "invalid");
    }

    const recipient = process.env.INSTRUCTOR_FORM_RECIPIENT;
    if (!hasConfiguredRecipient()) {
      return redirect(request, "unavailable");
    }

    formData.delete("privacy_consent");
    formData.set("Privacy Consent", "Accepted");
    formData.set("_subject", "New Nova Verse Instructor Application");
    formData.set("_template", "table");
    formData.set("_captcha", "false");
    formData.set("_replyto", email);
    formData.set("_url", new URL("/become-instructor.html", request.url).toString());

    try {
      if (!(await sendToRecruitmentInbox(recipient, formData))) {
        return redirect(request, "failed");
      }
    } catch {
      return redirect(request, "failed");
    }

    return redirect(request, "sent");
  },
};
