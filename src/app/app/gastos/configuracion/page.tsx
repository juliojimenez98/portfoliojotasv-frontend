"use client";

import React, { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getPeriods, deletePeriod } from "@/actions/periods";
import { getPaydayConfig } from "@/actions/users";
import { getAccounts } from "@/actions/accounts";
import { getSubscriptions, deleteSubscription } from "@/actions/subscriptions";
import type { ISpendPeriod } from "@/types/period";
import type { PaydayConfig } from "@/types/user";
import type { IAccount } from "@/types/account";
import { formatCurrency } from "@/lib/utils";
import { paydaySummary } from "@/components/gastos/PaydayConfigModal";
import PaydayConfigModal from "@/components/gastos/PaydayConfigModal";
import SubscriptionManagementModal from "@/components/gastos/SubscriptionManagementModal";
import { SUBSCRIPTION_CATEGORY_EMOJIS } from "@/lib/gastos-constants";

const CATEGORY_EMOJIS = SUBSCRIPTION_CATEGORY_EMOJIS;

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<"payday" | "subscriptions" | "history">(
    "payday",
  );
  const [periods, setPeriods] = useState<ISpendPeriod[]>([]);
  const [paydayConfig, setPaydayConfig] = useState<PaydayConfig | null>(null);
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaydayModal, setShowPaydayModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [subModal, setSubModal] = useState<{
    open: boolean;
    editing: any | null;
  }>({ open: false, editing: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, cfg, accs, subs] = await Promise.all([
        getPeriods(),
        getPaydayConfig(),
        getAccounts(),
        getSubscriptions(),
      ]);
      setPeriods(p);
      setPaydayConfig(cfg);
      setAccounts(accs);
      setSubscriptions(subs);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeletePeriod = async (id: string) => {
    if (!window.confirm("¿Eliminar este período del historial?")) return;
    setDeletingId(id);
    try {
      await deletePeriod(id);
      setPeriods((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm("¿Eliminar esta suscripción?")) return;
    setDeletingId(id);
    try {
      await deleteSubscription(id);
      setSubscriptions((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const activePeriod = periods.find((p) => p.status === "active");
  const closedPeriods = periods.filter((p) => p.status === "closed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          ⚙️ Configuración
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Día de pago e historial de períodos laborales
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-background-elevated rounded-xl border border-border max-w-md">
        {(
          [
            { key: "payday", label: "💳 Día de Pago" },
            { key: "subscriptions", label: "🔄 Suscripciones" },
            { key: "history", label: "📋 Historial" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── TAB: Payday ── */}
          {tab === "payday" && (
            <div className="space-y-4 max-w-lg">
              {paydayConfig ? (
                <Card variant="gradient" padding="lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold text-foreground">
                          {paydayConfig.label || "Día de Pago"}
                        </p>
                        <span className="text-[11px] bg-success/15 text-success px-2 py-0.5 rounded-full font-bold">
                          Configurado ✓
                        </span>
                      </div>
                      <p className="text-sm text-foreground-muted">
                        {paydaySummary(paydayConfig)}
                      </p>
                      {paydayConfig.amount && (
                        <p className="text-sm text-success font-semibold">
                          {formatCurrency(
                            paydayConfig.amount,
                            paydayConfig.currency,
                          )}{" "}
                          esperado
                          {paydayConfig.accountId &&
                          accounts.find(
                            (a) => a._id === paydayConfig?.accountId,
                          )
                            ? ` · ${accounts.find((a) => a._id === paydayConfig?.accountId)?.name}`
                            : ""}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setShowPaydayModal(true)}
                    >
                      Editar
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card variant="glass" padding="lg">
                  <div className="text-center space-y-4 py-4">
                    <p className="text-5xl">💳</p>
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        No has configurado tu día de pago
                      </p>
                      <p className="text-sm text-foreground-muted mt-1">
                        Configura cuándo recibes tu sueldo para un mejor control
                        de tus períodos de gasto.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowPaydayModal(true)}
                      className="w-full sm:w-auto"
                    >
                      Configurar ahora
                    </Button>
                  </div>
                </Card>
              )}

              {/* Active period info */}
              <Card variant="glass" padding="lg">
                <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">
                  Período Activo
                </p>
                {activePeriod ? (
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">
                      {activePeriod.label}
                    </p>
                    <p className="text-sm text-foreground-subtle">
                      Desde:{" "}
                      {new Date(activePeriod.startDate).toLocaleDateString(
                        "es-CL",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                    {activePeriod.notes && (
                      <p className="text-sm text-foreground-muted italic mt-1">
                        {activePeriod.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-foreground-subtle">
                    Sin período activo. Presiona{" "}
                    <span className="font-semibold text-foreground">
                      💰 Recibí mi Pago
                    </span>{" "}
                    en el Dashboard para iniciar uno.
                  </p>
                )}
              </Card>
            </div>
          )}

          {/* ── TAB: Subscriptions ── */}
          {tab === "subscriptions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground-muted">
                  {subscriptions.length} suscripcion
                  {subscriptions.length !== 1 ? "es" : ""} registradas
                </p>
                <Button
                  onClick={() => setSubModal({ open: true, editing: null })}
                  className="text-xs py-2 shadow-lg shadow-primary/20"
                >
                  + Nueva
                </Button>
              </div>

              {subscriptions.length === 0 ? (
                <Card variant="glass" padding="lg">
                  <div className="text-center py-10 space-y-3">
                    <p className="text-5xl">🔄</p>
                    <p className="text-base font-semibold text-foreground">
                      Sin suscripciones
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Agrega tus servicios de suscripción para hacer seguimiento
                      de su costo mensual.
                    </p>
                    <Button
                      onClick={() => setSubModal({ open: true, editing: null })}
                      className="w-full sm:w-auto"
                    >
                      Agregar primera suscripción
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscriptions.map((sub) => {
                    const accObj = accounts.find(
                      (a) => a._id === sub.accountId,
                    );
                    return (
                      <Card key={sub._id} variant="gradient" padding="lg">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-xl shadow-sm shrink-0">
                              {CATEGORY_EMOJIS[sub.category] ?? "📁"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {sub.name}
                              </p>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sub.isActive ? "bg-success/10 text-success" : "bg-foreground-subtle/10 text-foreground-subtle"}`}
                              >
                                {sub.isActive ? "Activa" : "Pausada"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setSubModal({ open: true, editing: sub })
                              }
                              className="p-1.5 rounded-lg bg-background border border-border hover:border-primary/50 hover:text-primary text-foreground-subtle transition-colors text-sm"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscription(sub._id)}
                              disabled={deletingId === sub._id}
                              className="p-1.5 rounded-lg bg-background border border-border hover:border-danger/50 hover:text-danger text-foreground-subtle transition-colors text-sm"
                              title="Eliminar"
                            >
                              {deletingId === sub._id ? "..." : "🗑️"}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-foreground">
                            {formatCurrency(sub.amount, sub.currency)}
                            <span className="text-xs font-normal text-foreground-muted ml-1">
                              /{sub.billingCycle === "monthly" ? "mes" : "año"}
                            </span>
                          </p>
                          <p className="text-xs text-foreground-subtle">
                            Día {sub.billingDay} de cada{" "}
                            {sub.billingCycle === "monthly" ? "mes" : "año"}
                          </p>
                          {accObj && (
                            <p className="text-xs text-foreground-muted">
                              🏦 {accObj.name}
                            </p>
                          )}
                          {sub.notes && (
                            <p className="text-xs text-foreground-muted italic mt-1 border-t border-border/50 pt-1">
                              {sub.notes}
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: History ── */}
          {tab === "history" && (
            <div className="space-y-4">
              {closedPeriods.length === 0 ? (
                <Card variant="glass" padding="lg">
                  <div className="text-center py-10 space-y-3">
                    <p className="text-5xl">📋</p>
                    <p className="text-base font-semibold text-foreground">
                      Sin historial aún
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Los períodos cerrados aparecerán aquí con su resumen de
                      gastos.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {closedPeriods.map((period) => {
                    const snap = period.snapshot;
                    const start = new Date(period.startDate).toLocaleDateString(
                      "es-CL",
                      {
                        day: "2-digit",
                        month: "short",
                      },
                    );
                    const end = period.endDate
                      ? new Date(period.endDate).toLocaleDateString("es-CL", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <Card key={period._id} variant="gradient" padding="lg">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <div>
                            <p className="text-base font-bold text-foreground">
                              {period.label}
                            </p>
                            <p className="text-xs text-foreground-subtle mt-0.5">
                              {start} → {end}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePeriod(period._id)}
                            disabled={deletingId === period._id}
                            className="text-foreground-subtle hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-danger/10"
                            title="Eliminar del historial"
                          >
                            {deletingId === period._id ? (
                              <span className="text-xs">...</span>
                            ) : (
                              "🗑️"
                            )}
                          </button>
                        </div>

                        {/* Snapshot stats */}
                        {snap ? (
                          <>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="text-center p-2 rounded-xl bg-danger/10 border border-danger/15">
                                <p className="text-[10px] text-foreground-subtle mb-0.5">
                                  Gastos
                                </p>
                                <p className="text-sm font-bold text-danger">
                                  {formatCurrency(snap.totalExpenses)}
                                </p>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-success/10 border border-success/15">
                                <p className="text-[10px] text-foreground-subtle mb-0.5">
                                  Ingresos
                                </p>
                                <p className="text-sm font-bold text-success">
                                  {formatCurrency(snap.totalIncome)}
                                </p>
                              </div>
                              <div
                                className={`text-center p-2 rounded-xl border ${
                                  snap.netSavings >= 0
                                    ? "bg-primary/10 border-primary/15"
                                    : "bg-warning/10 border-warning/15"
                                }`}
                              >
                                <p className="text-[10px] text-foreground-subtle mb-0.5">
                                  Ahorro
                                </p>
                                <p
                                  className={`text-sm font-bold ${
                                    snap.netSavings >= 0
                                      ? "text-primary"
                                      : "text-warning"
                                  }`}
                                >
                                  {snap.netSavings >= 0 ? "+" : ""}
                                  {formatCurrency(snap.netSavings)}
                                </p>
                              </div>
                            </div>

                            {snap.topCategories.length > 0 && (
                              <div className="space-y-1.5 mb-3">
                                <p className="text-[10px] font-bold text-foreground-subtle uppercase tracking-wider">
                                  Top categorías
                                </p>
                                {snap.topCategories.slice(0, 3).map((cat) => (
                                  <div
                                    key={cat.category}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <span className="text-foreground-muted capitalize">
                                      {cat.category}
                                    </span>
                                    <span className="font-semibold text-foreground">
                                      {formatCurrency(cat.amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className="text-xs text-foreground-subtle">
                              {snap.transactionCount} movimiento
                              {snap.transactionCount !== 1 ? "s" : ""}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-foreground-subtle italic">
                            Sin estadísticas
                          </p>
                        )}

                        {period.notes && (
                          <p className="text-xs text-foreground-muted italic border-t border-border/50 mt-3 pt-3">
                            {period.notes}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* PaydayConfigModal */}
      <PaydayConfigModal
        isOpen={showPaydayModal}
        onClose={() => setShowPaydayModal(false)}
        accounts={accounts}
        currentConfig={paydayConfig}
        onSaved={(cfg) => {
          setPaydayConfig(cfg);
          setShowPaydayModal(false);
        }}
      />

      {/* SubscriptionManagementModal */}
      <SubscriptionManagementModal
        isOpen={subModal.open}
        onClose={() => setSubModal({ open: false, editing: null })}
        accounts={accounts}
        editingSub={subModal.editing}
        onSaved={() => {
          setSubModal({ open: false, editing: null });
          load();
        }}
      />
    </div>
  );
}
