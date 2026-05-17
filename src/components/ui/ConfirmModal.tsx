"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "success" | "warning";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-danger/10 text-danger hover:bg-danger hover:text-white";
      case "success":
        return "bg-success/10 text-success hover:bg-success hover:text-white";
      case "warning":
        return "bg-warning/10 text-warning hover:bg-warning hover:text-white";
      case "primary":
      default:
        return "bg-primary/10 text-primary hover:bg-primary hover:text-white";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop clickable area for closing */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-background border border-border w-full max-w-sm rounded-t-3xl md:rounded-2xl shadow-xl overflow-hidden animate-slide-up md:animate-fade-in">
        {/* Drag handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-foreground-muted leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-6 py-4 pb-8 md:pb-4 bg-background-elevated border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()}`}
          >
            {isLoading ? "Cargando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
