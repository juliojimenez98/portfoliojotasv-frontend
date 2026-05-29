"use client";

import React, { useState, useMemo } from "react";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DeleteTransactionButton from "./DeleteTransactionButton";
import TransactionFormModal from "./TransactionFormModal";
import { formatCurrency, cn, isCreditCardPayment } from "@/lib/utils";
import { updateTransaction } from "@/actions/transactions";
import type { ITransaction, ICategory } from "@/types/transaction";
import type { IAccount } from "@/types/account";
import type { ISpendPeriod } from "@/types/period";

interface TransactionsPanelProps {
  transactions: ITransaction[];
  categories: ICategory[];
  accounts: IAccount[];
  periods?: ISpendPeriod[];
}

export default function TransactionsPanel({
  transactions,
  categories,
  accounts,
  periods = [],
}: TransactionsPanelProps) {
  const [typeFilter, setTypeFilter] = useState<
    "all" | "income" | "expense" | "transfer"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTxn, setEditingTxn] = useState<ITransaction | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [periodFilter, setPeriodFilter] = useState<string>("all"); // 'all' | period._id
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filtered = useMemo(() => {
    let result = [...transactions];

    // Period filter (overrides dateFrom/dateTo when active)
    if (periodFilter !== "all") {
      const period = periods.find((p) => p._id === periodFilter);
      if (period) {
        const from = new Date(period.startDate);
        const to = period.endDate ? new Date(period.endDate) : new Date();
        to.setHours(23, 59, 59, 999);
        result = result.filter((t) => {
          const d = new Date(t.date);
          return d >= from && d <= to;
        });
      }
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((t) => {
        if (typeFilter === "expense") {
          return t.type === "expense" || isCreditCardPayment(t);
        }
        if (typeFilter === "transfer") {
          return t.type === "transfer" && !isCreditCardPayment(t);
        }
        return t.type === typeFilter;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Account filter
    if (accountFilter !== "all") {
      result = result.filter((t) => t.accountId === accountFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(q));
    }

    // Date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((t) => new Date(t.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.date) <= to);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        cmp = a.amount - b.amount;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [
    transactions,
    periods,
    periodFilter,
    typeFilter,
    categoryFilter,
    accountFilter,
    searchQuery,
    dateFrom,
    dateTo,
    sortBy,
    sortDir,
  ]);

  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "expense" || isCreditCardPayment(t))
    .reduce((s, t) => s + t.amount, 0);

  const clearFilters = () => {
    setTypeFilter("all");
    setCategoryFilter("all");
    setAccountFilter("all");
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setPeriodFilter("all");
  };

  const hasActiveFilters =
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    accountFilter !== "all" ||
    searchQuery.trim() !== "" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    periodFilter !== "all";

  const getCatDisplay = (catValue: string, txn?: ITransaction) => {
    if (txn && isCreditCardPayment(txn)) return { icon: "💳", label: "Abono a tarjeta credito" };
    if (catValue === "transfer") return { icon: "🔄", label: "Transferencia" };
    const cat = categories.find((c) => c.value === catValue);
    return cat
      ? { icon: cat.icon, label: cat.label }
      : { icon: "📁", label: catValue };
  };

  const getAccountName = (accId: string) => {
    const acc = accounts.find((a) => a._id === accId);
    return acc?.name || "Desconocida";
  };

  const handleExportExcel = () => {
    const headers = ["Descripción", "Categoría", "Cuenta", "Fecha", "Tipo", "Monto (CLP)", "Notas"];
    const rows = filtered.map((t) => {
      const cat = getCatDisplay(t.category, t);
      const dateStr = new Date(t.date).toLocaleDateString("es-CL");
      const isCCPayment = isCreditCardPayment(t);
      const typeStr = t.type === "income" ? "Ingreso" : isCCPayment ? "Gasto (Abono tarjeta)" : t.type === "transfer" ? "Transferencia" : "Gasto";
      return [
        t.description,
        cat.label,
        getAccountName(t.accountId),
        dateStr,
        typeStr,
        t.amount,
        t.notes || ""
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transacciones_${new Date().toLocaleDateString("es-CL").replace(/\//g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Transacciones
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Historial completo de movimientos financieros
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-background-elevated hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-bold text-foreground active:scale-95 shadow-sm"
          >
            📥 Exportar Excel
          </button>
          <Badge variant="primary">{filtered.length} resultados</Badge>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Ingresos
              </p>
              <p className="text-2xl font-bold text-success mt-1">
                +{formatCurrency(totalIncome)}
              </p>
            </div>
            <span className="text-2xl">📈</span>
          </div>
        </Card>
        <Card variant="gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Gastos
              </p>
              <p className="text-2xl font-bold text-danger mt-1">
                -{formatCurrency(totalExpense)}
              </p>
            </div>
            <span className="text-2xl">📉</span>
          </div>
        </Card>
        <Card variant="gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Balance Neto
              </p>
              <p
                className={cn(
                  "text-2xl font-bold mt-1",
                  totalIncome - totalExpense >= 0
                    ? "text-success"
                    : "text-danger",
                )}
              >
                {totalIncome - totalExpense >= 0 ? "+" : ""}
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
            <span className="text-2xl">⚖️</span>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card variant="glass">
        <CardHeader>
          <h3 className="text-base font-semibold text-foreground">Filtros</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-danger hover:text-danger/80 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Buscar
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Descripción del movimiento..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="all">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
              <option value="transfer">Transferencias</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="all">Todas</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Cuenta
            </label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="all">Todas</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period filter */}
          {periods.length > 0 && (
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-1.5">
                Período Laboral
              </label>
              <select
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  // clear manual date range when period is selected
                  if (e.target.value !== "all") {
                    setDateFrom("");
                    setDateTo("");
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="all">📅 Todos los períodos</option>
                {periods.map((p) => {
                  const start = new Date(p.startDate).toLocaleDateString(
                    "es-CL",
                    { day: "2-digit", month: "short" },
                  );
                  const end = p.endDate
                    ? new Date(p.endDate).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "Activo";
                  return (
                    <option key={p._id} value={p._id}>
                      {p.status === "active" ? "🟢" : "📋"} {p.label} ({start} →{" "}
                      {end})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Date From */}
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Ordenar por
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="date">Fecha</option>
                <option value="amount">Monto</option>
              </select>
              <button
                onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                className="px-3 py-2 rounded-xl border border-border bg-background text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
                title={sortDir === "asc" ? "Ascendente" : "Descendente"}
              >
                {sortDir === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <Card variant="glass">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">Movimientos</h3>
          <Badge variant="default">{filtered.length}</Badge>
        </CardHeader>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sin resultados
            </h3>
            <p className="text-sm text-foreground-muted">
              No se encontraron transacciones con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-xs font-bold text-foreground-muted uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-foreground-muted uppercase tracking-wider hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-foreground-muted uppercase tracking-wider hidden lg:table-cell">
                    Cuenta
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-foreground-muted uppercase tracking-wider hidden sm:table-cell">
                    Fecha
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-bold text-foreground-muted uppercase tracking-wider hidden xl:table-cell">
                    Saldo Previo
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-bold text-foreground-muted uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="text-right py-3 px-1 text-xs font-bold text-foreground-muted uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => {
                  const cat = getCatDisplay(txn.category, txn);
                  const ccPayment = isCreditCardPayment(txn);
                  const dateStr = new Date(txn.date).toLocaleDateString(
                    "es-CL",
                    { day: "2-digit", month: "short", year: "numeric" },
                  );

                  return (
                    <tr
                      key={txn._id}
                      className="border-b border-border/50 hover:bg-black/2 dark:hover:bg-white/2 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                              txn.type === "expense" || ccPayment
                                ? "bg-danger/10 text-danger"
                                : txn.type === "income"
                                  ? "bg-success/10 text-success"
                                  : "bg-primary/10 text-primary",
                            )}
                          >
                            {txn.type === "expense" || ccPayment
                              ? "↓"
                              : txn.type === "income"
                                ? "↑"
                                : "⇄"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {txn.description}
                            </p>
                            <p className="text-xs text-foreground-subtle md:hidden">
                              {cat.icon} {cat.label}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-foreground-muted capitalize">
                            {cat.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className="text-foreground-muted">
                          {getAccountName(txn.accountId)}
                        </span>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <span className="text-foreground-muted whitespace-nowrap">
                          {dateStr}
                        </span>
                      </td>
                      <td className="py-3 px-3 hidden xl:table-cell text-right">
                        {txn.balanceBefore != null ? (
                          <span className="text-xs text-foreground-subtle font-mono whitespace-nowrap">
                            {formatCurrency(txn.balanceBefore)}
                          </span>
                        ) : (
                          <span className="text-xs text-foreground-subtle/40">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={cn(
                            "font-bold whitespace-nowrap",
                            txn.type === "expense" || ccPayment
                              ? "text-danger"
                              : txn.type === "income"
                                ? "text-success"
                                : "text-primary",
                          )}
                        >
                          {txn.type === "expense" || ccPayment
                            ? "-"
                            : txn.type === "income"
                              ? "+"
                              : "⇄ "}
                          {formatCurrency(txn.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-1 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingTxn(txn)}
                            className="p-1.5 rounded-lg text-foreground-subtle hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <DeleteTransactionButton transactionId={txn._id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={!!editingTxn}
        onClose={() => setEditingTxn(null)}
        onSubmit={async (data) => {
          if (editingTxn) {
            await updateTransaction(editingTxn._id, data);
            setEditingTxn(null);
          }
        }}
        accounts={accounts}
        categories={categories}
        editingTransaction={editingTxn}
        transactions={transactions}
      />
    </div>
  );
}
