"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/quest-ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
export default function ConfirmActionButton({ href, requireConfirm = false, confirmTitle = "確認", confirmMessage, confirmLabel = "続行する", cancelLabel = "キャンセル", confirmVariant = "default", confirmClassName, variant = "default", size = "sm", className, ariaLabel, onConfirm, children, disabled = false }) { const router = useRouter(); const [open, setOpen] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState(""); const busy = useRef(false); async function confirm() { if (busy.current)
    return; busy.current = true; setPending(true); setError(""); try {
    await onConfirm?.();
    setOpen(false);
    if (href)
        router.push(href);
}
catch (e) {
    setError(e.message || "処理に失敗しました。もう一度お試しください。");
}
finally {
    busy.current = false;
    setPending(false);
} } return <><Button type="button" size={size} variant={variant} className={className} aria-label={ariaLabel} disabled={disabled || pending || Boolean(className?.includes("pointer-events-none"))} onClick={() => { if (requireConfirm) {
    setError("");
    setOpen(true);
}
else if (onConfirm) {
    confirm();
}
else
    router.push(href); }}>{children}</Button>{!open && error && <p role="alert" className="action-error">{error}</p>}<AlertDialog open={open} onOpenChange={v => { if (!pending)
    setOpen(v); }}><AlertDialogContent className="guild-dialog"><AlertDialogHeader><p className="eyebrow">GUILD CONFIRMATION</p><AlertDialogTitle className="font-serif text-xl">{confirmTitle}</AlertDialogTitle><AlertDialogDescription>{confirmMessage || "内容を確認して続行してください。"}</AlertDialogDescription></AlertDialogHeader>{error && <p role="alert" className="action-error">{error}</p>}<AlertDialogFooter><AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel><Button type="button" variant={confirmVariant} className={confirmClassName} onClick={confirm} disabled={pending}>{pending ? "処理中…" : confirmLabel}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog></>; }
