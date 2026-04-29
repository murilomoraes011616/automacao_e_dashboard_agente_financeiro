-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, type)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (public access)
CREATE POLICY "Allow all operations on categories" 
ON public.categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert default categories for entrada
INSERT INTO public.categories (name, type) VALUES
  ('Salário', 'entrada'),
  ('Freelance', 'entrada'),
  ('Investimentos', 'entrada'),
  ('Outros', 'entrada');

-- Insert default categories for saida
INSERT INTO public.categories (name, type) VALUES
  ('Alimentação', 'saida'),
  ('Transporte', 'saida'),
  ('Moradia', 'saida'),
  ('Lazer', 'saida'),
  ('Saúde', 'saida'),
  ('Educação', 'saida'),
  ('Outros', 'saida');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;