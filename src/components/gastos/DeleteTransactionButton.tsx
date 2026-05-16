'use client';

import React, { useState } from 'react';
import { deleteTransaction } from '@/actions/transactions';

interface DeleteTransactionButtonProps {
  transactionId: string;
}

export default function DeleteTransactionButton({ transactionId }: DeleteTransactionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este movimiento? Se restaurará el balance de la cuenta.')) {
      setLoading(true);
      try {
        await deleteTransaction(transactionId);
      } catch (err) {
        alert('Error al eliminar el movimiento');
        setLoading(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-foreground-subtle hover:text-danger p-1 rounded transition-colors disabled:opacity-50"
      title="Eliminar movimiento"
    >
      {loading ? '⏳' : '🗑️'}
    </button>
  );
}
