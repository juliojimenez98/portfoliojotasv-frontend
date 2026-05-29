"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { IAccount } from "@/types/account";
import type { ITransaction } from "@/types/transaction";
import { formatCurrency, isCreditCardPayment } from "@/lib/utils";

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: IAccount | null;
  transactions: ITransaction[];
  loading: boolean;
  onUpdateBalance: (newBalance: number) => Promise<void>;
}

export default function AccountDetailModal({
  isOpen,
  onClose,
  account,
  transactions,
  loading,
  onUpdateBalance,
}: AccountDetailModalProps) {
  const [balanceInput, setBalanceInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (account && isOpen) {
      setBalanceInput(account.balance.toString());
      setError("");
      setSuccess(false);
    }
  }, [account, isOpen]);

  if (!account) return null;

  // Summaries
  const incomes = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense" || isCreditCardPayment(t));
  const totalIncomesAmount = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpensesAmount = expenses.reduce((sum, t) => sum + t.amount, 0);
  const netDifference = totalIncomesAmount - totalExpensesAmount;

  const handleSaveBalance = async () => {
    const newBal = parseFloat(balanceInput);
    if (isNaN(newBal)) {
      setError("Por favor ingresa un saldo numérico válido.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      await onUpdateBalance(newBal);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar el saldo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalle de Cuenta: ${account.name}`} size="xl">
      <div className="space-y-6">
        {/* Account Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-background-elevated border border-border">
            <p className="text-xs text-foreground-muted uppercase tracking-wider">Moneda</p>
            <p className="text-lg font-bold text-foreground mt-1">{account.currency}</p>
          </div>
          <div className="p-4 rounded-xl bg-background-elevated border border-border">
            <p className="text-xs text-foreground-muted uppercase tracking-wider">Tipo</p>
            <p className="text-lg font-bold text-foreground mt-1 capitalize">{account.type.replace("_", " ")}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <p className="text-xs text-primary font-bold uppercase tracking-wider">Saldo de la Cuenta</p>
            <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(account.balance, account.currency)}</p>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground">Historial de Movimientos</h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-foreground-muted text-center py-8 bg-background-elevated/50 rounded-xl border border-border/50">
              No hay transacciones registradas para esta cuenta.
            </p>
          ) : (
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border bg-background-elevated text-xs font-bold text-foreground-muted uppercase tracking-wider">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Descripción</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => {
                    const isCC = isCreditCardPayment(txn);
                    const isExpense = txn.type === "expense" || isCC;
                    const dateStr = new Date(txn.date).toLocaleDateString("es-CL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr key={txn._id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                        <td className="py-2.5 px-3 text-foreground-muted whitespace-nowrap">{dateStr}</td>
                        <td className="py-2.5 px-3 font-medium text-foreground">{txn.description}</td>
                        <td className="py-2.5 px-3 text-xs">
                          {isCC ? (
                            <span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger font-medium">
                              Gasto (Abono CC)
                            </span>
                          ) : txn.type === "expense" ? (
                            <span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger font-medium">
                              Gasto
                            </span>
                          ) : txn.type === "income" ? (
                            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                              Ingreso
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              Transferencia
                            </span>
                          )}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                          isExpense ? "text-danger" : txn.type === "income" ? "text-success" : "text-primary"
                        }`}>
                          {isExpense ? "-" : txn.type === "income" ? "+" : "⇄ "}
                          {formatCurrency(txn.amount, account.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals Summary */}
        {!loading && transactions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-background-elevated/70 border border-border">
            <div className="text-center sm:text-left">
              <span className="text-xs text-foreground-muted">Total Ingresos</span>
              <p className="text-base font-bold text-success mt-0.5">+{formatCurrency(totalIncomesAmount, account.currency)}</p>
            </div>
            <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-3">
              <span className="text-xs text-foreground-muted">Total Egresos (Gastos/Abonos)</span>
              <p className="text-base font-bold text-danger mt-0.5">-{formatCurrency(totalExpensesAmount, account.currency)}</p>
            </div>
            <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-3">
              <span className="text-xs text-foreground-muted">Flujo Neto del Historial</span>
              <p className={`text-base font-bold mt-0.5 ${netDifference >= 0 ? "text-success" : "text-danger"}`}>
                {netDifference >= 0 ? "+" : ""}{formatCurrency(netDifference, account.currency)}
              </p>
            </div>
          </div>
        )}

        {/* Adjust Balance Section */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-foreground">Ajustar Saldo Actual</h4>
            <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
              Modifica directamente el balance actual en la base de datos.
              <span className="font-semibold text-primary"> Esta acción NO creará ninguna transacción</span>. Úsala para corregir desfases.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Input
                label="Nuevo Saldo de Cuenta"
                type="number"
                step={account.currency === "CLP" ? "1" : "0.01"}
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="Ej: 250000"
              />
            </div>
            <Button
              onClick={handleSaveBalance}
              isLoading={submitting}
              className="w-full sm:w-auto h-[42px] px-6"
            >
              💾 Actualizar Saldo
            </Button>
          </div>

          {error && (
            <p className="text-xs text-danger font-medium mt-1">⚠️ {error}</p>
          )}
          {success && (
            <p className="text-xs text-success font-medium mt-1">✓ Saldo de cuenta actualizado con éxito.</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="secondary" className="px-8">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
