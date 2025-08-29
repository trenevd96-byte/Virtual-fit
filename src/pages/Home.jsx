import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Sparkles, 
  Zap, 
  Shield, 
  ArrowRight, 
  Star,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Camera,
    title: "AI-Powered Try-On",
    description: "Upload your photo and see how any garment looks on you instantly",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get photorealistic try-on results in seconds, not minutes",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your photos are processed securely and never shared",
    color: "from-green-500 to-emerald-500"
  }
];

const stats = [
  { label: "Try-Ons Completed", value: "10K+", icon: TrendingUp },
  { label: "Accuracy Rate", value: "95%", icon: CheckCircle2 },
  { label: "Avg. Rating", value: "4.8", icon: Star },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/50" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                <Sparkles className="w-4 h-4 mr-1" />
                AI-Powered Fashion
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Try On Clothes
                <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                  Virtually
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Experience the future of online shopping. See how any garment looks on you 
                with our cutting-edge AI technology. No fitting rooms required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("TryOn")}>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <Camera className="w-5 h-5 mr-2" />
                    Start Try-On
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("Gallery")}>
                  <Button variant="outline" size="lg" className="px-8 py-3 rounded-xl border-2 hover:bg-slate-50">
                    View Gallery
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-3xl p-8 shadow-2xl">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Camera className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to Try?</h3>
                    <p className="text-slate-600">Upload your photo and start exploring</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center border-0 shadow-lg">
                  <CardContent className="p-8">
                    <stat.icon className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                    <div className="text-slate-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our advanced AI technology makes virtual try-on simple and accurate
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already using VirtualFit to make smarter fashion decisions
            </p>
            <Link to={createPageUrl("TryOn")}>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Camera className="w-5 h-5 mr-2" />
                Start Your First Try-On
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}