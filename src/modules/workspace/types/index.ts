export type Workspace = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type CreateWorkspaceInput = {
  name: string;
  slug?: string;
  logo?: string | null;
};
