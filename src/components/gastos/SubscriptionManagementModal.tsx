"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input, { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  createSubscription,
  updateSubscription,
} from "@/actions/subscriptions";
import type { IAccount } from "@/types/account";
import { formatCurrency } from "@/lib/utils";
import {
  ACCOUNT_TYPE_ICONS,
  SUBSCRIPTION_CATEGORIES,
} from "@/lib/gastos-constants";

interface SubscriptionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: IAccount[];
  editingSub?: any | null;
  onSaved?: () => void;
}

const CATEGORIES = SUBSCRIPTION_CATEGORIES;

const currencyOptions = [
  { value: "CLP", label: "CLP" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "DOP", label: "DOP" },
];

const typeIcons = ACCOUNT_TYPE_ICONS;

const defaultForm = (accounts: IAccount[]) => ({
  name: "",
  amount: "",
  currency: "CLP",
  billingCycle: "monthly",
  billingDay: "15",
  accountId: accounts.length > 0 ? accounts[0]._id : "",
  category: "streaming",
  startDate: new Date().toISOString().split("T")[0],
  notes: "",
  isActive: true,
});

export default function SubscriptionManagementModal({
  isOpen,
  onClose,
  accounts,
  editingSub = null,
  onSaved,
}: SubscriptionManagementModalProps) {
  const [form, setForm] = useState(defaultForm(accounts));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editingSub;

  useEffect(() => {
    if (editingSub) {
      setForm({
        name: editingSub.name,
        amount: editingSub.amount.toString(),
        currency: editingSub.currency || "CLP",
        billingCycle: editingSub.billingCycle,
        billingDay: editingSub.billingDay.toString(),
        accountId: editingSub.accountId,
        category: editingSub.category || "streaming",
        startDate: new Date(editingSub.startDate).toISOString().split("T")[0],
        notes: editingSub.notes || "",
        isActive: editingSub.isActive ?? true,
      });
    } else {
      setForm(defaultForm(accounts));
    }
    setError("");
  }, [editingSub, isOpen, accounts]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("El nombre es requerido");
    const numAmount = parseFloat(form.amount);
    if (isNaN(numAmount) || numAmount <= 0)
      return setError("Ingresa un monto válido mayor a 0");
    if (!form.accountId) return setError("Selecciona una cuenta para el cobro");

    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        amount: form.currency === "CLP" ? Math.round(numAmount) : numAmount,
        currency: form.currency,
        billingCycle: form.billingCycle,
        billingDay: parseInt(form.billingDay, 10),
        accountId: form.accountId,
        category: form.category,
        startDate: new Date(form.startDate),
        nextBillingDate: new Date(),
        notes: form.notes.trim() || undefined,
        isActive: form.isActive,
      };

      if (isEditing) {
        await updateSubscription(editingSub._id, payload);
      } else {
        await createSubscription(payload);
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar la suscripción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "✏️ Editar Suscripción" : "🔄 Nueva Suscripción"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Name */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
            Nombre
          </p>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej: Netflix, Spotify, AWS..."
          />
        </div>

        {/* Category chips */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
            Categoría
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto">
            {CATEGORIES.map((cat) => {
              const sel = form.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, category: cat.value }))
                  }
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all",
                    sel
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background-elevated hover:border-border-hover",
                  )}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold leading-tight",
                      sel ? "text-primary" : "text-foreground-muted",
                    )}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Account cards */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
            Cuenta de cobro
          </p>
          <div className="grid grid-cols-2 gap-2">
            {accounts.map((acc) => {
              const sel = form.accountId === acc._id;
              return (
                <button
                  key={acc._id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, accountId: acc._id }))
                  }
                  className={cn(
                    "relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                    sel
                      ? "border-primary bg-primary/8 shadow-sm"
                      : "border-border bg-background-elevated hover:border-border-hover",
                  )}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: `${acc.color}25` }}
                  >
                    <span style={{ color: acc.color }}>
                      {typeIcons[acc.type] ?? "💳"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-xs font-semibold truncate",
                        sel ? "text-foreground" : "text-foreground-muted",
                      )}
                    >
                      {acc.name}
                    </p>
                    <p className="text-[10px] text-foreground-subtle truncate">
                      {formatCurrency(acc.balance, acc.currency)}
                    </p>
                  </div>
                  {sel && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount + Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
              Monto
            </p>
            <Input
              name="amount"
              type="number"
              step={form.currency === "CLP" ? "1" : "0.01"}
              min={form.currency === "CLP" ? "1" : "0.01"}
              value={form.amount}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
              Moneda
            </p>
            <Select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              options={currencyOptions}
            />
          </div>
        </div>

        {/* Billing config */}
        <div className="p-4 rounded-xl bg-background-elevated border border-border space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            Configuración de cobro
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-foreground-muted mb-1.5">Frecuencia</p>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {[
                  { value: "monthly", label: "Mensual" },
                  { value: "yearly", label: "Anual" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, billingCycle: opt.value }))
                    }
                    className={cn(
                      "flex-1 py-2 text-xs font-semibold transition-all",
                      form.billingCycle === opt.value
                        ? "bg-primary text-white"
                        : "bg-background-elevated text-foreground-muted hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-foreground-muted mb-1.5">
                Día de cobro
              </p>
              <Input
                name="billingDay"
                type="number"
                min="1"
                max="31"
                value={form.billingDay}
                onChange={handleChange}
                placeholder="1–31"
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-foreground-muted mb-1.5">
              Fecha de inicio
            </p>
            <Input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Active toggle */}
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
          }
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
            form.isActive
              ? "border-success/40 bg-success/8"
              : "border-border bg-background-elevated",
          )}
        >
          <span
            className={cn(
              "text-sm font-semibold",
              form.isActive ? "text-success" : "text-foreground-muted",
            )}
          >
            {form.isActive ? "✅ Suscripción activa" : "⏸️ Suscripción pausada"}
          </span>
          <div
            className={cn(
              "w-10 h-5 rounded-full relative transition-colors",
              form.isActive ? "bg-success" : "bg-foreground-subtle/30",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                form.isActive ? "left-5" : "left-0.5",
              )}
            />
          </div>
        </button>

        {/* Notes */}
        <Input
          label="Notas (opcional)"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Detalles adicionales..."
        />

        {/* Submit */}
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
            className="flex-1 shadow-lg shadow-primary/20 font-semibold"
          >
            {isEditing ? "Guardar Cambios" : "+ Agregar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
