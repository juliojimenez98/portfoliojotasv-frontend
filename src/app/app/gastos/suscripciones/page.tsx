import type { Metadata } from 'next';
import { getSubscriptions, getActiveSubscriptionsCost } from '@/actions/subscriptions';
import { getAccounts } from '@/actions/accounts';
import { getTransactions } from '@/actions/transactions';
import SubscriptionPageContainer from '@/components/gastos/SubscriptionPageContainer';
import type { ISubscription } from '@/types/subscription';
import type { IAccount } from '@/types/account';
import type { ITransaction } from '@/types/transaction';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Suscripciones',
  description: 'Gestión de suscripciones mensuales y anuales.',
};

export default async function SuscripcionesPage() {
  let subscriptions: ISubscription[] = [];
  let accounts: IAccount[] = [];
  let cost = { monthlyTotal: 0, yearlyTotal: 0, count: 0 };
  let currentMonthTransactions: ITransaction[] = [];

  try {
    const [subData, accData, costData, txnsData] = await Promise.all([
      getSubscriptions(),
      getAccounts(),
      getActiveSubscriptionsCost(),
      getTransactions({ type: 'expense' }),
    ]);
    
    subscriptions = subData;
    accounts = accData;
    cost = costData;
    
    const now = new Date();
    currentMonthTransactions = txnsData.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  } catch {
    subscriptions = [];
    accounts = [];
    cost = { monthlyTotal: 0, yearlyTotal: 0, count: 0 };
  }

  return <SubscriptionPageContainer subscriptions={subscriptions} accounts={accounts} cost={cost} currentMonthTransactions={currentMonthTransactions} />;
}
