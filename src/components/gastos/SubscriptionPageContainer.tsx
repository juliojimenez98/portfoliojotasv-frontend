"use client";

import React, { useState } from "react";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SubscriptionManagementModal from "./SubscriptionManagementModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { formatCurrency, cn } from "@/lib/utils";
import { SUBSCRIPTION_CATEGORY_EMOJIS } from "@/lib/gastos-constants";
import type { IAccount } from "@/types/account";
import type { ITransaction } from "@/types/transaction";
import { createTransaction } from "@/actions/transactions";

interface SubscriptionPageContainerProps {
  subscriptions: any[];
  accounts: IAccount[];
  cost: { monthlyTotal: number; yearlyTotal: number; count: number };
  currentMonthTransactions?: ITransaction[];
}

export default function SubscriptionPageContainer({
  subscriptions,
  accounts,
  cost,
  currentMonthTransactions = [],
}: SubscriptionPageContainerProps) {
  const [subModal, setSubModal] = useState<{
    open: boolean;
    editing: any | null;
  }>({ open: false, editing: null });
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [chargeModalSub, setChargeModalSub] = useState<any | null>(null);

  const activeSubs = subscriptions.filter((s) => s.isActive);
  const inactiveSubs = subscriptions.filter((s) => !s.isActive);

  // Check if a subscription has been paid this month based on existing transactions
  const isPaidThisMonth = (subId: string) => {
    return currentMonthTransactions.some((t) => t.subscriptionId === subId);
  };

  const handleOpenChargeModal = (sub: any) => {
    if (!sub.accountId) {
      alert(
        "Esta suscripción no tiene una cuenta vinculada. Edítala para asignarle una.",
      );
      return;
    }
    setChargeModalSub(sub);
  };

  const handleRegisterCharge = async () => {
    if (!chargeModalSub) return;

    try {
      setIsProcessingId(chargeModalSub._id);
      await createTransaction({
        accountId: chargeModalSub.accountId,
        subscriptionId: chargeModalSub._id,
        type: "expense",
        category: chargeModalSub.category || "software",
        amount: chargeModalSub.amount,
        date: new Date().toISOString(),
        description: `Cobro de Suscripción: ${chargeModalSub.name}`,
        currency: chargeModalSub.currency || "CLP",
      });
      setChargeModalSub(null);
    } catch (error) {
      console.error("Error registrando cobro:", error);
      alert("Ocurrió un error al registrar el cobro.");
    } finally {
      setIsProcessingId(null);
    }
  };

  const getChargeModalContent = () => {
    if (!chargeModalSub)
      return { title: "", message: "", variant: "primary" as const };
    const isAlreadyPaid = isPaidThisMonth(chargeModalSub._id);

    if (isAlreadyPaid) {
      return {
        title: "Suscripción ya cobrada",
        message: `Parece que ya registraste un gasto para "${chargeModalSub.name}" este mes. ¿Estás seguro de que deseas registrarlo nuevamente?`,
        variant: "warning" as const,
        confirmText: "Sí, cobrar de nuevo",
      };
    }
    return {
      title: "Registrar Cobro",
      message: `Se registrará un gasto por ${formatCurrency(chargeModalSub.amount, chargeModalSub.currency)} en el mes actual correspondiente a la suscripción "${chargeModalSub.name}".`,
      variant: "primary" as const,
      confirmText: "Registrar Gasto",
    };
  };

  const modalContent = getChargeModalContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Suscripciones
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Gestiona tus gastos recurrentes
          </p>
        </div>
        <button
          onClick={() => setSubModal({ open: true, editing: null })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
        >
          + Nueva Suscripción
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Costo Mensual</CardTitle>
            <span className="text-xl">📅</span>
          </CardHeader>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatCurrency(cost.monthlyTotal)}
          </p>
        </Card>
        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Costo Anual</CardTitle>
            <span className="text-xl">📆</span>
          </CardHeader>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatCurrency(cost.yearlyTotal)}
          </p>
        </Card>
        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Activas</CardTitle>
            <span className="text-xl">✅</span>
          </CardHeader>
          <p className="text-2xl font-bold text-foreground mt-1">
            {activeSubs.length} / {subscriptions.length}
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            {inactiveSubs.length} inactivas
          </p>
        </Card>
      </div>

      {/* List */}
      <Card variant="glass">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">
            Todas las suscripciones
          </h3>
        </CardHeader>
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sin suscripciones
            </h3>
            <p className="text-sm text-foreground-muted">
              Agrega tus suscripciones recurrentes para llevar control de tus
              gastos fijos.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {subscriptions.map((sub) => {
              const accObj = accounts.find((a) => a._id === sub.accountId);
              const isProcessing = isProcessingId === sub._id;
              const isPaid = isPaidThisMonth(sub._id);

              return (
                <div
                  key={sub._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background-elevated hover:border-border-hover transition-all shadow-sm gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary-light shrink-0 shadow-inner">
                      {SUBSCRIPTION_CATEGORY_EMOJIS[sub.category] ?? "📁"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">
                          {sub.name}
                        </p>
                        <span className="text-xs text-foreground-subtle">
                          · Día {sub.billingDay}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-xs text-foreground-subtle capitalize">
                          {sub.category}
                        </span>
                        <span className="text-foreground-subtle">·</span>
                        <span className="text-xs text-foreground-subtle">
                          {sub.billingCycle === "monthly" ? "Mensual" : "Anual"}
                        </span>
                        <span className="text-foreground-subtle">·</span>
                        <span className="text-xs text-foreground-muted">
                          🏦 {accObj ? accObj.name : "Externa"}
                        </span>
                        {isPaid && (
                          <>
                            <span className="text-foreground-subtle">·</span>
                            <span className="text-xs font-bold text-success/80">
                              Pagado este mes
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:ml-auto">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(sub.amount, sub.currency)}
                      </p>
                    </div>
                    <Badge
                      variant={sub.isActive ? "success" : "danger"}
                      dot
                      className="hidden sm:inline-flex"
                    >
                      {sub.isActive ? "Activa" : "Inactiva"}
                    </Badge>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 border-l border-border pl-4">
                      {sub.isActive && (
                        <button
                          onClick={() => handleOpenChargeModal(sub)}
                          disabled={isProcessing}
                          className={cn(
                            "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed",
                            isPaid
                              ? "bg-warning/10 text-warning hover:bg-warning hover:text-white"
                              : "bg-success/10 text-success hover:bg-success hover:text-white",
                          )}
                          title="Registrar como gasto de este mes"
                        >
                          {isProcessing ? "⏳" : "💳"}{" "}
                          <span className="hidden md:inline">
                            {isPaid ? "Cobrar Nuevo" : "Se cobró"}
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setSubModal({ open: true, editing: sub })
                        }
                        className="p-1.5 text-foreground-subtle hover:text-primary transition-colors rounded-lg hover:bg-white/5"
                        title="Editar suscripción"
                      >
                        ⚙️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <SubscriptionManagementModal
        isOpen={subModal.open}
        onClose={() => setSubModal({ open: false, editing: null })}
        accounts={accounts}
        editingSub={subModal.editing}
        onSaved={() => setSubModal({ open: false, editing: null })}
      />

      <ConfirmModal
        isOpen={!!chargeModalSub}
        onClose={() => setChargeModalSub(null)}
        onConfirm={handleRegisterCharge}
        title={modalContent.title}
        message={modalContent.message}
        confirmText={modalContent.confirmText}
        variant={modalContent.variant}
        isLoading={!!isProcessingId}
      />
    </div>
  );
}
