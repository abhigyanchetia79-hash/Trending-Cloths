import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { uploadImage, deleteImage, type UploadResult } from "@/lib/storage";
import { validateImageFile, createImagePreview, formatFileSize } from "@/lib/imageOptimization";
import { toast } from "sonner";

interface OptimizedImageUploadProps {
  onImageUploaded: (result: UploadResult) => void;
  onImageRemoved?: () => void;
  currentImageUrl?: string;
  currentImagePath?: string;
  className?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

const OptimizedImageUpload = ({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl,
  currentImagePath,
  className = "",
  maxSizeMB = 2,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'webp']
}: OptimizedImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setPreview(null);
    
    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        toast.error(validation.error || 'Invalid file');
        return;
      }

      // Create preview
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);
      
      // Start upload
      setUploading(true);
      setProgress(0);

      const result = await uploadImage(file, {
        folder: 'product-images',
        optimize: true,
        onProgress: (progress) => {
          setProgress(progress);
        }
      });

      setUploadResult(result);
      onImageUploaded(result);
      
      // Show success message with compression info
      if (result.compressionRatio > 0) {
        toast.success(`Image uploaded successfully! Compressed by ${result.compressionRatio}%`);
      } else {
        toast.success('Image uploaded successfully!');
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload image';
      setError(errorMessage);
      toast.error(errorMessage);
      setPreview(null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onImageUploaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleFile(imageFiles[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleRemove = useCallback(async () => {
    try {
      if (currentImagePath) {
        await deleteImage(currentImagePath);
      }
      setPreview(null);
      setUploadResult(null);
      setError(null);
      onImageRemoved?.();
      toast.success('Image removed successfully');
    } catch (error: any) {
      toast.error('Failed to remove image');
    }
  }, [currentImagePath, onImageRemoved]);

  const handleRetry = useCallback(() => {
    if (uploadResult) {
      handleFile(new File([], uploadResult.url));
    }
  }, [uploadResult, handleFile]);

  const onButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatAcceptedText = () => {
    return acceptedFormats.map(format => format.toUpperCase()).join(', ');
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptedFormats.map(f => `image/${f}`).join(',')}
        onChange={handleChange}
        disabled={uploading}
      />

      <Card className="overflow-hidden">
        <div
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
          {/* Upload Progress */}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <div className="w-full max-w-xs space-y-2">
                <p className="text-sm font-medium">Uploading image...</p>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {preview && !uploading && (
            <div className="space-y-4">
              <div className="relative mx-auto w-full max-w-sm">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
              
              {uploadResult && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Original: {formatFileSize(uploadResult.originalSize)}</p>
                  <p>Compressed: {formatFileSize(uploadResult.compressedSize)}</p>
                  {uploadResult.compressionRatio > 0 && (
                    <p className="text-green-600">Saved {uploadResult.compressionRatio}% space</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload Area */}
          {!preview && !uploading && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon size={24} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {dragActive ? "Drop image here" : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatAcceptedText()} • Max {maxSizeMB}MB • Auto-optimized
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <div className="text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                    setPreview(null);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OptimizedImageUpload;
