import { supabase } from "@/integrations/supabase/client";

// Utility to generate mock sensor data for demo purposes
export const generateMockSensorData = async () => {
  const temperature = (Math.random() * 15 + 18).toFixed(2); // 18-33°C
  const humidity = (Math.random() * 40 + 40).toFixed(2);    // 40-80%
  const soil_moisture = (Math.random() * 50 + 30).toFixed(2); // 30-80%

  const { error } = await supabase.from('sensor_readings').insert({
    temperature: parseFloat(temperature),
    humidity: parseFloat(humidity),
    soil_moisture: parseFloat(soil_moisture)
  });

  if (error) {
    console.error('Error inserting mock sensor data:', error);
    return null;
  }

  // Check for threshold violations and create alerts
  const temp = parseFloat(temperature);
  const hum = parseFloat(humidity);
  const moist = parseFloat(soil_moisture);

  if (temp < 15 || temp > 35) {
    await supabase.from('alerts').insert({
      alert_type: 'temperature',
      message: `Temperature ${temp < 15 ? 'too low' : 'too high'}: ${temperature}°C`,
      value: temp,
      is_read: false
    });
  }

  if (hum < 40 || hum > 80) {
    await supabase.from('alerts').insert({
      alert_type: 'humidity',
      message: `Humidity ${hum < 40 ? 'too low' : 'too high'}: ${humidity}%`,
      value: hum,
      is_read: false
    });
  }

  if (moist < 30 || moist > 80) {
    await supabase.from('alerts').insert({
      alert_type: 'soil_moisture',
      message: `Soil moisture ${moist < 30 ? 'too low' : 'too high'}: ${soil_moisture}%`,
      value: moist,
      is_read: false
    });
  }

  return { temperature, humidity, soil_moisture };
};

// Start generating mock data every 10 seconds (only call this once in your app)
export const startMockDataGeneration = () => {
  // Generate initial data
  generateMockSensorData();
  
  // Generate new data every 10 seconds
  const interval = setInterval(() => {
    generateMockSensorData();
  }, 10000);

  return () => clearInterval(interval);
};
