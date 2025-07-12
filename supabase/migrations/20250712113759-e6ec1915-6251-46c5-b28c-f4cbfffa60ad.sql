
-- Drop all security/company related tables and their dependencies
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.request_responses CASCADE;
DROP TABLE IF EXISTS public.service_requests CASCADE;
DROP TABLE IF EXISTS public.security_officers CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- Drop the enum types that are no longer needed
DROP TYPE IF EXISTS public.service_type CASCADE;
DROP TYPE IF EXISTS public.request_status CASCADE;
DROP TYPE IF EXISTS public.officer_status CASCADE;

-- Update the user_role enum to only include 'user'
ALTER TYPE public.user_role RENAME TO user_role_old;
CREATE TYPE public.user_role AS ENUM ('user');

-- Update the profiles table to use the new enum
ALTER TABLE public.profiles 
ALTER COLUMN role DROP DEFAULT,
ALTER COLUMN role TYPE public.user_role USING 'user'::public.user_role,
ALTER COLUMN role SET DEFAULT 'user'::public.user_role;

-- Drop the old enum type
DROP TYPE public.user_role_old CASCADE;

-- Update the handle_new_user function to only set role as 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, address, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    'user'::user_role
  );
  RETURN NEW;
END;
$$;

-- Clean up any unnecessary RLS policies on profiles
DROP POLICY IF EXISTS "Users can view officer profiles" ON public.profiles;

-- Keep only the essential user profile policies
-- These should already exist but let's ensure they're correct
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
