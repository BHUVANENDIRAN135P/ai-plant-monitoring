import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface SensorReading {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  created_at: string;
}

interface SensorChartProps {
  data: SensorReading[];
}

export const SensorChart = ({ data }: SensorChartProps) => {
  const chartData = data.map(reading => ({
    time: format(new Date(reading.created_at), 'HH:mm'),
    temperature: Number(reading.temperature),
    humidity: Number(reading.humidity),
    moisture: Number(reading.soil_moisture),
  }));

  return (
    <Card className="shadow-medium border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Plant Sensors</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  temperature: 'Temperature (°C)',
                  humidity: 'Humidity (%)',
                  moisture: 'Soil Moisture (%)',
                };
                return <span style={{ color: 'hsl(var(--foreground))' }}>{labels[value] || value}</span>;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              name="temperature"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#ef4444' }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="humidity" 
              name="humidity"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="moisture" 
              name="moisture"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#f59e0b' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
