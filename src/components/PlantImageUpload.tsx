import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const PlantImageUpload = () => {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) fetchExistingImage();
  }, [user]);

  const fetchExistingImage = async () => {
    if (!user) return;
    const { data } = await supabase.storage
      .from("plant-images")
      .list(user.id, { limit: 1, sortBy: { column: "created_at", order: "desc" } });

    if (data && data.length > 0) {
      const { data: urlData } = supabase.storage
        .from("plant-images")
        .getPublicUrl(`${user.id}/${data[0].name}`);
      setImageUrl(urlData.publicUrl);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("plant-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } else {
      const { data: urlData } = supabase.storage
        .from("plant-images")
        .getPublicUrl(fileName);
      setImageUrl(urlData.publicUrl);
      toast.success("Plant image uploaded!");
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    if (!user || !imageUrl) return;
    const path = imageUrl.split("/plant-images/")[1];
    if (path) {
      await supabase.storage.from("plant-images").remove([decodeURIComponent(path)]);
    }
    setImageUrl(null);
    toast.success("Image removed");
  };

  return (
    <Card className="shadow-medium border-border overflow-hidden">
      <CardContent className="p-0">
        {imageUrl ? (
          <div className="relative group">
            <img
              src={imageUrl}
              alt="Your plant"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <label>
                  <Button size="sm" variant="secondary" asChild className="cursor-pointer">
                    <span>
                      <Camera className="w-4 h-4 mr-1" />
                      Change
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
                <Button size="sm" variant="destructive" onClick={handleRemove}>
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Your Plant</span>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-64 cursor-pointer border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-all m-4">
            <Upload className="w-10 h-10 text-muted-foreground mb-3" />
            <span className="text-base font-medium text-foreground mb-1">
              Upload your plant photo
            </span>
            <span className="text-sm text-muted-foreground">
              {uploading ? "Uploading..." : "JPG, PNG up to 5MB"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </CardContent>
    </Card>
  );
};
