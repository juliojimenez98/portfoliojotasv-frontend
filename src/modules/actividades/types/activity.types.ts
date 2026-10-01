export type ActivityFrequency =
  | "daily"
  | "weekdays"
  | "weekends"
  | "weekly"
  | "monthly"
  | "custom_days"
  | "interval_days";

export type ActivityTrackingMode = "completion" | "timer";

export type ActivityCategory =
  | "work"
  | "personal"
  | "health"
  | "study"
  | "home"
  | "other";

export interface ActivitySchedule {
  frequency: ActivityFrequency;
  daysOfWeek: number[];
  intervalDays: number;
  startDate: string;
  endDate?: string | null;
  timeOfDay?: string;
  expectedStartTime?: string;
  expectedEndTime?: string;
}

export interface IActivity {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  trackingMode: ActivityTrackingMode;
  schedule: ActivitySchedule;
  nextOccurrenceAt?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ActivityLogStatus = "completed" | "in_progress" | "skipped";

export interface IActivityLog {
  _id: string;
  userId: string;
  activityId: string;
  activityTitle: string;
  dateKey: string;
  scheduledFor?: string | null;
  status: ActivityLogStatus;
  checkInAt?: string;
  checkOutAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  note?: string;
  skipReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityInput {
  title: string;
  description?: string;
  category: ActivityCategory;
  trackingMode: ActivityTrackingMode;
  schedule: ActivitySchedule;
  isActive?: boolean;
}
