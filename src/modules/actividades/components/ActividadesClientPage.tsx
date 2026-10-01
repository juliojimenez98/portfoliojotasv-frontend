"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Input, { Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type {
  ActivityCategory,
  ActivityFrequency,
  ActivityInput,
  ActivityTrackingMode,
  IActivity,
  IActivityLog,
} from "../types/activity.types";
import {
  checkInActivity,
  checkOutActivity,
  completeActivity,
  createActivity,
  deleteActivity,
  getActivities,
  getActivityLogs,
  skipActivity,
  updateActivity,
} from "../services/activity.actions";
import {
  CATEGORY_META,
  DAY_OPTIONS,
  FREQUENCY_OPTIONS,
  durationLabel,
  formatDate,
  formatDateTime,
  formatTime,
  getDateKey,
  getOpenLog,
  hasFinishedToday,
  hasSkippedToday,
  isActivityScheduledForDate,
  scheduleLabel,
  toDateInputValue,
} from "../services/activitySchedule";

type ActivityTab = "today" | "all" | "history";

interface ActividadesClientPageProps {
  initialActivities: IActivity[];
  initialLogs: IActivityLog[];
}

interface ActivityFormState {
  title: string;
  description: string;
  category: ActivityCategory;
  trackingMode: ActivityTrackingMode;
  frequency: ActivityFrequency;
  daysOfWeek: number[];
  intervalDays: string;
  startDate: string;
  endDate: string;
  timeOfDay: string;
  expectedStartTime: string;
  expectedEndTime: string;
}

const categoryOptions = Object.entries(CATEGORY_META).map(([value, meta]) => ({
  value,
  label: `${meta.icon} ${meta.label}`,
}));

const trackingModeOptions = [
  { value: "completion", label: "Marcar como hecha" },
  { value: "timer", label: "Entrada y salida" },
];

const todayInputValue = getDateKey(new Date());

const emptyForm: ActivityFormState = {
  title: "",
  description: "",
  category: "personal",
  trackingMode: "completion",
  frequency: "daily",
  daysOfWeek: [1, 2, 3, 4, 5],
  intervalDays: "1",
  startDate: todayInputValue,
  endDate: "",
  timeOfDay: "09:00",
  expectedStartTime: "09:00",
  expectedEndTime: "18:00",
};

function buildFormFromActivity(activity: IActivity): ActivityFormState {
  return {
    title: activity.title,
    description: activity.description || "",
    category: activity.category,
    trackingMode: activity.trackingMode,
    frequency: activity.schedule.frequency,
    daysOfWeek: activity.schedule.daysOfWeek || [],
    intervalDays: String(activity.schedule.intervalDays || 1),
    startDate: toDateInputValue(activity.schedule.startDate),
    endDate: activity.schedule.endDate
      ? toDateInputValue(activity.schedule.endDate)
      : "",
    timeOfDay:
      activity.schedule.timeOfDay ||
      activity.schedule.expectedStartTime ||
      "09:00",
    expectedStartTime:
      activity.schedule.expectedStartTime ||
      activity.schedule.timeOfDay ||
      "09:00",
    expectedEndTime: activity.schedule.expectedEndTime || "18:00",
  };
}

function buildPayload(form: ActivityFormState): ActivityInput {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    trackingMode: form.trackingMode,
    schedule: {
      frequency: form.frequency,
      daysOfWeek:
        form.frequency === "custom_days" || form.frequency === "weekly"
          ? form.daysOfWeek
          : [],
      intervalDays: Math.max(1, Number(form.intervalDays || 1)),
      startDate: form.startDate,
      endDate: form.endDate || null,
      timeOfDay: form.timeOfDay || form.expectedStartTime || "09:00",
      expectedStartTime:
        form.trackingMode === "timer"
          ? form.expectedStartTime || form.timeOfDay || "09:00"
          : form.timeOfDay || "09:00",
      expectedEndTime:
        form.trackingMode === "timer" ? form.expectedEndTime || undefined : undefined,
    },
  };
}

