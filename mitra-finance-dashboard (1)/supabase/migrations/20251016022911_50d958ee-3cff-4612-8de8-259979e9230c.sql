-- Adicionar campo whatsapp_number nas tabelas

-- Tabela metas
ALTER TABLE public.metas 
ADD COLUMN whatsapp_number text;

-- Tabela categories
ALTER TABLE public.categories 
ADD COLUMN whatsapp_number text;

-- Tabela entradas
ALTER TABLE public.entradas 
ADD COLUMN whatsapp_number text;

-- Tabela saidas
ALTER TABLE public.saidas 
ADD COLUMN whatsapp_number text;