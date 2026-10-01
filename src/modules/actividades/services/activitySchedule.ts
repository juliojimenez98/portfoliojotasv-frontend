import type {
  ActivityCategory,
  ActivityFrequency,
  IActivity,
  IActivityLog,
} from "../types/activity.types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const DAY_OPTIONS = [
  { value: 1, short: "Lun", label: "Lunes" },
  { value: 2, short: "Mar", label: "Martes" },
  { value: 3, short: "Mie", label: "Miercoles" },
  { value: 4, short: "Jue", label: "Jueves" },
  { value: 5, short: "Vie", label: "Viernes" },
  { value: 6, short: "Sab", label: "Sabado" },
  { value: 0, short: "Dom", label: "Domingo" },
];

export const FREQUENCY_OPTIONS: {
  value: ActivityFrequency;
  label: string;
}[] = [
  { value: "daily", label: "Todos los dias" },
  { value: "weekdays", label: "Entre semana" },
  { value: "weekends", label: "Fines de semana" },
  { value: "weekly", label: "Semanal" },
  { value: "custom_days", label: "Dias especificos" },
  { value: "monthly", label: "Mensual" },
  { value: "interval_days", label: "Cada ciertos dias" },
];

export const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; icon: string; className: string }
> = {
  work: {
    label: "Trabajo",
    icon: "💼",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  personal: {
    label: "Personal",
    icon: "✨",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  health: {
    label: "Salud",
    icon: "🏃",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  study: {
    label: "Estudio",
    icon: "📚",
    className: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  },
  home: {
    label: "Casa",
    icon: "🏠",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  other: {
    label: "Otra",
    icon: "🧩",
    className: "bg-foreground-muted/10 text-foreground-muted border-border",
  },
};

export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return getDateKey(new Date());
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return getDateKey(new Date());
  return getDateKey(date);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(value?: string | null): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatTime(value?: string | null): string {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function durationLabel(minutes?: number): string {
  if (minutes === undefined || minutes === null) return "Sin duracion";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isActivityScheduledForDate(
  activity: IActivity,
  date = new Date(),
): boolean {
  if (!activity.isActive) return false;

  const schedule = activity.schedule;
  const dayStart = startOfDay(date);
  const startDate = startOfDay(new Date(schedule.startDate));
  const endDate = schedule.endDate ? startOfDay(new Date(schedule.endDate)) : null;

  if (Number.isNaN(startDate.getTime())) return false;
  if (dayStart < startDate) return false;
  if (endDate && dayStart > endDate) return false;

  const dayOfWeek = dayStart.getDay();
  const days = schedule.daysOfWeek || [];

  switch (schedule.frequency) {
    case "daily":
      return true;
    case "weekdays":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "weekends":
      return dayOfWeek === 0 || dayOfWeek === 6;
    case "weekly":
      return days.length > 0 ? days.includes(dayOfWeek) : dayOfWeek === startDate.getDay();
    case "custom_days":
      return days.includes(dayOfWeek);
    case "monthly":
      return dayStart.getDate() === startDate.getDate();
    case "interval_days": {
      const diffDays = Math.floor((dayStart.getTime() - startDate.getTime()) / DAY_MS);
      const interval = Math.max(1, Number(schedule.intervalDays || 1));
      return diffDays >= 0 && diffDays % interval === 0;
    }
    default:
      return false;
  }
}

export function scheduleLabel(activity: IActivity): string {
  const { schedule } = activity;
  const time = schedule.expectedStartTime || schedule.timeOfDay || "09:00";

  if (schedule.frequency === "custom_days") {
    const days = DAY_OPTIONS.filter((day) =>
      schedule.daysOfWeek?.includes(day.value),
    ).map((day) => day.short);
    return `${days.length ? days.join(", ") : "Dias definidos"} a las ${time}`;
  }

  if (schedule.frequency === "weekly") {
    const days = DAY_OPTIONS.filter((day) =>
      schedule.daysOfWeek?.includes(day.value),
    ).map((day) => day.short);
    return `${days.length ? days.join(", ") : "Semanal"} a las ${time}`;
  }

  if (schedule.frequency === "interval_days") {
    return `Cada ${schedule.intervalDays || 1} dias a las ${time}`;
  }

  const label =
    FREQUENCY_OPTIONS.find((option) => option.value === schedule.frequency)
      ?.label || "Programada";
  return `${label} a las ${time}`;
}

export function getOpenLog(
  activityId: string,
  logs: IActivityLog[],
): IActivityLog | undefined {
  return logs.find(
    (log) =>
      log.activityId === activityId &&
      log.status === "in_progress" &&
      !log.checkOutAt,
  );
}

export function hasFinishedToday(
  activityId: string,
  logs: IActivityLog[],
): boolean {
  const todayKey = getDateKey(new Date());
  return logs.some(
    (log) =>
      log.activityId === activityId &&
      log.dateKey === todayKey &&
      log.status === "completed",
  );
}

export function hasSkippedToday(
  activityId: string,
  logs: IActivityLog[],
): boolean {
  const todayKey = getDateKey(new Date());
  return logs.some(
    (log) =>
      log.activityId === activityId &&
      log.dateKey === todayKey &&
      log.status === "skipped",
  );
}
