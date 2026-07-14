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
  const { deleteFiscalYear, closeFiscalYear, reopenFiscalYear } =
    useFiscalYear();
  const { tenantId, companyId } = useTenantStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  function closeDialog() {
    setDialog(null);
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
          router.push(`/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`);
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
          router.push(`/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`);
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
          const reopened = await reopenFiscalYear(fiscalYear.id, justification);
          console.log("reopened:", reopened);
          router.push(`/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`);
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
        {fiscalYear.status === "OPEN" && (
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
