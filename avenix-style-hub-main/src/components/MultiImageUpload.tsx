import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Plus, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { uploadMultipleImages, deleteImage, type UploadResult } from "@/lib/storage";
import { validateImageFile, createImagePreview, formatFileSize } from "@/lib/imageOptimization";
import { toast } from "sonner";

interface MultiImageUploadProps {
  onImagesUploaded: (results: UploadResult[]) => void;
  currentImages?: string[];
  currentImagePaths?: string[];
  maxImages?: number;
  className?: string;
}

const MultiImageUpload = ({
  onImagesUploaded,
  currentImages = [],
  currentImagePaths = [],
  maxImages = 5,
  className = ""
}: MultiImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState<UploadResult[]>([]);
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const results = await uploadMultipleImages(validFiles, {
        folder: 'product-images',
        optimize: true,
        onProgress: setProgress
      });

      const newImages = [...images, ...results];
      setImages(newImages);
      setPreviews([...previews, ...results.map(r => r.url)]);
      onImagesUploaded(newImages);

      toast.success(`${results.length} images uploaded successfully!`);

    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    const imagePath = currentImagePaths[index] || imageToRemove?.path;

    try {
      if (imagePath) {
        await deleteImage(imagePath);
      }

      const newImages = images.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);
      
      setImages(newImages);
      setPreviews(newPreviews);
      onImagesUploaded(newImages);

      toast.success('Image removed successfully');
    } catch (error: any) {
      toast.error('Failed to remove image');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleChange}
        disabled={uploading || images.length >= maxImages}
      />

      {/* Upload Area */}
      {images.length < maxImages && (
        <Card
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}
            ${uploading ? "cursor-not-allowed opacity-50" : ""}
          `}
          onClick={onButtonClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <div className="w-full max-w-xs space-y-2">
                <p className="text-sm font-medium">Uploading images...</p>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon size={24} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {dragActive ? "Drop images here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP • Max 2MB each • Up to {maxImages} images • Auto-optimized
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Image Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={preview}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X size={16} />
                  </Button>

                  {/* Upload Success Indicator */}
                  {images[index] && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle size={12} />
                    </div>
                  )}
                </div>
                
                {/* Image Info */}
                {images[index] && (
                  <div className="p-2 text-xs text-muted-foreground">
                    <p>Compressed: {formatFileSize(images[index].compressedSize)}</p>
                    {images[index].compressionRatio > 0 && (
                      <p className="text-green-600">Saved {images[index].compressionRatio}%</p>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}

          {/* Add More Button */}
          {images.length < maxImages && (
            <Card
              className="aspect-square flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={onButtonClick}
            >
              <div className="text-center space-y-2">
                <Plus size={24} className="mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Add Image</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Image Count */}
      <div className="text-xs text-muted-foreground">
        {images.length} of {maxImages} images uploaded
      </div>
    </div>
  );
};

export default MultiImageUpload;
