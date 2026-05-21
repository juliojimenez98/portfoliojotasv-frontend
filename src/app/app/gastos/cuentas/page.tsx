"use client";

import React, { useState, useEffect, useCallback } from "react";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AccountFormModal from "@/components/gastos/AccountFormModal";
import DepositModal from "@/components/gastos/DepositModal";
import TransferModal from "@/components/gastos/TransferModal";
import PaydayConfigModal, {
  paydaySummary,
} from "@/components/gastos/PaydayConfigModal";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  depositToAccount,
  transferBetweenAccounts,
  recalculateBalances,
  previewRoundBalances,
} from "@/actions/accounts";
import { getPaydayConfig } from "@/actions/users";
import type { PaydayConfig } from "@/types/user";

export const dynamic = "force-dynamic";

import { formatCurrency } from "@/lib/utils";
import type { IAccount } from "@/types/account";
import Modal from "@/components/ui/Modal";
const typeLabels: Record<string, string> = {
  credit_card: "Tarjeta de Crédito",
  debit: "Débito",
  cash: "Efectivo",
  savings: "Ahorros",
  other: "Otro",
};

const typeIcons: Record<string, string> = {
  credit_card: "💳",
  debit: "🏦",
  cash: "💵",
  savings: "🏆",
  investment: "📈",
  other: "📁",
};

