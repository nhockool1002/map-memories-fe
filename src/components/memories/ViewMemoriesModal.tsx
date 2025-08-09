'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle, Image, Video, MapPin, Calendar, User, Heart, Eye, EyeOff } from 'lucide-react';
import { Location, Memory, MemoryLocationResponse } from '@/types/api';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface ViewMemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
  onMemoryDeleted?: () => void;
}

const ViewMemoriesModal: React.FC<ViewMemoriesModalProps> = ({
  isOpen,
  onClose,
  location,
  onMemoryDeleted,
}) => {
  const [memories, setMemories] = useState<MemoryLocationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<MemoryLocationResponse | null>(null);
  const [locationDeleted, setLocationDeleted] = useState(false);

  useEffect(() => {
    if (isOpen && location && !locationDeleted) {
      loadMemories();
    }
  }, [isOpen, location, locationDeleted]);

  const loadMemories = useCallback(async () => {
    if (!location) return;

    try {
      setLoading(true);
      console.log('Loading memories for location:', location);
      
      // Try to get memories directly for this location using location UUID first
      if (location.uuid) {
        try {
          const locationMemoriesResponse = await apiClient.getLocationMemories(location.uuid);
          console.log('Location memories response:', locationMemoriesResponse);
          
          if (locationMemoriesResponse.success && locationMemoriesResponse.data && locationMemoriesResponse.data.length > 0) {
            // Get detailed info for each memory using API 2.2
            const detailedMemories = await Promise.all(
              locationMemoriesResponse.data.map(async (memory) => {
                try {
                  const detailResponse = await apiClient.getMemoryLocationDetail(memory.id);
                  console.log('Memory detail response:', detailResponse);
                  return detailResponse.data;
                } catch (error) {
                  console.error(`Error fetching memory detail for ${memory.id}:`, error);
                  return null;
                }
              })
            );

            const filteredMemories = detailedMemories.filter(Boolean) as MemoryLocationResponse[];
            console.log('Final memories:', filteredMemories);
            setMemories(filteredMemories);
            return;
          } else {
            console.log('No location memories found or empty response');
          }
        } catch (error) {
          console.error('Error fetching location memories:', error);
        }
      }
      
      // Fallback: try to get all memories and filter by location
      const response = await apiClient.getMemories();
      console.log('API response:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        // Filter memories for this location and get detailed info
        const locationMemories = response.data.filter(memory => {
          console.log('Memory location:', memory.location, 'Target location:', location);
          // Check multiple ways to match location
          const locationMatch = 
            (location.uuid && memory.location.uuid === location.uuid) ||
            (location.id && memory.location.id === location.id) ||
            (location.latitude && memory.location.latitude && 
             Math.abs(parseFloat(location.latitude.toString()) - parseFloat(memory.location.latitude.toString())) < 0.0001 &&
             location.longitude && memory.location.longitude &&
             Math.abs(parseFloat(location.longitude.toString()) - parseFloat(memory.location.longitude.toString())) < 0.0001);
          
          console.log('Location match:', locationMatch);
          return locationMatch;
        });
        
        console.log('Filtered memories:', locationMemories);
        
        if (locationMemories.length > 0) {
          // Get detailed info for each memory using API 2.2
          const detailedMemories = await Promise.all(
            locationMemories.map(async (memory) => {
              try {
                const detailResponse = await apiClient.getMemoryLocationDetail(memory.id);
                console.log('Memory detail response:', detailResponse);
                return detailResponse.data;
              } catch (error) {
                console.error(`Error fetching memory detail for ${memory.id}:`, error);
                return null;
              }
            })
          );

          const filteredMemories = detailedMemories.filter(Boolean) as MemoryLocationResponse[];
          console.log('Final memories:', filteredMemories);
          setMemories(filteredMemories);
        } else {
          console.log('No memories found for this location');
          setMemories([]);
        }
      } else {
        console.log('No memories found or API error');
        setMemories([]);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
      toast.error('Không thể tải kỷ niệm');
      setMemories([]);
    } finally {
      setLoading(false);
    }
  }, [location]);

  const handleDeleteMemory = async (memory: MemoryLocationResponse) => {
    setMemoryToDelete(memory);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!memoryToDelete) return;

    try {
      const response = await apiClient.deleteMemoryLocation(memoryToDelete.id);
      if (response.success) {
        toast.success('Đã xóa kỷ niệm thành công');
        
        // Nếu memory cuối cùng bị xóa, đóng modal
        if (memories.length === 1) {
          setLocationDeleted(true);
          onMemoryDeleted?.();
          onClose();
          return;
        } else {
          // Nếu không phải memory cuối cùng, chỉ xóa memory
          setMemories(prev => prev.filter(m => m.id !== memoryToDelete.id));
          setShowDeleteConfirm(false);
          setMemoryToDelete(null);
        }
      } else {
        toast.error('Không thể xóa kỷ niệm');
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Không thể xóa kỷ niệm');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setMemoryToDelete(null);
  };

  // Hàm để strip HTML tags và hiển thị text thuần
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Nếu location đã bị xóa, không render gì
  if (locationDeleted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Kỷ niệm tại địa điểm</h2>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 font-medium">{location.name}</span>
                      </div>
                      {location.address && (
                        <span className="text-gray-500 text-sm">{location.address}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải kỷ niệm...</span>
                  </div>
                ) : memories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có kỷ niệm nào</h3>
                    <p className="text-gray-500">Hãy tạo kỷ niệm đầu tiên tại địa điểm này</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {memories.map((memory) => (
                      <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{memory.title}</h3>
                              {memory.is_public ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            
                            {/* Meta information */}
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(memory.visit_date), 'dd/MM/yyyy')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="h-3 w-3" />
                                <span>{memory.like_count} lượt thích</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Image className="h-3 w-3" />
                                <span>{memory.image_count} ảnh</span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteMemory(memory)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            title="Xóa kỷ niệm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Content */}
                        <div className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">
                          {stripHtml(memory.content)}
                        </div>
                        
                        {/* Tags */}
                        {memory.tags && memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {memory.tags.map((tag, index) => (
                              <span
                                key={`${tag}-${index}`}
                                className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Images */}
                        {memory.images && memory.images.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <Image className="h-4 w-4 mr-2" />
                              Hình ảnh ({memory.images.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {memory.images.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={image.image_base64}
                                    alt={image.caption || `Hình ảnh ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                  />
                                  {image.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 rounded-b-lg">
                                      {image.caption}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Location details */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Thông tin địa điểm
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Tên:</span>
                              <span className="ml-2 font-medium">{memory.location.name}</span>
                            </div>
                            {memory.location.description && (
                              <div>
                                <span className="text-gray-500">Mô tả:</span>
                                <span className="ml-2">{memory.location.description}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Địa chỉ:</span>
                              <span className="ml-2">{memory.location.address || 'Chưa có'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Thành phố:</span>
                              <span className="ml-2">{memory.location.city || 'Chưa có'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quốc gia:</span>
                              <span className="ml-2">{memory.location.country || 'Chưa có'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tọa độ:</span>
                              <span className="ml-2 font-mono text-xs">
                                {memory.location.latitude}, {memory.location.longitude}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && memoryToDelete && (
              <div className="fixed inset-0 z-[70] overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                  onClick={cancelDelete}
                />

                <div className="flex min-h-screen items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-[71]"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                      <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn xóa kỷ niệm "{memoryToDelete.title}"? 
                        {memories.length === 1 && (
                          <span className="block mt-2 text-red-600 font-medium">
                            Đây là kỷ niệm cuối cùng, địa điểm cũng sẽ bị xóa!
                          </span>
                        )}
                        Hành động này không thể hoàn tác.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={cancelDelete}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ViewMemoriesModal; 