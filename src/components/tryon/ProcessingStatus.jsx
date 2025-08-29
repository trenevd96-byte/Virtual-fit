import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Zap, 
  Eye,
  Layers,
  Wand2,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const processingSteps = [
  { 
    id: 'analysis', 
    title: 'Analyzing Your Photo', 
    description: 'Detecting pose and body landmarks',
    icon: Eye,
    threshold: 20
  },
  { 
    id: 'segmentation', 
    title: 'Creating Masks', 
    description: 'Separating clothing and background',
    icon: Layers,
    threshold: 40
  },
  { 
    id: 'tryon', 
    title: 'AI Try-On Magic', 
    description: 'Applying garment with advanced AI',
    icon: Wand2,
    threshold: 80
  },
  { 
    id: 'refinement', 
    title: 'Final Touches', 
    description: 'Enhancing details and lighting',
    icon: Sparkles,
    threshold: 100
  }
];

export default function ProcessingStatus({ userImage, selectedGarment, progress }) {
  const currentStep = processingSteps.find(step => 
    progress < step.threshold
  ) || processingSteps[processingSteps.length - 1];

  const isStepComplete = (step) => progress >= step.threshold;
  const isStepActive = (step) => step.id === currentStep.id;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Images Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Processing Your Try-On</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* User Image */}
            <div className="text-center">
              <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden mb-3">
                {userImage?.preview && (
                  <img
                    src={userImage.preview}
                    alt="Your photo"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-xs">Your Photo</Badge>
              </div>
            </div>

            {/* Garment */}
            <div className="text-center">
              <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden mb-3">
                {selectedGarment?.image_url && (
                  <img
                    src={selectedGarment.image_url}
                    alt={selectedGarment.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-xs">{selectedGarment?.name}</Badge>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Processing Progress
              </span>
              <span className="text-sm text-slate-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Processing Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            AI Processing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processingSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isStepActive(step) 
                    ? 'bg-purple-50 border-2 border-purple-200' 
                    : isStepComplete(step)
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isStepComplete(step)
                    ? 'bg-green-500 text-white'
                    : isStepActive(step)
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <AnimatePresence mode="wait">
                    {isStepComplete(step) ? (
                      <motion.div
                        key="complete"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="processing"
                        animate={isStepActive(step) ? { rotate: 360 } : {}}
                        transition={{ duration: 2, repeat: isStepActive(step) ? Infinity : 0, ease: "linear" }}
                      >
                        <step.icon className="w-6 h-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1">
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    isStepActive(step) 
                      ? 'text-purple-700' 
                      : isStepComplete(step)
                      ? 'text-green-700'
                      : 'text-slate-700'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {isStepActive(step) && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Badge className="bg-purple-100 text-purple-700">
                        Processing...
                      </Badge>
                    </motion.div>
                  )}
                  {isStepComplete(step) && (
                    <Badge className="bg-green-100 text-green-700">
                      Complete
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fun Fact */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-purple-800 mb-2">Did you know?</h3>
          <p className="text-purple-700">
            Our AI processes over 1,000 data points to ensure the most realistic try-on experience possible!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}