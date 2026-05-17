"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input, { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { savePaydayConfig, deletePaydayConfig } from "@/actions/users";
import type { PaydayConfig, PaydayType } from "@/types/user";
import type { IAccount } from "@/types/account";
import { formatCurrency } from "@/lib/utils";

interface PaydayConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: IAccount[];
  currentConfig: PaydayConfig | null;
  onSaved: (config: PaydayConfig | null) => void;
}

const PAYDAY_TYPE_OPTIONS: {
  value: PaydayType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "fixed_day",
    label: "Día fijo del mes",
    description: "Ej: siempre el día 5, 10, 15, 28...",
    icon: "📅",
  },
  {
    value: "last_day",
    label: "Último día del mes",
    description: "El día 28, 29, 30 o 31 según el mes",
    icon: "🗓️",
  },
  {
    value: "last_business_day",
    label: "Último día hábil del mes",
    description: "El último lunes–viernes antes del fin de mes",
    icon: "🏢",
  },
  {
    value: "business_days_before_end",
    label: "N días hábiles antes del fin de mes",
    description: "Ej: 3 días hábiles antes = aprox. día 26–28",
    icon: "⏳",
  },
  {
    value: "first_day",
    label: "Primer día del mes",
    description: "Siempre el día 1 de cada mes",
    icon: "🌅",
  },
  {
    value: "first_business_day",
    label: "Primer día hábil del mes",
    description: "El primer lunes–viernes de cada mes",
    icon: "🌄",
  },
  {
    value: "custom_text",
    label: "Personalizado",
    description: "Escribe tu propia descripción (ej: quincena 15 y 30)",
    icon: "✏️",
  },
];

