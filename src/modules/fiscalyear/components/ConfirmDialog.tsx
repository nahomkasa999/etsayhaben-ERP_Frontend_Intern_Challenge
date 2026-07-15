"use client";

import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

type Props = {
  open: boolean;
  title: string;
  message: string;
  onConfirm?: (inputValue?: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "confirm" | "alert";
  inputLabel?: string;
  inputMultiline?: boolean;
  danger?: boolean;
  isPending?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "confirm",
  inputLabel,
  inputMultiline = false,
  danger = false,
  isPending = false,
}: Props) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!open) setInputValue("");
  }, [open]);

  const requiresInput = !!inputLabel;
  const canConfirm = !requiresInput || inputValue.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        {inputLabel && (
          <div className="grid gap-2 py-2">
            <Label htmlFor="confirm-dialog-input">{inputLabel}</Label>
            {inputMultiline ? (
              <Textarea
                id="confirm-dialog-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputLabel}
                disabled={isPending}
                autoFocus
              />
            ) : (
              <Input
                id="confirm-dialog-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputLabel}
                disabled={isPending}
                autoFocus
              />
            )}
          </div>
        )}

        <DialogFooter className="mx-0 mb-0 grid w-full grid-cols-2 gap-4 border-0 bg-transparent p-0 sm:justify-stretch">
          {variant === "alert" ? (
            <Button
              className="w-full col-span-2"
              onClick={onCancel}
              variant={danger ? "destructive" : "default"}
            >
              OK
            </Button>
          ) : (
            <>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                className="w-full"
                variant={danger ? "destructive" : "default"}
                disabled={isPending || !canConfirm}
                onClick={() => onConfirm?.(inputValue)}
              >
                {isPending ? `${confirmText}...` : confirmText}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
