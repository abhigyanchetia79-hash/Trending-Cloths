
-- Add payment fields to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS transaction_id text,
ADD COLUMN IF NOT EXISTS upi_app text,
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

-- Create payment_settings table
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id text NOT NULL DEFAULT '',
  payee_name text NOT NULL DEFAULT 'Trending Cloths',
  gpay_enabled boolean NOT NULL DEFAULT true,
  phonepe_enabled boolean NOT NULL DEFAULT true,
  paytm_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for checkout)
CREATE POLICY "Payment settings are viewable by everyone"
ON public.payment_settings FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Admins can update payment settings"
ON public.payment_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert
CREATE POLICY "Admins can insert payment settings"
ON public.payment_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default row
INSERT INTO public.payment_settings (upi_id, payee_name) VALUES ('', 'Trending Cloths');

-- Trigger for updated_at
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
