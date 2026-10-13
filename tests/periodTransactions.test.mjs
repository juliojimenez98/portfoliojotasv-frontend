import assert from "node:assert/strict";
import test from "node:test";
import { filterPeriodTransactions } from "../src/modules/gastos/services/periodTransactions.ts";

const accounts = [
  { _id: "tc", type: "credit_card", billingDay: 22 },
  { _id: "other-tc", type: "credit_card", billingDay: 25 },
  { _id: "debit", type: "debit" },
];
const options = {
  startDate: new Date("2026-09-28T03:00:00Z"),
  endDate: new Date("2026-10-13T23:00:00Z"),
  referenceDate: new Date("2026-10-13T23:00:00Z"),
  includeUnbilled: true,
};
function expense(id, date, overrides = {}) {
  return {
    _id: id, date: new Date(date), accountId: "tc",
    type: "expense", category: "food", amount: 1000,
    ...overrides,
  };
}
const ids = (transactions) => transactions.map((transaction) => transaction._id);

test("checkbox adds the open cycle before payday without duplicating period expenses", () => {
  const transactions = [
    expense("billed", "2026-09-22T15:00:00Z"),
    expense("pending", "2026-09-23T15:00:00Z"),
    expense("before-payday", "2026-09-27T15:00:00Z"),
    expense("payday", "2026-09-28T03:00:00Z"),
    expense("current", "2026-10-05T15:00:00Z"),
  ];
  assert.deepEqual(ids(filterPeriodTransactions(transactions, accounts, {
    ...options, includeUnbilled: false,
  })), ["payday", "current"]);
  const included = filterPeriodTransactions(transactions, accounts, options);
  assert.deepEqual(ids(included), ["pending", "before-payday", "payday", "current"]);
  assert.equal(included.reduce((sum, transaction) => sum + transaction.amount, 0), 4000);
});

test("each credit card uses its own cutoff; other accounts and payments stay excluded", () => {
  const transactions = [
    expense("pending", "2026-09-24T15:00:00Z"),
    expense("other-billed", "2026-09-24T15:00:00Z", { accountId: "other-tc" }),
    expense("other-pending", "2026-09-26T15:00:00Z", { accountId: "other-tc" }),
    expense("debit", "2026-09-24T15:00:00Z", { accountId: "debit" }),
    expense("unknown", "2026-09-24T15:00:00Z", { accountId: "missing" }),
    expense("payment", "2026-09-24T15:00:00Z", { category: "abono_tarjeta" }),
    expense("transfer", "2026-09-24T15:00:00Z", { type: "transfer" }),
    expense("legacy-payment", "2026-09-24T15:00:00Z", { category: "transfer" }),
    expense("income", "2026-09-24T15:00:00Z", { type: "income" }),
  ];
  assert.deepEqual(ids(filterPeriodTransactions(transactions, accounts, options)), ["pending", "other-pending"]);
});

test("pending additions stop once the next statement closes", () => {
  const transactions = [expense("previous", "2026-09-27T15:00:00Z")];
  assert.deepEqual(filterPeriodTransactions(transactions, accounts, {
    ...options, referenceDate: new Date("2026-10-22T15:00:00Z"),
  }), []);
});

test("upper date bounds still apply and all-periods view does not duplicate anything", () => {
  const transactions = [
    expense("pending", "2026-09-27T15:00:00Z"),
    expense("current", "2026-10-05T15:00:00Z"),
  ];
  assert.deepEqual(filterPeriodTransactions(transactions, accounts, {
    ...options, endDate: new Date("2026-09-26T23:59:59Z"),
  }), []);
  assert.deepEqual(filterPeriodTransactions([
    expense("before-both-bounds", "2026-09-24T15:00:00Z"),
  ], accounts, {
    ...options, endDate: new Date("2026-09-26T23:59:59Z"),
  }), []);
  assert.deepEqual(filterPeriodTransactions(transactions, accounts, {
    ...options, startDate: undefined,
  }), transactions);
});

test("closing day uses Chile dates even when the server runs in UTC", () => {
  const transactions = [
    expense("still-closing-day", "2026-09-23T02:59:59Z"),
    expense("new-cycle", "2026-09-23T03:00:00Z"),
  ];
  assert.deepEqual(ids(filterPeriodTransactions(transactions, accounts, options)), ["new-cycle"]);
});

