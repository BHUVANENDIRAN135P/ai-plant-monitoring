import { useEffect } from "react";
import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { DiseaseDetection } from "@/components/DiseaseDetection";
import { Button } from "@/components/ui/button";
import { Heart, Bell, LogOut } from "lucide-react";
import { startMockDataGeneration } from "@/utils/mockSensorData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const { signOut, user } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  // Start generating mock sensor data on component mount (for demo)
  useEffect(() => {
    if (user) {
      const { setMockDataUserId } = require("@/utils/mockSensorData");
      setMockDataUserId(user.id);
      const cleanup = startMockDataGeneration();
      return cleanup;
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">AI PLANT MONITORING</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="#dashboard">Dashboard</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#detection">Detection</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#dashboard">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Hero />
        <Dashboard />
        <div id="detection">
          <DiseaseDetection />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-2">AI PLANT MONITORING</h3>
            <p className="text-primary-foreground/80">
              Empowering farmers with AI-powered precision agriculture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
