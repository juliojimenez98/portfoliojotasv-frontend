'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AccountFormModal from '@/components/gastos/AccountFormModal';
import DepositModal from '@/components/gastos/DepositModal';
import TransferModal from '@/components/gastos/TransferModal';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  depositToAccount,
  transferBetweenAccounts,
} from '@/actions/accounts';
import { formatCurrency } from '@/lib/utils';
import type { IAccount } from '@/types/account';

const typeLabels: Record<string, string> = {
  credit_card: 'Tarjeta de Crédito',
  debit: 'Débito',
  cash: 'Efectivo',
  savings: 'Ahorros',
  other: 'Otro',
};

const typeIcons: Record<string, string> = {
  credit_card: '💳',
  debit: '🏦',
  cash: '💵',
  savings: '🏆',
  other: '📁',
};

const refreshLabels: Record<string, string> = {
  automatic: '⚡ Automático',
  manual: '✋ Manual',
};

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const handleDeposit = async (accountId: string, amount: number, description?: string) => {
    await depositToAccount(accountId, amount, description);
    await fetchAccounts();
  };

  const handleTransfer = async (fromId: string, toId: string, amount: number, description?: string) => {
    await transferBetweenAccounts(fromId, toId, amount, description);
    await fetchAccounts();
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cuentas</h1>
          <p className="text-sm text-foreground-muted mt-1">Gestiona tus cuentas financieras</p>
        </div>
        <div className="flex gap-2">
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
          <Button onClick={openCreate}>+ Nueva Cuenta</Button>
        </div>
      </div>

      {/* Balance Total */}
      <Card variant="glow" padding="lg">
        <div className="text-center">
          <CardTitle className="text-center">Balance Total</CardTitle>
          <p className="text-4xl md:text-5xl font-bold gradient-text mt-2">{formatCurrency(total)}</p>
          <p className="text-sm text-foreground-subtle mt-2">{accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} activa{accounts.length !== 1 ? 's' : ''}</p>
        </div>
      </Card>

      {/* Accounts grid */}
      {accounts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏦</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay cuentas aún</h3>
          <p className="text-sm text-foreground-muted mb-4">Crea tu primera cuenta para empezar a registrar gastos.</p>
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
                    {typeIcons[acc.type] || '📁'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-foreground truncate">{acc.name}</p>
                    <p className="text-xs text-foreground-subtle">
                      {typeLabels[acc.type] || acc.type}
                      {acc.bankName && ` · ${acc.bankName}`}
                    </p>
                  </div>
                </div>
                <Badge variant={acc.isActive ? 'success' : 'danger'} dot>
                  {acc.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </CardHeader>

              {/* Description */}
              {acc.description && (
                <p className="text-xs text-foreground-subtle mt-2 line-clamp-2">{acc.description}</p>
              )}

              {/* Balance */}
              <div className="mt-4">
                <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-1">Balance</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(acc.balance)}</p>
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
    </div>
  );
}