test("cutoff 31 clamps to February and handles leap years", () => {
  for (const year of [2024, 2026]) {
    const lastDay = year === 2024 ? 29 : 28;
    const transactions = [
      expense("billed", `${year}-02-${lastDay}T15:00:00Z`),
      expense("pending", `${year}-03-01T15:00:00Z`),
    ];
    assert.deepEqual(ids(filterPeriodTransactions(transactions, [
      { _id: "tc", type: "credit_card", billingDay: 31 },
    ], {
      includeUnbilled: true,
      startDate: new Date(`${year}-03-05T15:00:00Z`),
      referenceDate: new Date(`${year}-03-10T15:00:00Z`),
    })), ["pending"]);
    assert.deepEqual(filterPeriodTransactions([transactions[0]], [
      { _id: "tc", type: "credit_card", billingDay: 31 },
    ], {
      includeUnbilled: true,
      startDate: new Date(`${year}-03-01T15:00:00Z`),
      referenceDate: new Date(`${year}-02-${lastDay}T20:00:00Z`),
    }), []);
  }
});

test("January uses the previous December cutoff and legacy cards default to day 22", () => {
  const transactions = [expense("pending", "2025-12-27T15:00:00Z")];
  assert.deepEqual(ids(filterPeriodTransactions(transactions, [
    { _id: "tc", type: "credit_card" },
  ], {
    includeUnbilled: true,
    startDate: new Date("2025-12-28T03:00:00Z"),
    referenceDate: new Date("2026-01-10T15:00:00Z"),
  })), ["pending"]);
});

test("future purchases are not added as pending before a future range", () => {
  assert.deepEqual(filterPeriodTransactions([
    expense("future", "2026-10-15T15:00:00Z"),
  ], accounts, {
    ...options, startDate: new Date("2026-10-20T15:00:00Z"), endDate: undefined,
  }), []);
});

test("only pending filters the entire history to unbilled credit card purchases", () => {
  const transactions = [
    expense("billed", "2026-09-22T15:00:00Z"),
    expense("pending", "2026-09-24T15:00:00Z"),
    expense("other-billed", "2026-09-24T15:00:00Z", { accountId: "other-tc" }),
    expense("other-pending", "2026-09-26T15:00:00Z", { accountId: "other-tc" }),
    expense("current", "2026-10-05T15:00:00Z"),
    expense("debit", "2026-10-05T15:00:00Z", { accountId: "debit" }),
    expense("income", "2026-10-05T15:00:00Z", { type: "income" }),
    expense("payment", "2026-10-05T15:00:00Z", { category: "abono_tarjeta" }),
    expense("transfer", "2026-10-05T15:00:00Z", { type: "transfer" }),
    expense("future", "2026-10-15T15:00:00Z"),
  ];
  const filtered = filterPeriodTransactions(transactions, accounts, {
    referenceDate: options.referenceDate,
    onlyUnbilled: true,
  });
  assert.deepEqual(ids(filtered), ["pending", "other-pending", "current"]);
  assert.equal(filtered.reduce((sum, transaction) => sum + transaction.amount, 0), 3000);
});

test("only pending respects the selected period and can include previous pending purchases", () => {
  const transactions = [
    expense("previous", "2026-09-27T15:00:00Z"),
    expense("current", "2026-10-05T15:00:00Z"),
    expense("after-end", "2026-10-10T15:00:00Z"),
  ];
  const range = {
    ...options,
    endDate: new Date("2026-10-06T23:00:00Z"),
    onlyUnbilled: true,
  };
  assert.deepEqual(ids(filterPeriodTransactions(transactions, accounts, {
    ...range, includeUnbilled: false,
  })), ["current"]);
  assert.deepEqual(ids(filterPeriodTransactions(transactions, accounts, range)), ["previous", "current"]);
});

test("turning off only pending restores billed and non-card transactions", () => {
  const transactions = [
    expense("billed", "2026-09-22T15:00:00Z"),
    expense("pending", "2026-09-24T15:00:00Z"),
    expense("debit", "2026-10-05T15:00:00Z", { accountId: "debit" }),
  ];
  assert.deepEqual(filterPeriodTransactions(transactions, accounts, {
    onlyUnbilled: false, referenceDate: options.referenceDate,
  }), transactions);
});
