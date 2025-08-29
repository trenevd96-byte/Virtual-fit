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
  ShirtIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CaptureWizard from "../components/tryon/CaptureWizard";
import GarmentSelector from "../components/tryon/GarmentSelector";
import PoseGuideOverlay from "../components/tryon/PoseGuideOverlay";
import ProcessingStatus from "../components/tryon/ProcessingStatus";

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
              />
            )}

            {currentStep === 'processing' && (
              <ProcessingStatus
                userImage={userImage}
                selectedGarment={selectedGarment}
                progress={processingProgress}
              />
            )}

            {currentStep === 'results' && (
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
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}