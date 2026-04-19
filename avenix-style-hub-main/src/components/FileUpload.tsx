import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadFile } from "@/lib/database";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

const FileUpload = ({ 
  onFileUploaded, 
  accept = "image/*,video/*", 
  maxSize = 10,
  className = "" 
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!accept.includes(file.type.split('/')[0] + '/*') && !accept.includes(file.type)) {
      toast.error('Invalid file type');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${random}.${extension}`;
      
      // Create folder structure based on file type
      const folder = file.type.startsWith('video/') ? 'videos' : 'images';
      const path = `${folder}/${filename}`;

      // Simulate progress (in real implementation, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const url = await uploadFile(file, path);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        onFileUploaded(url);
        setUploading(false);
        setProgress(0);
        toast.success("File uploaded successfully!");
      }, 500);

    } catch (error: any) {
      toast.error(error.message || "Failed to upload file");
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return <Video size={24} />;
    return <ImageIcon size={24} />;
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
      />
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}
          ${uploading ? "cursor-not-allowed opacity-50" : ""}
        `}
        onClick={onButtonClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploading...</p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Upload size={24} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {dragActive ? "Drop file here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                {accept.includes('image') && accept.includes('video') 
                  ? "Images and videos up to " + maxSize + "MB"
                  : accept.includes('image') 
                  ? "Images up to " + maxSize + "MB"
                  : "Videos up to " + maxSize + "MB"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
