import Link from "next/link";
import { AuthNavActions } from "@/shared/components/layout/AuthNavActions";
import { LandingCta } from "@/shared/components/layout/LandingCta";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-border bg-background border-b px-6 py-4">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <span className="font-sans text-xl font-bold tracking-tight text-foreground">
            EthioERP
          </span>
          <AuthNavActions />
        </nav>
      </header>

      <main className="bg-background flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="font-sans text-5xl font-black tracking-tighter text-foreground sm:text-6xl md:text-7xl">
          EthioERP
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
          Enterprise resource planning built for Ethiopian businesses
        </p>
        <div className="mt-8 flex gap-4">
          <LandingCta />
          <Link
            href="/about"
            className="rounded-md bg-card px-6 py-3 text-base font-semibold text-card-foreground shadow-md ring-1 ring-border transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Learn More
          </Link>
        </div>
      </main>

      <footer className="border-border bg-muted border-t px-6 py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} EthioERP. All rights reserved.
      </footer>
    </div>
  );
}
