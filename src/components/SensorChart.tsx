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
        <ResponsiveContainer width="100%" height={300}>
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
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="humidity" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="moisture" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
