'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { IAccount, AccountType, RefreshType } from '@/types/account';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  account?: IAccount | null;
}

const accountTypeOptions = [
  { value: 'debit', label: '🏦 Débito' },
  { value: 'credit_card', label: '💳 Tarjeta de Crédito' },
  { value: 'cash', label: '💵 Efectivo' },
  { value: 'savings', label: '🏆 Ahorros' },
  { value: 'other', label: '📁 Otro' },
];

const refreshTypeOptions = [
  { value: 'manual', label: '✋ Manual' },
  { value: 'automatic', label: '⚡ Automático' },
];

const currencyOptions = [
  { value: 'CLP', label: 'CLP — Peso Chileno' },
  { value: 'USD', label: 'USD — Dólar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'DOP', label: 'DOP — Peso Dominicano' },
];

const colorOptions = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#64748b', '#78716c',
];

export default function AccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  account,
}: AccountFormModalProps) {
  const isEdit = !!account;

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'debit' as AccountType,
    bankName: '',
    currency: 'CLP',
    balance: 0,
    creditLimit: 0,
    color: '#6366f1',
    refreshType: 'manual' as RefreshType,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      setForm({
        name: account.name,
        description: account.description || '',
        type: account.type,
        bankName: account.bankName || '',
        currency: account.currency,
        balance: account.balance,
        creditLimit: account.creditLimit || 0,
        color: account.color,
        refreshType: account.refreshType || 'manual',
      });
    } else {
      setForm({
        name: '',
        description: '',
        type: 'debit',
        bankName: '',
        currency: 'CLP',
        balance: 0,
        creditLimit: 0,
        color: '#6366f1',
        refreshType: 'manual',
      });
    }
    setError('');
  }, [account, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'balance' || name === 'creditLimit' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        creditLimit: form.type === 'credit_card' ? form.creditLimit : undefined,
      };
      if (form.type === 'credit_card' && !isEdit && !form.balance) {
        payload.balance = form.creditLimit;
      }
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Cuenta' : 'Nueva Cuenta'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <Input
          label="Nombre *"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ej: Cuenta Principal"
        />

        <Input
          label="Descripción"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ej: Cuenta para gastos del día a día"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Tipo de cuenta *"
            name="type"
            value={form.type}
            onChange={handleChange}
            options={accountTypeOptions}
          />

          <Input
            label="Banco (opcional)"
            name="bankName"
            value={form.bankName}
            onChange={handleChange}
            placeholder="Ej: Banco Popular"
          />
        </div>

        {form.type === 'credit_card' && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-xs text-danger space-y-1">
            <p className="font-bold">💳 Cuenta de tipo Tarjeta de Crédito</p>
            <p className="text-foreground-muted leading-relaxed">
              Las tarjetas de crédito **no forman parte de tus activos/dinero disponible**. 
              Al registrar compras, se descontará del cupo disponible y se mostrará cuánto has gastado en números rojos.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Moneda"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            options={currencyOptions}
          />

          <Select
            label="Tipo de refresco"
            name="refreshType"
            value={form.refreshType}
            onChange={handleChange}
            options={refreshTypeOptions}
          />
        </div>

        {form.type === 'credit_card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cupo total (Límite de crédito) *"
              name="creditLimit"
              type="number"
              step={form.currency === 'CLP' ? '1' : '0.01'}
              value={form.creditLimit.toString()}
              onChange={handleChange}
              placeholder="0"
            />
            <Input
              label={isEdit ? "Cupo disponible (Balance actual) *" : "Cupo disponible inicial (opcional)"}
              name="balance"
              type="number"
              step={form.currency === 'CLP' ? '1' : '0.01'}
              value={form.balance.toString()}
              onChange={handleChange}
              placeholder={isEdit ? "0" : "Dejar en blanco para usar cupo total"}
            />
          </div>
        ) : (
          !isEdit && (
            <Input
              label="Balance inicial"
              name="balance"
              type="number"
              step={form.currency === 'CLP' ? '1' : '0.01'}
              value={form.balance.toString()}
              onChange={handleChange}
              placeholder="0"
            />
          )
        )}

        {/* Color picker */}
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, color: c }))}
                className="w-8 h-8 rounded-lg transition-all duration-200 border-2"
                style={{
                  backgroundColor: c,
                  borderColor: form.color === c ? '#fff' : 'transparent',
                  transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: form.color === c ? `0 0 12px ${c}60` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            {isEdit ? 'Guardar Cambios' : 'Crear Cuenta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
