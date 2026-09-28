import { NextResponse, type NextRequest } from "next/server";

/**
 * Locks the whole CRM behind a username + password (HTTP Basic Auth).
 * The CRM holds people's contact info, so it must never be public.
 * Set ADMIN_USER and ADMIN_PASSWORD in the environment. In production, missing values = locked out.
 */
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("CRM login is not configured (set ADMIN_USER and ADMIN_PASSWORD).", { status: 503 });
    }
    return NextResponse.next(); // local dev without a password
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const [u, ...rest] = atob(header.slice(6)).split(":");
    if (u === user && rest.join(":") === pass) return NextResponse.next();
  }
  return new NextResponse("Login required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="LegalShield Outreach CRM"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
