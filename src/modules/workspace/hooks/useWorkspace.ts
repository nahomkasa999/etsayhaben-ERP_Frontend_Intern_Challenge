"use client";

import { createFetch, createSchema } from "@better-fetch/fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CreateWorkspaceSchema,
  OrganizationsListResponseSchema,
  SetActiveWorkspaceResponseSchema,
  SetActiveWorkspaceSchema,
  WorkspaceSchema,
  type CreateWorkspaceInput,
  type Workspace,
} from "../types";
import { WorkspaceApiError } from "../types";

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

function createApiError(fetchError: unknown, fallback: string) {
  let message = fallback;
  let status = 400;

  if (fetchError && typeof fetchError === "object") {
    if (
      "message" in fetchError &&
      typeof fetchError.message === "string" &&
      fetchError.message.length > 0
    ) {
      message = fetchError.message;
    }

    if ("status" in fetchError && typeof fetchError.status === "number") {
      status = fetchError.status;
    }
  }

  return new WorkspaceApiError(message, status);
}

export function useWorkspace() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  async function fetchOrganizations() {
    const { data, error: fetchError } = await workspaceFetch("/organizations");

    if (fetchError) {
      throw createApiError(fetchError, "Failed to fetch organizations");
    }

    return data;
  }

  async function createOrganizationRequest(input: CreateWorkspaceInput): Promise<Workspace> {
    const { data, error: fetchError } = await workspaceFetch("@post/organizations", {
      body: input,
    });

    if (fetchError) {
      throw createApiError(fetchError, "Failed to create organization");
    }

    return data;
  }

  async function setActiveOrganizationRequest(organizationId: string) {
    const { data, error: fetchError } = await workspaceFetch(
      "@post/organizations/set-active",
      { body: { organizationId } },
    );

    if (fetchError) {
      throw createApiError(fetchError, "Failed to set active organization");
    }

    return data;
  }

  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });

  const workspaces = organizationsQuery.data?.organizations ?? [];
  const activeOrganizationId =
    organizationsQuery.data?.activeOrganizationId ?? null;
  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeOrganizationId) ?? null;

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
        actionError instanceof WorkspaceApiError
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
        actionError instanceof WorkspaceApiError
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
