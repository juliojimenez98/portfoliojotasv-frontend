"use client";

import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Input, { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { IAccount } from "@/types/account";
import type { ICategory, ITransaction } from "@/types/transaction";
import { formatCurrency, cn } from "@/lib/utils";
import { createCategory } from "@/actions/transactions";
import { ACCOUNT_TYPE_ICONS } from "@/lib/gastos-constants";

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  accounts: IAccount[];
  categories: ICategory[];
  editingTransaction?: any | null;
  transactions?: ITransaction[];
}

const currencyOptions = [
  { value: "CLP", label: "CLP — Peso Chileno" },
  { value: "USD", label: "USD — Dólar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "DOP", label: "DOP — Peso Dominicano" },
];

const getLocalDateString = (dateInput: Date | string | number) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const QUICK_EMOJIS = [
  "🍔",
  "🚗",
  "🎬",
  "💊",
  "🎓",
  "🏠",
  "💡",
  "🛍️",
  "✈️",
  "💻",
  "📱",
  "🍕",
  "🏆",
  "🎁",
  "🐶",
  "☕",
  "🥦",
  "⛽",
  "🎮",
  "🛒",
];

const typeIcons = ACCOUNT_TYPE_ICONS;

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  categories,
  editingTransaction = null,
  transactions = [],
}: TransactionFormModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    type: "expense" as "expense" | "income",
    accountId: "",
    description: "",
    originalAmount: "",
    originalCurrency: "CLP",
    exchangeRate: "",
    category: "",
    customCategory: "",
    date: getLocalDateString(new Date()),
    notes: "",
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customIcon, setCustomIcon] = useState("📁");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setForm({
          type:
            editingTransaction.type === "transfer"
              ? "expense"
              : editingTransaction.type,
          accountId:
            editingTransaction.accountId ||
            (accounts.length > 0 ? accounts[0]._id : ""),
          description: editingTransaction.description || "",
          originalAmount: (
            editingTransaction.originalAmount ??
            editingTransaction.amount ??
            ""
          ).toString(),
          originalCurrency: editingTransaction.originalCurrency || "CLP",
          exchangeRate:
            editingTransaction.exchangeRate &&
            editingTransaction.exchangeRate !== 1
              ? editingTransaction.exchangeRate.toString()
              : "",
          category:
            editingTransaction.category ||
            (categories.length > 0 ? categories[0].value : "other"),
          customCategory: "",
          date: editingTransaction.date
            ? getLocalDateString(editingTransaction.date)
            : getLocalDateString(new Date()),
          notes: editingTransaction.notes || "",
        });
        setStep(3); // Start directly at details when editing
      } else {
        setForm({
          type: "expense",
          accountId: accounts.length > 0 ? accounts[0]._id : "",
          description: "",
          originalAmount: "",
          originalCurrency: "CLP",
          exchangeRate: "",
          category: categories.length > 0 ? categories[0].value : "other",
          customCategory: "",
          date: getLocalDateString(new Date()),
          notes: "",
        });
        setStep(1); // Start at step 1 for new transactions
      }
      setIsCustomCategory(false);
      setCustomIcon("📁");
      setError("");
    }
  }, [isOpen, accounts, categories, editingTransaction]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountSelect = (accountId: string) => {
    setForm((p) => ({ ...p, accountId }));
    setError("");
    setStep(2);
  };

  const handleCategorySelect = (categoryValue: string) => {
    setForm((p) => ({ ...p, category: categoryValue }));
    setError("");
    setStep(3);
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.accountId) return setError("Selecciona una cuenta para continuar");
      setError("");
      setStep(2);
    } else if (step === 2) {
      const finalCategory = isCustomCategory
        ? form.customCategory.trim()
        : form.category;
      if (!finalCategory) return setError("Selecciona una categoría para continuar");
      setError("");
      setStep(3);
    }
  };

  const prevStep = () => {
    setError("");
    setStep((p) => Math.max(1, p - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountId) return setError("Selecciona una cuenta");
    if (!form.description.trim())
      return setError("La descripción es requerida");
    const numAmount = parseFloat(form.originalAmount);
    if (!numAmount || numAmount <= 0)
      return setError("Ingresa un monto válido mayor a 0");
    const finalCategory = isCustomCategory
      ? form.customCategory.trim()
      : form.category;
    if (!finalCategory) return setError("La categoría es requerida");

    setLoading(true);
    setError("");
    try {
      let resolvedCategoryValue = finalCategory.toLowerCase();
      if (isCustomCategory && form.customCategory.trim()) {
        try {
          const created = await createCategory({
            label: form.customCategory.trim(),
            icon: customIcon,
          });
          if (created && created.value) {
            resolvedCategoryValue = created.value;
          }
        } catch {}
      }
      await onSubmit({
        type: form.type,
        accountId: form.accountId,
        description: form.description.trim(),
        originalAmount: numAmount,
        originalCurrency: form.originalCurrency,
        exchangeRate: form.exchangeRate
          ? parseFloat(form.exchangeRate)
          : undefined,
        category: resolvedCategoryValue,
        date: new Date(form.date + "T00:00:00"),
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al registrar la transacción");
    } finally {
      setLoading(false);
    }
  };

  const isExpense = form.type === "expense";
  const selectedCategoryValue = isCustomCategory
    ? form.customCategory.trim().toLowerCase()
    : form.category;

  const categoryObj = categories.find((c) => c.value === selectedCategoryValue);

  // ── Calculate Category Monthly Expenses and Limits ──
  const { currentCategoryExpenses, newTotal } = useMemo(() => {
    if (!transactions || !isOpen || !isExpense || !selectedCategoryValue) {
      return { currentCategoryExpenses: 0, newTotal: 0 };
    }

    const date = new Date(form.date + "T00:00:00");
    const month = date.getMonth();
    const year = date.getFullYear();

    const currentExpenses = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === selectedCategoryValue &&
          new Date(t.date).getMonth() === month &&
          new Date(t.date).getFullYear() === year &&
          (!editingTransaction || t._id !== editingTransaction._id),
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const typedAmount = parseFloat(form.originalAmount) || 0;
    const rate =
      form.originalCurrency === "CLP"
        ? 1
        : parseFloat(form.exchangeRate) || 900; // default rate fallback for non-CLP
    const addedAmountCLP = typedAmount * rate;

    return {
      currentCategoryExpenses: currentExpenses,
      newTotal: currentExpenses + addedAmountCLP,
    };
  }, [
    transactions,
    form.category,
    form.customCategory,
    isCustomCategory,
    form.date,
    form.originalAmount,
    form.originalCurrency,
    form.exchangeRate,
    isExpense,
    isOpen,
    editingTransaction,
  ]);

  const selectedAccount = accounts.find((a) => a._id === form.accountId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? "✏️ Editar Movimiento" : "Nuevo Movimiento"}
      size="md"
    >
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2 mb-6 select-none">
        {[
          { num: 1, label: "Cuenta", icon: "🏦" },
          { num: 2, label: "Categoría", icon: "📁" },
          { num: 3, label: "Detalles", icon: "📝" },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div 
              onClick={() => step > s.num || (editingTransaction && setStep(s.num)) ? setStep(s.num) : null}
              className={cn(
                "flex flex-col items-center gap-1.5 relative z-10",
                (step > s.num || editingTransaction) ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 duration-300",
                  step === s.num
                    ? "border-primary bg-primary text-white scale-110 shadow-md shadow-primary/25"
                    : step > s.num
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "border-border bg-background-elevated text-foreground-subtle"
                )}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-wide uppercase transition-colors duration-300",
                  step === s.num ? "text-primary" : "text-foreground-muted"
                )}
              >
                {s.label}
              </span>
            </div>
            {idx < 2 && (
              <div className="flex-1 h-0.5 mx-2 bg-background-elevated border border-border relative overflow-hidden rounded-full">
                <div
                  className={cn(
                    "absolute inset-0 bg-primary transition-all duration-500 origin-left",
                    step > s.num ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* ── STEP 1: ACCOUNT & TYPE ── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-background-elevated rounded-2xl border border-border">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: t }))}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-bold transition-all",
                    form.type === t
                      ? t === "expense"
                        ? "bg-danger text-white shadow-lg shadow-danger/20"
                        : "bg-success text-white shadow-lg shadow-success/20"
                      : "text-foreground-muted hover:text-foreground",
                  )}
                >
                  {t === "expense" ? "↓ Gasto" : "↑ Ingreso"}
                </button>
              ))}
            </div>

            {/* Account Selection */}
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider block mb-2">
                Selecciona una Cuenta *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const isSelected = form.accountId === acc._id;
                  return (
                    <button
                      key={acc._id}
                      type="button"
                      onClick={() => handleAccountSelect(acc._id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all active:scale-[0.98]",
                        isSelected
                          ? "border-primary bg-primary/8 shadow-md shadow-primary/10"
                          : "border-border bg-background-elevated hover:border-border-hover",
                      )}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: `${acc.color}25` }}
                      >
                        {typeIcons[acc.type] || "📁"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-xs font-bold truncate",
                            isSelected ? "text-primary" : "text-foreground",
                          )}
                        >
                          {acc.name}
                        </p>
                        <p className="text-[11px] text-foreground-subtle truncate">
                          {acc.type === "credit_card"
                            ? `Cupo: ${formatCurrency(acc.balance, acc.currency)}`
                            : formatCurrency(acc.balance, acc.currency)}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">✓</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: CATEGORY ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Selecciona una Categoría *
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {isCustomCategory ? "← Volver a existentes" : "+ Nueva categoría"}
              </button>
            </div>

            {isCustomCategory ? (
              <div className="space-y-3 p-4 rounded-2xl bg-background-elevated border border-border">
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div className="col-span-2">
                    <Input
                      label="Nombre Categoría"
                      name="customCategory"
                      value={form.customCategory}
                      onChange={handleChange}
                      placeholder="Ej: Gimnasio, Regalos..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Icono
                    </label>
                    <div className="flex items-center gap-1.5 h-10 px-2 rounded-lg bg-background border border-border">
                      <span className="text-lg">{customIcon}</span>
                      <Input
                        value={customIcon}
                        onChange={(e) => setCustomIcon(e.target.value)}
                        className="h-7 text-xs px-1 w-full"
                        placeholder="Emoji"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 p-2 bg-background rounded-xl border border-border/50 max-h-32 overflow-y-auto">
                  {QUICK_EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCustomIcon(emoji)}
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-base transition-all",
                        customIcon === emoji
                          ? "bg-primary/20 border border-primary scale-110"
                          : "hover:bg-background-elevated",
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = form.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategorySelect(cat.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all text-center active:scale-[0.98]",
                        isSelected
                          ? isExpense
                            ? "border-danger bg-danger/8 shadow-sm shadow-danger/10"
                            : "border-success bg-success/8 shadow-sm shadow-success/10"
                          : "border-border bg-background-elevated hover:border-border-hover",
                      )}
                    >
                      <span className="text-xl leading-none">
                        {cat.icon || "📁"}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold leading-tight line-clamp-1 w-full text-center capitalize",
                          isSelected
                            ? isExpense
                              ? "text-danger"
                              : "text-success"
                            : "text-foreground-muted",
                        )}
                      >
                        {cat.label}
                      </span>
                      {cat.limit ? (
                        <span className="text-[8px] bg-black/10 dark:bg-white/5 px-1 py-0.5 rounded text-foreground-subtle whitespace-nowrap">
                          Límite
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: DETAILS & AMOUNT ── */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            {/* Selection Breadcrumbs (Visual guidance) */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-background-elevated border border-border text-xs text-foreground-muted">
              <span>Tipo: <strong>{isExpense ? "↓ Gasto" : "↑ Ingreso"}</strong></span>
              <span>•</span>
              <span>Cuenta: <strong>{selectedAccount?.name || "—"}</strong></span>
              <span>•</span>
              <span>Cat: <strong>{categoryObj ? `${categoryObj.icon} ${categoryObj.label}` : isCustomCategory ? `${customIcon} ${form.customCategory}` : "—"}</strong></span>
            </div>

            {/* Description */}
            <Input
              label="Descripción del movimiento *"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ej: Compra de supermercado, Almuerzo, Sueldo..."
              autoFocus
            />

            {/* Amount & Currency */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Monto *"
                name="originalAmount"
                type="number"
                step={form.originalCurrency === "CLP" ? "1" : "0.01"}
                min={form.originalCurrency === "CLP" ? "1" : "0.01"}
                value={form.originalAmount}
                onChange={handleChange}
                placeholder="0"
              />
              <Select
                label="Moneda"
                name="originalCurrency"
                value={form.originalCurrency}
                onChange={handleChange}
                options={currencyOptions}
              />
            </div>

            {/* Manual Exchange Rate */}
            {form.originalCurrency !== "CLP" && (
              <div className="p-3 rounded-xl bg-background-elevated border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground-muted">
                    Tasa de cambio (opcional)
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    Auto API
                  </span>
                </div>
                <Input
                  name="exchangeRate"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.exchangeRate}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para tasa automática"
                />
              </div>
            )}

            {/* Category Limit Warnings */}
            {isExpense && categoryObj?.limit && (
              <div className="animate-fade-in space-y-2 mt-2">
                {newTotal > categoryObj.limit ? (
                  <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs leading-relaxed space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span>🚨</span> Límite Mensual Superado
                    </div>
                    <p>
                      ¡Llegaste al límite en <strong>{categoryObj.label}</strong>! 
                      Tu presupuesto mensual es de <strong>{formatCurrency(categoryObj.limit)}</strong> y con esta transacción 
                      alcanzarás <strong>{formatCurrency(newTotal)}</strong> (te estás pasando por <strong>{formatCurrency(newTotal - categoryObj.limit)}</strong>). 
                      <strong> ¡Ten ojo con eso y cuida tus gastos!</strong>
                    </p>
                  </div>
                ) : newTotal >= categoryObj.limit * 0.85 ? (
                  <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20 text-warning-light text-xs leading-relaxed space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span>⚠️</span> Cerca del Límite Mensual
                    </div>
                    <p>
                      Con esta transacción, tu gasto total en <strong>{categoryObj.label}</strong> llegará a <strong>{formatCurrency(newTotal)}</strong>, 
                      lo que representa el <strong>{Math.round((newTotal / categoryObj.limit) * 100)}%</strong> de tu límite mensual de <strong>{formatCurrency(categoryObj.limit)}</strong>. 
                      ¡Ten ojo con eso antes de confirmar!
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-success/10 border border-success/20 text-success-light text-xs leading-relaxed flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>✓</span> Presupuesto disponible en {categoryObj.label}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(newTotal)} / {formatCurrency(categoryObj.limit)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Date & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Fecha *"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
              <Input
                label="Notas (opcional)"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Detalles..."
              />
            </div>
          </div>
        )}

        {/* ── FOOTER NAVIGATION ACTIONS ── */}
        <div className="flex gap-3 pt-2 border-t border-border/50">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              className="flex-1 text-xs py-2.5 font-bold"
            >
              ← Atrás
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 text-xs py-2.5 font-bold"
            >
              Cancelar
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={step === 1 ? !form.accountId : (isCustomCategory ? !form.customCategory.trim() : !form.category)}
              className="flex-1 text-xs py-2.5 font-bold"
            >
              Siguiente →
            </Button>
          ) : (
            <Button
              type="submit"
              isLoading={loading}
              className={cn(
                "flex-1 text-xs py-2.5 font-bold",
                isExpense
                  ? "bg-danger hover:bg-danger/90 shadow-danger/25"
                  : "bg-success hover:bg-success/90 shadow-success/25",
              )}
            >
              {editingTransaction
                ? "✓ Guardar Cambios"
                : isExpense
                  ? "↓ Registrar Gasto"
                  : "↑ Registrar Ingreso"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
