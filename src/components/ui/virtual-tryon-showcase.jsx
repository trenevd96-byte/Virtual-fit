import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BeforeAfterSlider from './before-after-slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronLeft, ChevronRight, Shirt, ShoppingBag } from 'lucide-react';

const VirtualTryOnShowcase = () => {
  const [currentExample, setCurrentExample] = useState(0);

  // Sample data - in production, these would be actual before/after images
  const examples = [
    {
      id: 1,
      category: 'Dress',
      categoryIcon: Shirt,
      title: 'Elegant Evening Dress',
      description: 'Transform from casual to glamorous',
      beforeImage: 'https://images.unsplash.com/photo-1494790108755-2616c78b5e24?w=400&h=600&fit=crop&crop=face',
      afterImage: 'https://images.unsplash.com/photo-1566479179817-c08cbf9e0b2e?w=400&h=600&fit=crop',
      beforeLabel: 'Original',
      afterLabel: 'AI Styled'
    },
    {
      id: 2,
      category: 'T-Shirt',
      categoryIcon: Shirt,
      title: 'Casual Streetwear Look',
      description: 'Perfect fit, perfect style',
      beforeImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
      afterImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
      beforeLabel: 'Before',
      afterLabel: 'Virtual Try-On'
    },
    {
      id: 3,
      category: 'Formal',
      categoryIcon: ShoppingBag,
      title: 'Professional Business Attire',
      description: 'From casual to corporate ready',
      beforeImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
      afterImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      beforeLabel: 'Everyday',
      afterLabel: 'AI Enhanced'
    }
  ];

  const nextExample = () => {
    setCurrentExample((prev) => (prev + 1) % examples.length);
  };

  const prevExample = () => {
    setCurrentExample((prev) => (prev - 1 + examples.length) % examples.length);
  };

  const currentData = examples[currentExample];
  const CategoryIcon = currentData.categoryIcon;

  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
            <Sparkles className="w-4 h-4 mr-1" />
            See the Magic
          </Badge>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Virtual Try-On 
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              in Action
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            See how our AI transforms any photo into a professional fashion showcase. 
            Drag the slider to reveal the incredible before and after results.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Before/After Slider */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <BeforeAfterSlider
              beforeImage={currentData.beforeImage}
              afterImage={currentData.afterImage}
              beforeLabel={currentData.beforeLabel}
              afterLabel={currentData.afterLabel}
              height="500px"
              className="w-full"
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={prevExample}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {examples.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentExample(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentExample 
                        ? 'bg-purple-600 w-8' 
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextExample}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Current Example Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <CategoryIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Badge variant="secondary" className="mb-1">
                    {currentData.category}
                  </Badge>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {currentData.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-lg text-slate-600">
                {currentData.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900">What Makes It Amazing:</h4>
              <div className="space-y-3">
                {[
                  '🎯 Perfect fit visualization',
                  '✨ Professional quality enhancement',
                  '🎨 Natural lighting & shadows',
                  '📸 Magazine-quality results'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-purple-100"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-slate-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="pt-6">
              <Link to="/try-on">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try It Yourself
                </Button>
              </Link>
              <p className="text-sm text-slate-500 mt-2">
                Upload your photo and see the magic happen
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-16 border-t border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {[
            { label: 'Accuracy Rate', value: '98%', icon: '🎯' },
            { label: 'Processing Time', value: '<30s', icon: '⚡' },
            { label: 'Happy Users', value: '50K+', icon: '😊' },
            { label: 'Garments', value: '1000+', icon: '👗' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VirtualTryOnShowcase;
