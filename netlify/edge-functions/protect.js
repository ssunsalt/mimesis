export default async (request, context) => {
  const authUser = Netlify.env.get("AUTH_USER");
  const authPass = Netlify.env.get("AUTH_PASS");

  // 환경변수가 아직 설정 안 됐으면 안전하게 막아버림 (설정 실수로 공개되는 것 방지)
  if (!authUser || !authPass) {
    return new Response("Access not configured.", { status: 503 });
  }

  const validAuth = "Basic " + btoa(authUser + ":" + authPass);
  const header = request.headers.get("authorization");

  if (header === validAuth) {
    return context.next();
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Protected area"' },
  });
};

// 이 경로들에서만 작동, 메인(/)과 /gallery는 건드리지 않음
export const config = {
  path: ["/trpg", "/trpg/*", "/log", "/log/*"],
};
