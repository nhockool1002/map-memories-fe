'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Heart, User, Tag, Image, Video } from 'lucide-react';
import apiClient from '@/lib/api';
import { Location, Memory } from '@/types/api';

interface ViewMemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
}

const ViewMemoriesModal: React.FC<ViewMemoriesModalProps> = ({
  isOpen,
  onClose,
  location,
}) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && location) {
      loadMemories();
    }
  }, [isOpen, location]);

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      // Only get memories for the current user (private memories)
      const response = await apiClient.getLocationMemories(location.uuid, { 
        page: 1, 
        limit: 100, 
        is_public: false 
      });
      if (response.success && response.data) {
        setMemories(response.data);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Kỷ niệm tại địa điểm</h2>
              <p className="text-gray-300 text-sm mt-1">{location.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Đang tải kỷ niệm...</p>
              </div>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-300 text-lg font-medium mb-2">Chưa có kỷ niệm nào</p>
              <p className="text-gray-400 text-sm">Tạo kỷ niệm đầu tiên tại địa điểm này!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {memories.map((memory) => (
                <div key={memory.uuid} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{memory.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(memory.visit_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none mb-4">
                    <div 
                      className="text-gray-300"
                      dangerouslySetInnerHTML={{ __html: memory.content }}
                    />
                  </div>

                  {/* Media Display */}
                  {memory.media && memory.media.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {memory.media.map((media) => (
                          <div key={media.uuid} className="relative group">
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
                              {media.media_type === 'image' ? <Image className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      {memory.tags && memory.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-4 h-4" />
                          <span>{memory.tags.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{memory.like_count} lượt thích</span>
                      </div>
                    </div>
                    <span className="text-xs">
                      {new Date(memory.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMemoriesModal; 