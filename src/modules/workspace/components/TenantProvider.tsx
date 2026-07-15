"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuthStore as useAppAuthStore } from "@/modules/auth/store/authStore";
import { useCompany } from "@/modules/company/hooks/useCompany";
import {
  useAuthStore as useFiscalAuthStore,
  useTenantStore,
} from "@/modules/fiscalyear/store/FiscalYearStore";
import { useWorkspace } from "../hooks/useWorkspace";
import { useWorkspaceStore } from "../store/workspaceStore";

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const setAppUser = useAppAuthStore((state) => state.setUser);
  const setFiscalUser = useFiscalAuthStore((state) => state.setUser);
  const setTenant = useTenantStore((state) => state.setTenant);
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();
  const {
    activeCompany,
    companies,
    setActiveCompanyId,
    refetchCompanies,
  } = useCompany();
  const storedCompanyId = useWorkspaceStore((state) => state.activeCompanyId);
  const clearWorkspaceContext = useWorkspaceStore(
    (state) => state.clearWorkspaceContext,
  );

  useEffect(() => {
    if (!session?.user) {
      clearWorkspaceContext();
      setTenant("", "");
      setAppUser(null);
      setFiscalUser("", "");
      return;
    }

    const user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image ?? null,
      role: "user",
    };

    setAppUser(user);
    setFiscalUser(user.id, user.name);
  }, [
    session,
    setAppUser,
    setFiscalUser,
    clearWorkspaceContext,
    setTenant,
  ]);

  useEffect(() => {
    if (!session?.user || workspaces.length === 0 || activeWorkspace) {
      return;
    }

    void setActiveWorkspace(workspaces[0].id);
  }, [session?.user, workspaces, activeWorkspace, setActiveWorkspace]);

  useEffect(() => {
    if (!activeWorkspace?.id) {
      return;
    }

    void refetchCompanies();
  }, [activeWorkspace?.id, refetchCompanies]);

  useEffect(() => {
    if (!activeWorkspace?.id || companies.length === 0 || activeCompany) {
      return;
    }

    setActiveCompanyId(companies[0].id);
  }, [
    activeWorkspace?.id,
    companies,
    activeCompany,
    setActiveCompanyId,
  ]);

  useEffect(() => {
    if (!activeCompany && storedCompanyId) {
      setActiveCompanyId(null);
    }
  }, [activeCompany, storedCompanyId, setActiveCompanyId]);

  useEffect(() => {
    if (!activeWorkspace?.id || !activeCompany?.id) {
      setTenant("", "");
      return;
    }

    setTenant(activeWorkspace.id, activeCompany.id);
  }, [activeWorkspace?.id, activeCompany?.id, setTenant]);

  return children;
}
