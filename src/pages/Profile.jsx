
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Rating } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  Star, 
  TrendingUp,
  Calendar,
  Target,
  Award,
  Settings,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({
    totalTryOns: 0,
    averageRating: 0,
    favoriteCategory: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      
      const myRatings = await Rating.filter({ created_by: currentUser.email });
      setRatings(myRatings);
      
      // Calculate stats
      const totalTryOns = myRatings.length;
      const averageRating = totalTryOns > 0 
        ? myRatings.reduce((sum, r) => sum + r.overall_score, 0) / totalTryOns 
        : 0;
      
      setStats({
        totalTryOns,
        averageRating,
        favoriteCategory: 'Tops' // This would be calculated from actual data
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{user?.full_name || 'User'}</h1>
              <p className="text-slate-600">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.totalTryOns}</div>
                <div className="text-slate-600 font-medium">Try-Ons</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.averageRating.toFixed(1)}</div>
                <div className="text-slate-600 font-medium">Avg. Rating</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.favoriteCategory}</div>
                <div className="text-slate-600 font-medium">Favorite Category</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Ratings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ratings.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No ratings yet</h3>
                <p className="text-slate-600">Complete a try-on and rate your experience to see your history here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.slice(0, 5).map((rating, index) => (
                  <motion.div
                    key={rating.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          {rating.overall_score}/100
                        </Badge>
                        {rating.fit_rating && (
                          <Badge variant="outline" className="text-xs">
                            {rating.fit_rating.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      
                      {rating.comments && (
                        <p className="text-sm text-slate-600 mb-2">{rating.comments}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(rating.created_date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(rating.overall_score / 20) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {ratings.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      View All Ratings ({ratings.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <p className="text-slate-900 mt-1">{user?.full_name || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-slate-900 mt-1">{user?.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Role</label>
                <Badge className="mt-1">
                  {user?.role || 'user'}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Member Since</label>
                <p className="text-slate-900 mt-1">
                  {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