const currencyOptions = [
  { value: "CLP", label: "CLP — Peso Chileno" },
  { value: "USD", label: "USD — Dólar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "DOP", label: "DOP — Peso Dominicano" },
];

/** Returns a human-readable summary of the payday config */
export function paydaySummary(cfg: PaydayConfig): string {
  switch (cfg.type) {
    case "fixed_day":
      return `Día ${cfg.fixedDay} de cada mes`;
    case "last_day":
      return "Último día del mes";
    case "last_business_day":
      return "Último día hábil del mes";
    case "business_days_before_end":
      return `${cfg.businessDaysBefore} día${(cfg.businessDaysBefore || 1) > 1 ? "s" : ""} hábil${(cfg.businessDaysBefore || 1) > 1 ? "es" : ""} antes de fin de mes`;
    case "first_day":
      return "Primer día del mes";
    case "first_business_day":
      return "Primer día hábil del mes";
    case "custom_text":
      return cfg.customText || "Personalizado";
    default:
      return "Configurado";
  }
}

export default function PaydayConfigModal({
  isOpen,
  onClose,
  accounts,
  currentConfig,
  onSaved,
}: PaydayConfigModalProps) {
  const [selectedType, setSelectedType] = useState<PaydayType>("fixed_day");
  const [fixedDay, setFixedDay] = useState("5");
  const [businessDaysBefore, setBusinessDaysBefore] = useState("3");
  const [customText, setCustomText] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("CLP");
  const [label, setLabel] = useState("");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const accountOptions = [
    { value: "", label: "— Sin cuenta específica —" },
    ...accounts.map((a) => ({
      value: a._id,
      label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
    })),
  ];

  // Populate form when editing existing config
  useEffect(() => {
    if (isOpen) {
      if (currentConfig) {
        setSelectedType(currentConfig.type);
        setFixedDay(currentConfig.fixedDay?.toString() || "5");
        setBusinessDaysBefore(
          currentConfig.businessDaysBefore?.toString() || "3",
        );
        setCustomText(currentConfig.customText || "");
        setAccountId(currentConfig.accountId || "");
        setAmount(currentConfig.amount?.toString() || "");
        setCurrency(currentConfig.currency || "CLP");
        setLabel(currentConfig.label || "");
      } else {
        setSelectedType("fixed_day");
        setFixedDay("5");
        setBusinessDaysBefore("3");
        setCustomText("");
        setAccountId(accounts[0]?._id || "");
        setAmount("");
        setCurrency("CLP");
        setLabel("");
      }
      setError("");
    }
  }, [isOpen, currentConfig, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedType === "fixed_day") {
      const n = parseInt(fixedDay);
      if (!n || n < 1 || n > 31) {
        setError("El día fijo debe ser un número entre 1 y 31");
        return;
      }
    }
    if (selectedType === "business_days_before_end") {
      const n = parseInt(businessDaysBefore);
      if (!n || n < 1 || n > 15) {
        setError("Debe ser entre 1 y 15 días hábiles");
        return;
      }
    }
    if (selectedType === "custom_text" && !customText.trim()) {
      setError("Escribe una descripción para tu día de pago");
      return;
    }

    setLoading(true);
    try {
      const payload: PaydayConfig = {
        type: selectedType,
        currency,
        ...(selectedType === "fixed_day" && { fixedDay: parseInt(fixedDay) }),
        ...(selectedType === "business_days_before_end" && {
          businessDaysBefore: parseInt(businessDaysBefore),
        }),
        ...(selectedType === "custom_text" && {
          customText: customText.trim(),
        }),
        ...(accountId && { accountId }),
        ...(amount && parseFloat(amount) > 0 && { amount: parseFloat(amount) }),
        ...(label.trim() && { label: label.trim() }),
      };
      const saved = await savePaydayConfig(payload);
      onSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePaydayConfig();
      onSaved(null);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const selectedOption = PAYDAY_TYPE_OPTIONS.find(
    (o) => o.value === selectedType,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💳 Día de Pago de Sueldo"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Type selector — card grid */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            ¿Cuándo te pagan? *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PAYDAY_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedType(opt.value)}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedType === opt.value
                    ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
                    : "border-border bg-background-elevated hover:border-border-hover"
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold leading-tight ${selectedType === opt.value ? "text-primary" : "text-foreground"}`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-foreground-subtle mt-0.5 leading-snug">
                    {opt.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conditional extra field */}
        {selectedType === "fixed_day" && (
          <Input
            label="Día del mes *"
            type="number"
            min="1"
            max="31"
            value={fixedDay}
            onChange={(e) => setFixedDay(e.target.value)}
            placeholder="Ej: 5"
          />
        )}
        {selectedType === "business_days_before_end" && (
          <Input
            label="Días hábiles antes del fin de mes *"
            type="number"
            min="1"
            max="15"
            value={businessDaysBefore}
            onChange={(e) => setBusinessDaysBefore(e.target.value)}
            placeholder="Ej: 3"
          />
        )}
        {selectedType === "custom_text" && (
          <Input
            label="Descripción de tu día de pago *"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Ej: Quincena los días 15 y 30"
          />
        )}

        {/* Preview badge */}
        {selectedOption && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/20">
            <span className="text-lg">{selectedOption.icon}</span>
            <div>
              <p className="text-xs text-foreground-subtle">
                Tu día de pago quedará como:
              </p>
              <p className="text-sm font-bold text-success">
                {selectedType === "fixed_day" && fixedDay
                  ? `Día ${fixedDay} de cada mes`
                  : selectedType === "business_days_before_end" &&
                      businessDaysBefore
                    ? `${businessDaysBefore} día${parseInt(businessDaysBefore) > 1 ? "s" : ""} hábil${parseInt(businessDaysBefore) > 1 ? "es" : ""} antes de fin de mes`
                    : selectedType === "custom_text" && customText
                      ? customText
                      : selectedOption.description}
              </p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border/60 pt-4 space-y-4">
          <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
            Detalles opcionales
          </p>

          <Select
            label="Cuenta donde recibes el sueldo"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            options={accountOptions}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monto esperado (opcional)"
              type="number"
              min="0"
              step={currency === "CLP" ? "1" : "0.01"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            <Select
              label="Moneda"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencyOptions}
            />
          </div>

          <Input
            label="Etiqueta (opcional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ej: Salario principal, Honorarios..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          {currentConfig && (
            <Button
              type="button"
              variant="danger"
              isLoading={deleting}
              onClick={handleDelete}
              className="px-4"
            >
              🗑️
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            {currentConfig ? "💾 Guardar Cambios" : "✅ Configurar Pago"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
