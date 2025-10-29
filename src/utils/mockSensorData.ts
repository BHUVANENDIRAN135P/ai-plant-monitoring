import { supabase } from "@/integrations/supabase/client";

let currentUserId: string | null = null;

export const setMockDataUserId = (userId: string) => {
  currentUserId = userId;
};

// State to maintain realistic sensor values with gradual changes
let lastTemperature = 25;
let lastHumidity = 60;
let lastSoilMoisture = 55;

// Utility to generate realistic sensor data with gradual changes
export const generateMockSensorData = async () => {
  const hour = new Date().getHours();
  
  // Temperature varies with time of day (cooler at night, warmer during day)
  const baseTemp = 20 + Math.sin((hour - 6) * Math.PI / 12) * 8; // 12-28°C base
  const tempChange = (Math.random() - 0.5) * 2; // ±1°C change
  lastTemperature = Math.max(15, Math.min(35, lastTemperature * 0.7 + (baseTemp + tempChange) * 0.3));
  
  // Humidity inversely related to temperature (higher at night, lower during day)
  const baseHumidity = 70 - Math.sin((hour - 6) * Math.PI / 12) * 20; // 50-90% base
  const humidityChange = (Math.random() - 0.5) * 5; // ±2.5% change
  lastHumidity = Math.max(30, Math.min(95, lastHumidity * 0.8 + (baseHumidity + humidityChange) * 0.2));
  
  // Soil moisture decreases slowly during day, can increase with "watering events"
  const wateringEvent = Math.random() > 0.95; // 5% chance of watering
  const moistureChange = wateringEvent ? 15 : (Math.random() - 0.6) * 3; // Gradual decrease or watering
  lastSoilMoisture = Math.max(20, Math.min(85, lastSoilMoisture + moistureChange));
  
  const temperature = lastTemperature.toFixed(2);
  const humidity = lastHumidity.toFixed(2);
  const soil_moisture = lastSoilMoisture.toFixed(2);

  if (!currentUserId) {
    console.log('No user ID set for mock data generation');
    return null;
  }

  const { error } = await supabase.from('sensor_readings').insert({
    user_id: currentUserId,
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
      user_id: currentUserId,
      alert_type: 'temperature',
      message: `Temperature ${temp < 15 ? 'too low' : 'too high'}: ${temperature}°C`,
      value: temp,
      is_read: false
    });
  }

  if (hum < 40 || hum > 80) {
    await supabase.from('alerts').insert({
      user_id: currentUserId,
      alert_type: 'humidity',
      message: `Humidity ${hum < 40 ? 'too low' : 'too high'}: ${humidity}%`,
      value: hum,
      is_read: false
    });
  }

  if (moist < 30 || moist > 80) {
    await supabase.from('alerts').insert({
      user_id: currentUserId,
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
