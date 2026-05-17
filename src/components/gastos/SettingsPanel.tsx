"use client";

import React, { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { getPeriods, deletePeriod } from "@/actions/periods";
import { getPaydayConfig } from "@/actions/users";
import type { ISpendPeriod } from "@/types/period";
import type { PaydayConfig } from "@/types/user";
import type { IAccount } from "@/types/account";
import { formatCurrency } from "@/lib/utils";
import { paydaySummary } from "@/components/gastos/PaydayConfigModal";
import PaydayConfigModal from "@/components/gastos/PaydayConfigModal";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: IAccount[];
}

export default function SettingsPanel({
  isOpen,
  onClose,
  accounts,
}: SettingsPanelProps) {
  const [tab, setTab] = useState<"payday" | "history">("payday");
  const [periods, setPeriods] = useState<ISpendPeriod[]>([]);
  const [paydayConfig, setPaydayConfig] = useState<PaydayConfig | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPaydayModal, setShowPaydayModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const [p, cfg] = await Promise.all([getPeriods(), getPaydayConfig()]);
      setPeriods(p);
      setPaydayConfig(cfg);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

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

  const activePeriod = periods.find((p) => p.status === "active");
  const closedPeriods = periods.filter((p) => p.status === "closed");

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="⚙️ Configuración"
        size="lg"
      >
        <div className="space-y-4">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-background-elevated rounded-xl border border-border">
            {(
              [
                { key: "payday", label: "💳 Día de Pago" },
                { key: "history", label: "📋 Historial" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.key
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: Payday ── */}
          {tab === "payday" && (
            <div className="space-y-4">
              {paydayConfig ? (
                <div className="p-4 rounded-2xl bg-success/8 border border-success/20 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">
                          {paydayConfig.label || "Día de Pago"}
                        </p>
                        <span className="text-[10px] bg-success/15 text-success px-2 py-0.5 rounded-full font-bold">
                          Configurado ✓
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted">
                        {paydaySummary(paydayConfig)}
                      </p>
                      {paydayConfig.amount && (
                        <p className="text-xs text-success font-semibold">
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
                      size="sm"
                      onClick={() => setShowPaydayModal(true)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-background-elevated border border-border text-center space-y-3">
                  <p className="text-3xl">💳</p>
                  <p className="text-sm font-semibold text-foreground">
                    No has configurado tu día de pago
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Configura cuándo recibes tu sueldo para tener un mejor
                    control de tus períodos de gasto.
                  </p>
                  <Button
                    onClick={() => setShowPaydayModal(true)}
                    className="w-full"
                  >
                    Configurar ahora
                  </Button>
                </div>
              )}

              {/* Active period info */}
              <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-2">
                <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                  Período Activo
                </p>
                {activePeriod ? (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      {activePeriod.label}
                    </p>
                    <p className="text-xs text-foreground-subtle">
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
                      <p className="text-xs text-foreground-muted italic">
                        {activePeriod.notes}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-foreground-subtle">
                    Sin período activo. Presiona "💰 Recibí mi Pago" en el
                    Dashboard para iniciar uno.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: History ── */}
          {tab === "history" && (
            <div className="space-y-3">
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : closedPeriods.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-3xl">📋</p>
                  <p className="text-sm font-semibold text-foreground">
                    Sin historial aún
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Los períodos cerrados aparecerán aquí con su resumen de
                    gastos.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {closedPeriods.map((period) => {
                    const snap = period.snapshot;
                    const start = new Date(period.startDate).toLocaleDateString(
                      "es-CL",
                      { day: "2-digit", month: "short" },
                    );
                    const end = period.endDate
                      ? new Date(period.endDate).toLocaleDateString("es-CL", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <div
                        key={period._id}
                        className="p-4 rounded-2xl bg-background-elevated border border-border space-y-3"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-foreground">
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
                            className="text-foreground-subtle hover:text-danger transition-colors p-1 rounded"
                            title="Eliminar del historial"
                          >
                            {deletingId === period._id ? "..." : "🗑️"}
                          </button>
                        </div>

                        {/* Snapshot stats */}
                        {snap && (
                          <>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center p-2 rounded-xl bg-danger/10 border border-danger/15">
                                <p className="text-[10px] text-foreground-subtle">
                                  Gastos
                                </p>
                                <p className="text-sm font-bold text-danger">
                                  {formatCurrency(snap.totalExpenses)}
                                </p>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-success/10 border border-success/15">
                                <p className="text-[10px] text-foreground-subtle">
                                  Ingresos
                                </p>
                                <p className="text-sm font-bold text-success">
                                  {formatCurrency(snap.totalIncome)}
                                </p>
                              </div>
                              <div
                                className={`text-center p-2 rounded-xl border ${snap.netSavings >= 0 ? "bg-primary/10 border-primary/15" : "bg-warning/10 border-warning/15"}`}
                              >
                                <p className="text-[10px] text-foreground-subtle">
                                  Ahorro
                                </p>
                                <p
                                  className={`text-sm font-bold ${snap.netSavings >= 0 ? "text-primary" : "text-warning"}`}
                                >
                                  {snap.netSavings >= 0 ? "+" : ""}
                                  {formatCurrency(snap.netSavings)}
                                </p>
                              </div>
                            </div>

                            {/* Top categories */}
                            {snap.topCategories.length > 0 && (
                              <div className="space-y-1">
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

                            <p className="text-[11px] text-foreground-subtle">
                              {snap.transactionCount} movimiento
                              {snap.transactionCount !== 1 ? "s" : ""}
                            </p>
                          </>
                        )}

                        {period.notes && (
                          <p className="text-xs text-foreground-muted italic border-t border-border/50 pt-2">
                            {period.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-1 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Nested PaydayConfigModal */}
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
    </>
  );
}
