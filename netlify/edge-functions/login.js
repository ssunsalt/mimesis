// netlify/edge-functions/login.js
export default async (request, context) => {
  const url = new URL(request.url);

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const formData = await request.formData();
  const username = (formData.get("username") || "").toString();
  const password = (formData.get("password") || "").toString();
  const redirectTo = (formData.get("redirect") || "/").toString();

  const authUser = Netlify.env.get("AUTH_USER");
  const authPass = Netlify.env.get("AUTH_PASS");
  const sessionSecret = Netlify.env.get("SESSION_SECRET");

  const isCorrect =
    username === authUser && password === authPass && Boolean(sessionSecret);

  if (isCorrect) {
    const headers = new Headers();
    headers.set("Location", redirectTo || "/");
    headers.append(
      "Set-Cookie",
      `site_session=${sessionSecret}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`
    );
    return new Response(null, { status: 302, headers });
  }

  const failUrl = new URL("/login", url.origin);
  failUrl.searchParams.set("redirect", redirectTo || "/");
  failUrl.searchParams.set("error", "1");
  return new Response(null, {
    status: 302,
    headers: { Location: failUrl.toString() },
  });
};

export const config = { path: "/api/login" };
