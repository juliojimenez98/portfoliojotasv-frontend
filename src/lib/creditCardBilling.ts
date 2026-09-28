import type { IAccount } from "@/types/account";
import type { ITransaction } from "@/types/transaction";

export interface CreditCardBillingSummary {
  billingDay: number;
  paymentDueDay?: number;
  // Dates
  cycleStartDate: Date; // e.g. Aug 23
  lastCutoffDate: Date; // e.g. Sept 22 23:59:59
  unbilledStartDate: Date; // e.g. Sept 23 00:00:00
  nextCutoffDate: Date; // e.g. Oct 22 23:59:59
  paymentDueDate?: Date; // e.g. Oct 5
  // Formatted labels
  lastCutoffLabel: string;
  nextCutoffLabel: string;
  cyclePeriodLabel: string;
  // Amounts
  totalSpent: number; // Cupo total - Cupo disponible
  totalAvailable: number; // Cupo disponible (account.balance)
  billedExpenses: number; // Total purchases in the closed cycle
  billedPayments: number; // Total payments/deposits made since the cycle started
  billedPending: number; // Amount currently due to pay for the closed statement
  unbilledExpenses: number; // Purchases made after the cutoff (next month's statement)
  isPaid: boolean; // True if billedPending === 0
}

/**
 * Calculates credit card statement cycles and splits expenses into billed (due now) vs unbilled (next cycle).
 */
