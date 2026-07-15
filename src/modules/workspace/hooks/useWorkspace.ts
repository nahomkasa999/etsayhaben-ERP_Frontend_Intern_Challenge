"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { slugify } from "@/shared/lib/slug";
import type { CreateWorkspaceInput, Workspace } from "../types";

function toWorkspace(organization: {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date | string;
  metadata?: string | Record<string, unknown> | null;
}): Workspace {
  let metadata: Record<string, unknown> | null = null;

  if (typeof organization.metadata === "string" && organization.metadata) {
    try {
      metadata = JSON.parse(organization.metadata) as Record<string, unknown>;
    } catch {
      metadata = null;
    }
  } else if (
    organization.metadata &&
    typeof organization.metadata === "object"
  ) {
    metadata = organization.metadata;
  }

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo ?? null,
    createdAt:
      typeof organization.createdAt === "string"
        ? organization.createdAt
        : organization.createdAt.toISOString(),
    metadata,
  };
}

async function ensureUniqueWorkspaceSlug(baseSlug: string) {
  let slug = baseSlug || "workspace";
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const { data, error } = await authClient.organization.checkSlug({
      slug: candidate,
    });

    if (!error && data?.status === true) {
      return candidate;
    }

    if (error) {
      suffix += 1;
      continue;
    }

    throw new Error("Failed to validate workspace slug");
  }
}

export function useWorkspace() {
  const {
    data: organizations,
    isPending: isLoadingWorkspaces,
    refetch: refetchWorkspaces,
  } = authClient.useListOrganizations();
  const {
    data: activeOrganization,
    isPending: isLoadingActiveWorkspace,
    refetch: refetchActiveWorkspace,
  } = authClient.useActiveOrganization();
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workspaces = (organizations ?? []).map(toWorkspace);
  const activeWorkspace = activeOrganization
    ? toWorkspace(activeOrganization)
    : null;

  async function createWorkspace(input: CreateWorkspaceInput) {
    setIsMutating(true);
    setError(null);

    try {
      const name = input.name.trim();

      if (!name) {
        throw new Error("Workspace name is required");
      }

      const baseSlug = slugify(input.slug?.trim() || name);
      const slug = await ensureUniqueWorkspaceSlug(baseSlug);

      const { data, error: createError } =
        await authClient.organization.create({
          name,
          slug,
          logo: input.logo ?? null,
        });

      if (createError) {
        throw new Error(createError.message ?? "Failed to create workspace");
      }

      if (!data) {
        throw new Error("Failed to create workspace");
      }

      await refetchWorkspaces();
      await refetchActiveWorkspace();

      return toWorkspace(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create workspace";
      setError(message);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }

  async function setActiveWorkspace(organizationId: string) {
    setIsMutating(true);
    setError(null);

    try {
      const { error: setActiveError } =
        await authClient.organization.setActive({
          organizationId,
        });

      if (setActiveError) {
        throw new Error(
          setActiveError.message ?? "Failed to set active workspace",
        );
      }

      await refetchActiveWorkspace();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to set active workspace";
      setError(message);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }

  return {
    workspaces,
    activeWorkspace,
    isLoading: isLoadingWorkspaces || isLoadingActiveWorkspace,
    isMutating,
    error,
    setError,
    createWorkspace,
    setActiveWorkspace,
    refetchWorkspaces,
    refetchActiveWorkspace,
  };
}
