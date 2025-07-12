
-- Create companies table for security companies
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create officer status enum
CREATE TYPE public.officer_status AS ENUM ('available', 'busy', 'offline');

-- Create security officers table
CREATE TABLE public.security_officers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  badge_number TEXT NOT NULL,
  hourly_rate NUMERIC,
  rating NUMERIC DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  specializations TEXT[],
  status officer_status DEFAULT 'offline',
  current_latitude NUMERIC,
  current_longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service request types enum
CREATE TYPE public.service_type AS ENUM ('armed_response', 'patrol', 'escort', 'emergency', 'surveillance');

-- Create request status enum  
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Create service requests table
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  officer_id UUID REFERENCES public.security_officers(id),
  service_type service_type NOT NULL,
  location_latitude NUMERIC NOT NULL,
  location_longitude NUMERIC NOT NULL,
  location_address TEXT,
  description TEXT,
  status request_status DEFAULT 'pending',
  estimated_duration INTEGER,
  total_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table for officer ratings
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  officer_id UUID REFERENCES public.security_officers(id) NOT NULL,
  request_id UUID REFERENCES public.service_requests(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for companies (public view)
CREATE POLICY "Everyone can view companies" ON public.companies
  FOR SELECT USING (true);

-- RLS policies for security officers (users can view available officers)
CREATE POLICY "Users can view available officers" ON public.security_officers
  FOR SELECT USING (status = 'available');

-- RLS policies for service requests (users manage their own)
CREATE POLICY "Users can manage their own requests" ON public.service_requests
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for reviews (users can view all, manage their own)
CREATE POLICY "Everyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert some sample companies
INSERT INTO public.companies (company_name, email, phone, address, description) VALUES
('Elite Security Services', 'contact@elitesecurity.com', '+1-555-0101', '123 Security Ave, City, State', 'Premium security services with experienced professionals'),
('Guardian Protection', 'info@guardianprotection.com', '+1-555-0102', '456 Guard St, City, State', 'Reliable protection services for all your security needs'),
('SecureForce Solutions', 'hello@secureforce.com', '+1-555-0103', '789 Defense Blvd, City, State', 'Advanced security solutions with cutting-edge technology');

-- Insert some sample officers (using placeholder user IDs - these will need to be updated with real user IDs)
INSERT INTO public.security_officers (user_id, company_id, badge_number, hourly_rate, rating, total_jobs, specializations, status, current_latitude, current_longitude) 
SELECT 
  gen_random_uuid(), -- placeholder user_id
  c.id,
  'BADGE-' || LPAD((row_number() OVER())::text, 4, '0'),
  ROUND((RANDOM() * 50 + 25)::numeric, 2), -- hourly rate between $25-75
  ROUND((RANDOM() * 2 + 3)::numeric, 1), -- rating between 3.0-5.0
  FLOOR(RANDOM() * 100)::integer, -- total jobs 0-99
  ARRAY['General Security', CASE WHEN RANDOM() > 0.5 THEN 'Armed Response' ELSE 'Patrol' END],
  'available',
  40.7128 + (RANDOM() - 0.5) * 0.1, -- around NYC latitude
  -74.0060 + (RANDOM() - 0.5) * 0.1  -- around NYC longitude
FROM public.companies c
CROSS JOIN generate_series(1, 3); -- 3 officers per company