export function getCreditCardBillingSummary(
  account: IAccount,
  transactions: ITransaction[] = [],
  referenceDate: Date = new Date(),
): CreditCardBillingSummary {
  const billingDay = account.billingDay || 22;
  const paymentDueDay = account.paymentDueDay;

  const ref = new Date(referenceDate);
  const currentDay = ref.getDate();
  const currentMonth = ref.getMonth(); // 0-11
  const currentYear = ref.getFullYear();

  let lastCutoffYear = currentYear;
  let lastCutoffMonth = currentMonth;
  let cycleStartYear = currentYear;
  let cycleStartMonth = currentMonth - 1;

  if (currentDay >= billingDay) {
    // Current month cutoff has already happened (e.g. today is Sept 28, cutoff was Sept 22)
    lastCutoffYear = currentYear;
    lastCutoffMonth = currentMonth;
    cycleStartYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    cycleStartMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  } else {
    // Current month cutoff has not happened yet (e.g. today is Sept 15, last cutoff was Aug 22)
    lastCutoffYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    lastCutoffMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    cycleStartYear = lastCutoffMonth === 0 ? lastCutoffYear - 1 : lastCutoffYear;
    cycleStartMonth = lastCutoffMonth === 0 ? 11 : lastCutoffMonth - 1;
  }

  // Calculate days in month to handle month-end clamps (e.g. Feb 28/29, April 30)
  const daysInLastCutoffMonth = new Date(
    lastCutoffYear,
    lastCutoffMonth + 1,
    0,
  ).getDate();
  const clampedBillingDay = Math.min(billingDay, daysInLastCutoffMonth);
  const lastCutoffDate = new Date(
    lastCutoffYear,
    lastCutoffMonth,
    clampedBillingDay,
    23,
    59,
    59,
    999,
  );

  const daysInCycleStartMonth = new Date(
    cycleStartYear,
    cycleStartMonth + 1,
    0,
  ).getDate();
  const clampedStartDay = Math.min(billingDay + 1, daysInCycleStartMonth);
  const cycleStartDate = new Date(
    cycleStartYear,
    cycleStartMonth,
    clampedStartDay,
    0,
    0,
    0,
    0,
  );

  // Unbilled start is immediately following lastCutoffDate
  const unbilledStartDate = new Date(lastCutoffDate.getTime() + 1);

  // Next cutoff date
  const nextCutoffMonth = lastCutoffMonth === 11 ? 0 : lastCutoffMonth + 1;
  const nextCutoffYear =
    lastCutoffMonth === 11 ? lastCutoffYear + 1 : lastCutoffYear;
  const daysInNextCutoffMonth = new Date(
    nextCutoffYear,
    nextCutoffMonth + 1,
    0,
  ).getDate();
  const clampedNextBillingDay = Math.min(billingDay, daysInNextCutoffMonth);
  const nextCutoffDate = new Date(
    nextCutoffYear,
    nextCutoffMonth,
    clampedNextBillingDay,
    23,
    59,
    59,
    999,
  );

  // Payment due date (optional)
  let paymentDueDate: Date | undefined = undefined;
  if (paymentDueDay) {
    const dueMonth =
      paymentDueDay >= billingDay ? lastCutoffMonth : nextCutoffMonth;
    const dueYear =
      paymentDueDay >= billingDay ? lastCutoffYear : nextCutoffYear;
    const daysInDueMonth = new Date(dueYear, dueMonth + 1, 0).getDate();
    paymentDueDate = new Date(
      dueYear,
      dueMonth,
      Math.min(paymentDueDay, daysInDueMonth),
      23,
      59,
      59,
      999,
    );
  }

  // Filter transactions for this account
  const accountTxns = transactions.filter((t) => t.accountId === account._id);

  let billedExpenses = 0;
  let billedPayments = 0;
  let unbilledExpenses = 0;

  accountTxns.forEach((txn) => {
    const txnDate = new Date(txn.date);

    if (txn.type === "expense" && txn.category !== "abono_tarjeta") {
      if (txnDate >= cycleStartDate && txnDate <= lastCutoffDate) {
        billedExpenses += txn.amount;
      } else if (txnDate > lastCutoffDate) {
        unbilledExpenses += txn.amount;
      }
    } else if (
      txn.type === "income" ||
      txn.type === "transfer" ||
      txn.category === "abono_tarjeta"
    ) {
      // Abono/Deposit to this credit card
      if (txnDate >= cycleStartDate) {
        billedPayments += txn.amount;
      }
    }
  });

  const totalSpent = Math.max(0, (account.creditLimit || 0) - account.balance);
  const totalAvailable = account.balance;

  // Billed pending: calculated as billedExpenses - billedPayments, but capped by totalSpent
  const calculatedBilledPending = Math.max(0, billedExpenses - billedPayments);
  const billedPending = Math.min(calculatedBilledPending, totalSpent);
  const isPaid = billedPending === 0 || totalSpent === 0;

  const lastCutoffLabel = lastCutoffDate.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
  });
  const nextCutoffLabel = nextCutoffDate.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
  });
  const cyclePeriodLabel = `${cycleStartDate.toLocaleDateString("es-CL", { day: "numeric", month: "short" })} → ${lastCutoffLabel}`;

  return {
    billingDay,
    paymentDueDay,
    cycleStartDate,
    lastCutoffDate,
    unbilledStartDate,
    nextCutoffDate,
    paymentDueDate,
    lastCutoffLabel,
    nextCutoffLabel,
    cyclePeriodLabel,
    totalSpent,
    totalAvailable,
    billedExpenses,
    billedPayments,
    billedPending,
    unbilledExpenses,
    isPaid,
  };
}

/**
 * Returns a visual badge and category for an individual credit card transaction.
 */
export function getTransactionBillingBadge(
  account: IAccount | undefined,
  txnDate: Date | string,
): {
  isCreditCard: boolean;
  status?: "billed" | "unbilled";
  label?: string;
  icon?: string;
  colorClass?: string;
} {
  if (!account || account.type !== "credit_card") {
    return { isCreditCard: false };
  }

  const summary = getCreditCardBillingSummary(account, [], new Date());
  const d = new Date(txnDate);

  if (d <= summary.lastCutoffDate) {
    const monthName = summary.lastCutoffDate.toLocaleDateString("es-CL", {
      month: "short",
    });
    return {
      isCreditCard: true,
      status: "billed",
      label: `Facturado (${monthName})`,
      icon: "📄",
      colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
  } else {
    const monthName = summary.nextCutoffDate.toLocaleDateString("es-CL", {
      month: "short",
    });
    return {
      isCreditCard: true,
      status: "unbilled",
      label: `Próx. Facturación (${monthName})`,
      icon: "⏳",
      colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    };
  }
}
