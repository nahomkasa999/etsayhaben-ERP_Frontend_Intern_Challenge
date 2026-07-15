"use client";

import Link from "next/link";
import { AuthNavActions } from "@/shared/components/layout/AuthNavActions";

export function PublicNavbar() {
  return (
    <nav className="border-border bg-background/80 fixed top-0 z-20 flex h-16 w-full items-center justify-between border-b px-6 backdrop-blur-sm">
      <Link
        href="/"
        className="font-sans text-xl font-bold tracking-tight text-foreground"
      >
        EthioERP
      </Link>
      <AuthNavActions />
    </nav>
  );
}
