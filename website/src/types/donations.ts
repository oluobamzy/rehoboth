// src/types/donations.ts
/**
 * Types for the Donation Processing System
 */

/** Base donation information interface */
export interface Donation {
  id: string;
  amount: number;
  currency: string;
  stripe_payment_id?: string;
  donor_email?: string;
  donor_name?: string;
  fund_designation?: string;
  is_recurring: boolean;
  frequency?: string;
  stripe_subscription_id?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

/** Donation designation/fund interface */
export interface DonationDesignation {
  id: string;
  name: string;
  description?: string;
  target_amount_cents?: number;
  current_amount_cents: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

/** Recurring donation interface */
export interface RecurringDonation {
  id: string;
  donor_email: string;
  donor_name?: string;
  amount: number;
  currency: string;
  fund_designation?: string;
  frequency: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  next_payment_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

/** Donation creation input interface */
export interface DonationInput {
  amount: number;
  currency?: string;
  donor_email?: string;
  donor_name?: string;
  fund_designation?: string;
  stripe_payment_id?: string;
  is_recurring?: boolean;
  frequency?: string;
  stripe_subscription_id?: string;
  metadata?: Record<string, any>;
}

/** Recurring donation creation input interface */
export interface RecurringDonationInput {
  donor_email: string;
  donor_name?: string;
  amount: number;
  currency?: string;
  fund_designation?: string;
  frequency: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  next_payment_date?: string;
  status?: string;
  metadata?: Record<string, any>;
}

/** Donation designation creation input interface */
export interface DonationDesignationInput {
  name: string;
  description?: string;
  target_amount_cents?: number;
  is_active?: boolean;
  display_order?: number;
}

/** Form data for donation form */
export interface DonationFormData {
  amount: number;
  customAmount?: string;
  designationId?: string;
  isRecurring: boolean;
  frequency?: string;
  donorName: string;
  donorEmail: string;
  agreeToTerms: boolean;
}

/** Donation statistics interface */
export interface DonationStatistics {
  totalAmount: number;
  averageAmount: number;
  donationCount: number;
  recurringDonorCount: number;
  designationTotals: {
    name: string;
    amount: number;
    target?: number;
    percentage?: number;
  }[];
  recentDonations: {
    id: string;
    amount: number;
    date: string;
    designation?: string;
  }[];
  monthlyTotals: {
    month: string;
    total: number;
  }[];
}

/** Constants for donation frequencies */
export const DONATION_FREQUENCIES = {
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUALLY: 'annually'
};

/** Constants for donation statuses */
export const DONATION_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELED: 'canceled',
  PAYMENT_FAILED: 'payment_failed'
};
