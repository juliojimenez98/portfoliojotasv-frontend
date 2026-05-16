'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { createSubscription, updateSubscription, deleteSubscription } from '@/actions/subscriptions';
import type { IAccount } from '@/types/account';
import { formatCurrency } from '@/lib/utils';

interface SubscriptionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: IAccount[];
  subscriptions: any[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  streaming: '🎬 Streaming',
  music: '🎵 Música',
  software: '💻 Software',
  gaming: '🎮 Gaming',
  cloud: '☁️ Nube',
  fitness: '🏋️ Fitness',
  news: '📰 Noticias',
  productivity: '⚡ Productividad',
  other: '📁 Otro',
};

const currencyOptions = [
  { value: 'CLP', label: 'CLP — Peso Chileno' },
  { value: 'USD', label: 'USD — Dólar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'DOP', label: 'DOP — Peso Dominicano' },
];

const cycleOptions = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
];

const categoryOptions = Object.entries(CATEGORY_EMOJIS).map(([value, label]) => ({
  value,
  label,
}));

export default function SubscriptionManagementModal({
  isOpen,
  onClose,
  accounts,
  subscriptions,
}: SubscriptionManagementModalProps) {
  const [form, setForm] = useState({
    name: '',
    amount: '',
    currency: 'CLP',
    billingCycle: 'monthly',
    billingDay: '15',
    accountId: accounts.length > 0 ? accounts[0]._id : '',
    category: 'streaming',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    if (accounts.length > 0 && !form.accountId) {
      setForm((prev) => ({ ...prev, accountId: accounts[0]._id }));
    }
  }, [accounts, form.accountId]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const accountOptions = accounts.map((a) => ({
    value: a._id,
    label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      amount: '',
      currency: 'CLP',
      billingCycle: 'monthly',
      billingDay: '15',
      accountId: accounts.length > 0 ? accounts[0]._id : '',
      category: 'streaming',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
      isActive: true,
    });
    setEditingId(null);
    setError('');
  };

  const startEdit = (sub: any) => {
    setEditingId(sub._id);
    setForm({
      name: sub.name,
      amount: sub.amount.toString(),
      currency: sub.currency || 'CLP',
      billingCycle: sub.billingCycle,
      billingDay: sub.billingDay.toString(),
      accountId: sub.accountId,
      category: sub.category || 'streaming',
      startDate: new Date(sub.startDate).toISOString().split('T')[0],
      notes: sub.notes || '',
      isActive: sub.isActive ?? true,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    const numAmount = parseFloat(form.amount);
    if (!numAmount || numAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }
    if (!form.accountId) {
      setError('Selecciona una cuenta para el cobro');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        amount: numAmount,
        currency: form.currency,
        billingCycle: form.billingCycle,
        billingDay: parseInt(form.billingDay, 10),
        accountId: form.accountId,
        category: form.category,
        startDate: new Date(form.startDate),
        nextBillingDate: new Date(), // pre-save hook will compute exact next date
        notes: form.notes.trim() || undefined,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateSubscription(editingId, payload);
      } else {
        await createSubscription(payload);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta suscripción?')) {
      try {
        await deleteSubscription(id);
        if (editingId === id) resetForm();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar la suscripción');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de Suscripciones" size="lg">
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2 animate-fade-in">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Create / Edit Form */}
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-background-elevated border border-border space-y-5 animate-fade-in shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              {editingId ? (
                <>
                  <span className="text-primary">✏️</span> Editar Suscripción
                </>
              ) : (
                <>
                  <span className="text-secondary">✨</span> Crear Nueva Suscripción
                </>
              )}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg"
              >
                + Nuevo modo crear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Netflix, Spotify, AWS..."
            />

            <Select
              label="Cuenta de cobro *"
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              options={accountOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Monto *"
              name="amount"
              type="number"
              step={form.currency === 'CLP' ? '1' : '0.01'}
              min={form.currency === 'CLP' ? '1' : '0.01'}
              value={form.amount}
              onChange={handleChange}
              placeholder={form.currency === 'CLP' ? '0' : '0.00'}
            />

            <Select
              label="Moneda"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              options={currencyOptions}
            />

            <Select
              label="Categoría"
              name="category"
              value={form.category}
              onChange={handleChange}
              options={categoryOptions}
            />
          </div>

          {/* Billing configuration - Beautifully aligned */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-background border border-border/80 shadow-inner">
            <Select
              label="Frecuencia *"
              name="billingCycle"
              value={form.billingCycle}
              onChange={handleChange}
              options={cycleOptions}
            />

            <Input
              label="Día de cobro *"
              name="billingDay"
              type="number"
              min="1"
              max="31"
              value={form.billingDay}
              onChange={handleChange}
              placeholder="1 al 31"
            />

            <Input
              label="Fecha inicio *"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <Input
              label="Notas (opcional)"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Detalles adicionales..."
            />

            <div className="flex items-center h-[42px] px-4 rounded-lg bg-background border border-border/80 gap-3 shadow-sm hover:border-border-hover transition-colors">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer select-none flex-1">
                Suscripción Activa
              </label>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${form.isActive ? 'bg-success/10 text-success' : 'bg-foreground-subtle/10 text-foreground-subtle'}`}>
                {form.isActive ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-border/50">
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm} className="text-xs py-2 px-4 shadow-sm">
                Cancelar Edición
              </Button>
            )}
            <Button type="submit" isLoading={loading} className="text-xs py-2 px-5 shadow-lg shadow-primary/20 font-semibold">
              {editingId ? 'Guardar Cambios' : '+ Añadir Suscripción'}
            </Button>
          </div>
        </form>

        {/* Existing Subscriptions List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
            <span>🔄</span> Suscripciones Existentes ({subscriptions.length})
          </h3>
          {subscriptions.length === 0 ? (
            <p className="text-xs text-foreground-subtle text-center py-8 bg-background-elevated rounded-2xl border border-border shadow-inner">
              No hay suscripciones registradas.
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {subscriptions.map((sub) => {
                const accObj = accounts.find((a) => a._id === sub.accountId);
                const isEditing = editingId === sub._id;

                return (
                  <div
                    key={sub._id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isEditing
                        ? 'border-primary bg-primary/10 shadow-md shadow-primary/5'
                        : 'border-border bg-background-elevated hover:border-border-hover shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-lg shadow-sm shrink-0">
                        {CATEGORY_EMOJIS[sub.category]?.split(' ')[0] || '📁'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground">{sub.name}</p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              sub.isActive
                                ? 'bg-success/10 text-success border border-success/20'
                                : 'bg-foreground-subtle/10 text-foreground-subtle border border-border'
                            }`}
                          >
                            {sub.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-subtle mt-0.5">
                          {formatCurrency(sub.amount, sub.currency)} • {sub.billingCycle === 'monthly' ? 'Mensual' : 'Anual'} (Día {sub.billingDay})
                        </p>
                        <p className="text-[11px] text-foreground-muted mt-0.5 font-medium">
                          🏦 Cobro en: <span className="font-semibold text-foreground">{accObj ? accObj.name : 'Cuenta externa'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(sub)}
                        className={`p-2 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 ${
                          isEditing ? 'bg-primary text-white shadow-sm' : 'bg-background hover:bg-white/10 text-foreground-subtle hover:text-foreground border border-border'
                        }`}
                        title="Editar"
                      >
                        ✏️ {isEditing ? 'Editando' : 'Editar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sub._id)}
                        className="p-2 bg-background hover:bg-danger/10 text-foreground-subtle hover:text-danger border border-border rounded-lg transition-colors text-xs"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose} className="px-5 py-2 text-xs font-semibold">
            Cerrar Modal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
