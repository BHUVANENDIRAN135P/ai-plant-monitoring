-- Add user_id columns to all tables
ALTER TABLE public.sensor_readings 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.plant_health_records 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.alerts 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public read access to sensor readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Allow public insert to sensor readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Allow public read access to plant health records" ON public.plant_health_records;
DROP POLICY IF EXISTS "Allow public insert to plant health records" ON public.plant_health_records;
DROP POLICY IF EXISTS "Allow public update to plant health records" ON public.plant_health_records;
DROP POLICY IF EXISTS "Allow public read access to alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow public insert to alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow public update to alerts" ON public.alerts;

-- Create user-scoped policies for sensor_readings
CREATE POLICY "Users can read own sensor data" 
ON public.sensor_readings FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sensor data" 
ON public.sensor_readings FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create user-scoped policies for plant_health_records
CREATE POLICY "Users can read own plant health records" 
ON public.plant_health_records FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plant health records" 
ON public.plant_health_records FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plant health records" 
ON public.plant_health_records FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Create user-scoped policies for alerts
CREATE POLICY "Users can read own alerts" 
ON public.alerts FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" 
ON public.alerts FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" 
ON public.alerts FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);