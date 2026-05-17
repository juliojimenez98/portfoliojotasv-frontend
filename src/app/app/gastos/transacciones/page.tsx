import type { Metadata } from "next";
import {
  getTransactions,
  getTransactionCategories,
} from "@/actions/transactions";
import { getAccounts } from "@/actions/accounts";
import { getPeriods } from "@/actions/periods";
import TransactionsPanel from "@/components/gastos/TransactionsPanel";
import type { ITransaction } from "@/types/transaction";
import type { IAccount } from "@/types/account";
import type { ISpendPeriod } from "@/types/period";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transacciones",
  description:
    "Historial completo de movimientos financieros con filtros avanzados.",
};

export default async function TransaccionesPage() {
  let transactions: ITransaction[] = [];
  let categories: any[] = [];
  let accounts: IAccount[] = [];
  let periods: ISpendPeriod[] = [];

  try {
    [transactions, categories, accounts, periods] = await Promise.all([
      getTransactions(),
      getTransactionCategories(),
      getAccounts(),
      getPeriods(),
    ]);
  } catch {
    transactions = [];
    categories = [];
    accounts = [];
    periods = [];
  }

  return (
    <TransactionsPanel
      transactions={transactions}
      categories={categories}
      accounts={accounts}
      periods={periods}
    />
  );
}
