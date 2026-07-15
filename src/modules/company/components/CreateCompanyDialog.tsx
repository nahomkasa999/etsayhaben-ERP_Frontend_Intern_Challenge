"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { CreateCompanyForm } from "./CreateCompanyForm";

type CreateCompanyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateCompanyDialog({
  open,
  onOpenChange,
}: CreateCompanyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create company</DialogTitle>
          <DialogDescription>
            Companies belong to this organization and scope ERP data.
          </DialogDescription>
        </DialogHeader>
        <CreateCompanyForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
