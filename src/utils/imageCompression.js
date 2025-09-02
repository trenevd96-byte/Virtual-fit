// Client-side image compression for Vercel deployment
// Only activates in production to reduce payload size under 6MB limit

export const compressImageForVercel = async (file, maxSizeMB = 2, quality = 0.8) => {
  // Skip compression in development - only compress for production
  if (!import.meta.env.PROD) {
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate optimal dimensions to stay under size limit
      const maxDimension = 1280; // Max width or height
      let { width, height } = img;
      
      // Resize if too large
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size <= maxSizeMB * 1024 * 1024) {
            // Size is acceptable
            const compressedFile = new File([blob], file.name, {
              type: blob.type || 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            // Try higher compression
            canvas.toBlob(
              (secondBlob) => {
                const finalFile = new File([secondBlob], file.name, {
                  type: secondBlob.type || 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(finalFile);
              },
              'image/jpeg',
              0.6 // Lower quality for smaller size
            );
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => resolve(file); // Fallback to original on error
    img.src = URL.createObjectURL(file);
  });
};

// Compress image data specifically for Gemini API payload
export const prepareImageForAPI = async (file) => {
  // Only compress in production to avoid Vercel 6MB limit
  if (import.meta.env.PROD) {
    console.log('🗜️ Compressing image for Vercel deployment...');
    return await compressImageForVercel(file, 1.5, 0.75); // 1.5MB max, 75% quality
  }
  
  // In development, return original file for best quality
  return file;
};
