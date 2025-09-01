/**
 * Image Pre-Processing Utilities for Virtual Try-On Enhancement
 * Browser-compatible image processing functions using Canvas API
 */

/**
 * Resize and compress image for API with size limit enforcement
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {number} maxDimension - Maximum width or height
 * @param {number} targetSizeKB - Target file size in KB (default 800KB for safety)
 * @returns {HTMLCanvasElement} - Resized and optimized canvas
 */
const resizeImageForAPI = (canvas, maxDimension = 800, targetSizeKB = 800) => {
  const { width, height } = canvas;
  
  // Start with aggressive sizing for Vercel limits
  let currentMaxDim = Math.min(maxDimension, Math.max(width, height));
  
  // Always resize if larger than maxDimension
  if (width > currentMaxDim || height > currentMaxDim) {
    const ratio = Math.min(currentMaxDim / width, currentMaxDim / height);
    const newWidth = Math.round(width * ratio);
    const newHeight = Math.round(height * ratio);
    
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;
    
    const ctx = resizedCanvas.getContext('2d');
    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
    
    return resizedCanvas;
  }
  
  return canvas;
};

/**
 * Prepare image for optimal Gemini AI processing
 * @param {File} imageFile - The image file to process
 * @returns {Promise<File>} - Enhanced image file
 */
export const prepareForCleanup = async (imageFile) => {
  try {
    console.log('🔧 Pre-processing image for optimal AI results...');
    
    // Load image into canvas
    let canvas = await loadImageToCanvas(imageFile);
    
    // Resize for optimal API performance
    canvas = resizeImageForAPI(canvas);
    const ctx = canvas.getContext('2d');
    
    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Apply enhancements
    let enhancedData = autoWhiteBalance(imageData);
    enhancedData = enhanceContrast(enhancedData, 1.1);
    enhancedData = subtleSkinSmoothing(enhancedData, 0.3);
    
    // Put enhanced data back to canvas
    ctx.putImageData(enhancedData, 0, 0);
    
    // Convert back to file
    const enhancedFile = await canvasToFile(canvas, imageFile.name, imageFile.type);
    
    console.log('✨ Image pre-processing completed successfully!');
    return enhancedFile;
    
  } catch (error) {
    console.error('Error in image pre-processing:', error);
    console.log('⚠️ Using original image without pre-processing');
    return imageFile; // Return original if processing fails
  }
};

/**
 * Load image file into a canvas element
 * @param {File} file - Image file
 * @returns {Promise<HTMLCanvasElement>} - Canvas with loaded image
 */
const loadImageToCanvas = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert canvas to File object
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} fileName - Original file name
 * @param {string} mimeType - MIME type
 * @returns {Promise<File>} - File object
 */
const canvasToFile = async (canvas, fileName, mimeType = 'image/jpeg', maxSizeKB = 1200) => {
  let quality = 0.8; // Start with 80% quality
  let file;
  
  // Force JPEG for better compression
  const outputMimeType = 'image/jpeg';
  const outputFileName = fileName.replace(/\.[^/.]+$/, '.jpg');
  
  // Iteratively compress until under Vercel size limit
  do {
    file = await new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const f = new File([blob], outputFileName, { 
          type: outputMimeType,
          lastModified: Date.now()
        });
        resolve(f);
      }, outputMimeType, quality);
    });
    
    console.log(`🔧 Compressed to ${(file.size / 1024).toFixed(0)}KB at quality ${(quality * 100).toFixed(0)}%`);
    
    if (file.size <= maxSizeKB * 1024) break;
    
    quality -= 0.1;
    if (quality < 0.4) break; // Don't go below 40% quality
  } while (file.size > maxSizeKB * 1024 && quality >= 0.4);
  
  return file;
};

/**
 * Automatic white balance for better skin tones
 * @param {ImageData} imageData - Canvas ImageData
 * @returns {ImageData} - White balanced image data
 */
