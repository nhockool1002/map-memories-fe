'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Save, 
  MapPin, 
  Calendar, 
  Image as ImageIcon, 
  X, 
  Plus, 
  Upload,
  Eye,
  EyeOff 
} from 'lucide-react';
import { Location, CreateMemoryRequest, Memory, Media } from '@/types/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';

const memorySchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề là bắt buộc')
    .max(255, 'Tiêu đề không được quá 255 ký tự'),
  content: z
    .string()
    .min(10, 'Nội dung phải có ít nhất 10 ký tự')
    .max(5000, 'Nội dung không được quá 5000 ký tự'),
  location_id: z
    .number()
    .min(1, 'Vui lòng chọn địa điểm'),
  visit_date: z
    .string()
    .min(1, 'Ngày ghé thăm là bắt buộc'),
  is_public: z
    .boolean()
    .default(true),
  tags: z
    .array(z.string())
    .default([]),
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
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);

  const isEditing = !!memory;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<MemoryFormData>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: memory?.title || '',
      content: memory?.content || '',
      location_id: memory?.location.id || preselectedLocation?.id || 0,
      visit_date: memory?.visit_date || format(new Date(), 'yyyy-MM-dd'),
      is_public: memory?.is_public ?? true,
      tags: memory?.tags || [],
    },
  });

  const watchedTags = watch('tags');
  const watchedIsPublic = watch('is_public');

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
        console.error('Error loading locations:', error);
        toast.error('Không thể tải danh sách địa điểm');
      } finally {
        setLoadingLocations(false);
      }
    };

    loadLocations();
  }, [preselectedLocation, memory, setValue]);

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
          console.error('Error loading media:', error);
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
      console.error('Error uploading files:', error);
      toast.error('Có lỗi xảy ra khi tải file');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: MemoryFormData) => {
    try {
      let result;
      
      if (isEditing && memory) {
        // Update existing memory
        const updateData = {
          title: data.title,
          content: data.content,
          visit_date: data.visit_date,
          is_public: data.is_public,
          tags: data.tags,
        };
        result = await apiClient.updateMemory(memory.uuid, updateData);
      } else {
        // Create new memory
        result = await apiClient.createMemory(data);
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
      console.error('Error saving memory:', error);
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

        {/* Location */}
        <div>
          <label className="form-label">Địa điểm</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              {...register('location_id', { valueAsNumber: true })}
              className={`form-input pl-12 ${errors.location_id ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
              disabled={loadingLocations}
            >
              <option value={0}>Chọn địa điểm...</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} - {location.city}, {location.country}
                </option>
              ))}
            </select>
            {loadingLocations && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
          {errors.location_id && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error"
            >
              {errors.location_id.message}
            </motion.p>
          )}
        </div>

        {/* Visit Date */}
        <div>
          <label className="form-label">Ngày ghé thăm</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              {...register('visit_date')}
              type="date"
              className={`form-input pl-12 ${errors.visit_date ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
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
          <textarea
            {...register('content')}
            rows={6}
            className={`form-input resize-none ${errors.content ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
            placeholder="Chia sẻ câu chuyện, cảm xúc và những điều đặc biệt về chuyến đi của bạn..."
          />
          {errors.content && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error"
            >
              {errors.content.message}
            </motion.p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="form-label">Thẻ tag</label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="form-input flex-1"
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
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-primary-500 hover:text-primary-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Privacy Setting */}
        <div>
          <label className="form-label">Quyền riêng tư</label>
          <div className="flex items-center space-x-3">
            <Controller
              name="is_public"
              control={control}
              render={({ field }) => (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Công khai kỷ niệm này</span>
                </label>
              )}
            />
            <div className="text-sm text-gray-500">
              {watchedIsPublic ? (
                <div className="flex items-center text-green-600">
                  <Eye className="h-4 w-4 mr-1" />
                  Mọi người có thể xem
                </div>
              ) : (
                <div className="flex items-center text-gray-600">
                  <EyeOff className="h-4 w-4 mr-1" />
                  Chỉ bạn có thể xem
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="form-label">Hình ảnh & Video</label>
          <div className="space-y-4">
            {/* File Input */}
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
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Kéo thả file hoặc nhấp để chọn</p>
                <p className="text-sm text-gray-500">Hỗ trợ hình ảnh và video (tối đa 50MB/file)</p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">File đã chọn:</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Media */}
            {uploadedMedia.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Media đã tải lên:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {uploadedMedia.map((media) => (
                    <div key={media.id} className="relative group">
                      {media.media_type === 'image' ? (
                        <img
                          src={apiClient.getMediaFileUrl(media.uuid)}
                          alt={media.original_filename}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-sm text-gray-600">Video</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
            loading={isSubmitting || uploading}
            disabled={isSubmitting || uploading}
          >
            <Save className="h-5 w-5 mr-2" />
            {isEditing ? 'Cập nhật kỷ niệm' : 'Lưu kỷ niệm'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onCancel}
              disabled={isSubmitting || uploading}
            >
              Hủy bỏ
            </Button>
          )}
        </div>
      </motion.form>
    </motion.div>
  );
};

export default MemoryForm;