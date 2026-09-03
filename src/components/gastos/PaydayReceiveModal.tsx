"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input, { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { startPeriod } from "@/actions/periods";
import { depositToAccount } from "@/actions/accounts";
import type { ISpendPeriod } from "@/types/period";
import type { PaydayConfig } from "@/types/user";
import type { IAccount } from "@/types/account";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface PaydayReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePeriod: ISpendPeriod | null;
  onPeriodStarted: (period: ISpendPeriod) => void;
  paydayConfig?: PaydayConfig | null;
  accounts?: IAccount[];
}

const getLocalDateString = (dateInput: Date | string | number = new Date()) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function PaydayReceiveModal({
  isOpen,
  onClose,
  activePeriod,
  onPeriodStarted,
  paydayConfig,
  accounts = [],
}: PaydayReceiveModalProps) {
  const [step, setStep] = useState<"confirm" | "deposit" | "summary">(
    "confirm",
  );
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPeriod, setNewPeriod] = useState<ISpendPeriod | null>(null);

  // Step 2: Deposit fields
  const [depositAccountId, setDepositAccountId] = useState("");
  const [depositDate, setDepositDate] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");

  const todayStr = getLocalDateString(new Date());

  const getLabelForDate = (dateStr: string) => {
    const d = dateStr ? new Date(dateStr + "T12:00:00") : new Date();
    return d
      .toLocaleDateString("es-CL", { month: "long", year: "numeric" })
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const defaultLabel = getLabelForDate(startDate || todayStr);

  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setLabel("");
      setNotes("");
      setStartDate(todayStr);
      setDepositDate(todayStr);
      setError("");
      setNewPeriod(null);
      setDepositAmount(paydayConfig?.amount ? String(paydayConfig.amount) : "");
      setDepositAccountId(
        paydayConfig?.accountId || (accounts.length > 0 ? accounts[0]._id : ""),
      );
      setDepositError("");
    }
  }, [isOpen, paydayConfig, accounts, todayStr]);

  // Sync depositDate with startDate if step 1 date changes
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setDepositDate(val);
  };

  // Quick Date Helpers
  const setQuickDateToday = () => {
    const d = getLocalDateString(new Date());
    handleStartDateChange(d);
  };

  const setQuickDateYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    handleStartDateChange(getLocalDateString(d));
  };

  const setQuickDateLastMonthEnd = () => {
    const now = new Date();
    // Day 0 of current month = last day of previous month
    const d = new Date(now.getFullYear(), now.getMonth(), 0);
    handleStartDateChange(getLocalDateString(d));
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const chosenDate = startDate
        ? new Date(startDate + "T00:00:00")
        : new Date();

      const period = await startPeriod({
        label: label.trim() || defaultLabel,
        startDate: chosenDate.toISOString(),
        notes: notes.trim() || undefined,
      });
      setNewPeriod(period);
      onPeriodStarted(period);

      // Transition to deposit step if accounts exist
      if (accounts.length > 0) {
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
      setDepositError("Ingresa un monto válido mayor a 0");
      return;
    }
    if (!depositAccountId) {
      setDepositError("Selecciona una cuenta de destino");
      return;
    }

    setDepositLoading(true);
    setDepositError("");
    try {
      const finalDate = depositDate
        ? new Date(depositDate + "T00:00:00").toISOString()
        : new Date().toISOString();

      await depositToAccount(
        depositAccountId,
        amount,
        `Sueldo${newPeriod?.label ? ` — ${newPeriod.label}` : ""}`,
        undefined,
        undefined,
        undefined,
        undefined,
        finalDate,
      );
      setStep("summary");
    } catch (err: any) {
      setDepositError(err.message || "Error al realizar el depósito");
    } finally {
      setDepositLoading(false);
    }
  };

  const accountOptions = accounts.map((a) => ({
    value: a._id,
    label: `${a.type === "credit_card" ? "💳" : "🏦"} ${a.name} (${formatCurrency(a.balance, a.currency)})`,
  }));

  const selectedDepositAccount = accounts.find((a) => a._id === depositAccountId);

  // ── Step 1: Confirmation ──────────────────────────────────────────────────
  if (step === "confirm") {
    const formattedSelectedDate = startDate
      ? new Date(startDate + "T12:00:00").toLocaleDateString("es-CL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="💰 Recibí mi Sueldo / Iniciar Período"
        size="lg"
      >
        <div className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-danger text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Warning Banner */}
          <div className="p-4 rounded-2xl bg-warning/10 border border-warning/25 space-y-1">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>⚠️</span> ¿Confirmas que recibiste tu sueldo?
            </p>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Esto <strong>cerrará el período anterior</strong> y abrirá el nuevo
              ciclo de gastos con las estadísticas actualizadas.
            </p>
          </div>

          {/* Payday config hint */}
          {(!paydayConfig || !paydayConfig.accountId) && (
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 space-y-1.5">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <span>💡</span> Configuración de sueldo
              </p>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Puedes configurar tu día de pago habitual para que el sistema calcule los recordatorios automáticamente.
              </p>
              <Link
                href="/app/gastos/configuracion"
                onClick={onClose}
                className="text-xs font-bold text-primary hover:underline block"
              >
                ⚙️ Configurar Día de Pago habitual
              </Link>
            </div>
          )}

          {/* Active period closing info (if any) */}
          {activePeriod && (
            <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-1.5">
              <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                Período que se cerrará
              </p>
              <p className="text-sm font-semibold text-foreground">
                📁 {activePeriod.label}
              </p>
              <p className="text-xs text-foreground-subtle">
                Inició el:{" "}
                {new Date(activePeriod.startDate).toLocaleDateString("es-CL", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          {/* Date Picker Section */}
          <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <span>📅</span> ¿Cuándo recibiste tu sueldo? *
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={setQuickDateToday}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  startDate === todayStr
                    ? "bg-primary text-white shadow-sm"
                    : "bg-background border border-border text-foreground-muted hover:text-foreground"
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={setQuickDateYesterday}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-background border border-border text-foreground-muted hover:text-foreground transition-all"
              >
                Ayer
              </button>
              <button
                type="button"
                onClick={setQuickDateLastMonthEnd}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-background border border-border text-foreground-muted hover:text-foreground transition-all"
              >
                Fin de mes anterior
              </button>
            </div>

            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />

            {formattedSelectedDate && (
              <p className="text-xs text-primary font-medium capitalize">
                ✨ {formattedSelectedDate}
              </p>
            )}
          </div>

          {/* New period details */}
          <div className="space-y-3">
            <Input
              label="Nombre del período"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={defaultLabel}
            />
            <Input
              label="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sueldo + bono de desempeño"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-2.5"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              isLoading={loading}
              onClick={handleConfirm}
              className="flex-1 py-2.5 font-bold shadow-lg shadow-primary/25"
            >
              💰 Confirmar Sueldo Recibido
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Step 2: Deposit salary ────────────────────────────────────────────────
  if (step === "deposit") {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="💵 Abonar Sueldo a tu Cuenta"
        size="lg"
      >
        <div className="space-y-5">
          {depositError && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-danger text-sm font-medium">
              ⚠️ {depositError}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-success/10 border border-success/20 space-y-1">
            <p className="text-sm font-bold text-success flex items-center gap-2">
              <span>🎉</span> ¡Período iniciado con éxito!
            </p>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Período <strong>{newPeriod?.label}</strong> activo. Puedes ingresar
              el depósito de tu sueldo a continuación o presionar omitir.
            </p>
          </div>

          {/* Account Selection */}
          <div className="space-y-3">
            <Select
              label="Cuenta destino del sueldo *"
              value={depositAccountId}
              onChange={(e) => setDepositAccountId(e.target.value)}
              options={accountOptions}
            />

            {selectedDepositAccount && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-background-elevated border border-border text-xs">
                <span className="text-foreground-muted font-medium">Saldo actual de la cuenta:</span>
                <strong className="text-foreground text-sm font-bold">
                  {formatCurrency(
                    selectedDepositAccount.balance,
                    selectedDepositAccount.currency,
                  )}
                </strong>
              </div>
            )}
          </div>

          {/* Deposit Date */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5 uppercase tracking-wider">
              📅 Fecha del abono / depósito *
            </label>
            <input
              type="date"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5 uppercase tracking-wider">
              Monto del sueldo *
              {paydayConfig?.currency && paydayConfig.currency !== "CLP" && (
                <span className="ml-1 text-primary">
                  ({paydayConfig.currency})
                </span>
              )}
            </label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder={
                paydayConfig?.amount ? String(paydayConfig.amount) : "0"
              }
              className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
              min="1"
            />
            {paydayConfig?.amount && (
              <p className="text-xs text-foreground-subtle mt-1.5">
                Monto configurado habitualmente:{" "}
                <strong>{formatCurrency(paydayConfig.amount, paydayConfig.currency)}</strong>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep("summary")}
              className="flex-1 py-2.5"
            >
              Omitir Abono
            </Button>
            <Button
              type="button"
              isLoading={depositLoading}
              onClick={handleDeposit}
              className="flex-1 py-2.5 font-bold shadow-lg shadow-primary/25"
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
      title="✅ ¡Período Iniciado!"
      size="md"
    >
      <div className="space-y-5 py-2">
        <div className="p-5 rounded-2xl bg-success/10 border border-success/20 text-center space-y-2">
          <p className="text-4xl">🎉</p>
          <p className="text-base font-bold text-success">
            ¡Período registrado correctamente!
          </p>
          <p className="text-sm text-foreground-muted">
            Ya puedes registrar tus gastos correspondientes a{" "}
            <strong className="text-foreground">{newPeriod?.label}</strong>.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" onClick={onClose} className="w-full font-bold py-2.5">
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}
