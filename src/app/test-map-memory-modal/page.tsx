'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/layout/Navigation';
import Map from '@/components/map/Map';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Location, Memory } from '@/types/api';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function TestMapMemoryModalPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  // Load test data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load locations
        const locationsResponse = await apiClient.getLocations({ limit: 10 });
        if (locationsResponse.success && locationsResponse.data) {
          setLocations(locationsResponse.data);
        }

        // Load memories
        const memoriesResponse = await apiClient.getMemories({ limit: 10 });
        if (memoriesResponse.success && memoriesResponse.data) {
          setMemories(memoriesResponse.data);
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLocationClick = (location: Location) => {
    console.log('Location clicked:', location);
    toast.success(`Đã click vào địa điểm: ${location.name}`);
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked:', { lat, lng });
    toast.success(`Đã click vào bản đồ tại: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const handleAddMemory = (location: Location) => {
    console.log('Add memory for location:', location);
    toast.success(`Mở form tạo kỷ niệm cho: ${location.name}`);
  };

  const handleMemoryUpdated = (memory: Memory) => {
    console.log('Memory updated:', memory);
    toast.success(`Kỷ niệm đã được cập nhật: ${memory.title}`);
    
    // Refresh memories list
    const loadMemories = async () => {
      try {
        const response = await apiClient.getMemories({ limit: 10 });
        if (response.success && response.data) {
          setMemories(response.data);
        }
      } catch (error) {
        console.error('Error refreshing memories:', error);
      }
    };
    loadMemories();
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Map Memory Modal</h1>
          <p className="text-gray-600">
            Click vào marker trên bản đồ để mở popup và form tạo/chỉnh sửa kỷ niệm
          </p>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
            <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <Map
              locations={locations}
              memories={memories}
              center={[21.0285, 105.8542]} // Hanoi
              zoom={10}
              height="h-96"
              onLocationClick={handleLocationClick}
              onMapClick={handleMapClick}
              onAddMemory={handleAddMemory}
              onMemoryUpdated={handleMemoryUpdated}
            />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hướng dẫn sử dụng</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Click vào marker xanh để mở popup với thông tin địa điểm</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Click "Thêm kỷ niệm" để mở form tạo kỷ niệm mới</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Click "Chỉnh sửa" để mở form chỉnh sửa kỷ niệm hiện có</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Click vào bản đồ để tạo marker mới và mở form</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thống kê</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Địa điểm:</span>
                <span className="font-semibold">{locations.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Kỷ niệm:</span>
                <span className="font-semibold">{memories.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Marker tổng cộng:</span>
                <span className="font-semibold">{locations.length + memories.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 