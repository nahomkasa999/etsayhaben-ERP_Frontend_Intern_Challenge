"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { useFiscalYear } from "../hooks/useFiscalyear";
import { useTenantStore } from "../store/FiscalYearStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { FiscalYearApiError } from "../types";
import type { FiscalYear } from "../types";

type DialogConfig = {
  title: string;
  message: string;
  variant?: "confirm" | "alert";
  confirmText?: string;
  inputLabel?: string;
  inputMultiline?: boolean;
  danger?: boolean;
  warning?: string;
  onConfirm?: (inputValue?: string) => void;
};

type Props = {
  fiscalYear: FiscalYear;
};

export function FiscalYearActions({ fiscalYear }: Props) {
  const router = useRouter();
  const {
    deleteFiscalYear,
    activateFiscalYear,
    closeFiscalYear,
    reopenFiscalYear,
  } = useFiscalYear();
  const { tenantId, companyId } = useTenantStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  const canActivate =
    !fiscalYear.isActive &&
    (fiscalYear.status === "OPEN" || fiscalYear.status === "REOPENED");

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
      message: `Are you sure you want to delete "${fiscalYear.fiscalYearName}"? This action cannot be undone.`,
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        closeDialog();
        setLoading("delete");
        try {
          await deleteFiscalYear(fiscalYear.id);
          router.push(`/fiscalyear`);
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            showError(error.message);
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
      message: `Provide a justification for closing "${fiscalYear.fiscalYearName}".`,
      warning:
        "This fiscal year has already been reopened once. If you close it now, it cannot be reopened again.",
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
          router.push(`/fiscalyear`);
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            showError(error.message);
          } else {
            showError("Failed to close fiscal year.");
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
      message: `Make "${fiscalYear.fiscalYearName}" the active fiscal year? The currently active fiscal year will be deactivated.`,
      confirmText: "Activate",
      onConfirm: async () => {
        closeDialog();
        setLoading("activate");
        try {
          await activateFiscalYear(fiscalYear.id);
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            showError(error.message);
          } else {
            showError("Failed to activate fiscal year.");
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
      message: `Provide a justification for reopening "${fiscalYear.fiscalYearName}".`,
      warning:
        "Reopening is allowed only once. After this fiscal year is closed again, it cannot be reopened a second time.",
      confirmText: "Reopen",
      danger: true,
      inputLabel: "Justification",
      inputMultiline: true,
      onConfirm: async (justification) => {
        if (!justification?.trim()) return;
        closeDialog();
        setLoading("reopen");
        try {
          await reopenFiscalYear(fiscalYear.id, justification);
          router.push(`/fiscalyear`);
        } catch (error) {
          if (error instanceof FiscalYearApiError) {
            showError(error.message);
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
          warning={dialog.warning}
        />
      )}

      {canActivate && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Activation</CardTitle>
            <CardDescription>
              Only one fiscal year can be active at a time. Activate this one to
              use it for transactions.
            </CardDescription>
          </CardHeader>
          <CardFooter className="border-0 bg-transparent">
            <Button
              className="w-full"
              onClick={handleActivate}
              disabled={loading === "activate"}
            >
              {loading === "activate" ? (
                <>
                  <Loader2 className="animate-spin" />
                  Activating...
                </>
              ) : (
                "Activate"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="max-w-xl border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Closing, reopening, or deleting a fiscal year can affect dependent
            records. Proceed with care.
            {fiscalYear.reopenedAt && fiscalYear.status !== "REOPENED" ? (
              <span className="mt-2 block font-medium text-warning">
                This fiscal year has already been reopened once and cannot be
                reopened again.
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-0 bg-transparent">
          <div className="grid w-full grid-cols-2 gap-4">
            {(fiscalYear.status === "OPEN" ||
              (!!fiscalYear.reopenedAt && fiscalYear.status !== "CLOSED")) && (
              <Button
                variant="destructive"
                className="w-full"
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

            {fiscalYear.status === "CLOSED" && !fiscalYear.reopenedAt && (
              <Button
                variant="outline"
                className="w-full"
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
              className="w-full"
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
        </CardFooter>
      </Card>
    </>
  );
}
