'use client';

import React, { useState } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SubscriptionManagementModal from './SubscriptionManagementModal';
import { formatCurrency } from '@/lib/utils';
import type { IAccount } from '@/types/account';

interface SubscriptionPageContainerProps {
  subscriptions: any[];
  accounts: IAccount[];
  cost: { monthlyTotal: number; yearlyTotal: number; count: number };
}

export default function SubscriptionPageContainer({ subscriptions, accounts, cost }: SubscriptionPageContainerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeSubs = subscriptions.filter((s) => s.isActive);
  const inactiveSubs = subscriptions.filter((s) => !s.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Suscripciones</h1>
          <p className="text-sm text-foreground-muted mt-1">Gestiona tus gastos recurrentes</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
        >
          + Nueva Suscripción
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <Card variant="gradient">
          <CardHeader><CardTitle>Costo Mensual</CardTitle><span className="text-xl">📅</span></CardHeader>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(cost.monthlyTotal)}</p>
        </Card>
        <Card variant="gradient">
          <CardHeader><CardTitle>Costo Anual</CardTitle><span className="text-xl">📆</span></CardHeader>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(cost.yearlyTotal)}</p>
        </Card>
        <Card variant="gradient">
          <CardHeader><CardTitle>Activas</CardTitle><span className="text-xl">✅</span></CardHeader>
          <p className="text-2xl font-bold text-foreground mt-1">{activeSubs.length} / {subscriptions.length}</p>
          <p className="text-xs text-foreground-subtle mt-1">{inactiveSubs.length} inactivas</p>
        </Card>
      </div>

      {/* List */}
      <Card variant="glass">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">Todas las suscripciones</h3>
        </CardHeader>
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Sin suscripciones</h3>
            <p className="text-sm text-foreground-muted">Agrega tus suscripciones recurrentes para llevar control de tus gastos fijos.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {subscriptions.map((sub) => {
              const accObj = accounts.find((a) => a._id === sub.accountId);
              return (
                <div key={sub._id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background-elevated hover:border-border-hover transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary-light shrink-0 shadow-inner">
                      {sub.category === 'streaming' ? '🎬' : sub.category === 'music' ? '🎵' : sub.category === 'software' ? '💻' : sub.category === 'gaming' ? '🎮' : sub.category === 'cloud' ? '☁️' : sub.category === 'fitness' ? '🏋️' : '📁'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{sub.name}</p>
                        <span className="text-xs text-foreground-subtle">· Día {sub.billingDay}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-foreground-subtle capitalize">{sub.category}</span>
                        <span className="text-foreground-subtle">·</span>
                        <span className="text-xs text-foreground-subtle">{sub.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</span>
                        <span className="text-foreground-subtle">·</span>
                        <span className="text-xs text-foreground-muted">🏦 {accObj ? accObj.name : 'Cuenta externa'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(sub.amount, sub.currency)}</p>
                    </div>
                    <Badge variant={sub.isActive ? 'success' : 'danger'} dot>
                      {sub.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <button
                      onClick={() => setIsOpen(true)}
                      className="p-2 text-foreground-subtle hover:text-primary transition-colors rounded-lg hover:bg-white/5"
                      title="Gestionar"
                    >
                      ⚙️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <SubscriptionManagementModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        accounts={accounts}
        subscriptions={subscriptions}
      />
    </div>
  );
}
