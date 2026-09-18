// netlify/edge-functions/protect.js
export default async (request, context) => {
  const sessionSecret = Netlify.env.get("SESSION_SECRET");
  const cookieHeader = request.headers.get("cookie") || "";
  const hasValidSession =
    Boolean(sessionSecret) && cookieHeader.includes(`site_session=${sessionSecret}`);

  if (hasValidSession) {
    return context.next();
  }

  const url = new URL(request.url);
  const loginUrl = new URL("/login", url.origin);
  loginUrl.searchParams.set("redirect", url.pathname);
  return Response.redirect(loginUrl.toString(), 302);
};

// 이 경로들에서만 작동, 메인(/)과 /gallery는 건드리지 않음
export const config = {
  path: ["/trpg", "/trpg/*", "/log", "/log/*", "/sheet", "/sheet/*"],
};
