import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

const BeforeAfterSlider = ({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Before", 
  afterLabel = "After",
  className = "",
  height = "400px"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    updateSliderPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    updateSliderPosition(e.touches[0].clientX);
  };

  const updateSliderPosition = (clientX) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-2xl ${className}`}>
      <div
        ref={containerRef}
        className="relative cursor-ew-resize select-none"
        style={{ height }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Before Image (Background) */}
        <div className="absolute inset-0">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 left-4">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium text-slate-700">{beforeLabel}</span>
            </div>
          </div>
        </div>

        {/* After Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">{afterLabel}</span>
            </div>
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize border-2 border-gray-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-0.5">
                <ArrowLeft className="w-3 h-3 text-gray-600" />
                <div className="w-0.5 h-4 bg-gray-400 rounded" />
                <ArrowRight className="w-3 h-3 text-gray-600" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hover Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <motion.div
            className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            ← Drag to compare →
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
