"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useWorkspace } from "../hooks/useWorkspace";

type CreateWorkspaceFormProps = {
  onSuccess?: () => void;
  submitLabel?: string;
};

export function CreateWorkspaceForm({
  onSuccess,
  submitLabel = "Create organization",
}: CreateWorkspaceFormProps) {
  const { createWorkspace, isMutating, error } = useWorkspace();
  const [name, setName] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createWorkspace({ name });
    setName("");
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="workspace-name">Organization name</Label>
        <Input
          id="workspace-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme Holdings"
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={isMutating || !name.trim()}>
        {isMutating ? "Creating..." : submitLabel}
      </Button>
    </form>
  );
}
