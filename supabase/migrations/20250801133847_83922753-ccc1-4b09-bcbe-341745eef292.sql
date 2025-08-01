-- Fix security issues and add data integrity constraints

-- 1. Clean up duplicate categories first
WITH duplicates AS (
  SELECT user_id, name, type, MIN(created_at) as first_created
  FROM categories 
  GROUP BY user_id, name, type 
  HAVING COUNT(*) > 1
),
to_keep AS (
  SELECT c.id
  FROM categories c
  INNER JOIN duplicates d ON c.user_id = d.user_id AND c.name = d.name AND c.type = d.type AND c.created_at = d.first_created
)
DELETE FROM categories 
WHERE id NOT IN (SELECT id FROM to_keep) 
AND (user_id, name, type) IN (
  SELECT user_id, name, type 
  FROM categories 
  GROUP BY user_id, name, type 
  HAVING COUNT(*) > 1
);

-- 2. Add unique constraint to prevent future duplicates
ALTER TABLE categories 
ADD CONSTRAINT unique_user_category_name_type 
UNIQUE (user_id, name, type);

-- 3. Fix mutable function search path security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_shared_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  DELETE FROM public.shared_finance_data WHERE expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_cleanup_expired_shared_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Clean up expired data when new data is inserted
  PERFORM cleanup_expired_shared_data();
  RETURN NEW;
END;
$function$;