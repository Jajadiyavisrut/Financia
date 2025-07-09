-- Create table for shared financial data
CREATE TABLE public.shared_finance_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code VARCHAR(8) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_finance_data ENABLE ROW LEVEL SECURITY;

-- Create policies for shared data
CREATE POLICY "Users can create their own shared data" 
ON public.shared_finance_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shared data" 
ON public.shared_finance_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can access valid shared data by code" 
ON public.shared_finance_data 
FOR SELECT 
USING (expires_at > now());

-- Create index for faster lookups
CREATE INDEX idx_shared_finance_data_code ON public.shared_finance_data(share_code);
CREATE INDEX idx_shared_finance_data_expires_at ON public.shared_finance_data(expires_at);

-- Create function to generate unique share codes
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired shared data
CREATE OR REPLACE FUNCTION cleanup_expired_shared_data()
RETURNS void AS $$
BEGIN
  DELETE FROM public.shared_finance_data WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically clean up expired data (can be called periodically)
CREATE OR REPLACE FUNCTION auto_cleanup_expired_shared_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up expired data when new data is inserted
  PERFORM cleanup_expired_shared_data();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-cleanup on insert
CREATE TRIGGER trigger_auto_cleanup_expired_data
  AFTER INSERT ON public.shared_finance_data
  FOR EACH STATEMENT
  EXECUTE FUNCTION auto_cleanup_expired_shared_data();