-- Remove a constraint única antiga se existir
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS unique_whatsapp_number;

-- Muda o default de whatsapp_number para NULL ao invés de string vazia
ALTER TABLE public.profiles 
ALTER COLUMN whatsapp_number SET DEFAULT NULL;

-- Atualiza registros existentes com string vazia para NULL
UPDATE public.profiles 
SET whatsapp_number = NULL 
WHERE whatsapp_number = '';

-- Cria uma constraint única parcial que só se aplica quando whatsapp_number não é NULL
CREATE UNIQUE INDEX unique_whatsapp_number 
ON public.profiles (whatsapp_number) 
WHERE whatsapp_number IS NOT NULL AND whatsapp_number != '';