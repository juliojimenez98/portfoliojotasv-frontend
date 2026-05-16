import type { Metadata } from 'next';
import { getSubscriptions, getActiveSubscriptionsCost } from '@/actions/subscriptions';
import { getAccounts } from '@/actions/accounts';
import SubscriptionPageContainer from '@/components/gastos/SubscriptionPageContainer';
import type { ISubscription } from '@/types/subscription';
import type { IAccount } from '@/types/account';

export const metadata: Metadata = {
  title: 'Suscripciones',
  description: 'Gestión de suscripciones mensuales y anuales.',
};

export default async function SuscripcionesPage() {
  let subscriptions: ISubscription[] = [];
  let accounts: IAccount[] = [];
  let cost = { monthlyTotal: 0, yearlyTotal: 0, count: 0 };
  try {
    [subscriptions, accounts, cost] = await Promise.all([
      getSubscriptions(),
      getAccounts(),
      getActiveSubscriptionsCost(),
    ]);
  } catch {
    subscriptions = [];
    accounts = [];
    cost = { monthlyTotal: 0, yearlyTotal: 0, count: 0 };
  }

  return <SubscriptionPageContainer subscriptions={subscriptions} accounts={accounts} cost={cost} />;
}
