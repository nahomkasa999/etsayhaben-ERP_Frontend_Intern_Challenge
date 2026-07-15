import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth"; // Adjust path to wherever your Better Auth client instance is

export async function proxy(request: NextRequest) {
  // Better Auth provides helper logic to check sessions directly from requests
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If there is no active session, intercept and redirect
  if (!session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

// Map the routes pointing directly to your business modules
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/fiscalyear/:path*",
    "/hr/:path*",
    "/inventory/:path*",
    "/profile/:path*",
  ],
};
