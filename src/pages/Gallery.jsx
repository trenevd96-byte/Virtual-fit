
import React, { useState, useEffect } from "react";
import { TryOnSession } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Grid3X3, 
  List, 
  Calendar, 
  Clock,
  Star,
  Download,
  Share2,
  MoreHorizontal,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Gallery() {
  const [sessions, setSessions] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      
      const userSessions = await TryOnSession.filter({ created_by: currentUser.email });
      setSessions(userSessions);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filterStatus === "all") return true;
    return session.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-slate-200 rounded-xl mb-4" />
                <div className="h-4 bg-slate-200 rounded mb-2" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Try-On Gallery</h1>
            <p className="text-slate-600">
              Your virtual try-on history • {sessions.length} sessions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="mb-8">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              All ({sessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Completed ({sessions.filter(s => s.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="processing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Processing ({sessions.filter(s => s.status === 'processing').length})
            </TabsTrigger>
            <TabsTrigger value="failed" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Failed ({sessions.filter(s => s.status === 'failed').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Gallery Content */}
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid3X3 className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No try-on sessions yet</h3>
              <p className="text-slate-600 mb-6">
                Start your first virtual try-on to see your results here
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Start Try-On
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-slate-100 rounded-t-lg overflow-hidden">
                      {session.result_image_url ? (
                        <img
                          src={session.result_image_url}
                          alt="Try-on result"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Clock className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <Badge className={`absolute top-3 left-3 text-xs ${getStatusColor(session.status)}`}>
                        {session.status}
                      </Badge>
                      
                      {/* AI Edit Badge */}
                      {session.ai_edited && (
                        <Badge className="absolute top-3 right-3 bg-purple-100 text-purple-800 text-xs">
                          AI Enhanced
                        </Badge>
                      )}
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button size="sm" variant="secondary" className="gap-2">
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {format(new Date(session.created_date), "MMM d")}
                          </span>
                        </div>
                        
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {session.processing_time && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{session.processing_time}s processing</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        {session.result_image_url ? (
                          <img
                            src={session.result_image_url}
                            alt="Try-on result"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                            {session.status}
                          </Badge>
                          {session.ai_edited && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              AI Enhanced
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <span className="text-slate-500">Created:</span> {format(new Date(session.created_date), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                          {session.processing_time && (
                            <div>
                              <span className="text-slate-500">Processing time:</span> {session.processing_time}s
                            </div>
                          )}
                          {session.pose_confidence && (
                            <div>
                              <span className="text-slate-500">Pose confidence:</span> {Math.round(session.pose_confidence * 100)}%
                            </div>
                          )}
                          {session.mask_quality && (
                            <div>
                              <span className="text-slate-500">Mask quality:</span> {Math.round(session.mask_quality * 100)}%
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
