// Gemini API configuration
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Get API key from environment
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }
  
  return apiKey;
};

// Make API request to Gemini
const makeGeminiRequest = async (endpoint, payload) => {
  const isProd = import.meta.env && import.meta.env.PROD;

  // Always enforce temperature for consistency
  if (!payload.generationConfig) {
    payload.generationConfig = {};
  }
  if (payload.generationConfig.temperature === undefined) {
    payload.generationConfig.temperature = 0.5;
  }

  try {
    if (isProd) {
      // In production, proxy through backend to keep API key server-side
      const response = await fetch('/api/geminiHandler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, payload })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      return data;
    } else {
      // In local dev, call Gemini directly using VITE_ key
      const apiKey = getApiKey();
      const url = `${GEMINI_API_BASE_URL}/${endpoint}?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Gemini API request failed:', error);
    throw error;
  }
};

// Generate text content with Gemini
export const generateText = async (prompt, model = "gemini-2.5-flash") => {
  try {
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    
    const endpoint = `models/${model}:generateContent`;
    const result = await makeGeminiRequest(endpoint, payload);
    
    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response format:', result);
      throw new Error('Unexpected response format from Gemini API: ' + JSON.stringify(result));
    }
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw error;
  }
};

// Generate image with Gemini 2.5 Flash Image (Nano Banana)
export const generateImage = async (prompt, options = {}) => {
  try {
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        ...options
      }
    };
    
    const endpoint = 'models/gemini-2.5-flash-image-preview:generateContent';
    const result = await makeGeminiRequest(endpoint, payload);
    
    // Extract image data from response
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return {
              success: true,
              imageData: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'image/png'
            };
          }
        }
      }
    }
    
    throw new Error('No image data found in response');
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw error;
  }
};

// Generate content with both text and image input
export const generateContentWithImage = async (prompt, imageFile, model = "gemini-2.5-flash") => {
  try {
    // Convert image to base64 format
    const imageData = await fileToGenerativePart(imageFile);
    
    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          imageData
        ]
      }]
    };
    
    const endpoint = `models/${model}:generateContent`;
    const result = await makeGeminiRequest(endpoint, payload);
    
    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response format:', result);
      throw new Error('Unexpected response format from Gemini API: ' + JSON.stringify(result));
    }
  } catch (error) {
    console.error("Error generating content with image:", error);
    throw error;
  }
};

// Helper function to convert file to format suitable for Gemini
export const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Advanced generation with custom configuration
export const generateWithConfig = async (prompt, config = {}) => {
  try {
    const modelName = config.model || "gemini-2.5-flash";
    
    const generationConfig = {
      temperature: config.temperature || 0.5,
      topP: config.topP || 0.8,
      topK: config.topK || 40,
      maxOutputTokens: config.maxOutputTokens || 1024,
      ...config.generationConfig
    };

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig
    };
    
    const endpoint = `models/${modelName}:generateContent`;
    const result = await makeGeminiRequest(endpoint, payload);
    
    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response format:', result);
      throw new Error('Unexpected response format from Gemini API: ' + JSON.stringify(result));
    }
  } catch (error) {
    console.error("Error generating content with custom config:", error);
    throw error;
  }
};

// Validate if virtual try-on actually changed the clothing
const validateTryOnResult = async (originalImageData, resultImageData) => {
  try {
    // Simple validation: if images are too similar, the try-on likely failed
    // In a real implementation, this could use image comparison algorithms
    // For now, we'll assume different base64 data means different images
    return originalImageData !== resultImageData;
  } catch (error) {
    console.error('Error validating try-on result:', error);
    return true; // Assume success if validation fails
  }
};

// Enhanced post-processing function (Nano Banana Cleanup)
export const nano_banana_cleanup = async (originalImageFile, tryOnImageData, garmentName) => {
  try {
    console.log('🎨 Applying Nano Banana Enhancement...');
    
    // Pre-process original image for enhancement reference
    const { prepareForCleanup } = await import('../utils/imageProcessing.js');
    const enhancedOriginalImage = await prepareForCleanup(originalImageFile);
    
    // Convert the enhanced original image to format we can work with
    const originalImageData = await fileToGenerativePart(enhancedOriginalImage);
    
    // Create the enhancement prompt
    const enhancementPrompt = `
NANO BANANA ENHANCEMENT: Refine virtual try-on result while preserving background and setting.

Please enhance this virtual try-on result with these specific improvements:

🚨 CRITICAL PRESERVATION (HIGHEST PRIORITY):
- MAINTAIN EXACTLY the same background, setting, and environment from original user photo
- ISOLATION PROTOCOL: Focus only on enhancing the garment and person, not the background
- ZERO CONTAMINATION: Do not introduce any architectural or environmental elements
- PRESERVE COMPLETELY: Original lighting direction and room atmosphere
- BACKGROUND LOCK: Keep all background elements exactly as they were in user's original photo

🌟 PROFESSIONAL BODY ENHANCEMENT:
1. Smooth and naturalize skin tones while preserving the person's identity
2. Apply magazine-quality beauty enhancement - professional retouching level
3. Perfect posture refinement for elegant, confident appearance:
   - Straighten spine naturally for better posture
   - Elongate neck gracefully
   - Refine shoulder positioning 
   - Enhance overall stance and poise
4. Add healthy, radiant glow to skin with professional luminosity

👗 DESIGNER GARMENT FITTING:
1. Perfect the garment draping to look like haute couture tailoring
2. Ensure the neckline, waistline, and hemline sit with precision perfection
3. Add realistic luxury fabric physics - premium material behavior
4. Enhance texture details to achieve high-fashion fabric appearance

💡 PROFESSIONAL LIGHTING MASTERY:
1. Apply fashion photography lighting techniques within existing setting
2. Create sophisticated rim lighting for depth and dimension
3. Perfect shadow and highlight balance for magazine-quality appearance
4. Professional glamour enhancement (15-20% intensity for high-end result)
5. Enhance skin radiance and luminosity to camera-ready perfection

✨ EDGE REFINEMENT:
1. Perfectly blend garment edges with the body (no harsh lines)
2. Add natural shadows where garment meets skin
3. Ensure hair overlays naturally over garment if applicable
4. Smooth any segmentation artifacts

🎯 PROFESSIONAL FINAL TOUCHES:
1. Magazine-quality beauty enhancement while maintaining authentic identity
2. Ensure the person exudes confidence and elegance in the ${garmentName}
3. Apply professional fashion photography post-processing effects
4. Create aspirational yet believable high-end fashion result
5. Professional model-level refinement while preserving natural character

🚫 STRICT PROHIBITIONS:
- DO NOT change the background or setting from the original user photo
- DO NOT add new architectural elements or environmental features  
- DO NOT introduce lighting setups that change the room atmosphere
- DO NOT create fashion studio effects or luxury environments
- DO NOT blend or mix environmental elements from garment reference images
- DO NOT alter the room context or background elements in any way

RESULT: Create a magazine-quality fashion portrait as if photographed by a professional fashion photographer, with enhanced garment fit, perfect pose, and professional lighting - all within the exact same original setting. Transform this into a high-end fashion image while preserving the authentic background environment.`;

    // Prepare the enhancement payload
    const enhancementPayload = {
      contents: [{
        parts: [
          { text: enhancementPrompt },
          originalImageData,
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: tryOnImageData
            }
          }
        ]
      }]
    };

    const endpoint = `models/gemini-2.5-flash-image-preview:generateContent`;
    
    const result = await makeGeminiRequest(endpoint, enhancementPayload);
    
    if (result.candidates && result.candidates.length > 0 && 
        result.candidates[0].content && result.candidates[0].content.parts && 
        result.candidates[0].content.parts.length > 0) {
      
      const part = result.candidates[0].content.parts[0];
      if (part.inlineData && part.inlineData.data) {
        console.log('✨ Nano Banana Enhancement completed successfully!');
        return {
          success: true,
          imageData: part.inlineData.data,
          imageUrl: `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`,
          enhanced: true
        };
      }
    }
    
    console.log('⚠️ Enhancement failed, returning original result');
    return {
      success: false,
      imageData: tryOnImageData,
      imageUrl: `data:image/jpeg;base64,${tryOnImageData}`,
      enhanced: false
    };
    
  } catch (error) {
    console.error('Error in nano_banana_cleanup:', error);
    return {
      success: false,
      imageData: tryOnImageData,
      imageUrl: `data:image/jpeg;base64,${tryOnImageData}`,
      enhanced: false,
      error: error.message
    };
  }
};

// Generate virtual try-on using multi-image composition with retry logic
export const generateVirtualTryOnImage = async (userImageFile, garmentImageUrl, garmentName, garmentType, maxRetries = 2, garmentFile = null) => {
  try {
    // Pre-process user image for optimal results
    console.log('🔧 Pre-processing user image for optimal AI results...');
    const { prepareForCleanup } = await import('../utils/imageProcessing.js');
    const enhancedUserImage = await prepareForCleanup(userImageFile);
    
    // Convert enhanced user image to base64
    const userImageData = await fileToGenerativePart(enhancedUserImage);
    
    // Handle garment image - either from URL or uploaded file
    let garmentImageData;
    if (garmentFile) {
      // Pre-process uploaded garment file for better quality
      console.log('🔧 Pre-processing custom garment image...');
      const enhancedGarmentImage = await prepareForCleanup(garmentFile);
      garmentImageData = await fileToGenerativePart(enhancedGarmentImage);
    } else {
      // Fetch garment image from URL and convert to base64
      const garmentResponse = await fetch(garmentImageUrl);
      const garmentBlob = await garmentResponse.blob();
      const garmentImageFile = new File([garmentBlob], 'garment.jpg', { type: garmentBlob.type });
      
      // Pre-process downloaded garment image
      console.log('🔧 Pre-processing garment image from URL...');
      const enhancedGarmentImage = await prepareForCleanup(garmentImageFile);
      garmentImageData = await fileToGenerativePart(enhancedGarmentImage);
    }
    
    const prompt = `VIRTUAL CLOTHING REPLACEMENT: Replace the person's current outfit with the ${garmentName} while keeping everything else identical.

IMAGES PROVIDED:
1. PERSON PHOTO (first image): Shows a person in their current clothing and environment
2. TARGET GARMENT (second image): Shows the ${garmentName} - a ${garmentType} that needs to be applied

🚨 CRITICAL IMAGE SEPARATION PROTOCOL:
- FROM IMAGE 1: Use EVERYTHING (person, pose, background, lighting, setting)
- FROM IMAGE 2: Use ONLY the ${garmentName} clothing item itself
- IGNORE COMPLETELY: Any background, setting, architecture, or environment from image 2
- PROHIBITION: Do not blend, mix, or transfer any environmental elements from image 2

CRITICAL REQUIREMENTS - FOLLOW EXACTLY:

🚨 BACKGROUND PRESERVATION (HIGHEST PRIORITY):
- COPY EXACTLY: Background, wall, curtains, floor, lighting, and setting from FIRST IMAGE ONLY
- ZERO TOLERANCE: No elements from second image's background (stairs, railings, architecture)
- ISOLATION REQUIRED: Extract ONLY the ${garmentName} from second image, ignore everything else
- ENVIRONMENT LOCK: Person stays in their original room from first image
- REFERENCE PROHIBITION: Do not use second image's setting, location, or environmental context
- MAINTAIN EXACTLY: Same lighting conditions and atmosphere from the original photo

🎯 CLOTHING REPLACEMENT + PROFESSIONAL ENHANCEMENT:
- REMOVE ONLY the clothing items from the person (keep everything else)
- REPLACE with the exact ${garmentName} from the second image
- FIT the garment naturally on the person's body with professional tailoring precision
- MATCH the garment's color, pattern, and texture exactly
- ENSURE proper draping and realistic fabric behavior

📐 PRESERVE ORIGINAL ELEMENTS:
- Person's face, hair, skin tone, and body proportions (enhanced but recognizable)
- Original background, walls, floor, and environment (unchanged)
- Same lighting direction from original photo (enhanced quality)
- Same image composition and framing

✨ PROFESSIONAL QUALITY ENHANCEMENTS (IN ORIGINAL SETTING):
- POSE REFINEMENT: Subtly improve posture for confidence and elegance
  * Straighten shoulders and spine slightly for better posture
  * Elongate neck gracefully while maintaining natural head position
  * Adjust arm positioning for more flattering silhouette if needed
  * Enhance stance for better balance and poise
  * Keep feet positioning natural but refined
- LIGHTING MASTERY: Apply professional portrait lighting techniques within existing environment
  * Enhance skin luminosity with natural-looking glow
  * Add subtle rim lighting effects to define body contours
  * Create soft shadows for depth and dimension
  * Balance highlights and shadows for magazine-quality appearance
- FABRIC PERFECTION: Make garment appear professionally styled
  * Perfect draping and fit as if tailored by master designers
  * Enhance fabric texture and luxurious appearance
  * Natural shadow play where garment meets body
- BEAUTY & SKIN: Professional retouching while maintaining authenticity
  * Smooth skin texture while preserving natural character
  * Enhance facial features subtly for camera-ready appearance
  * Add healthy, natural-looking radiance to skin

🚫 ABSOLUTE PROHIBITIONS:
- DO NOT use any background elements from the second image (stairs, railings, walls, floors)
- DO NOT change the location, setting, or environment from the first image
- DO NOT add architectural elements or furniture from the second image
- DO NOT blend environmental contexts from both images
- DO NOT create composite backgrounds or mixed settings
- DO NOT transfer lighting context from the second image's scene
- DO NOT move the person to match the second image's environment

🎯 GARMENT EXTRACTION PROTOCOL:
- ISOLATE: Only the ${garmentName} fabric, color, pattern, and design from second image
- IGNORE: All environmental context, lighting, background, and setting from second image
- TRANSFER: Only the clothing item's visual properties (texture, color, fit, style)

RESULT: Create a magazine-quality image as if photographed by a professional fashion photographer, but with the person wearing the ${garmentName} in their exact original setting. The result should look like a high-end fashion portrait taken in their own room - professional lighting, perfect pose, flawless fit, but preserving the authentic background environment.`;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          userImageData,
          garmentImageData
        ]
      }]
    };
    
    let attempt = 0;
    let lastError = null;
    
    while (attempt <= maxRetries) {
      try {
        console.log(`Virtual try-on attempt ${attempt + 1}/${maxRetries + 1}`);
        
        // Use progressively stronger prompt strategies for retries
        let currentPrompt = prompt;
        if (attempt === 1) {
          currentPrompt = `🚨 RETRY ATTEMPT 2: ULTRA-STRICT IMAGE SEPARATION PROTOCOL

CRITICAL FAILURE DETECTED: Previous attempt may have mixed elements from both images incorrectly.

🔥 EMERGENCY IMAGE SEPARATION PROTOCOL:
1. FIRST IMAGE USAGE: Copy EVERYTHING from first image (person, background, lighting, room)
2. SECOND IMAGE USAGE: Extract ONLY the ${garmentName} clothing item, IGNORE everything else
3. STRICT ISOLATION: No stairs, railings, architecture, or backgrounds from second image
4. ENVIRONMENT LOCK: Person remains in exact same curtain/room setting from first image

PROFESSIONAL REQUIREMENTS:
1. BACKGROUND ISOLATION: Zero contamination from second image's environment
2. GARMENT EXTRACTION: Pure ${garmentName} transfer without environmental context
3. POSE ENHANCEMENT: Magazine-quality posture refinement in original setting
4. LIGHTING ENHANCEMENT: Professional photography lighting within existing room

🚨 CRITICAL PROHIBITIONS:
- ZERO TOLERANCE: No architectural elements from second image (stairs, railings, fancy rooms)
- STRICT SEPARATION: Do not blend or mix backgrounds from both images
- ENVIRONMENT PROHIBITION: Person cannot be moved to match second image's setting
- CONTEXT ISOLATION: Ignore second image's lighting, atmosphere, and environment

GOAL: Professional fashion portrait with ${garmentName} in person's original room - NO environmental mixing.`;
        } else if (attempt === 2) {
          currentPrompt = `⚡ FINAL ATTEMPT: NUCLEAR OPTION - ABSOLUTE IMAGE SEPARATION

CRITICAL ERROR: AI KEEPS MIXING IMAGES - IMPLEMENT EMERGENCY PROTOCOL!

🆘 NUCLEAR IMAGE SEPARATION PROTOCOL:
1. FIRST IMAGE = FOUNDATION: Use 100% of environment, setting, background, lighting from first image
2. SECOND IMAGE = GARMENT ONLY: Extract ONLY the red sequined dress, IGNORE EVERYTHING ELSE
3. ABSOLUTE PROHIBITION: Zero tolerance for stairs, railings, luxury architecture from second image
4. ENVIRONMENT QUARANTINE: Second image's background is TOXIC - do not use any part of it

EMERGENCY EXTRACTION PROTOCOL:
- COPY EXACTLY: Curtain background, room setting, lighting direction from FIRST IMAGE
- EXTRACT ONLY: Red sequined dress fabric, color, pattern, design from SECOND IMAGE  
- IGNORE COMPLETELY: Staircase, railings, luxury setting, lighting from SECOND IMAGE
- RESULT REQUIREMENT: Person in red dress standing in original curtain-backdrop room

ADVANCED POSE INSTRUCTIONS:
- Spine: Naturally straight and elongated
- Shoulders: Relaxed back, confident posture  
- Arms: Graceful positioning, hands naturally placed
- Head: Slight chin lift for elegance, neck elongated
- Stance: Balanced, poised, model-like confidence
- Expression: Serene confidence, natural beauty

CRITICAL SUCCESS CRITERIA:
✅ BACKGROUND: Must match first image exactly (curtains, not stairs)
✅ GARMENT: Red sequined dress from second image only
✅ POSE: Professional model posture and elegance
✅ LIGHTING: Enhanced but within original room context

FAILURE = BACKGROUND CONTAMINATION FROM SECOND IMAGE!`;
        }
        
        const currentPayload = {
          contents: [{
            parts: [
              { text: currentPrompt },
              userImageData,
              garmentImageData
            ]
          }],
          generationConfig: {
            temperature: 0.5 // Adjusted for maximum consistency
          }
        };
        
        const endpoint = 'models/gemini-2.5-flash-image-preview:generateContent';
        const result = await makeGeminiRequest(endpoint, currentPayload);
        
        // Extract image data from response
        if (result.candidates && result.candidates.length > 0) {
          const candidate = result.candidates[0];
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                // Validate that the result is different from the input
                const isValid = await validateTryOnResult(userImageData.inlineData.data, part.inlineData.data);
                
                if (isValid || attempt === maxRetries) {
                  return {
                    success: true,
                    imageData: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'image/png',
                    prompt: currentPrompt,
                    attempt: attempt + 1,
                    validated: isValid
                  };
                } else {
                  console.log(`Attempt ${attempt + 1} failed validation - result too similar to input`);
                  lastError = new Error(`Try-on attempt ${attempt + 1} failed - no clothing change detected`);
                }
              }
            }
          }
        }
        
        attempt++;
        if (attempt <= maxRetries) {
          console.log(`Retrying with different prompt strategy...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
        }
        
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        lastError = error;
        attempt++;
        if (attempt <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError || new Error('All virtual try-on attempts failed');
  } catch (error) {
    console.error("Error generating virtual try-on image:", error);
    throw error;
  }
};

export default {
  generateText,
  generateImage,
  generateContentWithImage,
  generateWithConfig,
  generateVirtualTryOnImage,
  fileToGenerativePart
};
