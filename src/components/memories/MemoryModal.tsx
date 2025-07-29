'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, MapPin, Calendar, Heart, Upload, Image, Video, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api';
import { Memory, Media } from '@/types/api';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="w-full h-32 bg-gray-100 rounded animate-pulse"></div>
});

import 'react-quill/dist/quill.snow.css';

// Interface for uploaded media before API upload
interface UploadedMediaItem {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const memorySchema = z.object({
  location_name: z.string().min(1, 'Tên địa điểm là bắt buộc'),
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  visit_date: z.string().optional(),
  is_public: z.boolean().default(false),
  tags: z.string().optional(),
});

type MemoryFormData = z.infer<typeof memorySchema>;

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { lat: number; lng: number };
  onMemoryCreated: (memory: Memory) => void;
}

const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  location,
  onMemoryCreated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaItem[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MemoryFormData>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      location_name: `Địa điểm tại ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      is_public: false,
      visit_date: new Date().toISOString().split('T')[0],
      content: '',
    },
  });

  const content = watch('content');

  // Generate location name suggestions based on coordinates
  const getLocationSuggestions = () => {
    const suggestions = [
      `Địa điểm tại ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      `Vị trí ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      `Điểm đến ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
    ];
    return suggestions;
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const validVideoTypes = ['video/mp4', 'video/avi', 'video/mov'];
        
        if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
          throw new Error(`Loại file không được hỗ trợ: ${file.type}`);
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File quá lớn: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        // For now, we'll store the file to upload later when memory is created
        return {
          file,
          preview: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' as const : 'video' as const
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setUploadedMedia(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Error preparing files:', error);
    } finally {
      setUploadingMedia(false);
    }
  }, []);

  // Remove uploaded media
  const removeMedia = useCallback((index: number) => {
    setUploadedMedia(prev => {
      const newMedia = [...prev];
      URL.revokeObjectURL(newMedia[index].preview);
      newMedia.splice(index, 1);
      return newMedia;
    });
  }, []);

  // Upload media after memory is created
  const uploadMediaForMemory = useCallback(async (memoryId: number) => {
    if (uploadedMedia.length === 0) return;

    setUploadingMedia(true);
    try {
      const uploadPromises = uploadedMedia.map(async (media, index) => {
        const response = await apiClient.uploadMedia(memoryId, media.file, index);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(`Failed to upload ${media.file.name}`);
      });

      const uploadedMediaData = await Promise.all(uploadPromises);
      console.log('Media uploaded successfully:', uploadedMediaData);
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setUploadingMedia(false);
    }
  }, [uploadedMedia]);

  const onSubmit = async (data: MemoryFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Creating location with data:', {
        name: data.location_name,
        latitude: location.lat,
        longitude: location.lng,
        description: 'Địa điểm được tạo tự động',
      });

      // First, create or find location
      const locationResponse = await apiClient.createLocation({
        name: data.location_name,
        latitude: location.lat,
        longitude: location.lng,
        description: 'Địa điểm được tạo tự động',
      });

      console.log('Location response:', locationResponse);

      if (locationResponse.success && locationResponse.data) {
        console.log('Creating memory with data:', {
          title: data.title,
          content: data.content,
          location_id: locationResponse.data.id,
          visit_date: data.visit_date,
          is_public: data.is_public,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        });

        // Create memory
        const memoryResponse = await apiClient.createMemory({
          title: data.title,
          content: data.content,
          location_id: locationResponse.data.id,
          visit_date: data.visit_date,
          is_public: data.is_public,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        });

        console.log('Memory response:', memoryResponse);

        if (memoryResponse.success && memoryResponse.data) {
          console.log('Memory created successfully:', memoryResponse.data);
          
          // Upload media files
          if (uploadedMedia.length > 0) {
            await uploadMediaForMemory(memoryResponse.data.id);
          }
          
          onMemoryCreated(memoryResponse.data);
          reset();
          setUploadedMedia([]); // Clear uploaded media
          onClose(); // Close the modal
        } else {
          console.error('Memory creation failed:', memoryResponse);
        }
      } else {
        console.error('Location creation failed:', locationResponse);
      }
    } catch (error) {
      console.error('Error creating memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Tạo kỷ niệm mới</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center text-sm text-gray-700 mb-2">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              <span className="font-medium">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Điền thông tin địa điểm và kỷ niệm của bạn tại vị trí này
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                {...register('location_name')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                placeholder="Nhập tên địa điểm..."
              />
              {errors.location_name && (
                <p className="text-red-500 text-sm mt-1">{errors.location_name.message}</p>
              )}
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">Gợi ý:</p>
                <div className="flex flex-wrap gap-2">
                  {getLocationSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const event = { target: { value: suggestion } };
                        register('location_name').onChange(event);
                      }}
                      className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full border border-blue-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500"
                placeholder="Tiêu đề kỷ niệm"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-colors overflow-hidden">
                <ReactQuill
                  value={content}
                  onChange={(value) => setValue('content', value)}
                  placeholder="Viết kỷ niệm của bạn..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'color': [] }, { 'background': [] }],
                      ['link', 'blockquote'],
                      ['clean']
                    ],
                  }}
                  formats={[
                    'header', 'bold', 'italic', 'underline', 'strike',
                    'list', 'bullet', 'color', 'background', 'link', 'blockquote'
                  ]}
                  style={{ height: '200px' }}
                />
              </div>
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>

            {/* Visit Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày ghé thăm
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('visit_date')}
                  type="date"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900"
                />
              </div>
            </div>

            {/* Media Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Hình ảnh & Video
              </label>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 hover:bg-pink-50 transition-all duration-200">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="media-upload"
                  disabled={uploadingMedia}
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">
                    {uploadingMedia ? 'Đang tải lên...' : 'Click để chọn file hoặc kéo thả vào đây'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Hỗ trợ: JPEG, PNG, GIF, MP4, AVI, MOV (tối đa 50MB)
                  </p>
                </label>
              </div>

              {/* Uploaded Media Preview */}
              {uploadedMedia.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Đã chọn ({uploadedMedia.length}):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {uploadedMedia.map((media, index) => (
                      <div key={index} className="relative group">
                        {media.type === 'image' ? (
                          <img
                            src={media.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-28 object-cover rounded-lg shadow-md"
                          />
                        ) : (
                          <video
                            src={media.preview}
                            className="w-full h-28 object-cover rounded-lg shadow-md"
                            muted
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                          {media.type === 'image' ? <Image className="w-3 h-3 inline mr-1" /> : <Video className="w-3 h-3 inline mr-1" />}
                          {media.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tags - Moved to bottom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags (phân cách bằng dấu phẩy)
              </label>
              <input
                {...register('tags')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-500"
                placeholder="du lịch, ẩm thực, văn hóa..."
              />
            </div>

            <div className="flex space-x-4 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || uploadingMedia}
                className="flex-1"
              >
                {isLoading ? 'Đang tạo...' : 'Tạo kỷ niệm'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemoryModal; 