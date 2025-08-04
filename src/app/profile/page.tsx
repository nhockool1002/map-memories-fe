'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, MapPin, Calendar, User, Settings, LogOut, ArrowLeft, Image, Video, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Location, Memory } from '@/types/api';
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import UserItemsDisplay from '@/components/ui/UserItemsDisplay';
import RefreshUserItemsButton from '@/components/ui/RefreshUserItemsButton';

export default function ProfilePage() {
  const { user, logout, isAuthenticated, userItems, refreshUserItems } = useAuth();
  const router = useRouter();
  
  const [memories, setMemories] = useState<Memory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [memoriesResponse, locationsResponse] = await Promise.all([
        apiClient.getMemories({ is_public: false }), // Only get private memories
        apiClient.getLocations(),
      ]);

      if (memoriesResponse.success && memoriesResponse.data) {
        setMemories(memoriesResponse.data);
      }

      if (locationsResponse.success && locationsResponse.data) {
        // Filter locations that have memories for the current user
        const userLocations = locationsResponse.data.filter(location => location.memory_count > 0);
        setLocations(userLocations);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const filteredMemories = memories.filter(memory =>
    memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Hồ sơ cá nhân</h1>
              <p className="text-gray-300">Quản lý kỷ niệm và thông tin cá nhân</p>
            </div>
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về bản đồ</span>
            </Link>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user.full_name || user.username}
                </h2>
                <p className="text-gray-300">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm kỷ niệm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Tổng địa điểm</p>
                <p className="text-2xl font-bold text-white">{locations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Tổng kỷ niệm</p>
                <p className="text-2xl font-bold text-white">{memories.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Kỷ niệm gần đây</p>
                <p className="text-2xl font-bold text-white">
                  {memories.filter(m => {
                    const visitDate = new Date(m.visit_date);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return visitDate >= thirtyDaysAgo;
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Memories List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Kỷ niệm của tôi</h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Đang tải kỷ niệm...</p>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-300 text-lg font-medium mb-2">Chưa có kỷ niệm nào</p>
              <p className="text-gray-400 text-sm">Tạo kỷ niệm đầu tiên trên bản đồ!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredMemories.map((memory) => (
                <div key={memory.uuid} className="p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">{memory.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{memory.location?.name || 'Không xác định'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(memory.visit_date).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
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
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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

        {/* User Items Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Items đã lưu</h2>
            <RefreshUserItemsButton onRefresh={refreshUserItems} />
          </div>
          <UserItemsDisplay userItems={userItems} className="bg-gray-800 rounded-xl border border-gray-700 p-6" />
        </div>
      </div>
    </div>
  );
} 