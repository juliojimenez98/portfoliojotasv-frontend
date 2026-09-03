"use client";

import { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type {
  IRemedy,
  IRemedyLog,
  ITelegramStatus,
  ITelegramLinkCodeResponse,
} from "@/types/remedy";
import {
  getRemedies,
  getRemedyLogs,
  createRemedy,
  updateRemedy,
  deleteRemedy,
  executeRemedyAction,
  generateTelegramLinkCode,
  getTelegramStatus,
  linkTelegramManual,
  unlinkTelegram,
} from "@/actions/remedies";

interface RemediosClientPageProps {
  initialRemedies: IRemedy[];
  initialLogs: IRemedyLog[];
  initialTelegramStatus: ITelegramStatus;
}

export default function RemediosClientPage({
  initialRemedies,
  initialLogs,
  initialTelegramStatus,
}: RemediosClientPageProps) {
  const [mounted, setMounted] = useState(false);
  const [remedies, setRemedies] = useState<IRemedy[]>(initialRemedies);
  const [logs, setLogs] = useState<IRemedyLog[]>(initialLogs);
  const [telegramStatus, setTelegramStatus] =
    useState<ITelegramStatus>(initialTelegramStatus);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<"remedies" | "history">("remedies");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRemedy, setEditingRemedy] = useState<IRemedy | null>(null);
  const [deletingRemedyId, setDeletingRemedyId] = useState<string | null>(null);
  const [linkingTelegram, setLinkingTelegram] = useState(false);
  const [telegramCodeData, setTelegramCodeData] =
    useState<ITelegramLinkCodeResponse | null>(null);
  const [manualChatId, setManualChatId] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh data from server (sync with Telegram actions)
  const refreshData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const [remediesData, logsData, statusData] = await Promise.all([
        getRemedies(),
        getRemedyLogs(),
        getTelegramStatus(),
      ]);
      setRemedies(remediesData);
      setLogs(logsData);
      setTelegramStatus(statusData);
    } catch (e) {
      // silent catch during background sync
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  }, []);

  // Periodic polling every 4s and on window focus so Telegram actions reflect instantly
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData(false);
    }, 4000);

    const onFocus = () => refreshData(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onFocus);
    };
  }, [refreshData]);

  // Poll Telegram connection status automatically when modal is open
  useEffect(() => {
    if (!telegramCodeData) return;

    const interval = setInterval(async () => {
      try {
        const status = await getTelegramStatus();
        if (status.isLinked) {
          setTelegramStatus(status);
          setTelegramCodeData(null);
          refreshData(true);
          alert("🎉 ¡Telegram vinculado con éxito!");
        }
      } catch (e) {
        // silent catch during polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [telegramCodeData, refreshData]);

  // Skip modal state
  const [skippingRemedy, setSkippingRemedy] = useState<IRemedy | null>(null);
  const [skipReason, setSkipReason] = useState("Me siento mal");
  const [customSkipReason, setCustomSkipReason] = useState("");

  // Snooze picker modal state
  const [snoozingRemedy, setSnoozingRemedy] = useState<IRemedy | null>(null);
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(15);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDose, setFormDose] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formFrequencyHours, setFormFrequencyHours] = useState("8");
  const [formFirstDoseTime, setFormFirstDoseTime] = useState("");
  const [formSnoozeMinutes, setFormSnoozeMinutes] = useState("15");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Helper to open Add Modal
  const handleOpenAddModal = () => {
    setEditingRemedy(null);
    setFormName("");
    setFormDose("");
    setFormInstructions("");
    setFormFrequencyHours("8");

    // Default first dose time to current time formatted HH:mm
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    setFormFirstDoseTime(`${hours}:${mins}`);
    setFormSnoozeMinutes("15");

    setFormError("");
    setIsAddModalOpen(true);
  };

  // Helper to open Edit Modal
  const handleOpenEditModal = (remedy: IRemedy) => {
    setEditingRemedy(remedy);
    setFormName(remedy.name);
    setFormDose(remedy.dose);
    setFormInstructions(remedy.instructions || "");
    setFormFrequencyHours(String(remedy.frequencyHours));

    const nextDate = new Date(remedy.nextDoseAt);
    const hours = String(nextDate.getHours()).padStart(2, "0");
    const mins = String(nextDate.getMinutes()).padStart(2, "0");
    setFormFirstDoseTime(`${hours}:${mins}`);
    setFormSnoozeMinutes(String(remedy.snoozeMinutes || 15));

    setFormError("");
    setIsAddModalOpen(true);
  };

  // Save Remedy
  const handleSaveRemedy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDose.trim() || !formFrequencyHours) {
      setFormError("Por favor completa los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingRemedy) {
        // Construct date from time input
        const today = new Date();
        const [h, m] = formFirstDoseTime.split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          today.setHours(h, m, 0, 0);
        }

        const updated = await updateRemedy(editingRemedy._id, {
          name: formName,
          dose: formDose,
          instructions: formInstructions,
          frequencyHours: Number(formFrequencyHours),
          snoozeMinutes: Number(formSnoozeMinutes),
          nextDoseAt: today.toISOString(),
        });

        setRemedies((prev) =>
          prev.map((r) => (r._id === editingRemedy._id ? updated : r)),
        );
      } else {
        const today = new Date();
        if (formFirstDoseTime) {
          const [h, m] = formFirstDoseTime.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            today.setHours(h, m, 0, 0);
          }
        }

        const newRemedy = await createRemedy({
          name: formName,
          dose: formDose,
          instructions: formInstructions,
          frequencyHours: Number(formFrequencyHours),
          firstDoseTime: today.toISOString(),
          snoozeMinutes: Number(formSnoozeMinutes),
        });

        setRemedies((prev) => [...prev, newRemedy]);
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Error al guardar remedio");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Remedy
  const handleDeleteRemedy = async () => {
    if (!deletingRemedyId) return;
    try {
      await deleteRemedy(deletingRemedyId);
      setRemedies((prev) => prev.filter((r) => r._id !== deletingRemedyId));
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    } finally {
      setDeletingRemedyId(null);
    }
  };

  // Toggle active status
  const handleToggleActive = async (remedy: IRemedy) => {
    try {
      const updated = await updateRemedy(remedy._id, {
        isActive: !remedy.isActive,
      });
      setRemedies((prev) => prev.map((r) => (r._id === remedy._id ? updated : r)));
    } catch (err: any) {
      alert(err.message || "Error al actualizar estado");
    }
  };

  // Action: Taken
  const handleActionTaken = async (remedy: IRemedy) => {
    try {
      const res = await executeRemedyAction(remedy._id, "taken");
      setRemedies((prev) =>
        prev.map((r) => (r._id === remedy._id ? res.remedy : r)),
      );
      // Append log locally
      setLogs((prev) => [
        {
          _id: String(Date.now()),
          userId: remedy.userId,
          remedyId: remedy._id,
          remedyName: remedy.name,
          scheduledFor: remedy.nextDoseAt,
          action: "taken",
          actionAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err: any) {
      alert(err.message || "Error al registrar dosis");
    }
  };

  // Action: Snooze
  const handleConfirmSnooze = async () => {
    if (!snoozingRemedy) return;
    try {
      const res = await executeRemedyAction(
        snoozingRemedy._id,
        "snooze",
        undefined,
        snoozeMinutes,
      );
      setRemedies((prev) =>
        prev.map((r) => (r._id === snoozingRemedy._id ? res.remedy : r)),
      );
      setSnoozingRemedy(null);
    } catch (err: any) {
      alert(err.message || "Error al posponer");
    }
  };

  // Action: Skip
  const handleConfirmSkip = async () => {
    if (!skippingRemedy) return;
    const finalReason =
      skipReason === "Otro motivo"
        ? customSkipReason.trim() || "Otro motivo"
        : skipReason;

    try {
      const res = await executeRemedyAction(
        skippingRemedy._id,
        "skipped",
        finalReason,
      );
      setRemedies((prev) =>
        prev.map((r) => (r._id === skippingRemedy._id ? res.remedy : r)),
      );
      // Append log locally
      setLogs((prev) => [
        {
          _id: String(Date.now()),
          userId: skippingRemedy.userId,
          remedyId: skippingRemedy._id,
          remedyName: skippingRemedy.name,
          scheduledFor: skippingRemedy.nextDoseAt,
          action: "skipped",
          actionAt: new Date().toISOString(),
          skipReason: finalReason,
        },
        ...prev,
      ]);
      setSkippingRemedy(null);
    } catch (err: any) {
      alert(err.message || "Error al omitir dosis");
    }
  };

  // Telegram Link handler
  const handleGenerateTelegramCode = async () => {
    setLinkingTelegram(true);
    try {
      const res = await generateTelegramLinkCode();
      setTelegramCodeData(res);
    } catch (err: any) {
      alert(err.message || "Error al generar código de Telegram");
    } finally {
      setLinkingTelegram(false);
    }
  };

  const handleLinkManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualChatId.trim()) return;
    setIsSubmittingManual(true);
    try {
      await linkTelegramManual(manualChatId.trim());
      const status = await getTelegramStatus();
      setTelegramStatus(status);
      setTelegramCodeData(null);
      setManualChatId("");
      alert("🎉 ¡Telegram vinculado con éxito!");
    } catch (err: any) {
      alert(err.message || "Error al vincular");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleCheckStatusManual = async () => {
    try {
      const status = await getTelegramStatus();
      setTelegramStatus(status);
      if (status.isLinked) {
        setTelegramCodeData(null);
        alert("🎉 ¡Telegram ya está vinculado con éxito!");
      } else {
        alert("Aún no detectamos la vinculación. Por favor asegúrate de haber enviado /start con tu código al bot en Telegram.");
      }
    } catch (err: any) {
      alert(err.message || "Error al verificar");
    }
  };

  const handleUnlinkTelegram = async () => {
    if (!confirm("¿Estás seguro de desvincular Telegram? Dejarás de recibir notificaciones."))
      return;
    try {
      await unlinkTelegram();
      setTelegramStatus({
        isLinked: false,
        telegramChatId: null,
        defaultSnoozeMinutes: 15,
      });
      setTelegramCodeData(null);
    } catch (err: any) {
      alert(err.message || "Error al desvincular Telegram");
    }
  };

  // Helper date formatting
  const formatDateTime = (dateStr: string) => {
    if (!mounted) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("es-CL", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">💊</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Recordatorio de Remedios
            </h1>
          </div>
          <p className="text-sm text-foreground-muted">
            Gestiona tus medicamentos, frecuencias y alertas por Telegram.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refreshData(true)}
            disabled={isRefreshing}
            className="text-xs flex items-center gap-1.5 border-border hover:bg-background-elevated"
            title="Sincronizar con Telegram"
          >
            <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
            {isRefreshing ? "Sincronizando..." : "Sincronizar"}
          </Button>

          <Button
            onClick={handleOpenAddModal}
            className="bg-primary hover:bg-primary-hover text-white shadow-md text-xs sm:text-sm"
          >
            ➕ Nuevo Remedio
          </Button>
        </div>
      </div>

      {/* ── TELEGRAM CONNECTION CARD ── */}
      <div className="p-5 rounded-2xl bg-background-elevated border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center text-2xl shrink-0">
            ✈️
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">Bot de Telegram</h3>
              {telegramStatus.isLinked ? (
                <Badge variant="success" dot>
                  Conectado
                </Badge>
              ) : (
                <Badge variant="warning" dot>
                  No vinculado
                </Badge>
              )}
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              {telegramStatus.isLinked
                ? "Recibirás alertas en tu chat con botones interactivos para confirmar la toma, posponer o registrar omisiones."
                : "Vincula tu usuario con el bot de Telegram para recibir las alertas en tu teléfono con botones directos."}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
          {telegramStatus.isLinked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnlinkTelegram}
              className="text-danger border-danger/30 hover:bg-danger/10 w-full md:w-auto"
            >
              Desvincular Telegram
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateTelegramCode}
              disabled={linkingTelegram}
              className="bg-sky-500 hover:bg-sky-600 text-white w-full md:w-auto"
            >
              {linkingTelegram ? "Generando..." : "🔗 Vincular Telegram"}
            </Button>
          )}
        </div>
      </div>

      {/* TELEGRAM LINK MODAL */}
      {telegramCodeData && (
        <Modal
          isOpen={Boolean(telegramCodeData)}
          onClose={() => setTelegramCodeData(null)}
          title="Vincular con Telegram"
        >
          <div className="space-y-4">
            <p className="text-sm text-foreground-muted">
              Para recibir las alertas en Telegram, sigue estos sencillos pasos:
            </p>

            <div className="p-4 rounded-xl bg-background border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-subtle font-medium">
                  Tu código de vinculación:
                </span>
                <span className="text-lg font-mono font-bold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20">
                  {telegramCodeData.code}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={telegramCodeData.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-md transition-all text-center"
              >
                ✈️ Abrir Bot de Telegram
              </a>
              <p className="text-[11px] text-foreground-subtle text-center">
                O busca <b className="text-foreground">@remedios_jotasvbot</b> en Telegram y envíale:{" "}
                <code className="text-primary-light font-mono bg-primary/10 px-1 py-0.5 rounded">
                  /start {telegramCodeData.code}
                </code>
              </p>

              <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckStatusManual}
                  className="w-full text-sky-400 border-sky-500/30 hover:bg-sky-500/10 text-xs"
                >
                  🔄 Ya envié el comando / Verificar Conexión
                </Button>

                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-[11px] text-foreground-subtle hover:text-foreground underline text-center"
                >
                  {showManualInput
                    ? "Ocultar ingreso manual"
                    : "¿Prefieres ingresar tu Chat ID directamente?"}
                </button>

                {showManualInput && (
                  <form onSubmit={handleLinkManual} className="p-3 rounded-xl bg-background border border-border space-y-2">
                    <Input
                      label="Tu Telegram Chat ID"
                      placeholder="Ej. 123456789"
                      value={manualChatId}
                      onChange={(e) => setManualChatId(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmittingManual || !manualChatId.trim()}
                      className="bg-primary text-white w-full text-xs"
                    >
                      {isSubmittingManual ? "Guardando..." : "Guardar Chat ID"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── TABS ── */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("remedies")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "remedies"
              ? "border-primary text-primary"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
        >
          💊 Mis Remedios ({remedies.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
        >
          📜 Historial de Tomas ({logs.length})
        </button>
      </div>

      {/* ── TAB 1: MIS REMEDIOS ── */}
      {activeTab === "remedies" && (
        <div className="space-y-4">
          {remedies.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-2xl bg-background-elevated border border-dashed border-border space-y-4">
              <div className="text-5xl opacity-40">💊</div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  No tienes remedios registrados
                </h3>
                <p className="text-xs text-foreground-muted mt-1 max-w-md mx-auto">
                  Agrega los medicamentos que tomas periódicamente para recibir tus recordatorios a tiempo.
                </p>
              </div>
              <Button onClick={handleOpenAddModal} className="bg-primary text-white">
                ➕ Agregar mi primer remedio
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {remedies.map((remedy) => {
                const isDue =
                  new Date(remedy.nextDoseAt) <= new Date() && remedy.isActive;
                const isSnoozed = remedy.reminderState?.status === "snoozed";
                const lastLog = logs.find((l) => l.remedyId === remedy._id);

                return (
                  <div
                    key={remedy._id}
                    className={`group relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                      !remedy.isActive
                        ? "bg-background-elevated/40 border-border opacity-60"
                        : isDue
                          ? "bg-primary/5 border-primary/40 shadow-lg shadow-primary/5"
                          : isSnoozed
                            ? "bg-warning/5 border-warning/30"
                            : "bg-background-elevated border-border hover:border-border-hover"
                    }`}
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {remedy.name}
                          </h3>
                          <p className="text-xs font-medium text-foreground-muted">
                            Dosis: <span className="text-foreground">{remedy.dose}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {remedy.isActive ? (
                            isDue ? (
                              <Badge variant="primary" dot>
                                ¡Dosis Pendiente!
                              </Badge>
                            ) : isSnoozed ? (
                              <Badge variant="warning" dot>
                                Pospuesto
                              </Badge>
                            ) : lastLog?.action === "taken" ? (
                              <Badge variant="success" dot>
                                Al día ✅
                              </Badge>
                            ) : (
                              <Badge variant="default">
                                Programado ⏳
                              </Badge>
                            )
                          ) : (
                            <Badge variant="default">Pausado</Badge>
                          )}
                        </div>
                      </div>

                      {/* Instructions if any */}
                      {remedy.instructions && (
                        <p className="text-xs text-foreground-subtle bg-background/50 p-2 rounded-lg border border-border/50 mb-3 italic">
                          ℹ️ {remedy.instructions}
                        </p>
                      )}

                      {/* Details pills */}
                      <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/50">
                        <div>
                          <span className="text-foreground-subtle block">Frecuencia:</span>
                          <span className="font-semibold text-foreground">
                            Cada {remedy.frequencyHours} horas
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground-subtle block">Repetición:</span>
                          <span className="font-semibold text-foreground">
                            Cada {remedy.snoozeMinutes || 15} min
                          </span>
                        </div>
                      </div>

                      {/* Next dose indicator */}
                      <div className="mt-3 text-xs flex items-center justify-between">
                        <span className="text-foreground-muted font-medium">
                          Próxima dosis:
                        </span>
                        <span
                          suppressHydrationWarning
                          className={`font-semibold ${
                            isDue
                              ? "text-primary animate-pulse"
                              : "text-foreground-muted"
                          }`}
                        >
                          {formatDateTime(remedy.nextDoseAt)}
                        </span>
                      </div>

                      {/* Last recorded log */}
                      {lastLog && (
                        <div className="mt-2 text-[11px] flex items-center justify-between text-foreground-subtle bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-border/40">
                          <span className="font-medium">Última acción:</span>
                          <span className="font-semibold text-foreground">
                            {lastLog.action === "taken" && "✅ Tomado "}
                            {lastLog.action === "snoozed" && "⏰ Pospuesto "}
                            {lastLog.action === "skipped" && "❌ Omitido "}
                            <span suppressHydrationWarning className="font-normal text-foreground-muted">
                              ({formatDateTime(lastLog.actionAt)})
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      {remedy.isActive && (
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => handleActionTaken(remedy)}
                            className="py-1.5 px-2 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success/20 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                            title="Registrar dosis tomada"
                          >
                            ✅ Tomado
                          </button>

                          <button
                            onClick={() => {
                              setSnoozingRemedy(remedy);
                              setSnoozeMinutes(remedy.snoozeMinutes || 15);
                            }}
                            className="py-1.5 px-2 rounded-xl bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                            title="Posponer recordatorio"
                          >
                            ⏰ Posponer
                          </button>

                          <button
                            onClick={() => {
                              setSkippingRemedy(remedy);
                              setSkipReason("Me siento mal");
                              setCustomSkipReason("");
                            }}
                            className="py-1.5 px-2 rounded-xl bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                            title="No me lo puedo tomar hoy"
                          >
                            ❌ Omitir
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          onClick={() => handleToggleActive(remedy)}
                          className="text-foreground-subtle hover:text-foreground transition-colors"
                        >
                          {remedy.isActive ? "⏸️ Pausar" : "▶️ Reanudar"}
                        </button>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEditModal(remedy)}
                            className="text-foreground-muted hover:text-primary transition-colors font-medium"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => setDeletingRemedyId(remedy._id)}
                            className="text-foreground-muted hover:text-danger transition-colors font-medium"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: HISTORIAL DE TOMAS ── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-2xl bg-background-elevated border border-dashed border-border space-y-2">
              <div className="text-4xl opacity-40">📜</div>
              <h3 className="text-base font-semibold text-foreground">
                No hay historial de tomas aún
              </h3>
              <p className="text-xs text-foreground-muted">
                A medida que confirmes o pospongas tus remedios, aparecerá el registro aquí.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-background-elevated border border-border space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-foreground-subtle font-semibold">
                      <th className="pb-3 px-2">Fecha y Hora</th>
                      <th className="pb-3 px-2">Remedio</th>
                      <th className="pb-3 px-2">Acción</th>
                      <th className="pb-3 px-2">Motivo / Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td suppressHydrationWarning className="py-3 px-2 text-foreground-muted whitespace-nowrap">
                          {formatDateTime(log.actionAt)}
                        </td>
                        <td className="py-3 px-2 font-semibold text-foreground">
                          {log.remedyName}
                        </td>
                        <td className="py-3 px-2">
                          {log.action === "taken" && (
                            <Badge variant="success">✅ Tomado</Badge>
                          )}
                          {log.action === "snoozed" && (
                            <Badge variant="warning">⏰ Pospuesto</Badge>
                          )}
                          {log.action === "skipped" && (
                            <Badge variant="danger">❌ Omitido</Badge>
                          )}
                        </td>
                        <td className="py-3 px-2 text-foreground-muted">
                          {log.skipReason ? (
                            <span className="italic text-danger/80">
                              "{log.skipReason}"
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: CREAR / EDITAR REMEDIO ── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingRemedy ? "Editar Remedio" : "Nuevo Remedio"}
      >
        <form onSubmit={handleSaveRemedy} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
              {formError}
            </div>
          )}

          <Input
            label="Nombre del Medicamento *"
            placeholder="Ej. Paracetamol, Ibuprofeno 600mg"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <Input
            label="Dosis *"
            placeholder="Ej. 1 comprimido, 5ml, 1 cápsula"
            value={formDose}
            onChange={(e) => setFormDose(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                Frecuencia (Cada cuántas horas) *
              </label>
              <select
                value={formFrequencyHours}
                onChange={(e) => setFormFrequencyHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary"
              >
                <option value="4">Cada 4 horas</option>
                <option value="6">Cada 6 horas</option>
                <option value="8">Cada 8 horas</option>
                <option value="12">Cada 12 horas</option>
                <option value="24">Cada 24 horas (Diario)</option>
                <option value="48">Cada 48 horas (Cada 2 días)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                Repetición / Snooze (minutos)
              </label>
              <select
                value={formSnoozeMinutes}
                onChange={(e) => setFormSnoozeMinutes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary"
              >
                <option value="5">Cada 5 minutos</option>
                <option value="10">Cada 10 minutos</option>
                <option value="15">Cada 15 minutos (Defecto)</option>
                <option value="30">Cada 30 minutos</option>
                <option value="60">Cada 60 minutos (1 hora)</option>
              </select>
            </div>
          </div>

          <Input
            label="Hora de la primera toma / Siguiente dosis"
            type="time"
            value={formFirstDoseTime}
            onChange={(e) => setFormFirstDoseTime(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
              Instrucciones / Notas adicionales (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Tomar con abundante agua después del almuerzo"
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">
              {isSubmitting ? "Guardando..." : "Guardar Remedio"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: POSPONER (SNOOZE) ── */}
      {snoozingRemedy && (
        <Modal
          isOpen={Boolean(snoozingRemedy)}
          onClose={() => setSnoozingRemedy(null)}
          title={`Posponer recordatorio: ${snoozingRemedy.name}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-foreground-muted">
              ¿En cuántos minutos deseas que te volvamos a recordar tomar este remedio?
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[5, 15, 30, 45, 60, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSnoozeMinutes(mins)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    snoozeMinutes === mins
                      ? "bg-primary text-white border-primary"
                      : "bg-background border-border text-foreground hover:border-border-hover"
                  }`}
                >
                  {mins >= 60 ? `${mins / 60} h` : `${mins} min`}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSnoozingRemedy(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmSnooze}
                className="bg-warning hover:bg-warning/90 text-white"
              >
                ⏰ Posponer {snoozeMinutes} min
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: OMITIR DOSIS (SKIP WITH REASON) ── */}
      {skippingRemedy && (
        <Modal
          isOpen={Boolean(skippingRemedy)}
          onClose={() => setSkippingRemedy(null)}
          title={`No puedo tomarlo hoy: ${skippingRemedy.name}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-foreground-muted">
              Indica la razón por la cual omitirás la dosis de hoy:
            </p>

            <div className="space-y-2">
              {[
                "Me siento mal / Malestar o náuseas",
                "Sin stock de medicamento",
                "Indicación médica / Ayuno",
                "Otro motivo",
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    skipReason === reason
                      ? "bg-danger/10 border-danger/30 text-danger font-medium"
                      : "bg-background border-border text-foreground hover:border-border-hover"
                  }`}
                >
                  <input
                    type="radio"
                    name="skipReasonOption"
                    checked={skipReason === reason}
                    onChange={() => setSkipReason(reason)}
                    className="accent-danger"
                  />
                  <span className="text-xs">{reason}</span>
                </label>
              ))}
            </div>

            {skipReason === "Otro motivo" && (
              <Input
                label="Especifica la razón:"
                placeholder="Escribe la razón aquí..."
                value={customSkipReason}
                onChange={(e) => setCustomSkipReason(e.target.value)}
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSkippingRemedy(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmSkip}
                className="bg-danger hover:bg-danger/90 text-white"
              >
                ❌ Registrar Omisión
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── CONFIRM DELETE MODAL ── */}
      <ConfirmModal
        isOpen={Boolean(deletingRemedyId)}
        onClose={() => setDeletingRemedyId(null)}
        onConfirm={handleDeleteRemedy}
        title="Eliminar Remedio"
        message="¿Estás seguro de que deseas eliminar este remedio? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
