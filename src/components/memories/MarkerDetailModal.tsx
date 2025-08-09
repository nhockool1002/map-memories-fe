'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, User, Heart, Eye, EyeOff, Tag, Image as ImageIcon } from 'lucide-react';
import { Location, MemoryLocationResponse } from '@/types/api';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/api';

interface MarkerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
}

const MarkerDetailModal: React.FC<MarkerDetailModalProps> = ({
  isOpen,
  onClose,
  location,
}) => {
  const [memories, setMemories] = useState<MemoryLocationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && location) {
      fetchLocationMemories();
    }
  }, [isOpen, location]);

  const fetchLocationMemories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Lấy memories của location này
      const response = await apiClient.getLocationMemories(location.uuid, {
        limit: 50, // Lấy tối đa 50 memories
        is_public: undefined // Lấy cả public và private
      });

      if (response.data) {
        // Chuyển đổi từ Memory sang MemoryLocationResponse format
        const memoryDetails = await Promise.all(
          response.data.map(async (memory) => {
            try {
              const detailResponse = await apiClient.getMemoryLocationDetail(memory.id);
              return detailResponse.data;
            } catch (error) {
              console.error(`Error fetching memory detail for ${memory.id}:`, error);
              return null;
            }
          })
        );

        setMemories(memoryDetails.filter(Boolean) as MemoryLocationResponse[]);
      }
    } catch (error) {
      console.error('Error fetching location memories:', error);
      setError('Không thể tải dữ liệu kỷ niệm');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Marker chi tiết
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {location.name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Location Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Thông tin địa điểm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tên địa điểm</p>
                    <p className="font-medium">{location.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mô tả</p>
                    <p className="font-medium">{location.description || 'Không có mô tả'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    <p className="font-medium">{location.address || 'Không có địa chỉ'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thành phố</p>
                    <p className="font-medium">{location.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quốc gia</p>
                    <p className="font-medium">{location.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tọa độ</p>
                    <p className="font-medium">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Memories Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Kỷ niệm tại địa điểm này ({memories.length})
                  </h3>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải kỷ niệm...</span>
                  </div>
                )}

                {error && (
                  <div className="text-center py-8">
                    <div className="text-red-600 text-lg mb-2">⚠️</div>
                    <p className="text-red-600">{error}</p>
                    <Button
                      onClick={fetchLocationMemories}
                      className="mt-3"
                      variant="secondary"
                    >
                      Thử lại
                    </Button>
                  </div>
                )}

                {!loading && !error && memories.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📝</div>
                    <p className="text-gray-600">Chưa có kỷ niệm nào tại địa điểm này</p>
                  </div>
                )}

                {!loading && !error && memories.length > 0 && (
                  <div className="space-y-4">
                    {memories.map((memory) => (
                      <div key={memory.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {memory.title}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {memory.content.length > 150 
                                ? `${memory.content.substring(0, 150)}...` 
                                : memory.content
                              }
                            </p>
                          </div>
                                                     <div className="flex items-center space-x-2 ml-4">
                             {memory.is_public ? (
                               <Eye className="h-4 w-4 text-green-600" />
                             ) : (
                               <EyeOff className="h-4 w-4 text-gray-400" />
                             )}
                            <div className="flex items-center space-x-1">
                              <Heart className={`h-4 w-4 ${memory.is_liked_by_user ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                              <span className="text-sm text-gray-600">{memory.like_count}</span>
                            </div>
                          </div>
                        </div>

                        {/* Memory Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {memory.visit_date ? formatDate(memory.visit_date) : 'Không có ngày thăm'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">ID: {memory.user}</span>
                          </div>

                          {memory.tags && memory.tags.length > 0 && (
                            <div className="flex items-center space-x-2 md:col-span-2">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <div className="flex flex-wrap gap-1">
                                {memory.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {memory.images && memory.images.length > 0 && (
                            <div className="flex items-center space-x-2 md:col-span-2">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {memory.image_count} hình ảnh
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Created/Updated Info */}
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Tạo: {formatDateTime(memory.created_at)}</span>
                            <span>Cập nhật: {formatDateTime(memory.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MarkerDetailModal; 