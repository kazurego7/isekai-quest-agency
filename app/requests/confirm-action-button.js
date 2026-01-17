"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function ConfirmActionButton({
  href,
  requireConfirm = false,
  confirmTitle = "確認",
  confirmMessage,
  confirmLabel = "続行する",
  cancelLabel = "キャンセル",
  confirmVariant = "default",
  confirmClassName,
  variant = "default",
  size = "sm",
  className,
  ariaLabel,
  onConfirm,
  children,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handlePrimaryClick = () => {
    if (requireConfirm) {
      setOpen(true);
      return;
    }
    router.push(href);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    setOpen(false);
    if (onConfirm) {
      onConfirm();
    }
    router.push(href);
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        aria-label={ariaLabel}
        onClick={handlePrimaryClick}
      >
        {children}
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={handleCancel}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl border border-border/70 bg-white/95 p-5 shadow-lg backdrop-blur"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.32em] text-primary">Confirm</p>
              <h2 className="text-lg font-semibold text-ink">{confirmTitle}</h2>
              {confirmMessage ? <p className="text-sm text-muted-foreground">{confirmMessage}</p> : null}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
                {cancelLabel}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={confirmVariant}
                className={confirmClassName}
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
