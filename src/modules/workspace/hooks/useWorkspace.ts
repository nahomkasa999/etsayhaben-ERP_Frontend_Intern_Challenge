"use client";

import { createFetch, createSchema } from "@better-fetch/fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  CreateWorkspaceSchema,
  OrganizationsListResponseSchema,
  SetActiveWorkspaceResponseSchema,
  SetActiveWorkspaceSchema,
  WorkspaceSchema,
  type CreateWorkspaceInput,
  type Workspace,
} from "../types";

const workspaceFetch = createFetch({
  baseURL: "/api/v1",
  credentials: "include",
  schema: createSchema(
    {
      "/organizations": {
        output: OrganizationsListResponseSchema,
      },
      "@post/organizations": {
        input: CreateWorkspaceSchema,
        output: WorkspaceSchema,
      },
      "@post/organizations/set-active": {
        input: SetActiveWorkspaceSchema,
        output: SetActiveWorkspaceResponseSchema,
      },
    },
    { strict: true },
  ),
});

export function useWorkspace() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  function getErrorMessage(fetchError: unknown, fallback: string) {
    if (
      fetchError &&
      typeof fetchError === "object" &&
      "message" in fetchError &&
      typeof fetchError.message === "string" &&
      fetchError.message.length > 0
    ) {
      return fetchError.message;
    }

    return fallback;
  }

  async function fetchOrganizations() {
    const { data, error: fetchError } = await workspaceFetch("/organizations");

    if (fetchError) {
      throw new Error(getErrorMessage(fetchError, "Failed to fetch organizations"));
    }

    return data;
  }

  async function createOrganizationRequest(input: CreateWorkspaceInput): Promise<Workspace> {
    const { data, error: fetchError } = await workspaceFetch("@post/organizations", {
      body: input,
    });

    if (fetchError) {
      throw new Error(getErrorMessage(fetchError, "Failed to create organization"));
    }

    return data;
  }

  async function setActiveOrganizationRequest(organizationId: string) {
    const { data, error: fetchError } = await workspaceFetch(
      "@post/organizations/set-active",
      { body: { organizationId } },
    );

    if (fetchError) {
      throw new Error(
        getErrorMessage(fetchError, "Failed to set active organization"),
      );
    }

    return data;
  }

  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });

  const workspaces = useMemo(
    () => organizationsQuery.data?.organizations ?? [],
    [organizationsQuery.data?.organizations],
  );
  const activeOrganizationId =
    organizationsQuery.data?.activeOrganizationId ?? null;
  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeOrganizationId) ?? null;

  const totalCompanies = useMemo(
    () => workspaces.reduce((sum, workspace) => sum + workspace.companyCount, 0),
    [workspaces],
  );

  const createMutation = useMutation({
    mutationFn: createOrganizationRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: setActiveOrganizationRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  function getWorkspaceById(organizationId: string) {
    return workspaces.find((workspace) => workspace.id === organizationId) ?? null;
  }

  async function createWorkspace(input: CreateWorkspaceInput) {
    setError(null);

    try {
      return await createMutation.mutateAsync(input);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to create workspace",
      );
      throw actionError;
    }
  }

  async function setActiveWorkspace(organizationId: string) {
    setError(null);

    try {
      await setActiveMutation.mutateAsync(organizationId);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to set active workspace",
      );
      throw actionError;
    }
  }

  return {
    workspaces,
    activeWorkspace,
    activeOrganizationId,
    totalOrganizations: workspaces.length,
    totalCompanies,
    isLoading: organizationsQuery.isLoading,
    isMutating: createMutation.isPending || setActiveMutation.isPending,
    error,
    setError,
    createWorkspace,
    setActiveWorkspace,
    getWorkspaceById,
    refetchWorkspaces: organizationsQuery.refetch,
  };
}
