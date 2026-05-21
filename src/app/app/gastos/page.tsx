import type { Metadata } from "next";
import Link from "next/link";
import Card, { CardHeader, CardTitle, CardValue } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getAccounts } from "@/actions/accounts";
import {
  getMonthlyExpenseSummary,
  getCurrentMonthTotal,
  getCurrentYearTotal,
  getTransactions,
  getTransactionCategories,
} from "@/actions/transactions";
import {
  getSubscriptions,
  getActiveSubscriptionsCost,
} from "@/actions/subscriptions";
import { getActivePeriod } from "@/actions/periods";

export const dynamic = "force-dynamic";

import NewTransactionButton from "@/components/gastos/NewTransactionButton";
import DeleteTransactionButton from "@/components/gastos/DeleteTransactionButton";
import CategoryChartCard from "@/components/gastos/CategoryChartCard";
import ActivePeriodBanner from "@/components/gastos/ActivePeriodBanner";
import { formatCurrency } from "@/lib/utils";
import type { IAccount } from "@/types/account";
import type { ITransaction, MonthlyExpenseSummary } from "@/types/transaction";
import type { ISpendPeriod } from "@/types/period";

export const metadata: Metadata = {
  title: "Control de Gastos",
  description:
    "Dashboard financiero personal — gestiona tus cuentas, gastos y suscripciones.",
};

