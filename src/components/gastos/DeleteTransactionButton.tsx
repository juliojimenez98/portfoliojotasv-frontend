'use client';

import React, { useState } from 'react';
import { deleteTransaction } from '@/actions/transactions';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface DeleteTransactionButtonProps {
  transactionId: string;
}

export default function DeleteTransactionButton({ transactionId }: DeleteTransactionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTransaction(transactionId);
      setIsModalOpen(false);
    } catch (err) {
      alert('Error al eliminar el movimiento');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
        className="text-foreground-subtle hover:text-danger p-1 rounded transition-colors disabled:opacity-50"
        title="Eliminar movimiento"
      >
        {loading ? '⏳' : '🗑️'}
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Movimiento"
        message="¿Estás seguro de eliminar este movimiento? Se restaurará el balance de la cuenta y esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
}
