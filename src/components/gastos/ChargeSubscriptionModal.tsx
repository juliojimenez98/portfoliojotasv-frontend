"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { convertToCLP } from "@/actions/currency";

interface ChargeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountCLP: number, exchangeRate: number) => Promise<void>;
  sub: {
    name: string;
    amount: number;
    currency: string;
  } | null;
}

export default function ChargeSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  sub,
}: ChargeSubscriptionModalProps) {
  const [loadingRate, setLoadingRate] = useState(false);
  const [autoRate, setAutoRate] = useState<number | null>(null);
  const [autoAmountCLP, setAutoAmountCLP] = useState<number | null>(null);
  const [customAmountCLP, setCustomAmountCLP] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isForeign = sub && sub.currency !== "CLP";

  // Fetch conversion rate when modal opens for a foreign-currency sub
  useEffect(() => {
    if (!isOpen || !sub) return;

    setError("");
    setIsCustom(false);
    setCustomAmountCLP("");
    setAutoRate(null);
    setAutoAmountCLP(null);

    if (isForeign) {
      setLoadingRate(true);
      convertToCLP(sub.amount, sub.currency)
        .then((data) => {
          setAutoRate(data.exchangeRate);
          setAutoAmountCLP(data.convertedAmount);
          setCustomAmountCLP(data.convertedAmount.toString());
        })
        .catch(() => {
          setError(
            "No se pudo obtener la tasa de cambio automática. Ingresa el monto manualmente.",
          );
          setIsCustom(true);
        })
        .finally(() => setLoadingRate(false));
    }
  }, [isOpen, sub]);

  if (!sub) return null;

  const finalAmountCLP = isCustom
    ? parseInt(customAmountCLP) || 0
    : (autoAmountCLP ?? sub.amount);

  const effectiveRate =
    isCustom && sub.amount > 0
      ? Math.round((finalAmountCLP / sub.amount) * 100) / 100
      : (autoRate ?? 1);

  const handleConfirm = async () => {
    if (finalAmountCLP <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onConfirm(finalAmountCLP, effectiveRate);
    } catch (e: any) {
      setError(e.message || "Error al registrar el cobro");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💳 Registrar Cobro"
      size="sm"
    >
      <div className="space-y-4">
        {/* Sub info */}
        <div className="p-3 rounded-xl bg-background-elevated border border-border">
          <p className="text-sm font-bold text-foreground">{sub.name}</p>
          <p className="text-xs text-foreground-muted mt-0.5">
            Precio configurado:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(sub.amount, sub.currency)}
            </span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* CLP amount block */}
        {isForeign ? (
          <div className="space-y-3">
            {/* Auto conversion */}
            {loadingRate ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background-elevated border border-border">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                <span className="text-sm text-foreground-muted">
                  Obteniendo tasa de cambio…
                </span>
              </div>
            ) : autoRate && !isCustom ? (
              <div className="p-3 rounded-xl bg-primary/8 border border-primary/25 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                    Conversión automática
                  </span>
                  <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-mono">
                    1 {sub.currency} = {autoRate.toLocaleString("es-CL")} CLP
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(autoAmountCLP!)}
                </p>
                <p className="text-xs text-foreground-muted">
                  {sub.amount} {sub.currency} ×{" "}
                  {autoRate.toLocaleString("es-CL")}
                </p>
              </div>
            ) : null}

            {/* Toggle custom */}
            <button
              type="button"
              onClick={() => setIsCustom((v) => !v)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {isCustom
                ? "← Usar conversión automática"
                : "✏️ El cobro fue distinto — ingresar monto real"}
            </button>

            {isCustom && (
              <div className="space-y-2">
                <Input
                  label={`Monto cobrado en CLP *`}
                  type="number"
                  step="1"
                  min="1"
                  value={customAmountCLP}
                  onChange={(e) => setCustomAmountCLP(e.target.value)}
                  placeholder="Ej: 9450"
                />
                {customAmountCLP && parseInt(customAmountCLP) > 0 && (
                  <p className="text-xs text-foreground-muted">
                    Tasa implícita:{" "}
                    <span className="font-mono font-semibold text-foreground">
                      1 {sub.currency} ={" "}
                      {(parseInt(customAmountCLP) / sub.amount).toLocaleString(
                        "es-CL",
                        { maximumFractionDigits: 2 },
                      )}{" "}
                      CLP
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* CLP subscription — show simple confirmation */
          <div className="p-3 rounded-xl bg-success/8 border border-success/20">
            <p className="text-xs text-foreground-muted">
              Se registrará un gasto de
            </p>
            <p className="text-2xl font-bold text-foreground mt-0.5">
              {formatCurrency(sub.amount)}
            </p>
          </div>
        )}

        {/* Summary line */}
        {!loadingRate && finalAmountCLP > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-danger/8 border border-danger/20">
            <span className="text-sm text-foreground-muted">
              Gasto a registrar
            </span>
            <span className="text-lg font-bold text-danger">
              -{formatCurrency(finalAmountCLP)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || loadingRate || finalAmountCLP <= 0}
            className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-bold hover:bg-danger/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Registrando…
              </>
            ) : (
              "✓ Confirmar Cobro"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
