import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Sprout, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SensorChart } from "./SensorChart";
import { AlertsList } from "./AlertsList";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface SensorReading {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  created_at: string;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorReading[]>([]);
  

  useEffect(() => {
    if (!user) return;
    
    fetchLatestReading();
    fetchHistoricalData();
    

    // Subscribe to real-time updates
    const channel = supabase
      .channel('sensor_readings_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          setLatestReading(newReading);
          setHistoricalData(prev => [...prev, newReading].slice(-20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchLatestReading = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) setLatestReading(data);
  };

  const fetchHistoricalData = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setHistoricalData(data.reverse());
  };


  const getStatusColor = (value: number, type: 'temp' | 'humidity' | 'moisture') => {
    if (type === 'temp') {
      if (value < 15 || value > 35) return 'destructive';
      if (value < 18 || value > 32) return 'warning';
      return 'success';
    }
    if (type === 'humidity') {
      if (value < 40 || value > 80) return 'destructive';
      if (value < 50 || value > 70) return 'warning';
      return 'success';
    }
    if (type === 'moisture') {
      if (value < 30 || value > 80) return 'destructive';
      if (value < 40 || value > 70) return 'warning';
      return 'success';
    }
  };

  return (
    <section id="dashboard" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-primary text-primary-foreground">
            <TrendingUp className="w-3 h-3 mr-1" />
            Live Monitoring
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Environmental Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time monitoring of temperature, humidity, and soil conditions
          </p>
        </div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-medium hover:shadow-strong transition-all border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Temperature</CardTitle>
              <Thermometer className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {latestReading ? `${latestReading.temperature}°C` : '--'}
              </div>
              {latestReading && (
                <Badge 
                  variant={getStatusColor(Number(latestReading.temperature), 'temp') as any}
                  className="mt-2"
                >
                  {getStatusColor(Number(latestReading.temperature), 'temp') === 'success' ? 'Optimal' : 
                   getStatusColor(Number(latestReading.temperature), 'temp') === 'warning' ? 'Warning' : 'Critical'}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-strong transition-all border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Humidity</CardTitle>
              <Droplets className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {latestReading ? `${latestReading.humidity}%` : '--'}
              </div>
              {latestReading && (
                <Badge 
                  variant={getStatusColor(Number(latestReading.humidity), 'humidity') as any}
                  className="mt-2"
                >
                  {getStatusColor(Number(latestReading.humidity), 'humidity') === 'success' ? 'Optimal' : 
                   getStatusColor(Number(latestReading.humidity), 'humidity') === 'warning' ? 'Warning' : 'Critical'}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-strong transition-all border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Soil Moisture</CardTitle>
              <Sprout className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {latestReading ? `${latestReading.soil_moisture}%` : '--'}
              </div>
              {latestReading && (
                <Badge 
                  variant={getStatusColor(Number(latestReading.soil_moisture), 'moisture') as any}
                  className="mt-2"
                >
                  {getStatusColor(Number(latestReading.soil_moisture), 'moisture') === 'success' ? 'Optimal' : 
                   getStatusColor(Number(latestReading.soil_moisture), 'moisture') === 'warning' ? 'Warning' : 'Critical'}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SensorChart data={historicalData} />
          </div>
          <div>
            <AlertsList />
          </div>
        </div>
      </div>
    </section>
  );
};
