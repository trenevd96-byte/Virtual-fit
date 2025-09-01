import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  ShirtIcon,
  ShoppingCart,
  Heart,
  ZoomIn,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateText, generateVirtualTryOnImage, nano_banana_cleanup } from "../api/geminiClient";

import CaptureWizard from "../components/tryon/CaptureWizard";
import GarmentSelector from "../components/tryon/GarmentSelector";
import PoseGuideOverlay from "../components/tryon/PoseGuideOverlay";
import ProcessingStatus from "../components/tryon/ProcessingStatus";
import AIStyleRecommendations from '@/components/AIStyleRecommendations';

const steps = [
  { id: 'capture', title: 'Upload Photo', icon: User, description: 'Take or upload your photo' },
  { id: 'garment', title: 'Choose Garment', icon: ShirtIcon, description: 'Select what to try on' },
  { id: 'processing', title: 'AI Try-On', icon: Sparkles, description: 'Watch the magic happen' },
  { id: 'results', title: 'View Results', icon: CheckCircle2, description: 'See how you look' }
];

export default function TryOn() {
  const [currentStep, setCurrentStep] = useState('capture');
  const [userImage, setUserImage] = useState(null);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [virtualTryOnImage, setVirtualTryOnImage] = useState(null);
  const [loadingVirtualTryOn, setLoadingVirtualTryOn] = useState(false);
  const [tryOnProgress, setTryOnProgress] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const handleUserImageCapture = (imageData) => {
    setUserImage(imageData);
    setCurrentStep('garment');
  };

  const handleGarmentSelect = (garment) => {
    setSelectedGarment(garment);
    setCurrentStep('processing');
    // Start processing simulation
    simulateProcessing();
  };

  const simulateProcessing = () => {
    // Simulate AI processing with realistic progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setCurrentStep('results');
        }, 1000);
      }
      setProcessingProgress(progress);
    }, 800);
  };

  const resetWizard = () => {
    setCurrentStep('capture');
    setUserImage(null);
    setSelectedGarment(null);
    setSessionId(null);
    setProcessingProgress(0);
    setShowDetailedResults(false);
    setAiAnalysis(null);
    setLoadingAnalysis(false);
    setVirtualTryOnImage(null);
    setLoadingVirtualTryOn(false);
    setTryOnProgress('');
    setZoomedImage(null);
  };

  const handleImageZoom = (imageUrl, title) => {
    setZoomedImage({ url: imageUrl, title });
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  const generateVirtualTryOn = async () => {
    if (!selectedGarment || !userImage || !userImage.file) return;
    
    setLoadingVirtualTryOn(true);
    setTryOnProgress('Initializing AI virtual try-on...');
    
    try {
      console.log('Generating virtual try-on with enhanced prompts and retry logic...');
      
      // Set up progress tracking
      const originalConsoleLog = console.log;
      console.log = (message) => {
        if (message.includes('Pre-processing user image')) {
          setTryOnProgress('🔧 Enhancing image quality (skin tone, contrast, lighting)...');
        } else if (message.includes('Pre-processing custom garment')) {
          setTryOnProgress('🔧 Optimizing custom garment image...');
        } else if (message.includes('Pre-processing garment image from URL')) {
          setTryOnProgress('🔧 Enhancing garment image quality...');
        } else if (message.includes('Virtual try-on attempt')) {
          setTryOnProgress(`AI attempt: ${message}`);
        } else if (message.includes('Retrying')) {
          setTryOnProgress('Retrying with different approach...');
        }
        originalConsoleLog(message);
      };
      
      const result = await generateVirtualTryOnImage(
        userImage.file,
        selectedGarment.image_url,
        selectedGarment.name,
        selectedGarment.category,
        2, // maxRetries
        selectedGarment.file // Pass the custom file if it's an uploaded garment
      );
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      if (result.success && result.imageData) {
        // Convert base64 to data URL for display
        const imageUrl = `data:${result.mimeType};base64,${result.imageData}`;
        
        console.log(`Virtual try-on completed successfully on attempt ${result.attempt}!`);
        
        // Apply Nano Banana Enhancement for professional finish
        setTryOnProgress('🎨 Applying professional enhancement (lighting, skin, fabric)...');
        
        try {
          const enhancedResult = await nano_banana_cleanup(
            userImage.file,
            result.imageData,
            selectedGarment.name
          );
          
          if (enhancedResult.success && enhancedResult.enhanced) {
            console.log('✨ Enhancement completed - result upgraded to magazine quality!');
            setVirtualTryOnImage({
              success: true,
              imageUrl: enhancedResult.imageUrl,
              prompt: result.prompt,
              timestamp: new Date().toISOString(),
              generated: true,
              attempt: result.attempt,
              validated: result.validated,
              enhanced: true,
              enhancementApplied: true
            });
          } else {
            console.log('Enhancement not applied, using original result');
            setVirtualTryOnImage({
              success: true,
              imageUrl: imageUrl,
              prompt: result.prompt,
              timestamp: new Date().toISOString(),
              generated: true,
              attempt: result.attempt,
              validated: result.validated,
              enhanced: false,
              enhancementApplied: false
            });
          }
        } catch (enhancementError) {
          console.warn('Enhancement failed, using original result:', enhancementError);
          setVirtualTryOnImage({
            success: true,
            imageUrl: imageUrl,
            prompt: result.prompt,
            timestamp: new Date().toISOString(),
            generated: true,
            attempt: result.attempt,
            validated: result.validated,
            enhanced: false,
            enhancementError: enhancementError.message
          });
        }
        
        setTryOnProgress('');
        
        if (!result.validated) {
          console.warn('Warning: AI result may not show clothing change - showing best attempt');
        }
      } else {
        throw new Error('Failed to generate virtual try-on image');
      }
      
    } catch (error) {
      console.error('Error generating virtual try-on:', error);
      console.log = originalConsoleLog; // Restore console.log
      
      setTryOnProgress('');
      
      // Fallback to composite approach if AI generation fails
      setVirtualTryOnImage({
        success: false,
        error: error.message,
        fallback: true,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoadingVirtualTryOn(false);
      setTryOnProgress('');
    }
  };

  const generateAIAnalysis = async () => {
    if (!selectedGarment || !userImage) return;
    
    setLoadingAnalysis(true);
    try {
      const prompt = `Act as a top fashion stylist and create an engaging style analysis for this outfit choice:

**GARMENT:** ${selectedGarment.name} by ${selectedGarment.brand}
**TYPE:** ${selectedGarment.category} | **PRICE:** $${selectedGarment.price}
**COLORS:** ${selectedGarment.colors?.join(', ')}

Create a compelling, scannable analysis using this format:

**✨ STYLE VERDICT**
[Write 1-2 enthusiastic sentences about why this piece rocks]

**🎨 COLOR MAGIC**  
[Quick tip about the colors and what they do for the wearer]

**💫 STYLING SECRETS**
• [One styling tip]
• [One accessory suggestion] 
• [One pairing idea]

**🌟 PERFECT FOR**
[2-3 specific occasions where this outfit shines]

**📈 STYLIST RATING: [X]/5 ⭐**
[One sentence explaining the rating]

Keep it conversational, confident, and inspiring - like advice from a best friend who happens to be a fashion expert!`;

      const analysis = await generateText(prompt);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      setAiAnalysis(`**✨ STYLE VERDICT**
Great choice! The ${selectedGarment.name} is a versatile piece that works across multiple occasions.

**🎨 COLOR MAGIC**
The ${selectedGarment.category} features beautiful tones that complement most skin tones.

**💫 STYLING SECRETS**
• Pair with classic accessories for a polished look
• Layer with complementary pieces for depth
• Choose shoes that match the outfit's energy level

**🌟 PERFECT FOR**
Casual outings, social gatherings, and everyday styling

**📈 STYLIST RATING: 4/5 ⭐**
A solid, timeless choice that offers great versatility!`);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleViewResults = () => {
    setShowDetailedResults(true);
    generateVirtualTryOn();
    generateAIAnalysis();
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Virtual Try-On Studio</h1>
          <p className="text-slate-600">Experience AI-powered fashion in four simple steps</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  index <= currentStepIndex 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <step.icon className="w-5 h-5" />
                  {index < currentStepIndex && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 sm:w-24 h-0.5 ml-2 transition-colors duration-300 ${
                    index < currentStepIndex ? 'bg-purple-300' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              {steps[currentStepIndex]?.title}
            </h2>
            <p className="text-slate-600 text-sm">
              {steps[currentStepIndex]?.description}
            </p>
          </div>
          
          <Progress value={progressPercentage} className="mt-4 h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'capture' && (
              <CaptureWizard onImageCapture={handleUserImageCapture} />
            )}

            {currentStep === 'garment' && (
              <GarmentSelector 
                onGarmentSelect={handleGarmentSelect}
                onBack={() => setCurrentStep('capture')}
                userImage={userImage}
              />
            )}

            {currentStep === 'processing' && (
              <ProcessingStatus
                userImage={userImage}
                selectedGarment={selectedGarment}
                progress={processingProgress}
              />
            )}

            {currentStep === 'results' && !showDetailedResults && (
              <div className="text-center">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-slate-900">Try-On Complete!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-slate-600">
                      Your virtual try-on is ready. View the results and rate your experience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={handleViewResults}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                      <Button variant="outline" onClick={resetWizard}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Try Another
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 'results' && showDetailedResults && (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Virtual Try-On Results</h2>
                    <p className="text-slate-600">See how the {selectedGarment?.name} looks on you</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowDetailedResults(false)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Before/After Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Before & After</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Original Photo</h4>
                          <div 
                            className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden relative group cursor-pointer"
                            onClick={() => userImage?.preview && handleImageZoom(userImage.preview, "Original Photo")}
                          >
                            {userImage?.preview && (
                              <>
                                <img
                                  src={userImage.preview}
                                  alt="Original"
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                />
                                {/* Magnifying glass for zoom */}
                                <div className="absolute bottom-2 right-2">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <ZoomIn className="w-4 h-4 text-slate-600" />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">With {selectedGarment?.name}</h4>
                          <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden relative">
                            {loadingVirtualTryOn ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center p-4">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
                                  <p className="text-sm text-slate-600">Generating virtual try-on...</p>
                                  {tryOnProgress ? (
                                    <p className="text-xs text-slate-500 mt-1">{tryOnProgress}</p>
                                  ) : (
                                    <p className="text-xs text-slate-500 mt-1">AI is applying the garment</p>
                                  )}
                                </div>
                              </div>
                            ) : virtualTryOnImage ? (
                              <div className="relative w-full h-full">
                                {virtualTryOnImage.success && virtualTryOnImage.imageUrl ? (
                                  /* AI-Generated Virtual Try-On Result */
                                  <div 
                                    className="relative w-full h-full group cursor-pointer"
                                    onClick={() => handleImageZoom(virtualTryOnImage.imageUrl, `Virtual Try-On: ${selectedGarment?.name}`)}
                                  >
                                    <img
                                      src={virtualTryOnImage.imageUrl}
                                      alt={`Virtual try-on: ${selectedGarment?.name}`}
                                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                    
                                    {/* Success indicator */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                                      <div className="bg-green-500 rounded-full p-1">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                      </div>
                                      {virtualTryOnImage.enhanced && (
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-2 py-1">
                                          <span className="text-xs text-white font-medium">✨ Enhanced</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Magnifying glass for zoom */}
                                    <div className="absolute bottom-2 right-2">
                                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <ZoomIn className="w-4 h-4 text-slate-600" />
                                      </div>
                                    </div>
                                    
                                    {/* Regenerate button */}
                                    <div className="absolute top-2 left-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          generateVirtualTryOn();
                                        }}
                                        className="bg-white/90 backdrop-blur-sm h-8 px-2"
                                        disabled={loadingVirtualTryOn}
                                      >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        <span className="text-xs">Regenerate</span>
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Fallback Composite Display */
                                  <div 
                                    className="relative w-full h-full group cursor-pointer"
                                    onClick={() => userImage?.preview && handleImageZoom(userImage.preview, `Composite Preview: ${selectedGarment?.name}`)}
                                  >
                                    <div className="relative w-full h-full">
                                      {/* User's photo as background */}
                                      <img
                                        src={userImage?.preview}
                                        alt="User photo"
                                        className="w-full h-full object-cover opacity-60 transition-transform duration-200 group-hover:scale-105"
                                      />
                                      
                                      {/* Garment overlay positioned strategically */}
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative w-3/4 h-3/4">
                                          <img
                                            src={selectedGarment?.image_url}
                                            alt={selectedGarment?.name}
                                            className="w-full h-full object-contain opacity-90 mix-blend-multiply"
                                            style={{
                                              filter: 'contrast(1.1) brightness(1.1)',
                                              maskImage: 'radial-gradient(ellipse at center, black 70%, transparent 100%)'
                                            }}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Blend overlay for realistic effect */}
                                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 mix-blend-overlay"></div>
                                    </div>
                                    
                                    {/* Error indicator */}
                                    <div className="absolute top-2 right-2">
                                      <div className="bg-yellow-500 rounded-full p-1">
                                        <AlertCircle className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                    
                                    {/* Magnifying glass for zoom */}
                                    <div className="absolute bottom-2 right-2">
                                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <ZoomIn className="w-4 h-4 text-slate-600" />
                                      </div>
                                    </div>
                                    
                                    {/* Try Again button */}
                                    <div className="absolute top-2 left-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          generateVirtualTryOn();
                                        }}
                                        className="bg-white/90 backdrop-blur-sm h-8 px-2"
                                        disabled={loadingVirtualTryOn}
                                      >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        <span className="text-xs">Try AI Again</span>
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : userImage?.preview ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={userImage.preview}
                                  alt="Virtual try-on result"
                                  className="w-full h-full object-cover opacity-70"
                                />
                                {/* Overlay effect to simulate garment */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 mix-blend-overlay"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 text-center">
                                    <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                                    <p className="text-xs text-slate-600 font-medium">Processing...</p>
                                    <p className="text-xs text-slate-500">Applying garment</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-4">
                                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Virtual try-on result</p>
                                <p className="text-xs text-slate-500 mt-1">AI-powered visualization</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Outfit Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Outfit Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {selectedGarment?.image_url && (
                            <img
                              src={selectedGarment.image_url}
                              alt={selectedGarment.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{selectedGarment?.name}</h3>
                          <p className="text-sm text-slate-600">{selectedGarment?.brand}</p>
                          <p className="text-lg font-bold text-slate-900">${selectedGarment?.price}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* AI Style Analysis */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            AI Style Analysis
                          </h4>
                          {loadingAnalysis ? (
                            <div className="flex items-center gap-2 text-slate-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                              <span className="text-sm">Analyzing your style...</span>
                            </div>
                          ) : aiAnalysis ? (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed prose prose-sm max-w-none
                                [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:pl-4 [&>li]:mb-1
                                [&_strong]:text-slate-900 [&_strong]:font-semibold
                                [&_strong:contains('✨')]:text-purple-700
                                [&_strong:contains('🎨')]:text-blue-700  
                                [&_strong:contains('💫')]:text-indigo-700
                                [&_strong:contains('🌟')]:text-amber-700
                                [&_strong:contains('📈')]:text-green-700">
                                {aiAnalysis}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                                  <span className="text-xs text-slate-500">Powered by Gemini AI</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={generateAIAnalysis}
                                  className="text-xs h-6 px-2"
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Refresh
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-slate-600">Excellent fit for your body type</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-slate-600">Great color complement</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {selectedGarment?.colors && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-2">Available Colors</h4>
                            <div className="flex gap-2">
                              {selectedGarment.colors.slice(0, 4).map((color, i) => (
                                <div
                                  key={i}
                                  className="w-6 h-6 rounded-full border border-slate-200"
                                  style={{ backgroundColor: color.toLowerCase() }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Save to Favorites
                  </Button>
                  <Button variant="outline" onClick={resetWizard}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Try Another Outfit
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeZoom}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-t-lg">
              <h3 className="text-white font-semibold">{zoomedImage.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeZoom}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-b-lg overflow-hidden">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}