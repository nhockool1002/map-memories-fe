'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Upload, 
  X, 
  Tag, 
  Plus,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Memory, Location, Media, UserShopItem } from '@/types/api';
import apiClient from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';
import { format } from 'date-fns';

// Dynamic import for RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Đang tải editor...</div>
    </div>
  ),
});

const memorySchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề quá dài'),
  location_id: z.number().optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
  visit_date: z.string().min(1, 'Vui lòng chọn ngày ghé thăm'),
  tags: z.array(z.string()).default([]),
  is_public: z.boolean().default(false),
  marker_item_id: z.number().optional(),
});

type MemoryFormData = z.infer<typeof memorySchema>;

interface MemoryFormProps {
  memory?: Memory;
  onSuccess?: (memory: Memory) => void;
  onCancel?: () => void;
  preselectedLocation?: Location;
  className?: string;
}

const MemoryForm: React.FC<MemoryFormProps> = ({
  memory,
  onSuccess,
  onCancel,
  preselectedLocation,
  className = '',
}) => {
  const { userItems } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<UserShopItem | null>(null);

  const isEditing = !!memory;

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<MemoryFormData>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: memory?.title || '',
      content: memory?.content || '',
      location_id: memory?.location?.id || undefined, // Only set if editing existing memory
      visit_date: memory?.visit_date || format(new Date(), 'yyyy-MM-dd'),
      is_public: memory?.is_public ?? false,
      tags: memory?.tags || [],
      marker_item_id: undefined,
    },
  });

  const watchedTags = watch('tags');
  const watchedIsPublic = watch('is_public');

  // Filter user items that can be used as markers
  const markerItems = userItems.filter(item => item.shop_item && item.shop_item.image_base64);

  // Set default marker selection
  useEffect(() => {
    // If editing and memory has marker_item_id, find and select that marker
    if (memory?.marker_item_id) {
      const markerItem = userItems.find(item => item.id === memory.marker_item_id);
      if (markerItem) {
        setSelectedMarker(markerItem);
      }
    } else {
      // Default to null (default marker) for new memories
      setSelectedMarker(null);
    }
  }, [memory?.marker_item_id, userItems]);

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoadingLocations(true);
        const response = await apiClient.getLocations({ limit: 100 });
        if (response.success && response.data) {
          setLocations(response.data);
          
          // Set preselected location if provided
          if (preselectedLocation && !memory) {
            setValue('location_id', preselectedLocation.id);
          }
        }
      } catch (error) {
        toast.error('Không thể tải danh sách địa điểm');
      } finally {
        setLoadingLocations(false);
      }
    };

    loadLocations();
  }, [preselectedLocation?.id, memory?.id, setValue]);

  // Auto-create location from coordinates if preselectedLocation is provided
  useEffect(() => {
    if (preselectedLocation && preselectedLocation.latitude && preselectedLocation.longitude) {
      // Create a temporary location object for display
      const tempLocation: Location = {
        id: -1, // Temporary ID
        uuid: '',
        name: `Địa điểm tại ${preselectedLocation.latitude.toFixed(4)}, ${preselectedLocation.longitude.toFixed(4)}`,
        description: `Vị trí được chọn tại tọa độ ${preselectedLocation.latitude.toFixed(4)}, ${preselectedLocation.longitude.toFixed(4)}`,
        latitude: preselectedLocation.latitude,
        longitude: preselectedLocation.longitude,
        address: '',
        country: 'Việt Nam', // Default country
        city: 'Hà Nội', // Default city - will be updated by reverse geocoding
        memory_count: 0,
        created_at: '',
        updated_at: '',
      };
      
      // Add to locations list if not already present
      if (!locations.find(loc => 
        loc.latitude === preselectedLocation.latitude && 
        loc.longitude === preselectedLocation.longitude
      )) {
        setLocations(prev => [tempLocation, ...prev]);
      }
      
      // Set as selected location
      setValue('location_id', tempLocation.id);
    }
  }, [preselectedLocation, setValue]);

  // Load existing media for editing
  useEffect(() => {
    if (memory) {
      const loadMedia = async () => {
        try {
          const response = await apiClient.getMemoryMedia(memory.uuid);
          if (response.success && response.data) {
            setUploadedMedia(response.data);
          }
        } catch (error) {
          // Silent error handling
        }
      };
      loadMedia();
    }
  }, [memory]);

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !watchedTags.includes(trimmedTag)) {
      setValue('tags', [...watchedTags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = watchedTags.filter((_, i) => i !== index);
    setValue('tags', newTags);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.size <= 50 * 1024 * 1024; // 50MB
      if (!isValid) {
        toast.error(`File ${file.name} quá lớn (tối đa 50MB)`);
      }
      return isValid;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (memoryId: number) => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = selectedFiles.map((file, index) =>
        apiClient.uploadMedia(memoryId, file, index)
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results
        .filter(result => result.success)
        .map(result => result.data!);

      setUploadedMedia(prev => [...prev, ...successfulUploads]);
      setSelectedFiles([]);
      
      toast.success(`Đã tải lên ${successfulUploads.length} file`);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải file');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: MemoryFormData) => {
    try {
      let result;
      
      // Prepare request data
      const requestData: any = {
        ...data,
        marker_item_id: selectedMarker?.id,
      };

      // If we have preselectedLocation, create location first
      if (preselectedLocation) {
        try {
          // Create location first with marker_item_id
          const locationData = {
            name: `Địa điểm tại ${preselectedLocation.latitude.toFixed(4)}, ${preselectedLocation.longitude.toFixed(4)}`,
            description: `Vị trí được chọn tại tọa độ ${preselectedLocation.latitude.toFixed(4)}, ${preselectedLocation.longitude.toFixed(4)}`,
            latitude: preselectedLocation.latitude,
            longitude: preselectedLocation.longitude,
            country: preselectedLocation.country,
            city: preselectedLocation.city,
            marker_item_id: selectedMarker?.id, // Add marker_item_id to location request
          };

          const locationResult = await apiClient.createLocation(locationData);
          
          if (locationResult.success && locationResult.data) {
            // Use the created location's ID
            requestData.location_id = locationResult.data.id;
          } else {
            throw new Error('Không thể tạo địa điểm');
          }
        } catch (error) {
          toast.error('Không thể tạo địa điểm. Vui lòng thử lại.');
          return;
        }
      } else {
        // If no preselectedLocation, we need a location_id
        if (!data.location_id) {
          toast.error('Vui lòng chọn địa điểm hoặc click trên bản đồ để tạo địa điểm mới.');
          return;
        }
        requestData.location_id = data.location_id;
      }
      
      if (isEditing && memory) {
        // Update existing memory
        const updateData = {
          title: data.title,
          content: data.content,
          visit_date: data.visit_date,
          is_public: data.is_public,
          tags: data.tags,
          marker_item_id: selectedMarker?.id,
        };
        result = await apiClient.updateMemory(memory.uuid, updateData);
      } else {
        // Create new memory (without marker_item_id)
        delete requestData.marker_item_id; // Remove marker_item_id from memory request
        result = await apiClient.createMemory(requestData);
      }

      if (result.success && result.data) {
        // Upload files if any
        if (selectedFiles.length > 0) {
          await uploadFiles(result.data.id);
        }

        toast.success(isEditing ? 'Cập nhật kỷ niệm thành công!' : 'Tạo kỷ niệm thành công!');
        onSuccess?.(result.data);
      }
    } catch (error) {
      toast.error(isEditing ? 'Không thể cập nhật kỷ niệm' : 'Không thể tạo kỷ niệm');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className={`w-full ${className}`}
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          {isEditing ? 'Chỉnh sửa kỷ niệm' : 'Tạo kỷ niệm mới'}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? 'Cập nhật thông tin kỷ niệm của bạn'
            : 'Lưu giữ những khoảnh khắc đáng nhớ của bạn'
          }
        </p>
        
        {/* Coordinates Display */}
        {preselectedLocation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Tọa độ đã chọn:</span>
            </div>
            <div className="mt-2 text-sm text-blue-700">
              <div>Vĩ độ: <span className="font-mono font-semibold">{preselectedLocation.latitude.toFixed(6)}</span></div>
              <div>Kinh độ: <span className="font-mono font-semibold">{preselectedLocation.longitude.toFixed(6)}</span></div>
            </div>
          </div>
        )}
      </motion.div>

      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        {/* Title */}
        <div>
          <label className="form-label">Tiêu đề kỷ niệm</label>
          <input
            {...register('title')}
            type="text"
            className={`form-input ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
            placeholder="Nhập tiêu đề cho kỷ niệm..."
          />
          {errors.title && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error"
            >
              {errors.title.message}
            </motion.p>
          )}
        </div>

        {/* Marker Selection */}
        {markerItems.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <label className="form-label text-lg font-semibold text-gray-800">🎯 Chọn marker cho địa điểm</label>
            <div className="space-y-3">
              {/* Default marker option */}
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <input
                  type="radio"
                  name="marker-selection"
                  id="default-marker"
                  checked={selectedMarker === null}
                  onChange={() => setSelectedMarker(null)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="default-marker" className="flex items-center space-x-3 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Marker mặc định</p>
                    <p className="text-xs text-gray-500">Marker màu xanh với icon vị trí</p>
                  </div>
                </label>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {markerItems.map((userItem) => (
                  <div
                    key={userItem.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105 ${
                      selectedMarker?.id === userItem.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      // Only allow selecting one marker at a time
                      setSelectedMarker(userItem);
                    }}
                  >
                    <input
                      type="radio"
                      name="marker-selection"
                      id={`marker-${userItem.id}`}
                      checked={selectedMarker?.id === userItem.id}
                      onChange={() => setSelectedMarker(userItem)}
                      className="sr-only"
                    />
                    <label htmlFor={`marker-${userItem.id}`} className="cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 flex items-center justify-center">
                          {userItem.shop_item.image_base64 ? (
                            <img
                              src={userItem.shop_item.image_base64}
                              alt={userItem.shop_item.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs ${userItem.shop_item.image_base64 ? 'hidden' : ''}`}>
                            {userItem.shop_item.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {userItem.shop_item.name}
                          </p>
                        </div>
                      </div>
                    </label>
                    {selectedMarker?.id === userItem.id && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {selectedMarker && (
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {selectedMarker.shop_item.image_base64 ? (
                        <img
                          src={selectedMarker.shop_item.image_base64}
                          alt={selectedMarker.shop_item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          {selectedMarker.shop_item.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Marker đã chọn: {selectedMarker.shop_item.name}
                      </p>
                      {selectedMarker.shop_item.description && (
                        <p className="text-xs text-gray-500">
                          {selectedMarker.shop_item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMarker(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {selectedMarker === null && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Sử dụng marker mặc định
                      </p>
                      <p className="text-xs text-gray-500">
                        Marker màu xanh với icon vị trí
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Chọn marker để hiển thị trên bản đồ. Nếu không chọn, sẽ sử dụng marker mặc định.
            </p>
          </div>
        )}

        {/* Visit Date */}
        <div>
          <label className="form-label">Ngày ghé thăm</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              {...register('visit_date')}
              type="date"
              className={`form-input pl-12 pr-4 ${errors.visit_date ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
            />
          </div>
          {errors.visit_date && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error"
            >
              {errors.visit_date.message}
            </motion.p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="form-label">Nội dung kỷ niệm</label>
          <RichTextEditor
            value={watch('content')}
            onChange={(content) => setValue('content', content)}
            placeholder="Chia sẻ câu chuyện, cảm xúc và những điều đặc biệt về chuyến đi của bạn..."
            className={errors.content ? 'border-red-500' : ''}
          />
          {errors.content && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error mt-2"
            >
              {errors.content.message}
            </motion.p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="form-label">Thẻ tag</label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 form-input"
                placeholder="Thêm thẻ tag..."
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <motion.span
                    key={`${tag}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="form-label">Tệp đính kèm</label>
          <div className="space-y-4">
            {/* File Selection */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click để chọn file hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: JPG, PNG, GIF, MP4, MOV (tối đa 50MB/file)
                </p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Files đã chọn:</h4>
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="h-5 w-5 text-blue-500" />
                      ) : file.type.startsWith('video/') ? (
                        <Video className="h-5 w-5 text-red-500" />
                      ) : (
                        <File className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Media */}
            {uploadedMedia.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Files đã tải lên:</h4>
                {uploadedMedia.map((media) => (
                  <div key={media.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {media.media_type === 'image' ? (
                        <ImageIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <Video className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">{media.filename}</p>
                        <p className="text-xs text-gray-500">Đã tải lên thành công</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting || uploading}
          >
            <Save className="h-5 w-5 mr-2" />
            {isEditing ? 'Cập nhật kỷ niệm' : 'Lưu kỷ niệm'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting || uploading}
            >
              Hủy
            </Button>
          )}
        </div>
      </motion.form>
    </motion.div>
  );
};

export default MemoryForm;