'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/layout/Navigation';
import MemoryForm from '@/components/memories/MemoryForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Memory, Location } from '@/types/api';

export default function TestMemoryFormWithLocationPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Test location (Hồ Hoàn Kiếm, Hà Nội)
  const testLocation: Location = {
    id: -1,
    uuid: '',
    name: 'Hồ Hoàn Kiếm',
    description: 'Hồ nước nổi tiếng ở trung tâm Hà Nội',
    latitude: 21.0285,
    longitude: 105.8542,
    address: 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    country: 'Việt Nam',
    city: 'Hà Nội',
    memory_count: 0,
    created_at: '',
    updated_at: '',
  };

  const handleSuccess = (memory: Memory) => {
    console.log('Memory created/updated:', memory);
    alert('Kỷ niệm đã được tạo/cập nhật thành công!');
  };

  const handleCancel = () => {
    console.log('Form cancelled');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600">Bạn cần đăng nhập để sử dụng tính năng này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Memory Form với Location</h1>
          <p className="text-gray-600">Trang test cho MemoryForm với preselected location (Hồ Hoàn Kiếm)</p>
        </div>
        
        <MemoryForm
          preselectedLocation={testLocation}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
} 