'use client';

import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface MonthlyComparisonContainerProps {
  initialYear: number;
  monthlyData: {
    monthIndex: number;
    monthName: string;
    income: number;
    expense: number;
    savings: number;
    topCategories: { category: string; amount: number }[];
  }[];
  categories: { value: string; label: string; icon: string }[];
  onYearChange?: (year: number) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  streaming: '🎬 Streaming',
  music: '🎵 Música',
  software: '💻 Software',
  gaming: '🎮 Gaming',
  cloud: '☁️ Nube',
  fitness: '🏋️ Fitness',
  news: '📰 Noticias',
  productivity: '⚡ Productividad',
  other: '📁 Otro',
};

export default function MonthlyComparisonContainer({
  initialYear,
  monthlyData,
  categories,
}: MonthlyComparisonContainerProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);

  // Calculate annual totals
  const totalIncome = monthlyData.reduce((acc, m) => acc + m.income, 0);
  const totalExpense = monthlyData.reduce((acc, m) => acc + m.expense, 0);
  const totalSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  // Find max values for chart scaling
  const maxMonthlyVal = Math.max(
    ...monthlyData.map((m) => Math.max(m.income, m.expense, Math.abs(m.savings))),
    1
  );

  const getCatLabel = (val: string) => {
    const found = categories.find((c) => c.value === val);
    if (found) return `${found.icon || '📁'} ${found.label}`;
    return CATEGORY_EMOJIS[val] || `📁 ${val}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Comparativa Mes a Mes</h1>
          <p className="text-sm text-foreground-muted mt-1">Analítica de ingresos, gastos y capacidad de ahorro</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => {
              const y = parseInt(e.target.value, 10);
              setSelectedYear(y);
              // In Next.js server actions / server components, we can reload or use query param
              window.location.href = `/app/gastos/reportes?year=${y}`;
            }}
            className="px-4 py-2 rounded-xl bg-background-elevated border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm"
          >
            {[selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
              <option key={y} value={y}>
                Año {y}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2 text-xs py-2 shadow-sm">
            <span>📄</span> Exportar / Imprimir
          </Button>
        </div>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card variant="gradient">
          <CardHeader><CardTitle>Ingresos Totales</CardTitle><span className="text-xl">📈</span></CardHeader>
          <CardValue className="text-success">{formatCurrency(totalIncome)}</CardValue>
          <p className="text-xs text-foreground-subtle mt-1">Acumulado del año</p>
        </Card>
        <Card variant="gradient">
          <CardHeader><CardTitle>Gastos Totales</CardTitle><span className="text-xl">📉</span></CardHeader>
          <CardValue className="text-danger">{formatCurrency(totalExpense)}</CardValue>
          <p className="text-xs text-foreground-subtle mt-1">Acumulado del año</p>
        </Card>
        <Card variant="glow">
          <CardHeader><CardTitle>Ahorro Neto</CardTitle><span className="text-xl">💰</span></CardHeader>
          <CardValue className={totalSavings >= 0 ? 'gradient-text' : 'text-danger'}>
            {formatCurrency(totalSavings)}
          </CardValue>
          <p className="text-xs text-foreground-subtle mt-1">Balance anual disponible</p>
        </Card>
        <Card variant="glass">
          <CardHeader><CardTitle>Tasa de Ahorro</CardTitle><span className="text-xl">⚡</span></CardHeader>
          <CardValue className="text-primary">{savingsRate.toFixed(1)}%</CardValue>
          <p className="text-xs text-foreground-subtle mt-1">Porcentaje de retención</p>
        </Card>
      </div>

      {/* Stunning Visual Chart */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Gráfico Comparativo Mensual</h3>
            <p className="text-xs text-foreground-subtle mt-0.5">Distribución de Ingresos (Verde), Gastos (Rojo) y Ahorro (Púrpura)</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success/80 shadow-sm"></span> Ingresos</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-danger/80 shadow-sm"></span> Gastos</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary/80 shadow-sm"></span> Ahorro</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 h-64 items-end pt-6 border-b border-border/80">
          {monthlyData.map((m) => {
            const incPct = (m.income / maxMonthlyVal) * 100;
            const expPct = (m.expense / maxMonthlyVal) * 100;
            const savPct = (Math.max(m.savings, 0) / maxMonthlyVal) * 100;
            const isSelected = selectedMonthIndex === m.monthIndex;

            return (
              <div
                key={m.monthIndex}
                onClick={() => setSelectedMonthIndex(isSelected ? null : m.monthIndex)}
                className={`flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group p-1 rounded-xl transition-all ${
                  isSelected ? 'bg-primary/10 shadow-md border border-primary/20' : 'hover:bg-white/5'
                }`}
                title={`${m.monthName}: Ingresos ${formatCurrency(m.income)} | Gastos ${formatCurrency(m.expense)}`}
              >
                {/* Bar container */}
                <div className="w-full flex items-end justify-center gap-1 h-full max-w-[40px]">
                  {/* Income Bar */}
                  <div
                    className="w-1/3 bg-gradient-to-t from-success/60 to-success rounded-t-md group-hover:brightness-110 transition-all duration-500 shadow-sm"
                    style={{ height: `${Math.max(incPct, 2)}%` }}
                  />
                  {/* Expense Bar */}
                  <div
                    className="w-1/3 bg-gradient-to-t from-danger/60 to-danger rounded-t-md group-hover:brightness-110 transition-all duration-500 shadow-sm"
                    style={{ height: `${Math.max(expPct, 2)}%` }}
                  />
                  {/* Savings Bar */}
                  <div
                    className="w-1/3 bg-gradient-to-t from-primary/60 to-primary rounded-t-md group-hover:brightness-110 transition-all duration-500 shadow-sm"
                    style={{ height: `${Math.max(savPct, 2)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-foreground-muted group-hover:text-foreground transition-colors truncate w-full text-center">
                  {m.monthName.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-foreground-subtle text-center mt-3 italic">
          💡 Haz clic en cualquier mes para ver su desglose detallado de categorías abajo.
        </p>
      </Card>

      {/* Detailed Breakdown Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span>📅</span> Desglose Detallado por Mes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyData.map((m) => {
            const isSelected = selectedMonthIndex === m.monthIndex;
            const hasActivity = m.income > 0 || m.expense > 0;

            return (
              <Card
                key={m.monthIndex}
                variant={isSelected ? 'glow' : 'glass'}
                className={`transition-all duration-300 ${isSelected ? 'ring-2 ring-primary scale-[1.02]' : ''}`}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h4 className="text-base font-bold text-foreground">{m.monthName}</h4>
                    <Badge variant={m.savings >= 0 ? 'success' : 'danger'}>
                      {m.savings >= 0 ? '+' : ''}{formatCurrency(m.savings)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-success/10 border border-success/20 text-center">
                      <p className="text-foreground-subtle font-medium">Ingresos</p>
                      <p className="text-sm font-bold text-success mt-0.5">{formatCurrency(m.income)}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/20 text-center">
                      <p className="text-foreground-subtle font-medium">Gastos</p>
                      <p className="text-sm font-bold text-danger mt-0.5">{formatCurrency(m.expense)}</p>
                    </div>
                  </div>

                  {/* Top Categories */}
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-bold text-foreground-muted">Top Categorías de Gasto:</p>
                    {!hasActivity ? (
                      <p className="text-xs text-foreground-subtle italic py-2 text-center bg-background-elevated rounded-xl border border-border">
                        Sin movimientos este mes
                      </p>
                    ) : m.topCategories.length === 0 ? (
                      <p className="text-xs text-foreground-subtle italic py-2 text-center bg-background-elevated rounded-xl border border-border">
                        Sin gastos registrados
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {m.topCategories.map((cat) => (
                          <div key={cat.category} className="flex items-center justify-between text-xs p-2 rounded-lg bg-background-elevated border border-border/50">
                            <span className="font-medium text-foreground truncate max-w-[140px]">
                              {getCatLabel(cat.category)}
                            </span>
                            <span className="font-bold text-danger">
                              -{formatCurrency(cat.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
