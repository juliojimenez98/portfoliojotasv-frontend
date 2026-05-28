"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input, { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { IAccount } from "@/types/account";
import { formatCurrency } from "@/lib/utils";
import { convertToCLP } from "@/actions/currency";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    accountId: string,
    amount: number,
    description?: string,
    internationalAmountUSD?: number,
    exchangeRate?: number,
    fromAccountId?: string,
  ) => Promise<void>;
  account: IAccount | null;
  accounts?: IAccount[];
}

export default function DepositModal({
  isOpen,
  onClose,
  onSubmit,
  account,
  accounts = [],
}: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // International payment state
  const [payingInternational, setPayingInternational] = useState(false);
  const [intlUSD, setIntlUSD] = useState("");
  const [fetchingRate, setFetchingRate] = useState(false);
  const [autoRate, setAutoRate] = useState<number | null>(null);
  const [customRate, setCustomRate] = useState("");
  const [useCustomRate, setUseCustomRate] = useState(false);

  const hasInternational =
    account?.type === "credit_card" && !!account?.internationalCreditLimit;

  const handleFetchRate = async () => {
    const usdAmt = parseFloat(intlUSD);
    if (!usdAmt || usdAmt <= 0) return;
    setFetchingRate(true);
    setError("");
    try {
      const data = await convertToCLP(usdAmt, "USD");
      setAutoRate(data.exchangeRate);
      setAmount(Math.round(data.convertedAmount).toString());
      setCustomRate(data.exchangeRate.toString());
    } catch {
      setError(
        "No se pudo obtener la tasa automática. Ingresa la tasa manualmente.",
      );
      setUseCustomRate(true);
    } finally {
      setFetchingRate(false);
    }
  };

  const effectiveRate = useCustomRate
    ? parseFloat(customRate) || 0
    : (autoRate ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Ingresa un monto válido mayor a 0");
      return;
    }
    if (!account) return;

    if (account.type === "credit_card" && !fromAccountId) {
      setError("Selecciona la cuenta de origen para realizar el pago");
      return;
    }

    if (payingInternational) {
      const usdAmt = parseFloat(intlUSD);
      if (!usdAmt || usdAmt <= 0) {
        setError("Ingresa el monto en USD");
        return;
      }
      const rate = effectiveRate;
      if (!rate || rate <= 0) {
        setError("Ingresa la tasa de cambio");
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      if (payingInternational) {
        const usdAmt = parseFloat(intlUSD);
        await onSubmit(
          account._id,
          numAmount,
          description || undefined,
          usdAmt,
          effectiveRate,
          fromAccountId || undefined,
        );
      } else {
        await onSubmit(
          account._id,
          numAmount,
          description || undefined,
          undefined,
          undefined,
          fromAccountId || undefined,
        );
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || "Error al abonar");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setDescription("");
    setError("");
    setPayingInternational(false);
    setIntlUSD("");
    setAutoRate(null);
    setCustomRate("");
    setUseCustomRate(false);
    setFromAccountId("");
    onClose();
  };

  if (!account) return null;

  const usdNum = parseFloat(intlUSD) || 0;
  const clpNum = parseFloat(amount) || 0;
  const implicitRate =
    usdNum > 0 && clpNum > 0 ? Math.round(clpNum / usdNum) : 0;

  // Cálculos de porcentajes precisos para cupos (mostrando un decimal cuando corresponda)
  const nationalSpentPct = account.creditLimit
    ? Math.min(
        100,
        Math.max(0, ((account.creditLimit - account.balance) / account.creditLimit) * 100)
      )
    : 0;
  const nationalAvailablePct = 100 - nationalSpentPct;

  const intlSpentPct = account.internationalCreditLimit
    ? Math.min(
        100,
        Math.max(
          0,
          ((account.internationalCreditLimit - (account.internationalBalance ?? 0)) /
            account.internationalCreditLimit) *
            100
        )
      )
    : 0;
  const intlAvailablePct = 100 - intlSpentPct;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        account.type === "credit_card"
          ? "Pagar/Abonar Tarjeta"
          : "Abonar a Cuenta"
      }
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account info */}
        <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0 animate-pulse"
              style={{ backgroundColor: account.color }}
            >
              {account.type === "credit_card" ? "💳" : account.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-base truncate">
                {account.name}
              </p>
              <p className="text-[10px] text-foreground-subtle uppercase tracking-wider font-semibold">
                {account.type === "credit_card" ? "Tarjeta de Crédito" : "Cuenta corriente/vista"}
              </p>
            </div>
          </div>

          {account.type === "credit_card" ? (
            <div className="space-y-4 pt-2 border-t border-border/50">
              {/* Cupo Nacional */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground-muted">🇨🇱 Cupo Nacional ({account.currency})</span>
                  <span className="text-[10px] font-medium text-foreground-subtle">
                    Límite: {formatCurrency(account.creditLimit || 0, account.currency)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-background/40 p-2.5 rounded-xl border border-border/30">
                  <div>
                    <span className="text-[10px] text-foreground-subtle block uppercase font-medium">Gastado</span>
                    <span className="text-sm font-extrabold text-danger">
                      {formatCurrency(Math.max(0, (account.creditLimit || 0) - account.balance), account.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground-subtle block uppercase font-medium">Disponible</span>
                    <span className="text-sm font-extrabold text-success">
                      {formatCurrency(account.balance, account.currency)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {account.creditLimit ? (
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-border/40 overflow-hidden relative">
                      <div 
                        className="h-full bg-danger rounded-full transition-all duration-500"
                        style={{ width: `${nationalSpentPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-foreground-subtle">
                      <span>{nationalSpentPct.toFixed(1).replace(/\.0$/, "")}% gastado</span>
                      <span>{nationalAvailablePct.toFixed(1).replace(/\.0$/, "")}% disp.</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Cupo Internacional */}
              {hasInternational && (
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground-muted">🌐 Cupo Internacional (USD)</span>
                    <span className="text-[10px] font-medium text-foreground-subtle">
                      Límite: USD {(account.internationalCreditLimit || 0).toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-background/40 p-2.5 rounded-xl border border-border/30">
                    <div>
                      <span className="text-[10px] text-foreground-subtle block uppercase font-medium">Gastado</span>
                      <span className="text-sm font-extrabold text-danger">
                        USD {Math.max(0, (account.internationalCreditLimit || 0) - (account.internationalBalance ?? 0)).toLocaleString("es-CL", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-foreground-subtle block uppercase font-medium">Disponible</span>
                      <span className="text-sm font-extrabold text-success">
                        USD {(account.internationalBalance ?? 0).toLocaleString("es-CL", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {account.internationalCreditLimit ? (
                    <div className="space-y-1">
                      <div className="w-full h-2 rounded-full bg-border/40 overflow-hidden relative">
                        <div 
                          className="h-full bg-danger rounded-full transition-all duration-500"
                          style={{ width: `${intlSpentPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-foreground-subtle">
                        <span>{intlSpentPct.toFixed(1).replace(/\.0$/, "")}% gastado</span>
                        <span>{intlAvailablePct.toFixed(1).replace(/\.0$/, "")}% disp.</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs">
              <span className="text-foreground-muted font-medium">Balance actual:</span>
              <span className="font-extrabold text-foreground text-sm">
                {formatCurrency(account.balance, account.currency)}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Source Account Selection (only for credit cards) */}
        {account.type === "credit_card" && (
          <Select
            label="Cuenta de origen (desde dónde pagas) *"
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            options={accounts
              .filter((a) => a.type !== "credit_card" && a.isActive)
              .map((a) => ({
                value: a._id,
                label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
              }))}
          />
        )}

        {/* International toggle */}
        {hasInternational && account.type === "credit_card" && (
          <button
            type="button"
            onClick={() => {
              setPayingInternational((v) => !v);
              setAmount("");
              setIntlUSD("");
              setAutoRate(null);
              setUseCustomRate(false);
              setError("");
            }}
            className="flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
          >
            <span
              className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] transition-colors ${payingInternational ? "bg-primary border-primary text-white" : "border-border"}`}
            >
              {payingInternational ? "✓" : ""}
            </span>
            🌐 Pagar cobro internacional (en USD)
          </button>
        )}

        {/* International payment flow */}
        {payingInternational ? (
          <div className="space-y-3 p-3.5 rounded-xl bg-primary/8 border border-primary/25">
            <p className="text-xs text-foreground-muted">
              Ingresa el monto del cobro en USD y te calculamos cuánto te cobró
              el banco en CLP.
            </p>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="Monto en USD *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={intlUSD}
                  onChange={(e) => {
                    setIntlUSD(e.target.value);
                    setAutoRate(null);
                    setAmount("");
                  }}
                  placeholder="Ej: 29.99"
                />
              </div>
              <button
                type="button"
                onClick={handleFetchRate}
                disabled={fetchingRate || !intlUSD || parseFloat(intlUSD) <= 0}
                className="mb-0.5 px-3 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                {fetchingRate ? "…" : "🔄 Obtener tasa"}
              </button>
            </div>

            {autoRate && !useCustomRate && (
              <div className="p-3 rounded-xl bg-background-elevated border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                    Tasa automática
                  </span>
                  <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-mono">
                    1 USD = {autoRate.toLocaleString("es-CL")} CLP
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(parseFloat(amount))}
                </p>
                <p className="text-xs text-foreground-subtle">
                  USD {intlUSD} × {autoRate.toLocaleString("es-CL")}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setUseCustomRate((v) => !v)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {useCustomRate
                ? "← Usar tasa automática"
                : "✏️ El banco me cobró diferente — ingresar tasa real"}
            </button>

            {useCustomRate && (
              <div className="space-y-2">
                <Input
                  label="Tasa de cambio real (CLP por 1 USD) *"
                  type="number"
                  step="1"
                  min="1"
                  value={customRate}
                  onChange={(e) => {
                    setCustomRate(e.target.value);
                    const r = parseFloat(e.target.value) || 0;
                    const u = parseFloat(intlUSD) || 0;
                    if (r > 0 && u > 0) setAmount(Math.round(u * r).toString());
                  }}
                  placeholder="Ej: 940"
                />
                {implicitRate > 0 && (
                  <p className="text-xs text-foreground-muted">
                    Monto en CLP:{" "}
                    <span className="font-bold text-foreground">
                      {formatCurrency(clpNum)}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Show final CLP if we have it */}
            {clpNum > 0 && usdNum > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-success/8 border border-success/20">
                <span className="text-xs text-foreground-muted">
                  Cupo a restaurar
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">
                    +USD {usdNum.toFixed(2)}
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    {formatCurrency(clpNum)} CLP
                  </p>
                  {effectiveRate > 0 && (
                    <p className="text-[10px] text-foreground-subtle font-mono">
                      1 USD = {effectiveRate.toLocaleString("es-CL")} CLP
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Input
              label={
                account.type === "credit_card"
                  ? "Monto a pagar/abonar (CLP) *"
                  : "Monto a abonar *"
              }
              type="number"
              step={account.currency === "CLP" ? "1" : "0.01"}
              min={account.currency === "CLP" ? "1" : "0.01"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={account.currency === "CLP" ? "0" : "0.00"}
            />

            {amount && parseFloat(amount) > 0 && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm">
                <p className="text-foreground-muted">
                  {account.type === "credit_card"
                    ? "Nuevo cupo disponible:"
                    : "Nuevo balance:"}
                </p>
                <p className="text-lg font-bold text-green-400">
                  {formatCurrency(
                    account.balance + parseFloat(amount),
                    account.currency,
                  )}
                </p>
              </div>
            )}
          </>
        )}

        <Input
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            payingInternational ? "Ej: Netflix USD" : "Ej: Pago de nómina"
          }
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            disabled={
              payingInternational
                ? !intlUSD || !amount || !effectiveRate
                : !amount
            }
            className="flex-1"
          >
            💰 {payingInternational ? "Registrar pago USD" : "Abonar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
