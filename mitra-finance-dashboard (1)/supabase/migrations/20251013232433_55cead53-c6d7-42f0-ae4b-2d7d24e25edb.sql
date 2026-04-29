-- Create table for financial goals (metas)
CREATE TABLE public.metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Create policy for metas
CREATE POLICY "Allow all operations on metas" 
ON public.metas 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_metas_updated_at
BEFORE UPDATE ON public.metas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.metas REPLICA IDENTITY FULL;