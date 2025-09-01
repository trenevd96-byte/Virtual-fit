import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getStyleRecommendations(imageData, garmentImage) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // First, analyze the garment
    const garmentAnalysis = await model.generateContent([
      "Identify the garment type, main color, and style. Return only: type|color|style",
      { inlineData: { data: garmentImage, mimeType: "image/jpeg" } }
    ]);
    
    const [type, color, style] = garmentAnalysis.response.text().split('|');
    
    // Get structured recommendations
    const prompt = generateStylePrompt(type, color, style);
    const result = await model.generateContent(prompt);
    
    // Parse JSON response
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Return fallback structured data
    return getFallbackRecommendations();
  }
}

const generateStylePrompt = (garmentType, garmentColor, garmentStyle) => {
  return `
    Analyze this ${garmentType} and provide styling recommendations in JSON format.
    
    Garment details:
    - Type: ${garmentType}
    - Color: ${garmentColor}
    - Style: ${garmentStyle}
    
    Return ONLY valid JSON in this exact structure:
    {
      "summary": {
        "style": "max 3 words",
        "compatibility": "percentage",
        "season": "suitable seasons",
        "rating": "number out of 5"
      },
      "styling_tips": [
        {"icon": "emoji", "tip": "one line tip"},
        // maximum 5 tips
      ],
      "color_matches": [
        {"color": "name", "hex": "#code", "description": "2-3 words"},
        // maximum 5 colors
      ],
      "occasions": ["occasion1", "occasion2", ...], // maximum 8
      "care_instructions": [
        {"icon": "emoji", "instruction": "short instruction"},
        // maximum 6 instructions
      ],
      "key_features": ["feature1", "feature2", "feature3"]
    }
    
    Keep all text concise. Use fashion industry standard terms.
  `;
};

const getFallbackRecommendations = () => ({
  summary: {
    style: "Classic Elegant",
    compatibility: "92%",
    season: "All Seasons",
    rating: "4.5/5"
  },
  styling_tips: [
    { icon: "👠", tip: "Pair with nude heels for an elongated silhouette" },
    { icon: "💍", tip: "Add delicate gold jewelry for sophistication" },
    { icon: "👜", tip: "Complete with a small clutch or chain bag" }
  ],
  color_matches: [
    { color: "Gold", hex: "#FFD700", description: "Perfect match" },
    { color: "Nude", hex: "#F5DEB3", description: "Elegant" },
    { color: "Black", hex: "#000000", description: "Classic" }
  ],
  occasions: ["Cocktail Party", "Formal Dinner", "Wedding Guest", "Date Night"],
  care_instructions: [
    { icon: "🌡️", instruction: "30°C Wash" },
    { icon: "🚫", instruction: "No Bleach" },
    { icon: "♨️", instruction: "Low Iron" }
  ],
  key_features: ["Versatile styling", "Timeless design", "Premium quality"]
});

