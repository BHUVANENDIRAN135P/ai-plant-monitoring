import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Leaf, Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import plantHealthyImage from "@/assets/plant-healthy.jpg";
import { useAuth } from "@/contexts/AuthContext";

interface DetectionResult {
  status: 'healthy' | 'disease_detected';
  disease_name?: string;
  confidence: number;
  recommendations?: string;
}

export const DiseaseDetection = () => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
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

        // Upload image to storage for persistent URL
        let storedImageUrl = previewUrl;
        if (user && selectedImage) {
          const fileName = `${user.id}/${Date.now()}-analysis.${selectedImage.name.split('.').pop()}`;
          const { error: uploadError } = await supabase.storage
            .from('plant-images')
            .upload(fileName, selectedImage, { upsert: true });
          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('plant-images')
              .getPublicUrl(fileName);
            storedImageUrl = urlData.publicUrl;
          }
        }

        // Call edge function for AI analysis
        const { data, error } = await supabase.functions.invoke('analyze-plant-disease', {
          body: { imageData: base64Image }
        });

        if (error) throw error;

        setResult(data.result);
        
        // Store result in database with persistent image URL
        await supabase.from('plant_health_records').insert({
          user_id: user?.id,
          image_url: storedImageUrl,
          status: data.result.status === 'healthy' ? 'healthy' : 'disease_detected',
          disease_name: data.result.disease_name,
          confidence: data.result.confidence,
          recommendations: data.result.recommendations
        });

        // Create alert if disease detected
        if (data.result.status === 'disease_detected') {
          await supabase.from('alerts').insert({
            user_id: user?.id,
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
          {/* Upload/Camera Section */}
          <Card className="shadow-strong border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Capture or Upload Image</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="upload" onClick={stopCamera}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="camera">
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
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
                </TabsContent>

                <TabsContent value="camera" className="space-y-4">
                  {!isCameraActive && !previewUrl ? (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
                      <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">Take a photo of the plant</p>
                      <Button onClick={startCamera} variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Camera
                      </Button>
                    </div>
                  ) : !previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative h-64 bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={capturePhoto} className="flex-1">
                          <Camera className="w-4 h-4 mr-2" />
                          Capture Photo
                        </Button>
                        <Button onClick={stopCamera} variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Captured plant"
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
                        Retake Photo
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <canvas ref={canvasRef} className="hidden" />

              {selectedImage && !result && (
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 mt-4"
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
