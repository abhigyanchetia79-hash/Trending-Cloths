import { supabase } from "@/integrations/supabase/client";
import { optimizeImage, validateImageFile, type OptimizedImage } from "./imageOptimization";

export interface UploadOptions {
  folder?: string;
  optimize?: boolean;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  url: string;
  path: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Upload image to Supabase Storage with optimization
 */
export const uploadImage = async (
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { folder = 'product-images', optimize = true, onProgress } = options;

  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    let optimizedFile: OptimizedImage;
    
    if (optimize) {
      // Optimize image
      onProgress?.(10);
      optimizedFile = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'webp',
        maxSizeKB: 500
      });
      onProgress?.(30);
    } else {
      optimizedFile = {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        dimensions: await getImageDimensions(file)
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = optimizedFile.file.name.split('.').pop();
    const filename = `${timestamp}-${random}.${extension}`;
    const path = `${folder}/${filename}`;

    onProgress?.(50);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, optimizedFile.file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    onProgress?.(80);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    onProgress?.(100);

    return {
      url: publicUrl,
      path: data.path,
      originalSize: optimizedFile.originalSize,
      compressedSize: optimizedFile.compressedSize,
      compressionRatio: optimizedFile.compressionRatio
    };

  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImage = async (path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Image delete error:', error);
    throw error;
  }
};

/**
 * Upload multiple images with progress tracking
 */
export const uploadMultipleImages = async (
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const result = await uploadImage(file, {
        ...options,
        onProgress: (progress) => {
          const overallProgress = ((i * 100) + progress) / totalFiles;
          options.onProgress?.(overallProgress);
        }
      });
      
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  }

  return results;
};

/**
 * Get image dimensions from file
 */
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
