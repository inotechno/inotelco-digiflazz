import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    "/",
    "/history/:path*",
    "/deposit/:path*",
    "/profile/:path*",
    "/api/v1/:path*",
  ],
};
