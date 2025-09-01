import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  User,
  Smartphone,
  ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";

import PoseGuideOverlay from "./PoseGuideOverlay";
import { generateContentWithImage, generateText } from "@/api/geminiClient";

export default function CaptureWizard({ onImageCapture }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [showPoseGuide, setShowPoseGuide] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setValidationStatus({
        type: 'error',
        message: 'Please upload an image file (JPG, PNG, etc.)'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setValidationStatus({
        type: 'error',
        message: 'Image size should be less than 10MB'
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      validateImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const validateImage = async (imageData) => {
    setValidationStatus({ type: 'loading', message: 'Analyzing photo with AI...' });
    
    try {
      // Convert base64 to blob for Gemini API
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      
      const prompt = `You're a friendly AI photo coach! Quickly analyze this photo for virtual try-on readiness:

Give a helpful assessment in this format:

**📸 PHOTO CHECK: [EXCELLENT/GOOD/NEEDS WORK]**

**✅ WHAT'S WORKING:**
[List 2-3 positive things about the photo]

**🎯 QUICK IMPROVEMENTS:**
[If needed, give 1-2 specific, actionable tips]

**💡 PRO TIP:**
[One friendly suggestion to make the photo even better]

Keep it encouraging, specific, and actionable - like a supportive friend helping them get the perfect shot!`;

      const aiAnalysis = await generateContentWithImage(prompt, file);
      
      // Parse AI response to determine validation status
      const lowerResponse = aiAnalysis.toLowerCase();
      let validationType = 'warning';
      let message = aiAnalysis;
      
      if (lowerResponse.includes('excellent') || lowerResponse.includes('perfect') || lowerResponse.includes('great')) {
        validationType = 'success';
      } else if (lowerResponse.includes('needs work') || lowerResponse.includes('needs improvement') || lowerResponse.includes('poor') || lowerResponse.includes('not suitable')) {
        validationType = 'error';
      }
      
        setValidationStatus({
        type: validationType,
        message: aiAnalysis,
        aiGenerated: true
        });
      
    } catch (error) {
      console.error('AI validation error:', error);
      // Fallback to simple validation
        setValidationStatus({
          type: 'warning',
        message: '**📸 PHOTO CHECK: GOOD** \n\n**✅ WHAT\'S WORKING:** \nPhoto uploaded successfully! \n\n**💡 PRO TIP:** \nEnsure you\'re facing forward with good lighting for best results.',
        aiGenerated: false
      });
    }
  };

  const handleContinue = () => {
    if (selectedImage && imagePreview) {
      onImageCapture({
        file: selectedImage,
        preview: imagePreview,
        validation: validationStatus
      });
    }
  };

  const retakePhoto = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setValidationStatus(null);
  };

  if (imagePreview) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Review Your Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {showPoseGuide && (
                  <PoseGuideOverlay />
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPoseGuide(!showPoseGuide)}
                >
                  {showPoseGuide ? 'Hide' : 'Show'} Pose Guide
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Photo Analysis</h3>
                {validationStatus ? (
                  <Alert className={`${
                    validationStatus.type === 'success' ? 'border-green-200 bg-green-50' :
                    validationStatus.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    validationStatus.type === 'error' ? 'border-red-200 bg-red-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      {validationStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />}
                      {validationStatus.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />}
                      {validationStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                      {validationStatus.type === 'loading' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mt-0.5" />}
                      <div className="flex-1">
                        <AlertDescription className="text-sm whitespace-pre-line">
                        {validationStatus.message}
                      </AlertDescription>
                        {validationStatus.aiGenerated && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                            <span className="text-xs text-slate-500">AI Analysis by Gemini</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Alert>
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                    <span className="text-sm">Analyzing photo...</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Full body visible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Facing forward</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Good lighting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Clear background</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!validationStatus || validationStatus.type === 'error' || validationStatus.type === 'loading'}
                >
                  {validationStatus?.type === 'loading' ? 'Analyzing...' : 'Continue to Garment Selection'}
                </Button>
                <Button variant="outline" onClick={retakePhoto} className="w-full">
                  Take Another Photo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Area */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Your Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? "border-purple-400 bg-purple-50" 
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8 text-slate-500" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Drop your image here
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Or click to browse from your device
                  </p>
                </div>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mt-4 text-center">
              Supported: JPG, PNG, HEIC • Max size: 10MB
            </p>
          </CardContent>
        </Card>

        {/* Camera Option */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Take Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-300 transition-colors">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-8 h-8 text-slate-500" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Use Your Camera
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Take a photo directly with your device's camera
                  </p>
                </div>
                
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Photo Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Full Body Shot</h4>
                <p className="text-sm text-slate-600">Stand 6-8 feet from camera, full body visible</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Face Forward</h4>
                <p className="text-sm text-slate-600">Look directly at camera, arms at your sides</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Good Lighting</h4>
                <p className="text-sm text-slate-600">Use natural light or bright indoor lighting</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Simple Background</h4>
                <p className="text-sm text-slate-600">Plain wall or background works best</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}