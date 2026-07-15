"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { useFiscalYear } from "../hooks/useFiscalyear";
import { useTenantStore } from "../store/FiscalYearStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { FiscalYearApiError } from "../types";
import type { FiscalYearList } from "../types";

type DialogConfig = {
  title: string;
  message: string;
  variant?: "confirm" | "alert";
  confirmText?: string;
  inputLabel?: string;
  inputMultiline?: boolean;
  danger?: boolean;
  onConfirm?: (inputValue?: string) => void;
};

type Props = {
  fiscalYear: FiscalYearList;
};

export function FiscalYearActions({ fiscalYear }: Props) {
  const router = useRouter();
  const { deleteFiscalYear, closeFiscalYear, reopenFiscalYear } =
    useFiscalYear();
  const { tenantId, companyId } = useTenantStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  function closeDialog() {
    setDialog(null);
  }

  function showError(message: string) {
    setDialog({
      title: "Error",
      message,
      variant: "alert",
      danger: true,
    });
  }

  function handleDelete() {
    setDialog({
      title: "Delete Fiscal Year",
      message: `Are you sure you want to delete "${fiscalYear.fiscal_year_name}"? This action cannot be undone.`,
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        closeDialog();
        setLoading("delete");
        try {
          await deleteFiscalYear(fiscalYear.id);
          router.push(
            `/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`,
          );
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            showError(error.detail);
          } else {
            showError("Failed to delete fiscal year.");
          }
        } finally {
          setLoading(null);
        }
      },
    });
  }

  function handleClose() {
    setDialog({
      title: "Close Fiscal Year",
      message: `Provide a justification for closing "${fiscalYear.fiscal_year_name}".`,
      confirmText: "Close",
      danger: true,
      inputLabel: "Justification",
      inputMultiline: true,
      onConfirm: async (justification) => {
        if (!justification?.trim()) return;
        closeDialog();
        setLoading("close");
        try {
          await closeFiscalYear(fiscalYear.id, justification);
          router.push(
            `/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`,
          );
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            showError(error.detail);
          } else {
            showError("Failed to close fiscal year.");
          }
        } finally {
          setLoading(null);
        }
      },
    });
  }

  function handleReopen() {
    setDialog({
      title: "Reopen Fiscal Year",
      message: `Provide a justification for reopening "${fiscalYear.fiscal_year_name}".`,
      confirmText: "Reopen",
      inputLabel: "Justification",
      inputMultiline: true,
      onConfirm: async (justification) => {
        if (!justification?.trim()) return;
        closeDialog();
        setLoading("reopen");
        try {
          await reopenFiscalYear(fiscalYear.id, justification);
          router.push(
            `/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`,
          );
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            showError(error.detail);
          } else {
            showError("Failed to reopen fiscal year.");
          }
        } finally {
          setLoading(null);
        }
      },
    });
  }

  return (
    <>
      {dialog && (
        <ConfirmDialog
          open
          title={dialog.title}
          message={dialog.message}
          variant={dialog.variant}
          confirmText={dialog.confirmText}
          inputLabel={dialog.inputLabel}
          inputMultiline={dialog.inputMultiline}
          danger={dialog.danger}
          isPending={!!loading}
          onConfirm={dialog.onConfirm}
          onCancel={closeDialog}
        />
      )}

      <div className="flex flex-wrap gap-2">
        {fiscalYear.status === "OPEN" && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClose}
            disabled={loading === "close"}
          >
            {loading === "close" ? (
              <>
                <Loader2 className="animate-spin" />
                Closing...
              </>
            ) : (
              "Close"
            )}
          </Button>
        )}

        {fiscalYear.status === "CLOSED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReopen}
            disabled={loading === "reopen"}
          >
            {loading === "reopen" ? (
              <>
                <Loader2 className="animate-spin" />
                Reopening...
              </>
            ) : (
              "Reopen"
            )}
          </Button>
        )}

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={loading === "delete"}
        >
          {loading === "delete" ? (
            <>
              <Loader2 className="animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </div>
    </>
  );
}
