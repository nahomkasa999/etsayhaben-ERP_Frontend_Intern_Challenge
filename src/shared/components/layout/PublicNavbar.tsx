"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export function PublicNavbar() {
  return (
    <nav className="border-border bg-background/80 fixed top-0 z-20 flex h-16 w-full items-center justify-between border-b px-6 backdrop-blur-sm">
      <span className="font-sans text-xl font-bold tracking-tight text-foreground">
        EthioERP
      </span>
      <div className="flex items-center gap-3">
        <Button variant="ghost">
          <Link href="/signin">Sign In</Link>
        </Button>
        <Button>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </nav>
  );
}
