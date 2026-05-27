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
  const [step, setStep] = useState(1);
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
      setStep(3); // Start directly at step 3 when editing
    } else {
      setForm(defaultForm(accounts));
      setStep(1); // Start at step 1 for new subscriptions
    }
    setError("");
  }, [editingSub, isOpen, accounts]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (categoryValue: string) => {
    setForm((prev) => ({ ...prev, category: categoryValue }));
    setError("");
    if (form.name.trim()) {
      setStep(2);
    }
  };

  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!form.name.trim()) return setError("El nombre es requerido");
      setStep(2);
    } else if (step === 2) {
      if (!form.accountId) return setError("Selecciona una cuenta de cobro");
      const numAmount = parseFloat(form.amount);
      if (isNaN(numAmount) || numAmount <= 0)
        return setError("Ingresa un monto válido mayor a 0");
      setStep(3);
    }
  };

  const prevStep = () => {
    setError("");
    setStep((p) => Math.max(1, p - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("El nombre es requerido");
    if (!form.accountId) return setError("Selecciona una cuenta para el cobro");
    const numAmount = parseFloat(form.amount);
    if (isNaN(numAmount) || numAmount <= 0)
      return setError("Ingresa un monto válido mayor a 0");
    const billingDayInt = parseInt(form.billingDay, 10);
    if (isNaN(billingDayInt) || billingDayInt < 1 || billingDayInt > 31)
      return setError("El día de cobro debe estar entre 1 y 31");

    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        amount: form.currency === "CLP" ? Math.round(numAmount) : numAmount,
        currency: form.currency,
        billingCycle: form.billingCycle,
        billingDay: billingDayInt,
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
      size="md"
    >
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2 mb-6 select-none">
        {[
          { num: 1, label: "Servicio", icon: "🎬" },
          { num: 2, label: "Pago", icon: "💳" },
          { num: 3, label: "Cobro", icon: "📅" },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div 
              onClick={() => step > s.num || (isEditing && setStep(s.num)) ? setStep(s.num) : null}
              className={cn(
                "flex flex-col items-center gap-1.5 relative z-10",
                (step > s.num || isEditing) ? "cursor-pointer" : "cursor-default"
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
              <div 
                className={cn(
                  "h-0.5 flex-1 mx-2 -mt-4 transition-colors duration-300",
                  step > s.num ? "bg-emerald-500" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── STEP 1: SERVICE & CATEGORY ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                Nombre del Servicio *
              </p>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Netflix, Spotify, AWS, Gimnasio..."
                autoFocus
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                Categoría
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pr-1">
                {CATEGORIES.map((cat) => {
                  const sel = form.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategorySelect(cat.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all cursor-pointer",
                        sel
                          ? "border-primary bg-primary/10 shadow-sm scale-[1.02]"
                          : "border-border bg-background-elevated hover:border-border-hover",
                      )}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <span
                        className={cn(
                          "text-[10px] font-bold leading-tight",
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
          </div>
        )}

        {/* ── STEP 2: ACCOUNT & PAYMENT AMOUNT ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                Cuenta de cobro *
              </p>
              <div className="grid grid-cols-2 gap-2">
                {accounts.map((acc) => {
                  const sel = form.accountId === acc._id;
                  return (
                    <button
                      key={acc._id}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, accountId: acc._id }));
                        setError("");
                      }}
                      className={cn(
                        "relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer",
                        sel
                          ? "border-primary bg-primary/10 shadow-sm scale-[1.02]"
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
                            "text-xs font-bold truncate",
                            sel ? "text-primary" : "text-foreground-muted",
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                  Monto *
                </p>
                <Input
                  name="amount"
                  type="number"
                  step={form.currency === "CLP" ? "1" : "0.01"}
                  min={form.currency === "CLP" ? "1" : "0.01"}
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0"
                  autoFocus
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
          </div>
        )}

        {/* ── STEP 3: BILLING CONFIG & NOTES ── */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in pr-0.5">
            <div className="p-4 rounded-xl bg-background-elevated border border-border space-y-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                Configuración de cobro
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-foreground-muted mb-1.5">Frecuencia</p>
                  <div className="flex rounded-xl border border-border overflow-hidden p-0.5 bg-background-card">
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
                          "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                          form.billingCycle === opt.value
                            ? "bg-primary text-white shadow-sm"
                            : "bg-transparent text-foreground-subtle hover:text-foreground",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-foreground-muted mb-1.5">
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
                <p className="text-[11px] font-semibold text-foreground-muted mb-1.5">
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
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer",
                form.isActive
                  ? "border-success/30 bg-success/5 hover:bg-success/10"
                  : "border-border bg-background-elevated hover:bg-background-elevated/70",
              )}
            >
              <span
                className={cn(
                  "text-xs font-bold",
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

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                Notas (opcional)
              </p>
              <Input
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Detalles adicionales..."
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 pt-3 border-t border-border/50">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              className="flex-1 font-bold text-xs py-2.5"
            >
              ← Atrás
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 font-bold text-xs py-2.5"
            >
              Cancelar
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={step === 1 ? !form.name.trim() : !form.accountId || !form.amount}
              className="flex-1 font-bold text-xs py-2.5"
            >
              Siguiente →
            </Button>
          ) : (
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1 font-bold text-xs py-2.5 shadow-lg shadow-primary/20"
            >
              {isEditing ? "✓ Guardar Cambios" : "+ Agregar Suscripción"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