const refreshLabels: Record<string, string> = {
  automatic: "⚡ Automático",
  manual: "✋ Manual",
};

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showPayday, setShowPayday] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcPreview, setRecalcPreview] = useState<null | {
    items: { accountId: string; name: string; oldBalance: number; newBalance: number; diff: number; hasChange: boolean }[];
    loading: boolean;
    applying: boolean;
  }>(null);

  // Payday config
  const [paydayConfig, setPaydayConfig] = useState<PaydayConfig | null>(null);
  const [paydayLoaded, setPaydayLoaded] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    // Load payday config once
    getPaydayConfig()
      .then((cfg) => setPaydayConfig(cfg))
      .catch(() => {})
      .finally(() => setPaydayLoaded(true));
  }, [fetchAccounts]);

  const total = accounts.reduce((a, c) => a + c.balance, 0);

  // Handlers
  const handleCreate = async (data: any) => {
    await createAccount(data);
    await fetchAccounts();
  };

  const handleUpdate = async (data: any) => {
    if (!selectedAccount) return;
    await updateAccount(selectedAccount._id, data);
    await fetchAccounts();
  };

  const handleDelete = async (id: string) => {
    await deleteAccount(id);
    setDeleteConfirm(null);
    await fetchAccounts();
  };

  const handleDeposit = async (
    accountId: string,
    amount: number,
    description?: string,
  ) => {
    await depositToAccount(accountId, amount, description);
    await fetchAccounts();
  };

  const handleTransfer = async (
    fromId: string,
    toId: string,
    amount: number,
    description?: string,
  ) => {
    await transferBetweenAccounts(fromId, toId, amount, description);
    await fetchAccounts();
  };

  const handleOpenRecalcPreview = async () => {
    setRecalcPreview({ items: [], loading: true, applying: false });
    try {
      const data = await previewRoundBalances();
      setRecalcPreview({ items: data, loading: false, applying: false });
    } catch {
      setRecalcPreview(null);
      alert("Error al obtener la vista previa");
    }
  };

  const handleRecalculate = async () => {
    if (!recalcPreview) return;
    setRecalcPreview((p) => p && ({ ...p, applying: true }));
    try {
      await recalculateBalances();
      await fetchAccounts();
      setRecalcPreview(null);
    } catch {
      alert("Error al corregir balances");
      setRecalcPreview((p) => p && ({ ...p, applying: false }));
    }
  };

  const openEdit = (acc: IAccount) => {
    setSelectedAccount(acc);
    setShowForm(true);
  };

  const openDeposit = (acc: IAccount) => {
    setSelectedAccount(acc);
    setShowDeposit(true);
  };

  const openTransfer = (acc: IAccount) => {
    setSelectedAccount(acc);
    setShowTransfer(true);
  };

  const openCreate = () => {
    setSelectedAccount(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Cuentas
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Gestiona tus cuentas financieras
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {accounts.length >= 2 && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAccount(null);
                setShowTransfer(true);
              }}
            >
              🔄 Transferir
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleOpenRecalcPreview}
            title="Redondea al entero más cercano los balances que tienen decimales por drift de punto flotante"
          >
            🔧 Corregir Balances
          </Button>
          <Button
            variant={paydayConfig ? "secondary" : "outline"}
            onClick={() => setShowPayday(true)}
          >
            {paydayConfig ? "💳 Día de Pago" : "💳 Configurar Sueldo"}
          </Button>
          <Button onClick={openCreate}>+ Nueva Cuenta</Button>
        </div>
      </div>

      {/* Payday prompt banner — shown only if not configured yet */}
      {paydayLoaded && !paydayConfig && accounts.length > 0 && (
        <button
          type="button"
          onClick={() => setShowPayday(true)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary/8 border border-primary/25 hover:bg-primary/12 transition-colors text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
            💳
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">
              ¿Cuándo te pagan el sueldo?
            </p>
            <p className="text-xs text-foreground-muted mt-0.5">
              Configura tu día de pago para un mejor seguimiento de tus
              finanzas. ¡Solo toma un momento!
            </p>
          </div>
          <span className="text-primary text-lg shrink-0">→</span>
        </button>
      )}

      {/* Payday config summary card — shown when configured */}
      {paydayLoaded && paydayConfig && (
        <button
          type="button"
          onClick={() => setShowPayday(true)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-success/8 border border-success/20 hover:bg-success/12 transition-colors text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center text-2xl shrink-0">
            💳
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-foreground">
                {paydayConfig.label || "Día de Pago"}
              </p>
              <span className="text-[10px] bg-success/15 text-success px-2 py-0.5 rounded-full font-bold">
                Configurado ✓
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">
              {paydaySummary(paydayConfig)}
            </p>
            {paydayConfig.amount && (
              <p className="text-xs text-success font-semibold mt-0.5">
                {formatCurrency(paydayConfig.amount, paydayConfig.currency)}{" "}
                esperado
                {paydayConfig.accountId &&
                accounts.find((a) => a._id === paydayConfig?.accountId)
                  ? ` · ${accounts.find((a) => a._id === paydayConfig?.accountId)?.name}`
                  : ""}
              </p>
            )}
          </div>
          <span className="text-foreground-muted text-xs shrink-0 group-hover:text-foreground transition-colors">
            Editar →
          </span>
        </button>
      )}

      {/* Balance Total */}
      <Card variant="glow" padding="lg">
        <div className="text-center">
          <CardTitle className="text-center">Balance Total</CardTitle>
          <p className="text-4xl md:text-5xl font-bold gradient-text mt-2">
            {formatCurrency(total)}
          </p>
          <p className="text-sm text-foreground-subtle mt-2">
            {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""} activa
            {accounts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </Card>

      {/* Accounts grid */}
      {accounts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏦</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No hay cuentas aún
          </h3>
          <p className="text-sm text-foreground-muted mb-4">
            Crea tu primera cuenta para empezar a registrar gastos.
          </p>
          <Button onClick={openCreate}>+ Crear primera cuenta</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
          {accounts.map((acc) => (
            <Card key={acc._id} variant="gradient" hover padding="lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${acc.color}20` }}
                  >
                    {typeIcons[acc.type] || "📁"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-foreground truncate">
                      {acc.name}
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      {typeLabels[acc.type] || acc.type}
                      {acc.bankName && ` · ${acc.bankName}`}
                    </p>
                  </div>
                </div>
                <Badge variant={acc.isActive ? "success" : "danger"} dot>
                  {acc.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </CardHeader>

              {/* Description */}
              {acc.description && (
                <p className="text-xs text-foreground-subtle mt-2 line-clamp-2">
                  {acc.description}
                </p>
              )}

              {/* Balance */}
              <div className="mt-4">
                <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-1">
                  Balance
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(acc.balance)}
                </p>
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-3 mt-3 text-xs text-foreground-subtle">
                <span>{refreshLabels[acc.refreshType] || acc.refreshType}</span>
                <span>·</span>
                <span>{acc.currency}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => openDeposit(acc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                >
                  💰 Abonar
                </button>
                <button
                  onClick={() => openTransfer(acc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  🔄 Transferir
                </button>
                <button
                  onClick={() => openEdit(acc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted bg-background-elevated hover:bg-white/10 transition-colors"
                >
                  ✏️ Editar
                </button>
                {deleteConfirm === acc._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(acc._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(acc._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <AccountFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedAccount(null);
        }}
        onSubmit={selectedAccount ? handleUpdate : handleCreate}
        account={selectedAccount}
      />

      <DepositModal
        isOpen={showDeposit}
        onClose={() => {
          setShowDeposit(false);
          setSelectedAccount(null);
        }}
        onSubmit={handleDeposit}
        account={selectedAccount}
      />

      <TransferModal
        isOpen={showTransfer}
        onClose={() => {
          setShowTransfer(false);
          setSelectedAccount(null);
        }}
        onSubmit={handleTransfer}
        accounts={accounts}
        preselectedAccountId={selectedAccount?._id}
      />

      <PaydayConfigModal
        isOpen={showPayday}
        onClose={() => setShowPayday(false)}
        accounts={accounts}
        currentConfig={paydayConfig}
        onSaved={(cfg) => setPaydayConfig(cfg)}
      />

      {/* Recalculate balances preview modal */}
      <Modal
        isOpen={!!recalcPreview}
        onClose={() => !recalcPreview?.applying && setRecalcPreview(null)}
        title="🔧 Corregir Balances"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 text-sm text-warning">
            <p className="font-bold mb-1">⚠️ ¿Qué hace esto?</p>
            <p className="text-foreground-muted text-xs leading-relaxed">
              Redondea al entero más cercano los balances que tienen decimales
              por errores de punto flotante (ej: <code>14995.0001 → 14995</code>).
              <strong className="text-foreground"> No recalcula desde transacciones</strong> — solo
              elimina la fracción decimal del balance actual.
            </p>
          </div>

          {recalcPreview?.loading ? (
            <div className="flex items-center justify-center py-8 gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-sm text-foreground-muted">Calculando impacto...</span>
            </div>
          ) : (
            <>
              {recalcPreview?.items.filter((i) => i.hasChange).length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm font-semibold text-foreground">Todos los balances ya son enteros</p>
                  <p className="text-xs text-foreground-muted mt-1">No hay nada que corregir.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                    Cambios a aplicar
                  </p>
                  {recalcPreview?.items.map((item) => (
                    <div
                      key={item.accountId}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        item.hasChange
                          ? "border-warning/30 bg-warning/5"
                          : "border-border bg-background-elevated opacity-50"
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-foreground-muted line-through">
                          {formatCurrency(item.oldBalance)}
                        </span>
                        <span className="text-foreground-subtle">→</span>
                        <span className={`font-bold ${item.hasChange ? "text-success" : "text-foreground-muted"}`}>
                          {formatCurrency(item.newBalance)}
                        </span>
                        {item.hasChange && (
                          <span className="text-[10px] bg-warning/15 text-warning px-1.5 py-0.5 rounded-full font-mono">
                            {item.diff > 0 ? "+" : ""}{item.diff.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRecalcPreview(null)}
                  disabled={recalcPreview?.applying}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                {recalcPreview?.items.some((i) => i.hasChange) && (
                  <button
                    onClick={handleRecalculate}
                    disabled={recalcPreview?.applying}
                    className="flex-1 py-2.5 rounded-xl bg-warning text-white text-sm font-bold hover:bg-warning/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {recalcPreview?.applying ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      "✓ Aplicar corrección"
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
