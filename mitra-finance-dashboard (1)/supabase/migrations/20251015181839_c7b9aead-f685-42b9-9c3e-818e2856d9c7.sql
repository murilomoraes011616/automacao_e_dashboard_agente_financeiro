-- Clean up orphaned records (records without user_id)
DELETE FROM entradas WHERE user_id IS NULL;
DELETE FROM saidas WHERE user_id IS NULL;
DELETE FROM metas WHERE user_id IS NULL;
DELETE FROM categories WHERE user_id IS NULL;

-- Fix categories RLS policies to be user-scoped
DROP POLICY IF EXISTS "Authenticated users can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;

-- Create user-scoped policies for categories
CREATE POLICY "Users can view own categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Make user_id required on all tables (prevent future orphaned records)
ALTER TABLE public.entradas ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.saidas ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.metas ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.categories ALTER COLUMN user_id SET NOT NULL;