import { PublicNavbar } from "@/shared/components/layout/PublicNavbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative h-dvh w-full overflow-hidden">
      <PublicNavbar />
      <div className="relative z-10 h-full flex items-center justify-center px-2">
        {children}
      </div>
    </section>
  );
}
