import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { ACTIVE_COMPANY_COOKIE } from "@/modules/company/types/constants";

import prisma from "@/lib/db";

import { auth } from "./lib/auth";

const relaxedPrefixes = ["/workspace", "/profile"];

function isRelaxedRoute(pathname: string) {
  return relaxedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const pathname = request.nextUrl.pathname;

  if (!session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isRelaxedRoute(pathname)) {
    return NextResponse.next();
  }

  const activeOrganizationId = session.session.activeOrganizationId;

  if (!activeOrganizationId) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const activeCompanyId = request.cookies.get(ACTIVE_COMPANY_COOKIE)?.value;

  if (!activeCompanyId) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const company = await prisma.company.findFirst({
    where: {
      id: activeCompanyId,
      organizationId: activeOrganizationId,
    },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/fiscalyear/:path*",
    "/hr/:path*",
    "/inventory/:path*",
    "/profile/:path*",
    "/workspace/:path*",
  ],
};