function upsertLog(logs: IActivityLog[], incoming: IActivityLog): IActivityLog[] {
  const exists = logs.some((log) => log._id === incoming._id);
  if (exists) {
    return logs.map((log) => (log._id === incoming._id ? incoming : log));
  }
  return [incoming, ...logs];
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function ActivityStatusBadge({
  activity,
  logs,
}: {
  activity: IActivity;
  logs: IActivityLog[];
}) {
  const openLog = getOpenLog(activity._id, logs);
  const finishedToday = hasFinishedToday(activity._id, logs);
  const skippedToday = hasSkippedToday(activity._id, logs);

  if (!activity.isActive) {
    return <Badge variant="default">Inactiva</Badge>;
  }
  if (openLog) {
    return <Badge variant="warning" dot>En curso</Badge>;
  }
  if (finishedToday) {
    return <Badge variant="success" dot>Hecha hoy</Badge>;
  }
  if (skippedToday) {
    return <Badge variant="danger">Omitida hoy</Badge>;
  }
  return <Badge variant="primary" dot>Activa</Badge>;
}

export default function ActividadesClientPage({
  initialActivities,
  initialLogs,
}: ActividadesClientPageProps) {
  const [activities, setActivities] = useState<IActivity[]>(initialActivities);
  const [logs, setLogs] = useState<IActivityLog[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<ActivityTab>("today");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<IActivity | null>(null);
  const [form, setForm] = useState<ActivityFormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingActivity, setDeletingActivity] = useState<IActivity | null>(null);
  const [skippingActivity, setSkippingActivity] = useState<IActivity | null>(null);
  const [skipReason, setSkipReason] = useState("");

  const todayActivities = useMemo(() => {
    return activities.filter((activity) => {
      const openLog = getOpenLog(activity._id, logs);
      return (
        isActivityScheduledForDate(activity, new Date()) ||
        Boolean(openLog) ||
        logs.some(
          (log) =>
            log.activityId === activity._id &&
            log.dateKey === getDateKey(new Date()),
        )
      );
    });
  }, [activities, logs]);

  const activeActivitiesCount = activities.filter((activity) => activity.isActive).length;
  const openLogsCount = logs.filter((log) => log.status === "in_progress").length;
  const finishedTodayCount = todayActivities.filter((activity) =>
    hasFinishedToday(activity._id, logs),
  ).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [activityData, logData] = await Promise.all([
        getActivities(),
        getActivityLogs(),
      ]);
      setActivities(activityData);
      setLogs(logData);
    } catch (err: unknown) {
      alert(errorMessage(err, "Error al actualizar actividades"));
    } finally {
      setIsRefreshing(false);
    }
  };

  const openCreateForm = () => {
    setEditingActivity(null);
    setForm(emptyForm);
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditForm = (activity: IActivity) => {
    setEditingActivity(activity);
    setForm(buildFormFromActivity(activity));
    setFormError("");
    setIsFormOpen(true);
  };

  const toggleDay = (day: number) => {
    setForm((current) => {
      const exists = current.daysOfWeek.includes(day);
      const daysOfWeek = exists
        ? current.daysOfWeek.filter((item) => item !== day)
        : [...current.daysOfWeek, day].sort((a, b) => a - b);
      return { ...current, daysOfWeek };
    });
  };

  const saveActivity = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setFormError("Ingresa un nombre para la actividad.");
      return;
    }
    if (
      (form.frequency === "custom_days" || form.frequency === "weekly") &&
      form.daysOfWeek.length === 0
    ) {
      setFormError("Selecciona al menos un dia.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = buildPayload(form);
      if (editingActivity) {
        const updated = await updateActivity(editingActivity._id, payload);
        setActivities((current) =>
          current.map((activity) =>
            activity._id === updated._id ? updated : activity,
          ),
        );
      } else {
        const created = await createActivity(payload);
        setActivities((current) => [created, ...current]);
      }
      setIsFormOpen(false);
    } catch (err: unknown) {
      setFormError(errorMessage(err, "Error al guardar actividad"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyActivityAndLog = (activity: IActivity, log: IActivityLog) => {
    setActivities((current) =>
      current.map((item) => (item._id === activity._id ? activity : item)),
    );
    setLogs((current) => upsertLog(current, log));
  };

  const runActivityAction = async (
    activity: IActivity,
    action: "complete" | "check-in" | "check-out",
  ) => {
    setPendingActionId(activity._id);
    try {
      const result =
        action === "complete"
          ? await completeActivity(activity._id)
          : action === "check-in"
            ? await checkInActivity(activity._id)
            : await checkOutActivity(activity._id);

      applyActivityAndLog(result.activity, result.log);
    } catch (err: unknown) {
      alert(errorMessage(err, "Error al registrar la accion"));
    } finally {
      setPendingActionId(null);
    }
  };

  const confirmSkip = async () => {
    if (!skippingActivity) return;
    setPendingActionId(skippingActivity._id);
    try {
      const result = await skipActivity(
        skippingActivity._id,
        skipReason.trim() || undefined,
      );
      applyActivityAndLog(result.activity, result.log);
      setSkippingActivity(null);
      setSkipReason("");
    } catch (err: unknown) {
      alert(errorMessage(err, "Error al omitir actividad"));
    } finally {
      setPendingActionId(null);
    }
  };

  const toggleActivityStatus = async (activity: IActivity) => {
    setPendingActionId(activity._id);
    try {
      const updated = await updateActivity(activity._id, {
        isActive: !activity.isActive,
      });
      setActivities((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (err: unknown) {
      alert(errorMessage(err, "Error al actualizar actividad"));
    } finally {
      setPendingActionId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingActivity) return;
    setPendingActionId(deletingActivity._id);
    try {
      await deleteActivity(deletingActivity._id);
      setActivities((current) =>
        current.filter((activity) => activity._id !== deletingActivity._id),
      );
      setDeletingActivity(null);
    } catch (err: unknown) {
      alert(errorMessage(err, "Error al eliminar actividad"));
    } finally {
      setPendingActionId(null);
    }
  };

  const renderActivityCard = (activity: IActivity) => {
    const categoryMeta = CATEGORY_META[activity.category];
    const openLog = getOpenLog(activity._id, logs);
    const finishedToday = hasFinishedToday(activity._id, logs);
    const skippedToday = hasSkippedToday(activity._id, logs);
    const isPending = pendingActionId === activity._id;
    const disableMainAction = !activity.isActive || isPending || skippedToday;

    return (
      <Card
        key={activity._id}
        className="overflow-hidden"
        padding="none"
        hover
      >
        <div className="p-4 md:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shrink-0">
                {categoryMeta.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground text-base truncate">
                  {activity.title}
                </h3>
                {activity.description && (
                  <p className="text-xs text-foreground-muted mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <ActivityStatusBadge activity={activity} logs={logs} />
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold",
                  categoryMeta.className,
                )}
              >
                {categoryMeta.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-background-elevated border border-border px-3 py-2">
              <p className="text-foreground-subtle">Frecuencia</p>
              <p className="font-semibold text-foreground mt-0.5">
                {scheduleLabel(activity)}
              </p>
            </div>
            <div className="rounded-lg bg-background-elevated border border-border px-3 py-2">
              <p className="text-foreground-subtle">Proxima</p>
              <p className="font-semibold text-foreground mt-0.5">
                {formatDateTime(activity.nextOccurrenceAt)}
              </p>
            </div>
            <div className="rounded-lg bg-background-elevated border border-border px-3 py-2">
              <p className="text-foreground-subtle">Registro</p>
              <p className="font-semibold text-foreground mt-0.5">
                {activity.trackingMode === "timer"
                  ? openLog
                    ? `Entrada ${formatTime(openLog.checkInAt)}`
                    : "Entrada y salida"
                  : finishedToday
                    ? "Completada"
                    : "Pendiente"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {activity.trackingMode === "timer" ? (
              openLog ? (
                <Button
                  type="button"
                  className="flex-1"
                  variant="primary"
                  isLoading={isPending}
                  disabled={disableMainAction}
                  onClick={() => runActivityAction(activity, "check-out")}
                >
                  Marcar salida
                </Button>
              ) : (
                <Button
                  type="button"
                  className="flex-1"
                  variant="primary"
                  isLoading={isPending}
                  disabled={disableMainAction || finishedToday}
                  onClick={() => runActivityAction(activity, "check-in")}
                >
                  Marcar entrada
                </Button>
              )
            ) : (
              <Button
                type="button"
                className="flex-1"
                variant={finishedToday ? "secondary" : "primary"}
                isLoading={isPending}
                disabled={disableMainAction || finishedToday}
                onClick={() => runActivityAction(activity, "complete")}
              >
                {finishedToday ? "Hecha hoy" : "Completar"}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              disabled={!activity.isActive || isPending || finishedToday || skippedToday}
              onClick={() => setSkippingActivity(activity)}
            >
              Omitir
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => openEditForm(activity)}
            >
              Editar
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={() => toggleActivityStatus(activity)}
              disabled={isPending}
              className="text-xs font-semibold text-foreground-muted hover:text-foreground disabled:opacity-50"
            >
              {activity.isActive ? "Pausar" : "Reactivar"}
            </button>
            <button
              type="button"
              onClick={() => setDeletingActivity(activity)}
              disabled={isPending}
              className="text-xs font-semibold text-danger hover:opacity-80 disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-background-elevated to-secondary/10 border border-primary/20 p-5 md:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <Badge variant="primary" dot>Rutinas y tareas</Badge>
            <h1 className="text-3xl md:text-4xl font-black text-foreground mt-3">
              Actividades
            </h1>
            <p className="text-sm text-foreground-muted mt-2 max-w-2xl">
              Organiza tareas recurrentes, turnos, habitos y marcas de entrada o salida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              isLoading={isRefreshing}
              onClick={handleRefresh}
            >
              Actualizar
            </Button>
            <Button type="button" onClick={openCreateForm}>
              Nueva actividad
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wider text-foreground-subtle font-bold">
            Activas
          </p>
          <p className="text-3xl font-black text-foreground mt-1">
            {activeActivitiesCount}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-foreground-subtle font-bold">
            Para hoy
          </p>
          <p className="text-3xl font-black text-primary mt-1">
            {todayActivities.length}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-foreground-subtle font-bold">
            En curso
          </p>
          <p className="text-3xl font-black text-warning mt-1">
            {openLogsCount}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border">
        {[
          { value: "today", label: `Hoy (${finishedTodayCount}/${todayActivities.length})` },
          { value: "all", label: `Todas (${activities.length})` },
          { value: "history", label: "Historial" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value as ActivityTab)}
            className={cn(
              "px-4 py-3 text-sm font-bold border-b-2 transition-colors",
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "today" && (
        <div className="space-y-4">
          {todayActivities.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-5xl mb-3">📅</div>
              <h3 className="text-lg font-bold text-foreground">
                Nada programado para hoy
              </h3>
              <p className="text-sm text-foreground-muted mt-1">
                Puedes crear una actividad recurrente cuando quieras.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {todayActivities.map(renderActivityCard)}
            </div>
          )}
        </div>
      )}

      {activeTab === "all" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {activities.length === 0 ? (
            <Card className="text-center py-12 xl:col-span-2">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-foreground">
                Crea tu primera actividad
              </h3>
              <p className="text-sm text-foreground-muted mt-1">
                Puede ser trabajo, estudio, ejercicio, casa o cualquier rutina.
              </p>
            </Card>
          ) : (
            activities.map(renderActivityCard)
          )}
        </div>
      )}

      {activeTab === "history" && (
        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-border">
            {logs.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-5xl mb-3">🕓</div>
                <h3 className="text-lg font-bold text-foreground">
                  Sin registros aun
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Tus entradas, salidas, omisiones y tareas completadas apareceran aqui.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">
                        {log.activityTitle}
                      </h3>
                      <Badge
                        variant={
                          log.status === "completed"
                            ? "success"
                            : log.status === "in_progress"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {log.status === "completed"
                          ? "Completada"
                          : log.status === "in_progress"
                            ? "En curso"
                            : "Omitida"}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground-muted mt-1">
                      {formatDate(log.scheduledFor || log.createdAt)} ·{" "}
                      {log.checkInAt && `Entrada ${formatTime(log.checkInAt)}`}
                      {log.checkOutAt && ` · Salida ${formatTime(log.checkOutAt)}`}
                      {log.completedAt && !log.checkInAt && `Registro ${formatTime(log.completedAt)}`}
                    </p>
                    {(log.note || log.skipReason) && (
                      <p className="text-xs text-foreground-subtle mt-1">
                        {log.note || log.skipReason}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-bold text-foreground shrink-0">
                    {log.durationMinutes !== undefined
                      ? durationLabel(log.durationMinutes)
                      : log.status === "skipped"
                        ? "Omitida"
                        : "Registro"}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingActivity ? "Editar actividad" : "Nueva actividad"}
        size="3xl"
      >
        <form onSubmit={saveActivity} className="space-y-5">
          {formError && (
            <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Ej. Jornada laboral"
              required
            />
            <Select
              label="Categoria"
              value={form.category}
              options={categoryOptions}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as ActivityCategory,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1.5">
              Descripcion
            </label>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full min-h-24 rounded-lg border border-border bg-background-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="Detalles opcionales"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de registro"
              value={form.trackingMode}
              options={trackingModeOptions}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  trackingMode: event.target.value as ActivityTrackingMode,
                }))
              }
            />
            <Select
              label="Frecuencia"
              value={form.frequency}
              options={FREQUENCY_OPTIONS}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  frequency: event.target.value as ActivityFrequency,
                }))
              }
            />
          </div>

          {(form.frequency === "custom_days" || form.frequency === "weekly") && (
            <div>
              <p className="block text-sm font-medium text-foreground-muted mb-2">
                Dias
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    aria-pressed={form.daysOfWeek.includes(day.value)}
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "h-10 rounded-lg border text-xs font-bold transition-colors",
                      form.daysOfWeek.includes(day.value)
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background-elevated text-foreground-muted hover:text-foreground",
                    )}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Desde"
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
            />
            <Input
              label="Hasta"
              type="date"
              value={form.endDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, endDate: event.target.value }))
              }
            />
            {form.frequency === "interval_days" ? (
              <Input
                label="Intervalo"
                type="number"
                min={1}
                value={form.intervalDays}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    intervalDays: event.target.value,
                  }))
                }
              />
            ) : (
              <Input
                label="Hora"
                type="time"
                value={form.timeOfDay}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    timeOfDay: event.target.value,
                  }))
                }
              />
            )}
          </div>

          {form.trackingMode === "timer" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Entrada esperada"
                type="time"
                value={form.expectedStartTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expectedStartTime: event.target.value,
                    timeOfDay: event.target.value,
                  }))
                }
              />
              <Input
                label="Salida esperada"
                type="time"
                value={form.expectedEndTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expectedEndTime: event.target.value,
                  }))
                }
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingActivity ? "Guardar cambios" : "Crear actividad"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(skippingActivity)}
        onClose={() => setSkippingActivity(null)}
        title="Omitir actividad"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Motivo"
            value={skipReason}
            onChange={(event) => setSkipReason(event.target.value)}
            placeholder="Opcional"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSkippingActivity(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={Boolean(
                skippingActivity && pendingActionId === skippingActivity._id,
              )}
              onClick={confirmSkip}
            >
              Omitir
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingActivity)}
        onClose={() => setDeletingActivity(null)}
        onConfirm={confirmDelete}
        title="Eliminar actividad"
        message={`Se eliminara "${deletingActivity?.title || "esta actividad"}".`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={Boolean(
          deletingActivity && pendingActionId === deletingActivity._id,
        )}
      />
    </div>
  );
}
