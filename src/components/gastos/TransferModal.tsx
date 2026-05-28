'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { IAccount } from '@/types/account';
import { formatCurrency } from '@/lib/utils';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fromId: string, toId: string, amount: number, description?: string) => Promise<void>;
  accounts: IAccount[];
  preselectedAccountId?: string | null;
}

export default function TransferModal({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  preselectedAccountId,
}: TransferModalProps) {
  const [fromId, setFromId] = useState(preselectedAccountId || '');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when opened with a preselected account
  React.useEffect(() => {
    if (isOpen) {
      setFromId(preselectedAccountId || '');
      setToId('');
      setAmount('');
      setDescription('');
      setError('');
    }
  }, [isOpen, preselectedAccountId]);

  const fromAccount = accounts.find((a) => a._id === fromId);
  const toAccount = accounts.find((a) => a._id === toId);

  const accountOptions = accounts.map((a) => ({
    value: a._id,
    label: a.type === 'credit_card' 
      ? `${a.name} (Cupo: ${formatCurrency(a.balance, a.currency)})`
      : `${a.name} (${formatCurrency(a.balance, a.currency)})`,
  }));

  const destinationOptions = accounts
    .filter((a) => a._id !== fromId && a.type !== 'credit_card')
    .map((a) => ({
      value: a._id,
      label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!fromId) {
      setError('Selecciona la cuenta de origen');
      return;
    }
    if (!toId) {
      setError('Selecciona la cuenta de destino');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }
    if (fromAccount && numAmount > fromAccount.balance) {
      setError(fromAccount.type === 'credit_card' ? 'Cupo insuficiente en la tarjeta de origen' : 'Fondos insuficientes en la cuenta de origen');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(fromId, toId, numAmount, description || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al transferir');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (accounts.length < 2) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Transferir" size="sm">
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-foreground-muted text-sm">
            Necesitas al menos 2 cuentas para hacer una transferencia.
          </p>
          <Button variant="secondary" onClick={handleClose} className="mt-4">
            Cerrar
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Transferir entre Cuentas" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <Select
          label="Cuenta de origen *"
          value={fromId}
          onChange={(e) => {
            setFromId(e.target.value);
            if (e.target.value === toId) setToId('');
          }}
          options={accountOptions}
        />

        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-background-elevated border border-border flex items-center justify-center text-lg">
            ↓
          </div>
        </div>

        <Select
          label="Cuenta de destino *"
          value={toId}
          onChange={(e) => setToId(e.target.value)}
          options={destinationOptions}
        />

        <Input
          label="Monto *"
          type="number"
          step={fromAccount?.currency === 'CLP' ? '1' : '0.01'}
          min={fromAccount?.currency === 'CLP' ? '1' : '0.01'}
          max={fromAccount?.balance.toString()}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={fromAccount?.currency === 'CLP' ? '0' : '0.00'}
        />

        <Input
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Transferencia para ahorros"
        />

        {/* Preview */}
        {fromAccount && toAccount && amount && parseFloat(amount) > 0 && (
          <div className="p-4 rounded-xl bg-background-elevated border border-border space-y-2 text-sm">
            <p className="text-foreground-muted font-medium mb-2">Resultado de la transferencia:</p>
            <div className="flex justify-between">
              <span className="text-foreground-subtle">{fromAccount.name}:</span>
              <span className="text-red-400 font-medium">
                {formatCurrency(fromAccount.balance - parseFloat(amount), fromAccount.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-subtle">{toAccount.name}:</span>
              <span className="text-green-400 font-medium">
                {formatCurrency(toAccount.balance + parseFloat(amount), toAccount.currency)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            🔄 Transferir
          </Button>
        </div>
      </form>
    </Modal>
  );
}
