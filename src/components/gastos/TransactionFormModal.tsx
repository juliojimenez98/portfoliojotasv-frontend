"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input, { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { IAccount } from "@/types/account";
import type { ICategory } from "@/types/transaction";
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
}

const currencyOptions = [
  { value: "CLP", label: "CLP — Peso Chileno" },
  { value: "USD", label: "USD — Dólar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "DOP", label: "DOP — Peso Dominicano" },
];

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
];

const typeIcons = ACCOUNT_TYPE_ICONS;

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  categories,
  editingTransaction = null,
}: TransactionFormModalProps) {
  const [form, setForm] = useState({
    type: "expense" as "expense" | "income",
    accountId: "",
    description: "",
    originalAmount: "",
    originalCurrency: "CLP",
    exchangeRate: "",
    category: "",
    customCategory: "",
    date: new Date().toISOString().split("T")[0],
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
            ? new Date(editingTransaction.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          notes: editingTransaction.notes || "",
        });
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
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
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
      if (isCustomCategory && form.customCategory.trim()) {
        try {
          await createCategory({
            label: form.customCategory.trim(),
            icon: customIcon,
          });
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
        category: finalCategory.toLowerCase(),
        date: new Date(form.date),
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? "✏️ Editar Movimiento" : "Nuevo Movimiento"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* ── Type Toggle ── */}
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
                    ? "bg-danger text-white shadow-lg shadow-danger/30"
                    : "bg-success text-white shadow-lg shadow-success/30"
                  : "text-foreground-muted hover:text-foreground",
              )}
            >
              {t === "expense" ? "↓ Gasto" : "↑ Ingreso"}
            </button>
          ))}
        </div>

        {/* ── Account Cards ── */}
        <div>
          <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider block mb-2">
            Cuenta *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {accounts.map((acc) => {
              const isSelected = form.accountId === acc._id;
              return (
                <button
                  key={acc._id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, accountId: acc._id }))}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/8 shadow-md shadow-primary/15"
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
                      {formatCurrency(acc.balance, acc.currency)}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-bold">
                        ✓
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Description ── */}
        <Input
          label="Descripción *"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ej: Almuerzo de trabajo, Pago de cliente..."
        />

        {/* ── Amount & Currency ── */}
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

        {/* ── Category chips ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Categoría *
            </label>
            <button
              type="button"
              onClick={() => setIsCustomCategory(!isCustomCategory)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {isCustomCategory ? "Seleccionar existente" : "+ Nueva categoría"}
            </button>
          </div>

          {isCustomCategory ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="col-span-2">
                  <Input
                    name="customCategory"
                    value={form.customCategory}
                    onChange={handleChange}
                    placeholder="Ej: Suscripciones, Gimnasio..."
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
              <div className="flex flex-wrap gap-1 p-2 bg-background rounded-xl border border-border/50">
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
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = form.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, category: cat.value }))
                    }
                    className={cn(
                      "flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 transition-all text-center",
                      isSelected
                        ? isExpense
                          ? "border-danger bg-danger/8 shadow-sm shadow-danger/20"
                          : "border-success bg-success/8 shadow-sm shadow-success/20"
                        : "border-border bg-background-elevated hover:border-border-hover",
                    )}
                  >
                    <span className="text-xl leading-none">
                      {cat.icon || "📁"}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold leading-tight line-clamp-1 w-full text-center",
                        isSelected
                          ? isExpense
                            ? "text-danger"
                            : "text-success"
                          : "text-foreground-muted",
                      )}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Date & Notes ── */}
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
            placeholder="Detalles adicionales..."
          />
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className={cn(
              "flex-1",
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
        </div>
      </form>
    </Modal>
  );
}
