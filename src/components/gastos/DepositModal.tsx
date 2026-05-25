'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { IAccount } from '@/types/account';
import { formatCurrency } from '@/lib/utils';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountId: string, amount: number, description?: string) => Promise<void>;
  account: IAccount | null;
}

export default function DepositModal({
  isOpen,
  onClose,
  onSubmit,
  account,
}: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }
    if (!account) return;

    setLoading(true);
    setError('');
    try {
      await onSubmit(account._id, numAmount, description || undefined);
      setAmount('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al abonar');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  };

  if (!account) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={account.type === 'credit_card' ? "Pagar/Abonar Tarjeta" : "Abonar a Cuenta"} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account info */}
        <div className="p-3 rounded-xl bg-background-elevated border border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: account.color }}
            >
              {account.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{account.name}</p>
              <p className="text-xs text-foreground-subtle">
                {account.type === 'credit_card' ? 'Cupo disponible' : 'Balance actual'}: <span className="font-medium text-foreground">{formatCurrency(account.balance, account.currency)}</span>
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <Input
          label={account.type === 'credit_card' ? "Monto a pagar/abonar *" : "Monto a abonar *"}
          type="number"
          step={account.currency === 'CLP' ? '1' : '0.01'}
          min={account.currency === 'CLP' ? '1' : '0.01'}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={account.currency === 'CLP' ? '0' : '0.00'}
        />

        <Input
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Pago de nómina"
        />

        {amount && parseFloat(amount) > 0 && (
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm">
            <p className="text-foreground-muted">{account.type === 'credit_card' ? "Nuevo cupo disponible:" : "Nuevo balance:"}</p>
            <p className="text-lg font-bold text-green-400">
              {formatCurrency(account.balance + parseFloat(amount), account.currency)}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            💰 Abonar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
