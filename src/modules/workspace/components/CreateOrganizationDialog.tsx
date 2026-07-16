"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { CreateWorkspaceForm } from "./CreateWorkspaceForm";

type CreateOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Organizations are your top-level workspaces. Each one can contain
            multiple companies.
          </DialogDescription>
        </DialogHeader>
        <CreateWorkspaceForm onSuccess={() => { onOpenChange(false); }} />
      </DialogContent>
    </Dialog>
  );
}
