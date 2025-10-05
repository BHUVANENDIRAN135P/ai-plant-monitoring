import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Leaf, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import plantHealthyImage from "@/assets/plant-healthy.jpg";

interface DetectionResult {
  status: 'healthy' | 'disease_detected';
  disease_name?: string;
  confidence: number;
  recommendations?: string;
}

export const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      
      reader.onload = async () => {
        const base64Image = reader.result as string;

        // Call edge function for AI analysis
        const { data, error } = await supabase.functions.invoke('analyze-plant-disease', {
          body: { imageData: base64Image }
        });

        if (error) throw error;

        setResult(data.result);
        
        // Store result in database
        await supabase.from('plant_health_records').insert({
          image_url: previewUrl,
          status: data.result.status === 'healthy' ? 'healthy' : 'disease_detected',
          disease_name: data.result.disease_name,
          confidence: data.result.confidence,
          recommendations: data.result.recommendations
        });

        // Create alert if disease detected
        if (data.result.status === 'disease_detected') {
          await supabase.from('alerts').insert({
            alert_type: 'disease',
            message: `Disease detected: ${data.result.disease_name}`,
            value: data.result.confidence,
            is_read: false
          });
        }

        toast.success('Analysis complete!');
      };
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-leaf text-primary-foreground">
            <Leaf className="w-3 h-3 mr-1" />
            AI-Powered Detection
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Plant Disease Detection
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload a photo of your plant leaves for instant AI analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="shadow-strong border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Upload Plant Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!previewUrl ? (
                  <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-all">
                    <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Selected plant"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPreviewUrl("");
                        setSelectedImage(null);
                        setResult(null);
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                )}

                {selectedImage && !result && (
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Leaf className="mr-2 h-5 w-5" />
                        Analyze Plant Health
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-strong border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <img
                    src={plantHealthyImage}
                    alt="Healthy plant"
                    className="w-32 h-32 object-cover rounded-full mb-4 opacity-50"
                  />
                  <p className="text-sm">Upload and analyze an image to see results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    {result.status === 'healthy' ? (
                      <>
                        <CheckCircle2 className="w-12 h-12 text-success" />
                        <div>
                          <h3 className="text-2xl font-bold text-success">Plant is Healthy!</h3>
                          <p className="text-sm text-muted-foreground">No diseases detected</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-12 h-12 text-destructive" />
                        <div>
                          <h3 className="text-2xl font-bold text-destructive">Disease Detected</h3>
                          <p className="text-sm text-muted-foreground">{result.disease_name}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Confidence Level</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            result.status === 'healthy' ? 'bg-success' : 'bg-destructive'
                          }`}
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {result.confidence}%
                      </span>
                    </div>
                  </div>

                  {result.recommendations && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-2">Recommendations</p>
                      <p className="text-sm text-muted-foreground">{result.recommendations}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
