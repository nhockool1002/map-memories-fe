'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Heart, Calendar, User, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/layout/Navigation';
import Map from '@/components/map/Map';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/api';
import { Location, Memory } from '@/types/api';
import { format } from 'date-fns';

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // States
  const [locations, setLocations] = useState<Location[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [newLocationMarker, setNewLocationMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationDetails, setShowLocationDetails] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load locations and memories in parallel
        const [locationsResponse, memoriesResponse] = await Promise.all([
          apiClient.getLocations({ limit: 50 }),
          apiClient.getMemories({ limit: 20, is_public: true }),
        ]);

        if (locationsResponse.success && locationsResponse.data) {
          setLocations(locationsResponse.data);
        }

        if (memoriesResponse.success && memoriesResponse.data) {
          setMemories(memoriesResponse.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setShowLocationDetails(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isAuthenticated) {
      setNewLocationMarker({ lat, lng });
    } else {
      router.push('/auth');
    }
  };

  const handleAddMemory = (location: Location) => {
    if (isAuthenticated) {
      router.push(`/memories/create?locationId=${location.id}`);
    } else {
      router.push('/auth');
    }
  };

  const filteredMemories = memories.filter(memory =>
    memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 container-mobile"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-3 sm:mb-4">
            Khám phá kỷ niệm
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            Lưu giữ những khoảnh khắc đẹp nhất của bạn trên bản đồ. 
            Chia sẻ câu chuyện và khám phá những nơi mới.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 container-mobile"
        >
          {isAuthenticated ? (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/memories/create')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Tạo kỷ niệm mới
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/memories')}
              >
                <Heart className="h-5 w-5 mr-2" />
                Xem kỷ niệm của tôi
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/auth')}
              >
                Bắt đầu ngay
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/memories')}
              >
                Khám phá kỷ niệm
              </Button>
            </>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                  Bản đồ kỷ niệm
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isAuthenticated 
                    ? 'Nhấp vào bản đồ để tạo địa điểm mới' 
                    : 'Đăng nhập để tạo kỷ niệm mới'
                  }
                </p>
              </div>
              
              <Map
                locations={locations}
                memories={memories}
                height="h-80 sm:h-96 lg:h-[500px]"
                onLocationClick={handleLocationClick}
                onMapClick={handleMapClick}
                onAddMemory={handleAddMemory}
                newLocationMarker={newLocationMarker}
              />
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 lg:space-y-6"
          >
            {/* Search */}
            <div className="card p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm kỷ niệm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Recent Memories */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-primary-600" />
                  Kỷ niệm gần đây
                </h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto hide-scrollbar">
                {filteredMemories.length > 0 ? (
                  <div className="space-y-1">
                    {filteredMemories.slice(0, 10).map((memory) => (
                      <motion.div
                        key={memory.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 hover:bg-primary-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                        onClick={() => router.push(`/memories/${memory.uuid}`)}
                      >
                        <h4 className="font-medium text-gray-800 mb-1 line-clamp-1">
                          {memory.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {memory.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{memory.location.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                                                         <span>
                               {format(new Date(memory.visit_date), 'dd/MM')}
                             </span>
                          </div>
                        </div>
                        {memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {memory.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có kỷ niệm nào</p>
                    <p className="text-sm">Hãy tạo kỷ niệm đầu tiên của bạn!</p>
                  </div>
                )}
              </div>
              
              {filteredMemories.length > 10 && (
                <div className="p-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => router.push('/memories')}
                  >
                    Xem tất cả kỷ niệm
                  </Button>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng địa điểm</span>
                  <span className="font-semibold text-primary-600">{locations.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng kỷ niệm</span>
                  <span className="font-semibold text-primary-600">{memories.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kỷ niệm công khai</span>
                  <span className="font-semibold text-primary-600">
                    {memories.filter(m => m.is_public).length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Location Details Modal */}
      <AnimatePresence>
        {showLocationDetails && selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowLocationDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">{selectedLocation.name}</h3>
                {selectedLocation.description && (
                  <p className="text-gray-600 mb-4">{selectedLocation.description}</p>
                )}
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedLocation.address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}</span>
                  </div>
                  {selectedLocation.city && selectedLocation.country && (
                    <p>{selectedLocation.city}, {selectedLocation.country}</p>
                  )}
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    <span>{selectedLocation.memory_count} kỷ niệm</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleAddMemory(selectedLocation);
                      setShowLocationDetails(false);
                    }}
                    className="flex-1"
                  >
                    Thêm kỷ niệm
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowLocationDetails(false)}
                    className="flex-1"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}