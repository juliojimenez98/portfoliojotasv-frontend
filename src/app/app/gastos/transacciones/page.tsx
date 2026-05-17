import type { Metadata } from 'next';
import { getTransactions, getTransactionCategories } from '@/actions/transactions';
import { getAccounts } from '@/actions/accounts';
import TransactionsPanel from '@/components/gastos/TransactionsPanel';
import type { ITransaction } from '@/types/transaction';
import type { IAccount } from '@/types/account';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Transacciones',
  description: 'Historial completo de movimientos financieros con filtros avanzados.',
};

export default async function TransaccionesPage() {
  let transactions: ITransaction[] = [];
  let categories: any[] = [];
  let accounts: IAccount[] = [];

  try {
    [transactions, categories, accounts] = await Promise.all([
      getTransactions(),
      getTransactionCategories(),
      getAccounts(),
    ]);
  } catch {
    transactions = [];
    categories = [];
    accounts = [];
  }

  return (
    <TransactionsPanel
      transactions={transactions}
      categories={categories}
      accounts={accounts}
    />
  );
}
