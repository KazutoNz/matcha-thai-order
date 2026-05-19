-- Add new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rider';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';

-- Add new order statuses
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'delivered';