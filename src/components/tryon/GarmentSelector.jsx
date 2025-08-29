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
  ShoppingCart
} from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { id: "all", name: "All Items", count: 0 },
  { id: "top", name: "Tops", count: 0 },
  { id: "dress", name: "Dresses", count: 0 },
  { id: "pants", name: "Pants", count: 0 }
];

export default function GarmentSelector({ onGarmentSelect, onBack }) {
  const [garments, setGarments] = useState([]);
  const [filteredGarments, setFilteredGarments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGarments();
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

  const loadGarments = async () => {
    try {
      const data = await Garment.list();
      setGarments(data);
    } catch (error) {
      console.error("Error loading garments:", error);
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
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

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