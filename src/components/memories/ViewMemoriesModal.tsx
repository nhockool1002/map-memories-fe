'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle, Image, Video } from 'lucide-react';
import { Location, Memory } from '@/types/api';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface ViewMemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
  onMemoryDeleted?: () => void; // Callback để reload map
}

const ViewMemoriesModal: React.FC<ViewMemoriesModalProps> = ({
  isOpen,
  onClose,
  location,
  onMemoryDeleted,
}) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<Memory | null>(null);
  const [locationDeleted, setLocationDeleted] = useState(false);

  useEffect(() => {
    if (isOpen && location?.uuid && !locationDeleted) {
      // Silent load handling
    }
  }, [isOpen, location?.uuid, locationDeleted]);

  const loadMemories = useCallback(async () => {
    if (!location?.uuid) return;

    try {
      const response = await apiClient.getMemories();
      if (response.success && response.data) {
        // Filter memories for this location
        const locationMemories = response.data.filter(memory => memory.location.uuid === location.uuid);
        setMemories(locationMemories);
      }
    } catch (error) {
      // Silent error handling
    }
  }, [location?.uuid]);

  const handleDeleteMemory = async (memory: Memory) => {
    setMemoryToDelete(memory);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!memoryToDelete) return;

    try {
      // Chỉ xóa memory, backend sẽ tự xử lý location
      const memoryResponse = await apiClient.deleteMemory(memoryToDelete.uuid);
      if (memoryResponse.success) {
        
        // Nếu memory cuối cùng bị xóa, đóng modal
        if (memories.length === 1) {
          toast.success('Đã xóa kỷ niệm thành công');
          setLocationDeleted(true); // Set flag để tránh reload
          onMemoryDeleted?.(); // Reload map để cập nhật location markers
          onClose();
          return;
        } else {
          // Nếu không phải memory cuối cùng, chỉ xóa memory
          toast.success('Đã xóa kỷ niệm thành công');
          setMemories(prev => prev.filter(m => m.uuid !== memoryToDelete.uuid));
          setShowDeleteConfirm(false);
          setMemoryToDelete(null);
        }
      } else {
        toast.error('Không thể xóa kỷ niệm');
      }
    } catch (error) {
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
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Kỷ niệm tại địa điểm</h2>
                    <p className="text-gray-600 mt-1">{location.name}</p>
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
                  <div className="space-y-4">
                    {memories.map((memory) => (
                      <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{memory.title}</h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  {format(new Date(memory.visit_date), 'dd/MM/yyyy')}
                                </span>
                                <button
                                  onClick={() => handleDeleteMemory(memory)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                  title="Xóa kỷ niệm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Nội dung đã strip HTML */}
                            <div className="text-gray-700 mb-3 whitespace-pre-wrap">
                              {stripHtml(memory.content)}
                            </div>
                            
                            {/* Tags */}
                            {memory.tags && memory.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {memory.tags.map((tag, index) => (
                                  <span
                                    key={`${tag}-${index}`}
                                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Media Display */}
                            {memory.media && memory.media.length > 0 && (
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Media:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {memory.media.map((media) => (
                                    <div key={media.id} className="relative group">
                                      {media.media_type === 'image' ? (
                                        <img
                                          src={apiClient.getMediaFileUrl(media.uuid)}
                                          alt={media.original_filename}
                                          className="w-full h-20 object-cover rounded-lg"
                                        />
                                      ) : (
                                        <video
                                          src={apiClient.getMediaFileUrl(media.uuid)}
                                          className="w-full h-20 object-cover rounded-lg"
                                          muted
                                        />
                                      )}
                                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                        {media.media_type === 'image' ? (
                                          <Image className="w-3 h-3 inline mr-1" />
                                        ) : (
                                          <Video className="w-3 h-3 inline mr-1" />
                                        )}
                                        {media.media_type}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>❤️ {memory.like_count} lượt thích</span>
                              <span>📸 {memory.media_count} ảnh/video</span>
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