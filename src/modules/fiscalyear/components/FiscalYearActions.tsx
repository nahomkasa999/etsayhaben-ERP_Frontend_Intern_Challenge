"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  danger?: boolean;
  onConfirm?: (inputValue?: string) => void;
};

type Props = {
  fiscalYear: FiscalYearList;
};

export function FiscalYearActions({ fiscalYear }: Props) {
  const router = useRouter();
  const {
    deleteFiscalYear,
    closeFiscalYear,
    reopenFiscalYear,
    activateFiscalYear,
  } = useFiscalYear();
  const { tenantId, companyId } = useTenantStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  const canActivate =
    (fiscalYear.status === "OPEN" || fiscalYear.status === "REOPENED") &&
    !fiscalYear.is_active;
  const canClose =
    fiscalYear.status === "OPEN" || fiscalYear.status === "REOPENED";

  function closeDialog() {
    setDialog(null);
  }

  function goBackToList() {
    router.push(`/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`);
  }

  function handleDelete() {
    setDialog({
      title: "Delete Fiscal Year",
      message: "Are you sure you want to delete this fiscal year?",
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        closeDialog();
        setLoading("delete");
        try {
          await deleteFiscalYear(fiscalYear.id);
          goBackToList();
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            setDialog({
              title: "Error",
              message: error.detail,
              variant: "alert",
            });
          } else {
            setDialog({
              title: "Error",
              message: "Failed to delete fiscal year.",
              variant: "alert",
            });
          }
        } finally {
          setLoading(null);
        }
      },
    });
  }

  function handleActivate() {
    setDialog({
      title: "Activate Fiscal Year",
      message:
        "This will make this fiscal year active for transactions and deactivate any other active fiscal year.",
      confirmText: "Activate",
      onConfirm: async () => {
        closeDialog();
        setLoading("activate");
        try {
          await activateFiscalYear(fiscalYear.id);
          goBackToList();
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            setDialog({
              title: "Error",
              message: error.detail,
              variant: "alert",
            });
          } else {
            setDialog({
              title: "Error",
              message: "Failed to activate fiscal year.",
              variant: "alert",
            });
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
      message: "Provide a justification for closing.",
      confirmText: "Close",
      danger: true,
      inputLabel: "Justification",
      onConfirm: async (justification) => {
        if (!justification) return;
        closeDialog();
        setLoading("close");
        try {
          await closeFiscalYear(fiscalYear.id, justification);
          goBackToList();
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            setDialog({
              title: "Error",
              message: error.detail,
              variant: "alert",
            });
          } else {
            setDialog({
              title: "Error",
              message: "Failed to close fiscal year.",
              variant: "alert",
            });
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
      message: "Provide a justification for reopening.",
      confirmText: "Reopen",
      inputLabel: "Justification",
      onConfirm: async (justification) => {
        if (!justification) return;
        closeDialog();
        setLoading("reopen");
        try {
          await reopenFiscalYear(fiscalYear.id, justification);
          goBackToList();
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            setDialog({
              title: "Error",
              message: error.detail,
              variant: "alert",
            });
          } else {
            setDialog({
              title: "Error",
              message: "Failed to reopen fiscal year.",
              variant: "alert",
            });
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
          danger={dialog.danger}
          onConfirm={dialog.onConfirm}
          onCancel={closeDialog}
        />
      )}

      <div className="space-x-2">
        {canActivate && (
          <button
            onClick={handleActivate}
            disabled={loading === "activate"}
            className="text-blue-600 hover:underline text-sm disabled:opacity-50"
          >
            {loading === "activate" ? "Activating..." : "Activate"}
          </button>
        )}

        {canClose && (
          <button
            onClick={handleClose}
            disabled={loading === "close"}
            className="text-red-600 hover:underline text-sm disabled:opacity-50"
          >
            {loading === "close" ? "Closing..." : "Close"}
          </button>
        )}

        {fiscalYear.status === "CLOSED" && (
          <button
            onClick={handleReopen}
            disabled={loading === "reopen"}
            className="text-yellow-600 hover:underline text-sm disabled:opacity-50"
          >
            {loading === "reopen" ? "Reopening..." : "Reopen"}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={loading === "delete"}
          className="text-red-600 hover:underline text-sm disabled:opacity-50"
        >
          {loading === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>
    </>
  );
}
