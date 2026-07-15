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



export function TenantProvider({ children }: { children: React.ReactNode }) {

  const { data: session } = authClient.useSession();

  const setAppUser = useAppAuthStore((state) => state.setUser);

  const setFiscalUser = useFiscalAuthStore((state) => state.setUser);

  const setTenant = useTenantStore((state) => state.setTenant);

  const { activeWorkspace } = useWorkspace();

  const { activeCompany } = useCompany();



  useEffect(() => {

    if (!session?.user) {

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

  }, [session, setAppUser, setFiscalUser, setTenant]);



  useEffect(() => {

    if (!activeWorkspace?.id || !activeCompany?.id) {

      setTenant("", "");

      return;

    }



    setTenant(activeWorkspace.id, activeCompany.id);

  }, [activeWorkspace?.id, activeCompany?.id, setTenant]);



  return children;

}


