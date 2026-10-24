const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
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

function hasConfiguredRecipient() {
  const recipient = process.env.INSTRUCTOR_FORM_RECIPIENT;
  return Boolean(recipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient));
}

function redirect(request, result) {
  const url = new URL("/become-instructor.html", request.url);
  url.searchParams.set("application", result);
  url.hash = "application-form";
  return new Response(null, {
    status: 303,
    headers: {
      Location: url.toString(),
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

function field(formData, name, maxLength) {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export default {
  async fetch(request) {
    if (request.method === "HEAD") {
      return new Response(null, {
        status: hasConfiguredRecipient() ? 204 : 503,
        headers: {
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST, HEAD", "Cache-Control": "no-store" },
      });
    }

    const requestUrl = new URL(request.url);
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    if (
      (origin && origin !== requestUrl.origin) ||
      (fetchSite && !["same-origin", "same-site"].includes(fetchSite))
    ) {
      return new Response("Forbidden", {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_FILE_BYTES + 256 * 1024) {
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
    const attachment = formData.get("attachment");
    const filename =
      attachment && typeof attachment === "object" && "name" in attachment
        ? String(attachment.name).toLowerCase()
        : "";
    const fileSize =
      attachment && typeof attachment === "object" && "size" in attachment
        ? Number(attachment.size)
        : 0;

    const validFile =
      fileSize > 0 &&
      fileSize <= MAX_FILE_BYTES &&
      ALLOWED_EXTENSIONS.some((extension) => filename.endsWith(extension));
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPhone = /^[0-9+()\-\s]{7,30}$/.test(phone);

    if (
      fullName.length < 2 ||
      !validEmail ||
      !validPhone ||
      !ALLOWED_EXPERIENCE.has(experience) ||
      !ALLOWED_SPECIALIZATIONS.has(specialization) ||
      !validFile
    ) {
      return redirect(request, fileSize > MAX_FILE_BYTES ? "file-too-large" : "invalid");
    }

    const recipient = process.env.INSTRUCTOR_FORM_RECIPIENT;
    if (!hasConfiguredRecipient()) {
      return redirect(request, "unavailable");
    }

    formData.set("_subject", "New Nova Verse Instructor Application");
    formData.set("_template", "table");
    formData.set("_captcha", "false");
    formData.set("_replyto", email);
    formData.set("_url", new URL("/become-instructor.html", request.url).toString());

    try {
      const upstream = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const result = await upstream.json().catch(() => null);
      const rejected = result?.success === false || result?.success === "false";
      if (!upstream.ok || rejected) return redirect(request, "failed");
    } catch {
      return redirect(request, "failed");
    }

    return redirect(request, "sent");
  },
};
