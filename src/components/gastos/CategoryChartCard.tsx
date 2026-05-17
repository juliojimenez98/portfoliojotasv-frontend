'use client';

import React, { useState } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface CategorySummary {
  value: string;
  label: string;
  icon: string;
  total: number;
  count: number;
}

interface CategoryChartCardProps {
  monthName: string;
  categorySummary: CategorySummary[];
  maxCategoryTotal: number;
}

const PIE_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

export default function CategoryChartCard({
  monthName,
  categorySummary,
  maxCategoryTotal,
}: CategoryChartCardProps) {
  const [viewMode, setViewMode] = useState<'bars' | 'pie'>('bars');

  // Sum total for pie chart percentages
  const grandTotal = categorySummary.reduce((acc, cat) => acc + cat.total, 0);

  // Generate conic gradient string for the pie chart
  let cumulativePercent = 0;
  const gradientStops = categorySummary.map((item, index) => {
    const percent = (item.total / grandTotal) * 100;
    const start = cumulativePercent;
    cumulativePercent += percent;
    const color = PIE_COLORS[index % PIE_COLORS.length];
    return `${color} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  return (
    <Card variant="glass" className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">Gastos por Categoría</h3>
          <Badge variant="info" className="capitalize">{monthName}</Badge>
        </div>
        {categorySummary.length > 0 && (
          <div className="flex bg-background-elevated p-1 rounded-lg border border-border shadow-sm">
            <button
              onClick={() => setViewMode('bars')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'bars' ? 'bg-primary text-white shadow-sm' : 'text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="Vista de Barras"
            >
              📊
            </button>
            <button
              onClick={() => setViewMode('pie')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'pie' ? 'bg-primary text-white shadow-sm' : 'text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="Vista de Torta"
            >
              🥧
            </button>
          </div>
        )}
      </CardHeader>
      
      <div className="flex-1 mt-2">
        {categorySummary.length === 0 ? (
          <p className="text-sm text-foreground-subtle text-center py-8">Sin gastos registrados.</p>
        ) : viewMode === 'bars' ? (
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 animate-fade-in">
            {categorySummary.map((item, index) => {
              const percentage = maxCategoryTotal > 0 ? (item.total / maxCategoryTotal) * 100 : 0;
              const barColor = PIE_COLORS[index % PIE_COLORS.length];
              return (
                <div key={item.value}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-foreground-subtle">({item.count})</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-background-elevated overflow-hidden p-0.5 border border-border/50">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center animate-fade-in py-2 gap-6 h-full">
            {/* Pie Chart SVG / CSS */}
            <div 
              className="w-48 h-48 rounded-full shadow-lg border-4 border-background-elevated relative animate-scale-up"
              style={{
                background: `conic-gradient(${gradientStops})`,
              }}
            >
              {/* Inner circle for a 'donut' effect, optional but looks premium */}
              <div className="absolute inset-[25%] bg-background rounded-full shadow-inner flex items-center justify-center">
                <span className="text-xs font-bold text-foreground opacity-50">Total</span>
              </div>
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 w-full gap-2 px-2 max-h-[140px] overflow-y-auto">
              {categorySummary.map((item, index) => {
                const color = PIE_COLORS[index % PIE_COLORS.length];
                const percent = ((item.total / grandTotal) * 100).toFixed(1);
                return (
                  <div key={item.value} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-background-elevated border border-border/50">
                    <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.icon} {item.label}</p>
                      <div className="flex justify-between mt-0.5">
                        <span className="font-bold text-foreground-muted">{formatCurrency(item.total)}</span>
                        <span className="text-foreground-subtle">{percent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
