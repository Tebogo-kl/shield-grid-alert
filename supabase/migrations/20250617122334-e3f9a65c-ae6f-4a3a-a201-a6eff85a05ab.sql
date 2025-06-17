
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('user', 'company_admin', 'security_officer');
CREATE TYPE public.service_type AS ENUM ('armed_response', 'patrol', 'escort', 'emergency', 'surveillance');
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.officer_status AS ENUM ('available', 'busy', 'offline');

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  contact_person TEXT NOT NULL,
  contact_title TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create security officers table
CREATE TABLE public.security_officers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  badge_number TEXT NOT NULL,
  specializations TEXT[],
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  status officer_status DEFAULT 'offline',
  hourly_rate DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, badge_number)
);

-- Create service requests table
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  officer_id UUID REFERENCES public.security_officers(id) ON DELETE SET NULL,
  service_type service_type NOT NULL,
  description TEXT,
  location_latitude DECIMAL(10, 8) NOT NULL,
  location_longitude DECIMAL(11, 8) NOT NULL,
  location_address TEXT,
  status request_status DEFAULT 'pending',
  estimated_duration INTEGER, -- in minutes
  total_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create request responses table (for officers responding to requests)
CREATE TABLE public.request_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  officer_id UUID REFERENCES public.security_officers(id) ON DELETE CASCADE NOT NULL,
  response_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  estimated_arrival INTEGER, -- in minutes
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  officer_id UUID REFERENCES public.security_officers(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for companies
CREATE POLICY "Company owners can manage their company" 
  ON public.companies FOR ALL 
  USING (auth.uid() = owner_id);

CREATE POLICY "Everyone can view companies" 
  ON public.companies FOR SELECT 
  USING (true);

-- Create RLS policies for security officers
CREATE POLICY "Officers can view their own data" 
  ON public.security_officers FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Company owners can manage their officers" 
  ON public.security_officers FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE companies.id = company_id 
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view officers for service requests" 
  ON public.security_officers FOR SELECT 
  USING (status = 'available');

-- Create RLS policies for service requests
CREATE POLICY "Users can manage their own requests" 
  ON public.service_requests FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Officers can view requests in their area" 
  ON public.service_requests FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.security_officers 
      WHERE security_officers.user_id = auth.uid()
      AND security_officers.status = 'available'
    )
  );

-- Create RLS policies for request responses
CREATE POLICY "Officers can manage their responses" 
  ON public.request_responses FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.security_officers 
      WHERE security_officers.id = officer_id 
      AND security_officers.user_id = auth.uid()
    )
  );

CREATE POLICY "Request owners can view responses" 
  ON public.request_responses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.service_requests 
      WHERE service_requests.id = request_id 
      AND service_requests.user_id = auth.uid()
    )
  );

-- Create RLS policies for reviews
CREATE POLICY "Users can manage their own reviews" 
  ON public.reviews FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Officers can view reviews about them" 
  ON public.reviews FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.security_officers 
      WHERE security_officers.id = officer_id 
      AND security_officers.user_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.companies 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.security_officers 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.service_requests 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_security_officers_location ON public.security_officers (current_latitude, current_longitude);
CREATE INDEX idx_security_officers_status ON public.security_officers (status);
CREATE INDEX idx_service_requests_location ON public.service_requests (location_latitude, location_longitude);
CREATE INDEX idx_service_requests_status ON public.service_requests (status);
CREATE INDEX idx_companies_owner ON public.companies (owner_id);
