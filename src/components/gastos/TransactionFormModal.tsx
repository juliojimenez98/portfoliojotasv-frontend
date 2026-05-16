'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { IAccount } from '@/types/account';
import type { ICategory } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { createCategory } from '@/actions/transactions';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  accounts: IAccount[];
  categories: ICategory[];
}

const currencyOptions = [
  { value: 'CLP', label: 'CLP — Peso Chileno' },
  { value: 'USD', label: 'USD — Dólar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'DOP', label: 'DOP — Peso Dominicano' },
];

const QUICK_EMOJIS = ['🍔', '🚗', '🎬', '💊', '🎓', '🏠', '💡', '🛍️', '✈️', '💻', '📱', '🍕', '🏆', '🎁', '🐶', '☕', '🥦', '⛽', '🎮'];

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  categories,
}: TransactionFormModalProps) {
  const [form, setForm] = useState({
    type: 'expense' as 'expense' | 'income',
    accountId: '',
    description: '',
    originalAmount: '',
    originalCurrency: 'CLP',
    exchangeRate: '', // empty means use automatic API rate
    category: '',
    customCategory: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customIcon, setCustomIcon] = useState('📁');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({
        type: 'expense',
        accountId: accounts.length > 0 ? accounts[0]._id : '',
        description: '',
        originalAmount: '',
        originalCurrency: 'CLP',
        exchangeRate: '',
        category: categories.length > 0 ? categories[0].value : 'other',
        customCategory: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setIsCustomCategory(false);
      setCustomIcon('📁');
      setError('');
    }
  }, [isOpen, accounts, categories]);

  const accountOptions = accounts.map((a) => ({
    value: a._id,
    label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.value,
    label: `${c.icon || '📁'} ${c.label}`,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.accountId) {
      setError('Selecciona una cuenta');
      return;
    }
    if (!form.description.trim()) {
      setError('La descripción es requerida');
      return;
    }
    const numAmount = parseFloat(form.originalAmount);
    if (!numAmount || numAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    const finalCategory = isCustomCategory ? form.customCategory.trim() : form.category;
    if (!finalCategory) {
      setError('La categoría es requerida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // If custom category, create it first so it stores the emoji icon
      if (isCustomCategory && form.customCategory.trim()) {
        try {
          await createCategory({ label: form.customCategory.trim(), icon: customIcon });
        } catch (err) {
          // ignore if already exists
        }
      }

      const payload = {
        type: form.type,
        accountId: form.accountId,
        description: form.description.trim(),
        originalAmount: numAmount,
        originalCurrency: form.originalCurrency,
        exchangeRate: form.exchangeRate ? parseFloat(form.exchangeRate) : undefined,
        category: finalCategory.toLowerCase(),
        date: new Date(form.date),
        notes: form.notes.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar la transacción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Movimiento" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-background-elevated rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, type: 'expense' }))}
            className={`py-2 rounded-lg text-sm font-semibold transition-all ${
              form.type === 'expense'
                ? 'bg-danger text-white shadow-md shadow-danger/25'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            ↓ Gasto
          </button>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, type: 'income' }))}
            className={`py-2 rounded-lg text-sm font-semibold transition-all ${
              form.type === 'income'
                ? 'bg-success text-white shadow-md shadow-success/25'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            ↑ Ingreso
          </button>
        </div>

        <Select
          label="Cuenta *"
          name="accountId"
          value={form.accountId}
          onChange={handleChange}
          options={accountOptions}
        />

        <Input
          label="Descripción *"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ej: Almuerzo de trabajo, Pago de cliente..."
        />

        {/* Amount & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Monto *"
            name="originalAmount"
            type="number"
            step={form.originalCurrency === 'CLP' ? '1' : '0.01'}
            min={form.originalCurrency === 'CLP' ? '1' : '0.01'}
            value={form.originalAmount}
            onChange={handleChange}
            placeholder={form.originalCurrency === 'CLP' ? '0' : '0.00'}
          />

          <Select
            label="Moneda"
            name="originalCurrency"
            value={form.originalCurrency}
            onChange={handleChange}
            options={currencyOptions}
          />
        </div>

        {/* Manual Exchange Rate Override */}
        {form.originalCurrency !== 'CLP' && (
          <div className="p-3 rounded-xl bg-background-elevated border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">Tasa de cambio (opcional)</span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                Auto API por defecto
              </span>
            </div>
            <Input
              name="exchangeRate"
              type="number"
              step="0.01"
              min="0.01"
              value={form.exchangeRate}
              onChange={handleChange}
              placeholder="Ej: 890.50 (dejar en blanco para tasa automática)"
            />
            <p className="text-[11px] text-foreground-subtle">
              Si tienes otro precio del dólar/euro, ingrésalo aquí para sobreescribir la conversión.
            </p>
          </div>
        )}

        {/* Category Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">Categoría *</label>
            <button
              type="button"
              onClick={() => setIsCustomCategory(!isCustomCategory)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {isCustomCategory ? 'Seleccionar existente' : '+ Añadir nueva categoría'}
            </button>
          </div>

          {isCustomCategory ? (
            <div className="space-y-2 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <div className="sm:col-span-2">
                  <Input
                    name="customCategory"
                    value={form.customCategory}
                    onChange={handleChange}
                    placeholder="Ej: Suscripciones, Gimnasio..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">Icono</label>
                  <div className="flex items-center gap-1.5 h-10 px-2 rounded-lg bg-background border border-border">
                    <span className="text-lg">{customIcon}</span>
                    <Input
                      value={customIcon}
                      onChange={(e) => setCustomIcon(e.target.value)}
                      className="h-7 text-xs px-1 w-full"
                      placeholder="Emoji"
                    />
                  </div>
                </div>
              </div>

              {/* Quick emoji row */}
              <div className="flex flex-wrap gap-1 p-1 bg-background rounded-lg border border-border/50 max-h-20 overflow-y-auto">
                {QUICK_EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCustomIcon(emoji)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-sm hover:bg-background-elevated ${
                      customIcon === emoji ? 'bg-primary/20 border border-primary' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Select
              name="category"
              value={form.category}
              onChange={handleChange}
              options={categoryOptions}
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha *"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />

          <Input
            label="Notas (opcional)"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Detalles adicionales..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            {form.type === 'expense' ? '↓ Registrar Gasto' : '↑ Registrar Ingreso'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
