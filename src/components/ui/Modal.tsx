"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Lock body scroll — works on desktop and most Android
      document.body.style.overflow = "hidden";
      // iOS Safari fix: also lock position to prevent bounce scroll bleed-through
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Restore body scroll and position
      const top = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      // Restore scroll position after unlocking
      if (top) {
        window.scrollTo(0, -parseInt(top || "0", 10));
      }
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop — touch-action:none stops iOS scroll bleed */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-fade-in touch-none"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative w-full rounded-2xl bg-background-card border border-border shadow-2xl overflow-hidden",
          sizeStyles[size],
          "animate-fade-in"
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 md:px-6 md:py-4 border-b border-border bg-background-card/80 backdrop-blur sticky top-0 z-10">
            <h2 className="text-base md:text-lg font-semibold text-foreground">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-foreground-subtle hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Cerrar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Body – uses most of the viewport height, overscroll-contain stops scroll chaining to page behind */}
        <div className="px-4 py-4 md:px-6 overflow-y-auto overscroll-contain max-h-[75dvh]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
