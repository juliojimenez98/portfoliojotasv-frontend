import type { Metadata } from 'next';
import { getMonthlyComparisonSummary, getTransactionCategories } from '@/actions/transactions';
import MonthlyComparisonContainer from '@/components/gastos/MonthlyComparisonContainer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reportes y Comparativa',
  description: 'Análisis financiero mes a mes de ingresos, gastos y capacidad de ahorro.',
};

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const yearParam = params?.year ? parseInt(params.year, 10) : currentYear;

  let monthlyData: any[] = [];
  let categories: any[] = [];

  try {
    [monthlyData, categories] = await Promise.all([
      getMonthlyComparisonSummary(yearParam),
      getTransactionCategories(),
    ]);
  } catch {
    monthlyData = [];
    categories = [];
  }

  return (
    <MonthlyComparisonContainer
      initialYear={yearParam}
      monthlyData={monthlyData}
      categories={categories}
    />
  );
}
