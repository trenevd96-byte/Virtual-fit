import React, { useState, useEffect } from "react";
import { Garment } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Upload,
  Camera,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { generateText } from "@/api/geminiClient";

const categories = [
  { id: "all", name: "All Items", count: 0 },
  { id: "top", name: "Tops", count: 0 },
  { id: "dress", name: "Dresses", count: 0 },
  { id: "pants", name: "Pants", count: 0 }
];

export default function GarmentSelector({ onGarmentSelect, onBack, userImage }) {
  const [garments, setGarments] = useState([]);
  const [filteredGarments, setFilteredGarments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  // Custom upload states
  const [uploadedGarment, setUploadedGarment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);

  useEffect(() => {
    loadGarments();
    if (userImage) {
      generateStyleRecommendations();
    }
  }, []);

  useEffect(() => {
    // Filter garments logic moved directly into useEffect
    let filtered = garments;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(g => g.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(g => 
        g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGarments(filtered);
  }, [garments, selectedCategory, searchQuery]);

  // Custom garment upload handlers
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      
      // Create custom garment object
      const customGarment = {
        id: 'custom_' + Date.now(),
        name: file.name.split('.')[0] || 'Custom Garment',
        brand: 'Your Upload',
        category: 'custom',
        price: 0,
        image_url: imageUrl,
        colors: ['custom'],
        isCustom: true,
        file: file // Store the actual file for API calls
      };

      setUploadedGarment(customGarment);
      setShowUploadSection(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedGarment = () => {
    if (uploadedGarment?.image_url) {
      URL.revokeObjectURL(uploadedGarment.image_url);
    }
    setUploadedGarment(null);
    setShowUploadSection(false);
  };

  const handleUploadedGarmentSelect = () => {
    if (uploadedGarment) {
      onGarmentSelect(uploadedGarment);
    }
  };

  const loadGarments = async () => {
    try {
      // Skip Base44 API call and use mock data directly for demo
      console.log("Using mock garment data for demo");
      // const data = await Garment.list();
      // setGarments(data);
      
      // Expanded mock data for comprehensive testing
      const mockGarments = [
        // T-SHIRTS
        {
          id: 1,
          name: "Classic White T-Shirt",
          brand: "StyleCo",
          category: "top",
          price: 29.99,
          image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop",
          colors: ["white", "black", "gray"]
        },
        {
          id: 2,
          name: "Striped Navy T-Shirt",
          brand: "MarineStyle",
          category: "top",
          price: 34.99,
          image_url: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=600&fit=crop",
          colors: ["navy", "white", "blue"]
        },
        {
          id: 3,
          name: "Vintage Band T-Shirt",
          brand: "RetroWear",
          category: "top",
          price: 39.99,
          image_url: "https://images.unsplash.com/photo-1583743814966-8936f37f4ec6?w=400&h=600&fit=crop",
          colors: ["black", "gray", "white"]
        },
        {
          id: 4,
          name: "Pastel Pink T-Shirt",
          brand: "SoftStyle",
          category: "top",
          price: 27.99,
          image_url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=600&fit=crop",
          colors: ["pink", "lavender", "mint"]
        },

        // HOODIES
        {
          id: 5,
          name: "Casual Gray Hoodie",
          brand: "ComfortWear",
          category: "top",
          price: 49.99,
          image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=600&fit=crop",
          colors: ["gray", "black", "navy", "red"]
        },
        {
          id: 6,
          name: "Oversized Black Hoodie",
          brand: "StreetStyle",
          category: "top",
          price: 59.99,
          image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
          colors: ["black", "charcoal", "dark gray"]
        },
        {
          id: 7,
          name: "Athletic Performance Hoodie",
          brand: "SportTech",
          category: "top",
          price: 69.99,
          image_url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=600&fit=crop",
          colors: ["navy", "black", "blue", "gray"]
        },
        {
          id: 8,
          name: "Cream Pullover Hoodie",
          brand: "CozyWear",
          category: "top",
          price: 54.99,
          image_url: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=400&h=600&fit=crop",
          colors: ["cream", "beige", "white", "sand"]
        },

        // DRESSES
        {
          id: 9,
          name: "Floral Summer Dress",
          brand: "TrendWear",
          category: "dress",
          price: 89.99,
          image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop",
          colors: ["floral", "blue", "pink"]
        },
        {
          id: 10,
          name: "Little Black Dress",
          brand: "ClassicStyle",
          category: "dress",
          price: 119.99,
          image_url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=600&fit=crop",
          colors: ["black"]
        },
        {
          id: 11,
          name: "Bohemian Maxi Dress",
          brand: "FreeSpirit",
          category: "dress",
          price: 95.99,
          image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop",
          colors: ["burgundy", "rust", "brown", "orange"]
        },
        {
          id: 12,
          name: "Elegant Evening Gown",
          brand: "Elegance",
          category: "dress",
          price: 199.99,
          image_url: "https://images.unsplash.com/photo-1566479179817-c08cbf9e0b2e?w=400&h=600&fit=crop",
          colors: ["black", "navy", "burgundy"]
        },
        {
          id: 13,
          name: "Casual Midi Dress",
          brand: "EverydayStyle",
          category: "dress",
          price: 67.99,
          image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=600&fit=crop",
          colors: ["blue", "navy", "denim"]
        },
        {
          id: 14,
          name: "Vintage Polka Dot Dress",
          brand: "RetroChic",
          category: "dress",
          price: 79.99,
          image_url: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&h=600&fit=crop",
          colors: ["red", "white", "black"]
        },
        {
          id: 15,
          name: "Wrap Sundress",
          brand: "SummerVibes",
          category: "dress",
          price: 72.99,
          image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop",
          colors: ["yellow", "white", "floral"]
        },

        // ADDITIONAL TOPS
        {
          id: 16,
          name: "Denim Jeans",
          brand: "DenimPlus",
          category: "pants",
          price: 79.99,
          image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop",
          colors: ["blue", "black", "light blue"]
        },
        {
          id: 17,
          name: "Professional Blazer",
          brand: "Business",
          category: "top",
          price: 129.99,
          image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop",
          colors: ["black", "navy", "gray"]
        },
        {
          id: 18,
          name: "Cropped Denim Jacket",
          brand: "CasualDenim",
          category: "top",
          price: 85.99,
          image_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop",
          colors: ["blue", "light blue", "indigo"]
        }
      ];
      setGarments(mockGarments);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryCounts = () => {
    return categories.map(cat => ({
      ...cat,
      count: cat.id === "all" 
        ? garments.length 
        : garments.filter(g => g.category === cat.id).length
    }));
  };

  const generateStyleRecommendations = async () => {
    if (!userImage) return;
    
    setLoadingRecommendations(true);
    try {
      const prompt = `Based on this person's appearance, body type, and style, provide 3-4 specific fashion recommendations for virtual try-on. Consider:
1. What clothing styles would suit their body type?
2. What colors would complement their appearance?
3. What fashion categories (tops, dresses, pants) would work best?
4. Any specific style preferences you can infer?

Provide practical, specific suggestions for a virtual fitting experience.`;

      const recommendations = await generateText(prompt);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setAiRecommendations('Unable to generate personalized recommendations at this time. Browse our collection to find items you love!');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleGarmentSelect = (garment) => {
    onGarmentSelect(garment);
  };

  if (loading) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-slate-200 rounded-xl mb-3" />
                <div className="h-4 bg-slate-200 rounded mb-2" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Choose a Garment</h2>
            <p className="text-slate-600">Select what you'd like to try on</p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {(aiRecommendations || loadingRecommendations) && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
              AI Style Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRecommendations ? (
              <div className="flex items-center gap-2 text-slate-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                <span className="text-sm">Generating personalized recommendations...</span>
              </div>
            ) : (
              <div className="text-sm text-slate-700 whitespace-pre-line">
                {aiRecommendations}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search garments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => document.getElementById('garment-upload').click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload Your Own
              </Button>
              <input
                id="garment-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Upload Section */}
      {showUploadSection && uploadedGarment && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-blue-900">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Your Custom Garment
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={removeUploadedGarment}
                  className="text-blue-700 hover:text-blue-900"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative">
                  <img
                    src={uploadedGarment.image_url}
                    alt={uploadedGarment.name}
                    className="w-32 h-40 object-cover rounded-lg border-2 border-blue-200"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">{uploadedGarment.name}</h3>
                  <p className="text-blue-700 text-sm mb-4">Custom uploaded garment ready for try-on</p>
                  <Button 
                    onClick={handleUploadedGarmentSelect}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Try On This Garment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          {getCategoryCounts().map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-sm">
              {category.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredGarments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No garments found</h3>
                <p className="text-slate-600">Try adjusting your search or category filter</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGarments.map((garment, index) => (
                <motion.div
                  key={garment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
                    <CardContent className="p-0">
                      <div 
                        className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-slate-100"
                        onClick={() => handleGarmentSelect(garment)}
                      >
                        {garment.image_url ? (
                          <img
                            src={garment.image_url}
                            alt={garment.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-12 h-12 text-slate-400" />
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button className="bg-white text-slate-900 hover:bg-slate-100">
                            Try On
                          </Button>
                        </div>

                        {/* Category Badge */}
                        <Badge className="absolute top-2 left-2 bg-white/90 text-slate-700 text-xs">
                          {garment.category}
                        </Badge>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button size="icon" variant="ghost" className="bg-white/90 hover:bg-white w-8 h-8">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-purple-700 transition-colors">
                          {garment.name}
                        </h3>
                        {garment.brand && (
                          <p className="text-sm text-slate-600 mb-2">{garment.brand}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          {garment.price && (
                            <span className="font-bold text-slate-900">${garment.price}</span>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-slate-600">4.8</span>
                          </div>
                        </div>

                        {garment.colors && garment.colors.length > 0 && (
                          <div className="flex gap-1 mt-3">
                            {garment.colors.slice(0, 4).map((color, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-full border border-slate-200"
                                style={{ backgroundColor: color.toLowerCase() }}
                              />
                            ))}
                            {garment.colors.length > 4 && (
                              <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center">
                                <span className="text-xs text-slate-600">+{garment.colors.length - 4}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}