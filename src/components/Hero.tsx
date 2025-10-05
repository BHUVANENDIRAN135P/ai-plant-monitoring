import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Activity, Cloud } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

export const Hero = () => {
  const scrollToDashboard = () => {
    document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container px-4 py-20 mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
            <Leaf className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Powered by AI & Cloud Technology</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
            Smart Plant Health
            <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Monitoring System
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Monitor environmental conditions, detect plant diseases early, and optimize crop health 
            with AI-powered precision agriculture.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all">
              <Activity className="w-8 h-8 text-secondary" />
              <div>
                <h3 className="font-semibold text-primary-foreground">Real-time Monitoring</h3>
                <p className="text-sm text-primary-foreground/80">Live sensor data tracking</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all">
              <Leaf className="w-8 h-8 text-secondary" />
              <div>
                <h3 className="font-semibold text-primary-foreground">Disease Detection</h3>
                <p className="text-sm text-primary-foreground/80">AI-powered image analysis</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all">
              <Cloud className="w-8 h-8 text-secondary" />
              <div>
                <h3 className="font-semibold text-primary-foreground">Cloud-Based</h3>
                <p className="text-sm text-primary-foreground/80">Access from anywhere</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center pt-8">
            <Button 
              size="lg" 
              onClick={scrollToDashboard}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 py-6 text-lg rounded-full shadow-strong group"
            >
              View Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-2 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};
