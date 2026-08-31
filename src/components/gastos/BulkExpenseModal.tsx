"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import type { IAccount } from "@/types/account";
import type { ICategory } from "@/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { createBulkTransactions } from "@/actions/transactions";

interface BulkExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: IAccount[];
  categories: ICategory[];
  preselectedAccountId?: string | null;
  onSuccess?: () => void;
}

interface ExpenseRow {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: string;
  notes: string;
}

interface BulkDraft {
  accountId: string;
  globalDate: string;
  rows: ExpenseRow[];
  savedAt: string;
}

const STORAGE_KEY = "ecosistema_bulk_expense_draft_v1";

const getLocalDateString = (dateInput: Date | string | number = new Date()) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createEmptyRow = (defaultCategory: string, defaultDate: string): ExpenseRow => ({
  id: Math.random().toString(36).substring(2, 9),
  date: defaultDate,
  description: "",
  category: defaultCategory,
  amount: "",
  notes: "",
});

export default function BulkExpenseModal({
  isOpen,
  onClose,
  accounts,
  categories,
  preselectedAccountId = null,
  onSuccess,
}: BulkExpenseModalProps) {
  const todayStr = useMemo(() => getLocalDateString(), []);
  const defaultCategoryValue = useMemo(
    () => (categories.length > 0 ? categories[0].value : "other"),
    [categories],
  );

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [globalDate, setGlobalDate] = useState<string>(todayStr);
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [savedDraft, setSavedDraft] = useState<BulkDraft | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Initialize or check draft when modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      return;
    }

    const initialAccountId =
      preselectedAccountId || (accounts.length > 0 ? accounts[0]._id : "");
    setSelectedAccountId(initialAccountId);
    setGlobalDate(todayStr);
    setError("");
    setShowPasteBox(false);
    setPasteText("");

    // Check for draft in localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: BulkDraft = JSON.parse(stored);
        const hasData =
          Array.isArray(parsed.rows) &&
          parsed.rows.some(
            (r) => r.description.trim() !== "" || (parseFloat(r.amount) || 0) > 0,
          );

        if (hasData) {
          setSavedDraft(parsed);
          // Set standard empty rows while user decides
          setRows([
            createEmptyRow(defaultCategoryValue, todayStr),
            createEmptyRow(defaultCategoryValue, todayStr),
            createEmptyRow(defaultCategoryValue, todayStr),
            createEmptyRow(defaultCategoryValue, todayStr),
            createEmptyRow(defaultCategoryValue, todayStr),
          ]);
          setIsInitialized(true);
          return;
        }
      }
    } catch {
      // Ignore parse error
    }

    setSavedDraft(null);
    setRows([
      createEmptyRow(defaultCategoryValue, todayStr),
      createEmptyRow(defaultCategoryValue, todayStr),
      createEmptyRow(defaultCategoryValue, todayStr),
      createEmptyRow(defaultCategoryValue, todayStr),
      createEmptyRow(defaultCategoryValue, todayStr),
    ]);
    setIsInitialized(true);
  }, [isOpen, preselectedAccountId, accounts, defaultCategoryValue, todayStr]);

  // Auto-save draft when user makes changes
  useEffect(() => {
    if (!isOpen || !isInitialized) return;

    const hasMeaningfulContent = rows.some(
      (r) => r.description.trim() !== "" || (parseFloat(r.amount) || 0) > 0,
    );

    if (hasMeaningfulContent && selectedAccountId) {
      const draft: BulkDraft = {
        accountId: selectedAccountId,
        globalDate,
        rows,
        savedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {}
    }
  }, [rows, selectedAccountId, globalDate, isOpen, isInitialized]);

  const handleRestoreDraft = () => {
    if (!savedDraft) return;

    if (savedDraft.accountId) {
      setSelectedAccountId(savedDraft.accountId);
    }
    if (savedDraft.globalDate) {
      setGlobalDate(savedDraft.globalDate);
    }
    if (Array.isArray(savedDraft.rows) && savedDraft.rows.length > 0) {
      setRows(savedDraft.rows);
    }
    setSavedDraft(null);
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSavedDraft(null);
  };

  const selectedAccount = accounts.find((a) => a._id === selectedAccountId);

  // Row operations
  const handleRowChange = (id: string, field: keyof ExpenseRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow(defaultCategoryValue, globalDate)]);
  };

  const handleAddMultipleRows = (count: number = 5) => {
    const newRows = Array.from({ length: count }, () =>
      createEmptyRow(defaultCategoryValue, globalDate),
    );
    setRows((prev) => [...prev, ...newRows]);
  };

  const handleDeleteRow = (id: string) => {
    if (rows.length === 1) {
      setRows([createEmptyRow(defaultCategoryValue, globalDate)]);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearEmptyRows = () => {
    const filled = rows.filter(
      (r) => r.description.trim() !== "" || (parseFloat(r.amount) || 0) > 0,
    );
    if (filled.length === 0) {
      setRows([createEmptyRow(defaultCategoryValue, globalDate)]);
    } else {
      setRows(filled);
    }
  };

  const handleApplyGlobalDate = () => {
    setRows((prev) => prev.map((r) => ({ ...r, date: globalDate })));
  };

  // Paste from Excel / Google Sheets parser
  const handleParsePaste = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.trim().split(/\r?\n/);
    const parsedRows: ExpenseRow[] = [];

    for (const line of lines) {
      let cols = line.split("\t");
      if (cols.length === 1 && line.includes(";")) {
        cols = line.split(";");
      } else if (cols.length === 1 && line.includes(",")) {
        cols = line.split(",");
      }

      cols = cols.map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (cols.length === 0 || cols.every((c) => !c)) continue;

      let dateVal = globalDate;
      let descVal = "";
      let catVal = defaultCategoryValue;
      let amountVal = "";
      let notesVal = "";

      if (cols.length === 1) {
        const num = parseFloat(cols[0].replace(/[^0-9.-]/g, ""));
        if (!isNaN(num) && num > 0) {
          amountVal = String(num);
        } else {
          descVal = cols[0];
        }
      } else if (cols.length === 2) {
        const num1 = parseFloat(cols[0].replace(/[^0-9.-]/g, ""));
        const num2 = parseFloat(cols[1].replace(/[^0-9.-]/g, ""));
        if (!isNaN(num2) && num2 > 0) {
          descVal = cols[0];
          amountVal = String(num2);
        } else if (!isNaN(num1) && num1 > 0) {
          amountVal = String(num1);
          descVal = cols[1];
        } else {
          descVal = cols[0];
          notesVal = cols[1];
        }
      } else if (cols.length === 3) {
        if (cols[0].match(/^\d{4}-\d{2}-\d{2}$/) || cols[0].match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
          dateVal = cols[0].includes("/") ? getLocalDateString(new Date(cols[0])) : cols[0];
          descVal = cols[1];
          const num = parseFloat(cols[2].replace(/[^0-9.-]/g, ""));
          if (!isNaN(num)) amountVal = String(num);
        } else {
          descVal = cols[0];
          const foundCat = categories.find(
            (c) =>
              c.label.toLowerCase() === cols[1].toLowerCase() ||
              c.value.toLowerCase() === cols[1].toLowerCase(),
          );
          if (foundCat) catVal = foundCat.value;
          const num = parseFloat(cols[2].replace(/[^0-9.-]/g, ""));
          if (!isNaN(num)) amountVal = String(num);
        }
      } else {
        let idx = 0;
        if (cols[0].match(/^\d{4}-\d{2}-\d{2}$/) || cols[0].match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
          dateVal = cols[0].includes("/") ? getLocalDateString(new Date(cols[0])) : cols[0];
          idx = 1;
        }
        descVal = cols[idx] || "";
        const foundCat = categories.find(
          (c) =>
            c.label.toLowerCase() === (cols[idx + 1] || "").toLowerCase() ||
            c.value.toLowerCase() === (cols[idx + 1] || "").toLowerCase(),
        );
        if (foundCat) {
          catVal = foundCat.value;
          idx++;
        }
        const num = parseFloat((cols[idx + 1] || "").replace(/[^0-9.-]/g, ""));
        if (!isNaN(num)) amountVal = String(num);
        notesVal = cols.slice(idx + 2).join(" ");
      }

      parsedRows.push({
        id: Math.random().toString(36).substring(2, 9),
        date: dateVal,
        description: descVal,
        category: catVal,
        amount: amountVal,
        notes: notesVal,
      });
    }

    if (parsedRows.length > 0) {
      setRows((prev) => {
        const filteredPrev = prev.filter(
          (r) => r.description.trim() !== "" || (parseFloat(r.amount) || 0) > 0,
        );
        return [...filteredPrev, ...parsedRows];
      });
      setPasteText("");
      setShowPasteBox(false);
    }
  };

  // Valid rows calculations
  const validRows = useMemo(() => {
    return rows.filter((r) => {
      const amt = parseFloat(r.amount);
      return amt > 0 && r.description.trim() !== "";
    });
  }, [rows]);

  const totalBatchAmount = useMemo(() => {
    return validRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }, [validRows]);

  const projectedBalance = useMemo(() => {
    if (!selectedAccount) return 0;
    return Math.round(selectedAccount.balance - totalBatchAmount);
  }, [selectedAccount, totalBatchAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      setError("Por favor selecciona una cuenta de cargo.");
      return;
    }
    if (validRows.length === 0) {
      setError("Ingresa al menos una fila con descripción y monto mayor a 0.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = validRows.map((r) => ({
        description: r.description.trim(),
        amount: parseFloat(r.amount),
        category: r.category || defaultCategoryValue,
        date: r.date ? new Date(r.date + "T00:00:00").toISOString() : new Date().toISOString(),
        notes: r.notes.trim() || undefined,
      }));

      await createBulkTransactions(selectedAccountId, payload);

      // Clear draft on successful submission
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setSavedDraft(null);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al procesar la carga masiva de gastos.");
    } finally {
      setLoading(false);
    }
  };

  const accountOptions = accounts.map((a) => ({
    value: a._id,
    label: `${a.type === "credit_card" ? "💳" : "🏦"} ${a.name} (${formatCurrency(a.balance, a.currency)})`,
  }));

  const draftAccountName = savedDraft
    ? accounts.find((a) => a._id === savedDraft.accountId)?.name || "Cuenta"
    : "";

  const draftValidCount = savedDraft
    ? savedDraft.rows.filter(
        (r) => r.description.trim() !== "" || (parseFloat(r.amount) || 0) > 0,
      ).length
    : 0;

  const draftTotalAmount = savedDraft
    ? savedDraft.rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📊 Carga Masiva de Gastos (Tabla tipo Excel)"
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Draft Recovery Prompt */}
        {savedDraft && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-200 animate-fade-in shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">💾</span>
              <div>
                <p className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span>Borrador guardado automáticamente</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {new Date(savedDraft.savedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Contiene <strong>{draftValidCount} gastos</strong> por un total de{" "}
                  <strong>{formatCurrency(draftTotalAmount)}</strong> para{" "}
                  <span className="text-amber-400 font-semibold">{draftAccountName}</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-all text-xs font-semibold text-foreground-muted"
              >
                🗑️ Descartar
              </button>
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all text-xs active:scale-95 shadow-md shadow-amber-500/25"
              >
                ✨ Recuperar Borrador
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-danger text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Top bar: Account Selector & Batch Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-background-elevated border border-border">
          <div className="md:col-span-6">
            <Select
              label="Cuenta de cargo *"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              options={accountOptions}
            />
          </div>

          <div className="md:col-span-3 flex items-center justify-between p-3 rounded-xl bg-background border border-border">
            <div>
              <p className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">
                Saldo Actual
              </p>
              <p className="text-base font-bold text-foreground mt-0.5">
                {selectedAccount
                  ? formatCurrency(selectedAccount.balance, selectedAccount.currency)
                  : "—"}
              </p>
            </div>
            <span className="text-xl">🏦</span>
          </div>

          <div className="md:col-span-3 flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/25">
            <div>
              <p className="text-[10px] uppercase font-bold text-primary tracking-wider">
                Saldo Proyectado
              </p>
              <p
                className={`text-base font-bold mt-0.5 ${
                  projectedBalance >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {selectedAccount
                  ? formatCurrency(projectedBalance, selectedAccount.currency)
                  : "—"}
              </p>
            </div>
            <span className="text-xl">📉</span>
          </div>
        </div>

        {/* Global Helpers Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-background-elevated/60 border border-border/80 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground-muted">📅 Fecha sugerida:</span>
            <input
              type="date"
              value={globalDate}
              onChange={(e) => setGlobalDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleApplyGlobalDate}
              className="px-3 py-1 rounded-lg bg-background border border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium text-foreground-muted hover:text-foreground active:scale-95"
            >
              Aplicar a todas
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPasteBox(!showPasteBox)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 font-bold transition-all active:scale-95 shadow-sm"
            >
              📋 {showPasteBox ? "Ocultar Pegado" : "Pegar desde Excel / Sheets"}
            </button>
          </div>
        </div>

        {/* Paste from Excel box */}
        {showPasteBox && (
          <div className="p-4 rounded-xl bg-primary/8 border border-primary/20 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                Pegar celdas copiadas de Excel / Google Sheets:
              </label>
              <span className="text-[11px] text-foreground-muted">
                (Detecta columnas: Descripción, Monto, Fecha, Categoría, Notas)
              </span>
            </div>
            <textarea
              rows={3}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"Supermercado Lider\t45000\nBencina Copec\t30000\nFarmacia Cruz Verde\t12500"}
              className="w-full p-3 text-xs font-mono rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPasteBox(false)}
                className="text-xs py-1.5 px-3"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleParsePaste}
                className="text-xs py-1.5 px-4 font-bold"
              >
                ⚡ Importar a la Tabla
              </Button>
            </div>
          </div>
        )}

        {/* Interactive Spreadsheet Table */}
        <div
          ref={tableContainerRef}
          className="border border-border rounded-xl overflow-x-auto overflow-y-auto max-h-[420px] bg-background shadow-inner"
        >
          <table className="min-w-[860px] w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-background-elevated border-b border-border shadow-sm">
              <tr className="text-foreground-muted font-bold uppercase tracking-wider">
                <th className="py-3 px-2 text-center w-10">#</th>
                <th className="py-3 px-2 w-36">Fecha</th>
                <th className="py-3 px-2 min-w-[220px]">Descripción *</th>
                <th className="py-3 px-2 w-48">Categoría *</th>
                <th className="py-3 px-2 w-36 text-right">Monto ($) *</th>
                <th className="py-3 px-2 min-w-[180px]">Notas (Opcional)</th>
                <th className="py-3 px-2 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row, idx) => {
                const isComplete =
                  row.description.trim() !== "" && (parseFloat(row.amount) || 0) > 0;

                return (
                  <tr
                    key={row.id}
                    className={`group transition-colors ${
                      isComplete
                        ? "bg-success/[0.04] hover:bg-success/[0.07]"
                        : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="py-2.5 px-2 text-center font-mono text-foreground-subtle font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-1.5">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleRowChange(row.id, "date", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-1.5">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) =>
                          handleRowChange(row.id, "description", e.target.value)
                        }
                        placeholder="Ej: Supermercado Lider"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-1.5">
                      <select
                        value={row.category}
                        onChange={(e) =>
                          handleRowChange(row.id, "category", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.icon || "📁"} {c.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-1.5">
                      <input
                        type="number"
                        step={selectedAccount?.currency === "CLP" ? "1" : "0.01"}
                        value={row.amount}
                        onChange={(e) => handleRowChange(row.id, "amount", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-xs text-right font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-1.5">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleRowChange(row.id, "notes", e.target.value)}
                        placeholder="Opcional"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted focus:text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1.5 rounded-lg text-foreground-subtle hover:text-danger hover:bg-danger/10 transition-colors opacity-70 group-hover:opacity-100"
                        title="Eliminar fila"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Row Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="px-3.5 py-2 rounded-xl border border-border bg-background-elevated hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-bold text-foreground active:scale-95 shadow-sm"
            >
              + Agregar Fila
            </button>
            <button
              type="button"
              onClick={() => handleAddMultipleRows(5)}
              className="px-3.5 py-2 rounded-xl border border-border bg-background-elevated hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-medium text-foreground-muted hover:text-foreground active:scale-95"
            >
              + 5 Filas
            </button>
            {rows.length > 3 && (
              <button
                type="button"
                onClick={handleClearEmptyRows}
                className="px-3 py-2 rounded-xl text-xs font-medium text-foreground-subtle hover:text-danger hover:bg-danger/10 transition-colors"
              >
                Limpiar vacías
              </button>
            )}
          </div>

          {/* Live Summary Bar */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-foreground-muted">
              <strong className="text-foreground">{validRows.length}</strong> de{" "}
              {rows.length} válidas
            </span>
            <div className="px-3.5 py-1.5 rounded-xl bg-danger/10 border border-danger/25">
              <span className="text-danger font-bold text-sm">
                Total: -{formatCurrency(totalBatchAmount, selectedAccount?.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit / Cancel Actions */}
        <div className="flex gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 py-2.5"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            disabled={validRows.length === 0 || !selectedAccountId}
            className="flex-1 font-bold py-2.5 shadow-lg shadow-primary/25"
          >
            📥 Registrar {validRows.length} Gasto{validRows.length !== 1 ? "s" : ""} (
            {formatCurrency(totalBatchAmount, selectedAccount?.currency)})
          </Button>
        </div>
      </form>
    </Modal>
  );
}
