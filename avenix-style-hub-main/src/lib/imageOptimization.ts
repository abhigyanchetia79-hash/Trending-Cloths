// Image optimization utilities for fast uploads

export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  maxSizeKB?: number;
}

export interface OptimizedImage {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
}

/**
 * Compress and optimize an image file
 */
export const optimizeImage = async (
  file: File,
  options: ImageOptions = {}
): Promise<OptimizedImage> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg',
    maxSizeKB = 1024
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if still too large, reduce quality
            let finalBlob = blob;
            let currentQuality = quality;
            
            while (finalBlob.size > maxSizeKB * 1024 && currentQuality > 0.1) {
              currentQuality -= 0.1;
              const newBlob = await new Promise<Blob>((resolve) => {
                canvas.toBlob(resolve, `image/${format}`, currentQuality);
              });
              finalBlob = newBlob;
            }

            const optimizedFile = new File([finalBlob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            });

            resolve({
              file: optimizedFile,
              originalSize: file.size,
              compressedSize: optimizedFile.size,
              compressionRatio: Math.round((1 - optimizedFile.size / file.size) * 100),
              dimensions: { width, height }
            });
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, or WebP images.'
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'File too large. Please upload images smaller than 2MB.'
    };
  }

  return { valid: true };
};

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
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

/**
 * Create image preview URL
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
