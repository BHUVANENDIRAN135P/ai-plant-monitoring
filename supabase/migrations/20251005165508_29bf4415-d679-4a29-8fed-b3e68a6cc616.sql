-- Create enum for alert types
CREATE TYPE alert_type AS ENUM ('temperature', 'humidity', 'soil_moisture', 'disease');

-- Create enum for disease status
CREATE TYPE disease_status AS ENUM ('healthy', 'disease_detected', 'analyzing');

-- Create sensor_readings table for environmental data
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temperature DECIMAL(5,2) NOT NULL,
  humidity DECIMAL(5,2) NOT NULL,
  soil_moisture DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plant_health_records table for disease detection
CREATE TABLE plant_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  status disease_status DEFAULT 'analyzing',
  disease_name TEXT,
  confidence DECIMAL(5,2),
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table for threshold violations
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type alert_type NOT NULL,
  message TEXT NOT NULL,
  value DECIMAL(5,2),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for monitoring dashboard)
CREATE POLICY "Allow public read access to sensor readings" 
  ON sensor_readings FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to sensor readings" 
  ON sensor_readings FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access to plant health records" 
  ON plant_health_records FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to plant health records" 
  ON plant_health_records FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update to plant health records" 
  ON plant_health_records FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public read access to alerts" 
  ON alerts FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to alerts" 
  ON alerts FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update to alerts" 
  ON alerts FOR UPDATE 
  USING (true);

-- Enable realtime for live monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE plant_health_records;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- Create indexes for better performance
CREATE INDEX idx_sensor_readings_created_at ON sensor_readings(created_at DESC);
CREATE INDEX idx_plant_health_records_created_at ON plant_health_records(created_at DESC);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_unread ON alerts(is_read) WHERE is_read = false;