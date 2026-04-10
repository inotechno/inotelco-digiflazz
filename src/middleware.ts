import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname === "/" && req.nextauth.token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/stats", req.url));
    }
  },
  {
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/history/:path*",
    "/deposit/:path*",
    "/profile/:path*",
    "/api/v1/:path*",
  ],
};
