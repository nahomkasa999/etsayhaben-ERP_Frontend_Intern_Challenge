"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function LandingCta() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <span className="inline-flex h-12 w-36 animate-pulse rounded-md bg-muted" />
    );
  }

  if (session?.user) {
    return (
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
      >
        Go to Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/signup"
      className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
    >
      Get Started
    </Link>
  );
}
