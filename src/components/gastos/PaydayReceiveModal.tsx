"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { startPeriod } from "@/actions/periods";
import { depositToAccount } from "@/actions/accounts";
import type { ISpendPeriod } from "@/types/period";
import type { PaydayConfig } from "@/types/user";
import type { IAccount } from "@/types/account";
import { formatCurrency } from "@/lib/utils";

interface PaydayReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePeriod: ISpendPeriod | null;
  onPeriodStarted: (period: ISpendPeriod) => void;
  paydayConfig?: PaydayConfig | null;
  accounts?: IAccount[];
}

export default function PaydayReceiveModal({
  isOpen,
  onClose,
  activePeriod,
  onPeriodStarted,
  paydayConfig,
  accounts = [],
}: PaydayReceiveModalProps) {
  const [step, setStep] = useState<"confirm" | "deposit" | "summary">("confirm");
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPeriod, setNewPeriod] = useState<ISpendPeriod | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

  const defaultLabel = (startDate ? new Date(startDate + "T12:00:00") : now)
    .toLocaleDateString("es-CL", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());

  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setLabel("");
      setNotes("");
      setStartDate(todayStr);
      setError("");
      setNewPeriod(null);
      setDepositAmount(paydayConfig?.amount ? String(paydayConfig.amount) : "");
      setDepositError("");
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const period = await startPeriod({
        label: label.trim() || defaultLabel,
        startDate: startDate
          ? new Date(startDate + "T00:00:00").toISOString()
          : now.toISOString(),
        notes: notes.trim() || undefined,
      });
      setNewPeriod(period);
      onPeriodStarted(period);
      // If paydayConfig has an associated account, go to deposit step
      if (paydayConfig?.accountId) {
        setStep("deposit");
      } else {
        setStep("summary");
      }
    } catch (err: any) {
      setError(err.message || "Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount.replace(/\./g, "").replace(",", "."));
    if (!amount || amount <= 0) {
      setDepositError("Ingresa un monto válido");
      return;
    }
    if (!paydayConfig?.accountId) return;
    setDepositLoading(true);
    setDepositError("");
    try {
      await depositToAccount(
        paydayConfig.accountId,
        amount,
        `Sueldo${newPeriod?.label ? ` — ${newPeriod.label}` : ""}`,
      );
      setStep("summary");
    } catch (err: any) {
      setDepositError(err.message || "Error al realizar el depósito");
    } finally {
      setDepositLoading(false);
    }
  };

  // ── Step 1: Confirmation ──────────────────────────────────────────────────
  if (step === "confirm") {
    const snap = activePeriod?.snapshot;
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="💰 Recibí mi Pago"
        size="md"
      >
        <div className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {/* Warning */}
          <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20 space-y-1">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>⚠️</span> ¿Confirmas que recibiste tu pago?
            </p>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Esto <strong>cerrará el período actual</strong> y abrirá uno
              nuevo. Las transacciones <strong>no se eliminan</strong>, quedan
              archivadas en el historial del período que se cierra.
            </p>
          </div>

          {/* Active period summary (if any) */}
          {activePeriod && (
            <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-2">
              <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Período que se cerrará
              </p>
              <p className="text-sm font-semibold text-foreground">
                {activePeriod.label}
              </p>
              <p className="text-xs text-foreground-subtle">
                Desde:{" "}
                {new Date(activePeriod.startDate).toLocaleDateString("es-CL")} →
                Hoy
              </p>
            </div>
          )}

          {/* New period label */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Nuevo período
            </p>
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-1.5">
                ¿Cuándo recibiste el pago?
              </label>
              <input
                type="date"
                value={startDate}
                max={todayStr}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              {startDate !== todayStr && (
                <p className="text-xs text-primary mt-1">
                  El período iniciará desde el{" "}
                  {new Date(startDate + "T12:00:00").toLocaleDateString(
                    "es-CL",
                    { day: "2-digit", month: "long", year: "numeric" },
                  )}
                </p>
              )}
            </div>
            <Input
              label="Nombre del período (opcional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={defaultLabel}
            />
            <Input
              label="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sueldo + bono de mayo"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              isLoading={loading}
              onClick={handleConfirm}
              className="flex-1"
            >
              💰 Confirmar Pago Recibido
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Step 2: Deposit salary ────────────────────────────────────────────────
  if (step === "deposit") {
    const depositAccount = accounts.find(
      (a) => a._id === paydayConfig?.accountId,
    );
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="💵 Abonar Sueldo"
        size="md"
      >
        <div className="space-y-5">
          {depositError && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {depositError}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-success/10 border border-success/20 space-y-1">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>🎉</span> ¡Período iniciado correctamente!
            </p>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Nuevo período <strong>{newPeriod?.label}</strong> activo. Ahora
              puedes abonar tu sueldo para dejar los gastos en $0 de partida.
            </p>
          </div>

          {depositAccount && (
            <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-1">
              <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Cuenta destino
              </p>
              <p className="text-sm font-semibold text-foreground">
                🏦 {depositAccount.name}
              </p>
              <p className="text-xs text-foreground-subtle">
                Saldo actual:{" "}
                {formatCurrency(depositAccount.balance, depositAccount.currency)}
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Monto a abonar
              {paydayConfig?.currency && paydayConfig.currency !== "CLP" && (
                <span className="ml-1 text-primary">({paydayConfig.currency})</span>
              )}
            </label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder={paydayConfig?.amount ? String(paydayConfig.amount) : "0"}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              min="1"
            />
            {paydayConfig?.amount && (
              <p className="text-xs text-foreground-subtle mt-1">
                Monto configurado: {formatCurrency(paydayConfig.amount, paydayConfig.currency)}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep("summary")}
              className="flex-1"
            >
              Omitir
            </Button>
            <Button
              type="button"
              isLoading={depositLoading}
              onClick={handleDeposit}
              className="flex-1"
            >
              💵 Abonar Sueldo
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Step 3: Summary ───────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✅ ¡Período Cerrado!"
      size="md"
    >
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-success/10 border border-success/20 text-center space-y-1">
          <p className="text-3xl">🎉</p>
          <p className="text-base font-bold text-success">
            ¡Nuevo período iniciado!
          </p>
          <p className="text-sm text-foreground-muted">
            Ya puedes empezar a registrar los gastos de{" "}
            <strong>{newPeriod?.label}</strong>
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" onClick={onClose} className="flex-1">
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}
