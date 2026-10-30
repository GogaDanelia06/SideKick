-- Signed up but not paid: the business can open Billing and nothing else.
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'PENDING';
