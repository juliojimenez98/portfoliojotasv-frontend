"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [step, setStep] = useState<"form" | "summary">("form");
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPeriod, setNewPeriod] = useState<ISpendPeriod | null>(null);

  // Deposit fields
  const [shouldDeposit, setShouldDeposit] = useState(true);
  const [depositAccountId, setDepositAccountId] = useState("");
  const [depositDate, setDepositDate] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositedSummary, setDepositedSummary] = useState<{
    amount: number;
    accountName: string;
  } | null>(null);

  const wasOpenRef = useRef(false);
  const todayStr = getLocalDateString(new Date());

  const getLabelForDate = (dateStr: string) => {
    const d = dateStr ? new Date(dateStr + "T12:00:00") : new Date();
    return d
      .toLocaleDateString("es-CL", { month: "long", year: "numeric" })
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const defaultLabel = getLabelForDate(startDate || todayStr);

  // Initialize only when modal opens (prevents background revalidation from resetting step/form)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      setStep("form");
      setLabel("");
      setNotes("");
      setStartDate(todayStr);
      setDepositDate(todayStr);
      setShouldDeposit(accounts.length > 0);
      setDepositAmount(paydayConfig?.amount ? String(paydayConfig.amount) : "");
      setDepositAccountId(
        paydayConfig?.accountId || (accounts.length > 0 ? accounts[0]._id : ""),
      );
      setError("");
      setNewPeriod(null);
      setDepositedSummary(null);
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
    }
  }, [isOpen, paydayConfig, accounts, todayStr]);

  // Sync depositDate with startDate
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const chosenDate = startDate
        ? new Date(startDate + "T00:00:00")
        : new Date();

      const periodLabel = label.trim() || defaultLabel;

      // 1. Start period
      const period = await startPeriod({
        label: periodLabel,
        startDate: chosenDate.toISOString(),
        notes: notes.trim() || undefined,
      });

      setNewPeriod(period);
      onPeriodStarted(period);

      // 2. Deposit salary if enabled
      let depositDone = false;
      let depositAmountNum = 0;
      let depositAccountName = "";

      if (shouldDeposit && depositAccountId) {
        const amount = Number(
          depositAmount.replace(/\./g, "").replace(",", "."),
        );
        if (amount > 0) {
          const finalDepositDate = depositDate
            ? new Date(depositDate + "T00:00:00").toISOString()
            : chosenDate.toISOString();

          await depositToAccount(
            depositAccountId,
            amount,
            `Sueldo${periodLabel ? ` — ${periodLabel}` : ""}`,
            undefined,
            undefined,
            undefined,
            undefined,
            finalDepositDate,
          );

          const targetAcc = accounts.find((a) => a._id === depositAccountId);
          depositDone = true;
          depositAmountNum = amount;
          depositAccountName = targetAcc?.name || "Cuenta seleccionada";
        }
      }

      setDepositedSummary(
        depositDone
          ? { amount: depositAmountNum, accountName: depositAccountName }
          : null,
      );

      setStep("summary");
    } catch (err: any) {
      setError(err.message || "Error al registrar el sueldo y período");
    } finally {
      setLoading(false);
    }
  };

  const accountOptions = accounts.map((a) => ({
    value: a._id,
    label: `${a.type === "credit_card" ? "💳" : "🏦"} ${a.name} (${formatCurrency(a.balance, a.currency)})`,
  }));

  const selectedDepositAccount = accounts.find(
    (a) => a._id === depositAccountId,
  );

  // ── Step 1: Complete Form ──────────────────────────────────────────────────
  if (step === "form") {
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
        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Active period closing info (if any) */}
          {activePeriod && (
            <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-1.5">
              <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                Período que se cerrará
              </p>
              <p className="text-sm font-semibold text-foreground">
                📁 {activePeriod.label}
              </p>
              <div className="text-xs text-foreground-subtle flex items-center gap-2 flex-wrap">
                <span>
                  Sueldo recibido:{" "}
                  <strong className="text-foreground">
                    {new Date(activePeriod.startDate).toLocaleDateString(
                      "es-CL",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </strong>
                </span>
                {activePeriod.createdAt && (
                  <span
                    className="text-[10px] text-foreground-subtle/80 bg-background px-1.5 py-0.5 rounded border border-border inline-flex items-center gap-1"
                    title={`Registrado en la app: ${new Date(activePeriod.createdAt).toLocaleString("es-CL")}`}
                  >
                    <span>🕒 Reg:</span>{" "}
                    {new Date(activePeriod.createdAt).toLocaleDateString(
                      "es-CL",
                      { day: "2-digit", month: "2-digit", year: "2-digit" },
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Date Picker Section */}
          <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <span>📅</span> ¿Cuándo recibiste tu sueldo? *
              </label>
              <span className="text-[10px] text-foreground-subtle bg-background px-2 py-0.5 rounded-full border border-border">
                🕒 Reg: Hoy
              </span>
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

          {/* Salary Deposit Section */}
          {accounts.length > 0 && (
            <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={shouldDeposit}
                    onChange={(e) => setShouldDeposit(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/30 border-border"
                  />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    💵 Abonar sueldo a una cuenta
                  </span>
                </label>
                <span className="text-[10px] text-foreground-subtle bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                  Recomendado
                </span>
              </div>

              {shouldDeposit && (
                <div className="space-y-3 pt-1 animate-fade-in">
                  <Select
                    label="Cuenta destino *"
                    value={depositAccountId}
                    onChange={(e) => setDepositAccountId(e.target.value)}
                    options={accountOptions}
                  />

                  {selectedDepositAccount && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border text-xs">
                      <span className="text-foreground-muted font-medium">
                        Saldo actual de la cuenta:
                      </span>
                      <strong className="text-foreground text-sm font-bold">
                        {formatCurrency(
                          selectedDepositAccount.balance,
                          selectedDepositAccount.currency,
                        )}
                      </strong>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5 uppercase tracking-wider">
                      Monto a abonar *
                      {paydayConfig?.currency &&
                        paydayConfig.currency !== "CLP" && (
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
                        paydayConfig?.amount
                          ? String(paydayConfig.amount)
                          : "Ej: 1500000"
                      }
                      className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                      min="1"
                    />
                    {paydayConfig?.amount && (
                      <p className="text-xs text-foreground-subtle mt-1.5">
                        Monto configurado habitualmente:{" "}
                        <strong>
                          {formatCurrency(
                            paydayConfig.amount,
                            paydayConfig.currency,
                          )}
                        </strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5 uppercase tracking-wider">
                      📅 Fecha del abono / depósito
                    </label>
                    <input
                      type="date"
                      value={depositDate}
                      onChange={(e) => setDepositDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

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
              type="submit"
              isLoading={loading}
              className="flex-1 py-2.5 font-bold shadow-lg shadow-primary/25"
            >
              {shouldDeposit && depositAmount
                ? "💰 Confirmar y Abonar Sueldo"
                : "🚀 Confirmar Sueldo Recibido"}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  // ── Step 2: Success Summary ───────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✅ ¡Período y Sueldo Registrados!"
      size="md"
    >
      <div className="space-y-5 py-2">
        <div className="p-5 rounded-2xl bg-success/10 border border-success/20 text-center space-y-2">
          <p className="text-4xl">🎉</p>
          <p className="text-base font-bold text-success">
            ¡Período registrado correctamente!
          </p>
          <p className="text-sm text-foreground-muted">
            Nuevo período{" "}
            <strong className="text-foreground">{newPeriod?.label}</strong>{" "}
            iniciado.
          </p>
        </div>

        {depositedSummary && (
          <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-1.5 text-xs">
            <p className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>💵</span> Abono de Sueldo Realizado
            </p>
            <div className="flex justify-between items-center pt-1">
              <span className="text-foreground-muted">Cuenta:</span>
              <span className="font-semibold text-foreground">
                🏦 {depositedSummary.accountName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-muted">Monto abonado:</span>
              <span className="font-bold text-success text-sm">
                +{formatCurrency(depositedSummary.amount)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            onClick={onClose}
            className="w-full font-bold py-2.5 shadow-lg shadow-primary/25"
          >
            ✨ Entendido / Ir al Dashboard
          </Button>
        </div>
      </div>
    </Modal>
  );
}
