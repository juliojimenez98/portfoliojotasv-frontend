export interface PeriodSnapshot {
  totalExpenses: number;
  totalIncome: number;
  totalTransfers: number;
  netSavings: number;
  transactionCount: number;
  topCategories: { category: string; amount: number; count: number }[];
}

export interface ISpendPeriod {
  _id: string;
  userId: string;
  label: string;
  startDate: string;
  endDate?: string;
  status: "active" | "closed";
  snapshot?: PeriodSnapshot;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
