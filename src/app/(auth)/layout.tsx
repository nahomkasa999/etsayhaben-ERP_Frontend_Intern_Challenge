import { PublicNavbar } from "@/shared/components/layout/PublicNavbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-dvh w-full">
      <PublicNavbar />
      <div className="relative z-10 flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center px-4 py-6 pt-20 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </section>
  );
}
