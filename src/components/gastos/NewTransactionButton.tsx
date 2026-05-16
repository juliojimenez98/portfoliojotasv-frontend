'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import TransactionFormModal from './TransactionFormModal';
import CategoryManagementModal from './CategoryManagementModal';
import SubscriptionManagementModal from './SubscriptionManagementModal';
import { createTransaction } from '@/actions/transactions';
import type { IAccount } from '@/types/account';
import type { ICategory } from '@/types/transaction';

interface NewTransactionButtonProps {
  accounts: IAccount[];
  categories: ICategory[];
  subscriptions: any[];
}

export default function NewTransactionButton({ accounts, categories, subscriptions }: NewTransactionButtonProps) {
  const [isTxnOpen, setIsTxnOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    await createTransaction(data);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 justify-end">
      <Button variant="secondary" onClick={() => setIsSubOpen(true)} className="flex items-center gap-1.5 shadow-sm text-xs py-2">
        <span>🔄</span> Suscripciones
      </Button>
      <Button variant="secondary" onClick={() => setIsCatOpen(true)} className="flex items-center gap-1.5 shadow-sm text-xs py-2">
        <span>⚙️</span> Categorías
      </Button>
      <Button onClick={() => setIsTxnOpen(true)} className="shadow-lg shadow-primary/25 text-xs py-2">
        + Nuevo Movimiento
      </Button>

      <TransactionFormModal
        isOpen={isTxnOpen}
        onClose={() => setIsTxnOpen(false)}
        onSubmit={handleSubmit}
        accounts={accounts}
        categories={categories}
      />

      <CategoryManagementModal
        isOpen={isCatOpen}
        onClose={() => setIsCatOpen(false)}
        categories={categories}
      />

      <SubscriptionManagementModal
        isOpen={isSubOpen}
        onClose={() => setIsSubOpen(false)}
        accounts={accounts}
        subscriptions={subscriptions}
      />
    </div>
  );
}
