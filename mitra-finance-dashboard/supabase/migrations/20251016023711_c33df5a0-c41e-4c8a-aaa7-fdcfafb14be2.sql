-- Adicionar campo user_lid nas tabelas

-- Tabela metas
ALTER TABLE public.metas 
ADD COLUMN user_lid text;

-- Tabela categories
ALTER TABLE public.categories 
ADD COLUMN user_lid text;

-- Tabela entradas
ALTER TABLE public.entradas 
ADD COLUMN user_lid text;

-- Tabela saidas
ALTER TABLE public.saidas 
ADD COLUMN user_lid text;