import type { IAccount } from "@/types/account";
import type { ITransaction } from "@/types/transaction";

const billingDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Santiago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function calendarDate(date: Date) {
  const parts = billingDateFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((value) => value.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}

function dateKey(year: number, month: number, day: number) {
  return year * 10000 + month * 100 + day;
}

function lastCutoffKey(billingDay: number, referenceDate: Date) {
  const { day, ...calendar } = calendarDate(referenceDate);
  let { year, month } = calendar;
  const cutoffDay = (y: number, m: number) =>
    Math.min(billingDay, new Date(Date.UTC(y, m, 0)).getUTCDate());

  // The closing day belongs to the billed cycle, as in the card summary.
  if (day < cutoffDay(year, month)) {
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }
  return dateKey(year, month, cutoffDay(year, month));
}

interface PeriodTransactionOptions {
  startDate?: Date;
  endDate?: Date;
  includeUnbilled?: boolean;
  referenceDate?: Date;
}

export function filterPeriodTransactions(
  transactions: ITransaction[],
  accounts: IAccount[],
  {
    startDate,
    endDate,
    includeUnbilled = false,
    referenceDate = new Date(),
  }: PeriodTransactionOptions,
): ITransaction[] {
  if (startDate && endDate && startDate > endDate) return [];

  const cutoffs = new Map(
    includeUnbilled
      ? accounts
          .filter((account) => account.type === "credit_card")
          .map((account) => [
            account._id,
            lastCutoffKey(account.billingDay || 22, referenceDate),
          ] as const)
      : [],
  );

  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    if (!Number.isFinite(date.getTime())) return false;
    if (endDate && date > endDate) return false;
    if (!startDate || date >= startDate) return true;

    const cutoff = cutoffs.get(transaction.accountId);
    if (
      cutoff === undefined ||
      date > referenceDate ||
      transaction.type !== "expense" ||
      transaction.category === "abono_tarjeta" ||
      transaction.category === "transfer"
    ) return false;

    const { year, month, day } = calendarDate(date);
    return dateKey(year, month, day) > cutoff;
  });
}
