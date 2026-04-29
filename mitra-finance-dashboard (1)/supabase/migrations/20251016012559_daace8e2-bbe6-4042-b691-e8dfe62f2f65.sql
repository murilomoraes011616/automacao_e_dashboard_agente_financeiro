-- Adicionar coluna whatsapp_number na tabela profiles
ALTER TABLE public.profiles 
  ADD COLUMN whatsapp_number text;

-- Garantir que whatsapp_numbers sejam únicos (mas permite NULL)
ALTER TABLE public.profiles
  ADD CONSTRAINT unique_whatsapp_number 
  UNIQUE (whatsapp_number);

-- Criar índice para busca rápida pelo n8n
CREATE INDEX idx_profiles_whatsapp_number 
  ON public.profiles(whatsapp_number);

-- Validação: deve ter formato de número (apenas dígitos, 12-15 caracteres)
ALTER TABLE public.profiles
  ADD CONSTRAINT whatsapp_number_format
  CHECK (
    whatsapp_number IS NULL 
    OR (whatsapp_number ~ '^[0-9]{12,15}$')
  );