const autoWhiteBalance = (imageData) => {
  const data = new Uint8ClampedArray(imageData.data);
  const pixels = data.length / 4;
  
  // Calculate average RGB values
  let avgR = 0, avgG = 0, avgB = 0;
  
  for (let i = 0; i < pixels; i++) {
    const idx = i * 4;
    avgR += data[idx];
    avgG += data[idx + 1];
    avgB += data[idx + 2];
  }
  
  avgR /= pixels;
  avgG /= pixels;
  avgB /= pixels;
  
  // Calculate the gray reference (balanced point)
  const grayRef = (avgR + avgG + avgB) / 3;
  
  // Calculate correction factors
  const factorR = grayRef / avgR;
  const factorG = grayRef / avgG;
  const factorB = grayRef / avgB;
  
  // Apply white balance correction
  for (let i = 0; i < pixels; i++) {
    const idx = i * 4;
    data[idx] = Math.min(255, data[idx] * factorR);     // Red
    data[idx + 1] = Math.min(255, data[idx + 1] * factorG); // Green
    data[idx + 2] = Math.min(255, data[idx + 2] * factorB); // Blue
    // Alpha remains unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Enhance contrast using histogram stretching
 * @param {ImageData} imageData - Canvas ImageData
 * @param {number} factor - Enhancement factor (1.0 = no change)
 * @returns {ImageData} - Enhanced image data
 */
const enhanceContrast = (imageData, factor = 1.2) => {
  const data = new Uint8ClampedArray(imageData.data);
  const pixels = data.length / 4;
  
  // Calculate histogram for luminance
  const histogram = new Array(256).fill(0);
  
  for (let i = 0; i < pixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Calculate luminance (Y in YUV)
    const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    histogram[luminance]++;
  }
  
  // Find min and max luminance values (with 1% cutoff to ignore outliers)
  const cutoff = pixels * 0.01;
  let minLum = 0, maxLum = 255;
  
  let cumulative = 0;
  for (let i = 0; i < 256; i++) {
    cumulative += histogram[i];
    if (cumulative > cutoff && minLum === 0) {
      minLum = i;
    }
    if (cumulative > pixels - cutoff) {
      maxLum = i;
      break;
    }
  }
  
  // Apply contrast stretching
  const range = maxLum - minLum;
  if (range > 0) {
    for (let i = 0; i < pixels; i++) {
      const idx = i * 4;
      
      for (let c = 0; c < 3; c++) { // RGB channels
        const value = data[idx + c];
        // Stretch contrast
        let stretched = ((value - minLum) / range) * 255;
        // Apply enhancement factor
        stretched = 128 + (stretched - 128) * factor;
        data[idx + c] = Math.max(0, Math.min(255, stretched));
      }
    }
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Apply subtle skin smoothing
 * @param {ImageData} imageData - Canvas ImageData
 * @param {number} strength - Smoothing strength (0.0 - 1.0)
 * @returns {ImageData} - Smoothed image data
 */
const subtleSkinSmoothing = (imageData, strength = 0.3) => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  
  // Create a copy for the result
  const result = new Uint8ClampedArray(data);
  
  // Simple skin tone detection and smoothing
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Simple skin tone detection (heuristic)
      if (isSkinTone(r, g, b)) {
        // Apply a gentle blur to skin areas
        const smoothedPixel = getAveragePixel(data, x, y, width, height);
        
        // Blend with original
        result[idx] = r + (smoothedPixel.r - r) * strength;
        result[idx + 1] = g + (smoothedPixel.g - g) * strength;
        result[idx + 2] = b + (smoothedPixel.b - b) * strength;
      }
    }
  }
  
  return new ImageData(result, width, height);
};

/**
 * Simple skin tone detection
 * @param {number} r - Red channel value
 * @param {number} g - Green channel value
 * @param {number} b - Blue channel value
 * @returns {boolean} - True if likely skin tone
 */
const isSkinTone = (r, g, b) => {
  // Simple skin tone detection based on RGB ratios
  // This is a basic heuristic and could be improved with more sophisticated algorithms
  
  // Convert to normalized values
  const total = r + g + b;
  if (total === 0) return false;
  
  const rNorm = r / total;
  const gNorm = g / total;
  const bNorm = b / total;
  
  // Skin tone typically has:
  // - More red than blue
  // - Balanced red and green
  // - Less blue overall
  return (
    rNorm > 0.35 && rNorm < 0.55 &&
    gNorm > 0.25 && gNorm < 0.45 &&
    bNorm > 0.15 && bNorm < 0.35 &&
    r > b && g > b
  );
};

/**
 * Get average pixel value in a 3x3 neighborhood
 * @param {Uint8ClampedArray} data - Image data array
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Object} - Average RGB values
 */
const getAveragePixel = (data, x, y, width, height) => {
  let totalR = 0, totalG = 0, totalB = 0;
  let count = 0;
  
  // Sample 3x3 neighborhood
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const idx = (ny * width + nx) * 4;
        totalR += data[idx];
        totalG += data[idx + 1];
        totalB += data[idx + 2];
        count++;
      }
    }
  }
  
  return {
    r: totalR / count,
    g: totalG / count,
    b: totalB / count
  };
};

/**
 * Detect basic pose landmarks (simplified version)
 * This is a placeholder for more sophisticated pose detection
 * @param {ImageData} imageData - Canvas ImageData
 * @returns {Object} - Basic pose information
 */
const detectPoseLandmarks = (imageData) => {
  // This is a simplified placeholder
  // In a real implementation, you might use TensorFlow.js or MediaPipe
  return {
    confidence: 0.8,
    posture: 'upright',
    suggestion: 'Good posture detected'
  };
};

/**
 * Apply posture enhancement hints
 * @param {ImageData} imageData - Canvas ImageData
 * @param {Object} poseLandmarks - Pose detection results
 * @returns {ImageData} - Image with posture hints applied
 */
const applyPostureHints = (imageData, poseLandmarks) => {
  // For now, this is a placeholder that returns the original data
  // In a real implementation, this could apply subtle corrections
  console.log('Pose analysis:', poseLandmarks.suggestion);
  return imageData;
};

// Export individual functions for testing
export {
  autoWhiteBalance,
  enhanceContrast,
  subtleSkinSmoothing,
  detectPoseLandmarks,
  applyPostureHints
};