export default async function GastosDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;
  const selectedAccountId = params?.accountId || null;

  let accounts: IAccount[] = [];
  let monthlyByAccount: MonthlyExpenseSummary[] = [];
  let monthlyTotal = 0;
  let yearlyTotal = 0;
  let subsCost = { monthlyTotal: 0, yearlyTotal: 0, count: 0 };
  let recentTransactions: ITransaction[] = [];
  let categories: any[] = [];
  let subscriptions: any[] = [];
  let activePeriod: ISpendPeriod | null = null;

  try {
    [
      accounts,
      monthlyByAccount,
      monthlyTotal,
      yearlyTotal,
      subsCost,
      recentTransactions,
      categories,
      subscriptions,
      activePeriod,
    ] = await Promise.all([
      getAccounts(),
      getMonthlyExpenseSummary(
        new Date().getMonth() + 1,
        new Date().getFullYear(),
      ),
      getCurrentMonthTotal(),
      getCurrentYearTotal(),
      getActiveSubscriptionsCost(),
      getTransactions(),
      getTransactionCategories(),
      getSubscriptions(),
      getActivePeriod().catch(() => null),
    ]);
  } catch {
    // DB not connected — show empty state
    accounts = [];
    monthlyByAccount = [];
    monthlyTotal = 0;
    yearlyTotal = 0;
    subsCost = { monthlyTotal: 0, yearlyTotal: 0, count: 0 };
    recentTransactions = [];
    categories = [];
    subscriptions = [];
  }

  const displayedTransactions = selectedAccountId
    ? recentTransactions.filter((t) => t.accountId === selectedAccountId)
    : recentTransactions;

  // ── Period-aware date range ──────────────────────────────────────────────
  // If there's an active period, use its startDate as the "from" boundary.
  // Otherwise fall back to the current calendar month.
  const now = new Date();
  const periodStart = activePeriod ? new Date(activePeriod.startDate) : null;

  const periodLabel = activePeriod
    ? activePeriod.label
    : now.toLocaleDateString("es", { month: "long", year: "numeric" });

  const isInRange = (date: Date | string) => {
    const d = new Date(date);
    if (periodStart) return d >= periodStart; // active period: from startDate to now
    // fallback: current calendar month
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  };

  const periodExpenses = displayedTransactions.filter(
    (t) => t.type === "expense" && isInRange(t.date),
  );
  const periodIncome = displayedTransactions.filter(
    (t) => t.type === "income" && isInRange(t.date),
  );

  const periodExpenseTotal = periodExpenses.reduce((s, t) => s + t.amount, 0);

  const recent = displayedTransactions
    .filter((t) => isInRange(t.date))
    .slice(0, 15);
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  // ── Gastos por cuenta (period-aware) ────────────────────────────────────
  const accountExpenseMap: Record<
    string,
    { total: number; count: number; name: string; color: string }
  > = {};
  for (const acc of accounts) {
    accountExpenseMap[acc._id] = {
      total: 0,
      count: 0,
      name: acc.name,
      color: acc.color || "#8b5cf6",
    };
  }
  for (const t of periodExpenses) {
    if (accountExpenseMap[t.accountId]) {
      accountExpenseMap[t.accountId].total += t.amount;
      accountExpenseMap[t.accountId].count += 1;
    }
  }
  const periodByAccount = Object.entries(accountExpenseMap)
    .map(([accountId, d]) => ({
      accountId,
      accountName: d.name,
      accountColor: d.color,
      total: d.total,
      count: d.count,
    }))
    .filter((i) => i.total > 0)
    .sort((a, b) => b.total - a.total);

  const maxAccountTotal =
    periodByAccount.length > 0 ? periodByAccount[0].total : 1;
  const periodAccountTotal = periodByAccount.reduce((s, i) => s + i.total, 0);

  // ── Category summary (period-aware) ─────────────────────────────────────
  const categoryMap: Record<
    string,
    { total: number; count: number; label: string; icon: string }
  > = {};
  for (const cat of categories) {
    categoryMap[cat.value] = {
      total: 0,
      count: 0,
      label: cat.label,
      icon: cat.icon || "📁",
    };
  }
  for (const t of periodExpenses) {
    const catVal = t.category || "other";
    if (!categoryMap[catVal])
      categoryMap[catVal] = { total: 0, count: 0, label: catVal, icon: "📁" };
    categoryMap[catVal].total += t.amount;
    categoryMap[catVal].count += 1;
  }
  const categorySummary = Object.entries(categoryMap)
    .map(([value, data]) => ({
      value,
      label: data.label,
      icon: data.icon,
      total: data.total,
      count: data.count,
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const maxCategoryTotal =
    categorySummary.length > 0 ? categorySummary[0].total : 1;

  const selectedAccountObj = accounts.find((a) => a._id === selectedAccountId);
  const transactionsTitle = selectedAccountObj
    ? `Movimientos: ${selectedAccountObj.name}`
    : "Transacciones Recientes";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard Financiero
          </h1>
          <p className="text-sm text-foreground-muted mt-1 capitalize">
            Resumen de gastos — {periodLabel}
          </p>
        </div>
        <div>
          <NewTransactionButton accounts={accounts} categories={categories} />
        </div>
      </div>

      {/* Active Period Banner */}
      <ActivePeriodBanner initialPeriod={activePeriod} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card variant="gradient">
          <CardHeader>
            <CardTitle>
              {activePeriod ? "Gasto del Período" : "Gasto Mensual"}
            </CardTitle>
            <span className="text-xl">{activePeriod ? "💼" : "📅"}</span>
          </CardHeader>
          <CardValue>{formatCurrency(periodExpenseTotal)}</CardValue>
          <p className="text-xs text-foreground-subtle mt-1 capitalize">
            {periodLabel}
          </p>
        </Card>
        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Gasto Anual</CardTitle>
            <span className="text-xl">📆</span>
          </CardHeader>
          <CardValue>{formatCurrency(yearlyTotal)}</CardValue>
        </Card>
        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Suscripciones</CardTitle>
            <span className="text-xl">🔄</span>
          </CardHeader>
          <CardValue>{formatCurrency(subsCost.monthlyTotal)}</CardValue>
          <p className="text-xs text-foreground-subtle mt-1">
            {subsCost.count} activas/mes
          </p>
        </Card>
        <Card variant="glow">
          <CardHeader>
            <CardTitle>Balance Total</CardTitle>
            <span className="text-xl">💰</span>
          </CardHeader>
          <CardValue className="gradient-text">
            {formatCurrency(totalBalance)}
          </CardValue>
          <p className="text-xs text-foreground-subtle mt-1">
            {accounts.length} cuentas
          </p>
        </Card>
      </div>

      {/* Accounts & Category Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Cuentas</h3>
            <Badge variant="primary">{accounts.length}</Badge>
          </CardHeader>
          {accounts.length === 0 ? (
            <p className="text-sm text-foreground-subtle text-center py-8">
              No hay cuentas registradas aún.
            </p>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
              {accounts.map((account) => {
                const isSelected = account._id === selectedAccountId;
                return (
                  <Link
                    key={account._id}
                    href={
                      isSelected
                        ? "/app/gastos"
                        : `/app/gastos?accountId=${account._id}`
                    }
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all block ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                        : "border-border hover:border-border-hover"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: account.color }}
                      >
                        {account.type === "credit_card"
                          ? "💳"
                          : account.type === "debit"
                            ? "🏦"
                            : "💵"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {account.name}
                        </p>
                        <p className="text-xs text-foreground-subtle capitalize">
                          {account.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(account.balance)}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <CategoryChartCard
          monthName={periodLabel}
          categorySummary={categorySummary}
          maxCategoryTotal={maxCategoryTotal}
        />
      </div>

      {/* Account Expenses & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">
              Gastos por Cuenta
            </h3>
            <Badge variant="warning" className="capitalize">
              {periodLabel}
            </Badge>
          </CardHeader>
          {periodByAccount.length === 0 ? (
            <p className="text-sm text-foreground-subtle text-center py-8">
              Sin gastos {activePeriod ? "en este período" : "este mes"}.
            </p>
          ) : (
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
              {periodByAccount.map((item) => {
                const percentage =
                  maxAccountTotal > 0
                    ? (item.total / maxAccountTotal) * 100
                    : 0;
                return (
                  <div key={item.accountId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: item.accountColor }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {item.accountName}
                        </span>
                        <span className="text-xs text-foreground-subtle">
                          ({item.count})
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-background-elevated overflow-hidden p-0.5 border border-border/50">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.accountColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm font-medium text-foreground-muted">
                  Total {activePeriod ? "del período" : "del mes"}
                </span>
                <span className="text-lg font-bold gradient-text">
                  {formatCurrency(periodAccountTotal)}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card variant="glass">
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">
              {transactionsTitle}
            </h3>
            <Badge variant="default">{displayedTransactions.length}</Badge>
          </CardHeader>
          {recent.length === 0 ? (
            <p className="text-sm text-foreground-subtle text-center py-8">
              No hay transacciones registradas.
            </p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
              {recent.map((txn) => {
                const catObj = categories.find((c) => c.value === txn.category);
                const catLabel =
                  txn.category === "transfer"
                    ? "🔄 Transferencia"
                    : catObj
                      ? `${catObj.icon || "📁"} ${catObj.label}`
                      : `📁 ${txn.category}`;

                return (
                  <div
                    key={txn._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${txn.type === "income" ? "bg-success/10 text-success" : txn.type === "transfer" ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"}`}
                      >
                        {txn.type === "income"
                          ? "↑"
                          : txn.type === "transfer"
                            ? "⇄"
                            : "↓"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {txn.description}
                        </p>
                        <p className="text-xs text-foreground-subtle capitalize">
                          {catLabel}
                          {txn.balanceBefore != null && (
                            <> · <span className="font-mono">Saldo previo: {formatCurrency(txn.balanceBefore)}</span></>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-sm font-semibold ${txn.type === "income" ? "text-success" : txn.type === "transfer" ? "text-primary" : "text-danger"}`}
                      >
                        {txn.type === "income"
                          ? "+"
                          : txn.type === "transfer"
                            ? "⇄ "
                            : "-"}
                        {formatCurrency(txn.amount)}
                      </p>
                      <DeleteTransactionButton transactionId={txn._id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
