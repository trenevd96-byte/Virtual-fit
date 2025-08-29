import React from "react";
import { motion } from "framer-motion";

export default function PoseGuideOverlay() {
  return (
    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
      <motion.svg
        viewBox="0 0 200 300"
        className="w-full h-full max-w-48 max-h-72"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Head */}
        <motion.circle
          cx="100"
          cy="40"
          r="15"
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        />
        
        {/* Body */}
        <motion.line
          x1="100"
          y1="55"
          x2="100"
          y2="180"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
        
        {/* Arms */}
        <motion.line
          x1="100"
          y1="85"
          x2="70"
          y2="130"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        />
        <motion.line
          x1="100"
          y1="85"
          x2="130"
          y2="130"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        />
        
        {/* Legs */}
        <motion.line
          x1="100"
          y1="180"
          x2="80"
          y2="250"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        />
        <motion.line
          x1="100"
          y1="180"
          x2="120"
          y2="250"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        />
        
        {/* Pose indicators */}
        <motion.circle
          cx="100"
          cy="40"
          r="18"
          fill="none"
          stroke="rgba(34, 197, 94, 0.6)"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 1, duration: 0.6 }}
        />
      </motion.svg>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <p className="text-xs font-medium text-slate-800 text-center">
            Stand straight, face forward, arms at sides
          </p>
        </div>
      </div>
    </div>
  );
}