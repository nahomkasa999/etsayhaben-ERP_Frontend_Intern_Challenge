"use client";

import { useState } from "react";

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
  danger?: boolean;
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
  danger = false,
}: Props) {
  const [inputValue, setInputValue] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold">{title}</h2>
        <p className="mb-4 text-sm text-gray-600">{message}</p>

        {inputLabel && (
          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              {inputLabel}
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              autoFocus
            />
          </label>
        )}

        <div className="flex justify-end gap-3">
          {variant === "alert" ? (
            <button
              onClick={onCancel}
              className={`rounded px-4 py-2 text-sm text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              OK
            </button>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {cancelText}
              </button>
              <button
                onClick={() => onConfirm?.(inputValue)}
                className={`rounded px-4 py-2 text-sm text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {confirmText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
