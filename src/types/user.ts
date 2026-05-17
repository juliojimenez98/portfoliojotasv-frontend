export interface IUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  allowedApps: string[];
  isAdmin: boolean;
  paydayConfig?: PaydayConfig;
  createdAt: Date;
  updatedAt: Date;
}

export type PaydayType =
  | 'fixed_day'
  | 'last_day'
  | 'last_business_day'
  | 'business_days_before_end'
  | 'first_day'
  | 'first_business_day'
  | 'custom_text';

export interface PaydayConfig {
  type: PaydayType;
  fixedDay?: number;
  businessDaysBefore?: number;
  customText?: string;
  accountId?: string;
  amount?: number;
  currency?: string;
  label?: string;
}

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SafeUser {
  _id: string;
  email: string;
  username: string;
  allowedApps: string[];
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
