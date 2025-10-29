import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface Alert {
  id: string;
  alert_type: 'temperature' | 'humidity' | 'soil_moisture' | 'disease';
  message: string;
  value: number | null;
  is_read: boolean;
  created_at: string;
}

export const AlertsList = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!user) return;
    
    fetchAlerts();

    const channel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setAlerts(prev => [payload.new as Alert, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setAlerts(data);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'disease':
        return <AlertCircle className="w-4 h-4" />;
      case 'temperature':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'disease':
        return 'destructive';
      case 'temperature':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card className="shadow-medium border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bell className="w-5 h-5" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mb-2 text-success" />
              <p className="text-sm">All systems normal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border transition-all ${
                    alert.is_read ? 'bg-muted/30' : 'bg-card border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Badge variant={getAlertVariant(alert.alert_type) as any} className="mt-0.5">
                      {getAlertIcon(alert.alert_type)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {alert.message}
                      </p>
                      {alert.value && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Value: {alert.value}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
