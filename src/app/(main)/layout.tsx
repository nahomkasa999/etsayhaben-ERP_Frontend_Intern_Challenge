import { TenantProvider } from "@/modules/workspace/components/TenantProvider";
import { MainAppShell } from "@/shared/components/layout/MainAppShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <MainAppShell>{children}</MainAppShell>
    </TenantProvider>
  );
}
