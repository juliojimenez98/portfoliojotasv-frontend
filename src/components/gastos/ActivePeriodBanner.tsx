"use client";

import React, { useState } from "react";
import type { ISpendPeriod } from "@/types/period";
import type { PaydayConfig } from "@/types/user";
import type { IAccount } from "@/types/account";
import PaydayReceiveModal from "./PaydayReceiveModal";

interface ActivePeriodBannerProps {
  initialPeriod: ISpendPeriod | null;
  paydayConfig?: PaydayConfig | null;
  accounts?: IAccount[];
}

export default function ActivePeriodBanner({
  initialPeriod,
  paydayConfig,
  accounts = [],
}: ActivePeriodBannerProps) {
  const [activePeriod, setActivePeriod] = useState<ISpendPeriod | null>(
    initialPeriod,
  );
  const [showModal, setShowModal] = useState(false);

  const daysSince = activePeriod
    ? Math.floor(
        (Date.now() - new Date(activePeriod.startDate).getTime()) / 86400000,
      )
    : null;

  const startLabel = activePeriod
    ? new Date(activePeriod.startDate).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-background-elevated border border-border">
        {activePeriod ? (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
                <p className="text-sm font-bold text-foreground">
                  {activePeriod.label}
                </p>
                <span className="text-[10px] bg-success/15 text-success px-2 py-0.5 rounded-full font-bold">
                  Período activo
                </span>
              </div>
              <p className="text-xs text-foreground-muted mt-0.5">
                Desde {startLabel} ·{" "}
                {daysSince === 0
                  ? "Comenzó hoy"
                  : `${daysSince} día${daysSince !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
            >
              💰 Recibí mi Pago
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">
                Sin período laboral activo
              </p>
              <p className="text-xs text-foreground-muted mt-0.5">
                Inicia un período para llevar registro de tus gastos por ciclo
                de sueldo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-success text-white text-sm font-bold shadow-md shadow-success/25 hover:bg-success/90 active:scale-95 transition-all"
            >
              🚀 Iniciar Período
            </button>
          </>
        )}
      </div>

      <PaydayReceiveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        activePeriod={activePeriod}
        onPeriodStarted={(newPeriod) => {
          setActivePeriod(newPeriod);
          // Don't close here — the modal handles its own multi-step flow (deposit → summary)
        }}
        paydayConfig={paydayConfig}
        accounts={accounts}
      />
    </>
  );
}
