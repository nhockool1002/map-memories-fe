'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, Heart, User, Plus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/api';
import { Memory, MemorySearchParams } from '@/types/api';
import { format } from 'date-fns';

export default function MemoriesPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyMemories, setShowMyMemories] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'visit_date' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMemories = async (reset = false) => {
    try {
      if (reset) setLoading(true);
      
      const params: MemorySearchParams = {
        page: reset ? 1 : currentPage,
        limit: 20,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Add user filter if showing only my memories
      if (showMyMemories && isAuthenticated && user) {
        params.user_id = user.id;
      } else {
        // Show only public memories for others
        params.is_public = true;
      }

      const response = await apiClient.getMemories(params);
      
      if (response.success && response.data) {
        if (reset) {
          setMemories(response.data);
          setCurrentPage(1);
        } else {
          setMemories(prev => [...prev, ...response.data!]);
        }
        
        setHasMore(response.pagination?.has_next || false);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  // Load memories on mount and when filters change
  useEffect(() => {
    loadMemories(true);
  }, [searchQuery, showMyMemories, sortBy, sortOrder, isAuthenticated]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
    loadMemories(false);
  };

  const handleMemoryClick = (memory: Memory) => {
    router.push(`/memories/${memory.uuid}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            Kỷ niệm
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá những câu chuyện và khoảnh khắc đáng nhớ
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8 space-y-4"
        >
          {/* Search and Create Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm kỷ niệm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-10 w-full"
              />
            </div>
            {isAuthenticated && (
              <Button
                variant="primary"
                onClick={() => router.push('/memories/create')}
                className="sm:w-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tạo kỷ niệm
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-wrap gap-3">
              {/* My Memories Toggle */}
              {isAuthenticated && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMyMemories}
                    onChange={(e) => setShowMyMemories(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Kỷ niệm của tôi</span>
                </label>
              )}

              {/* Sort Options */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="created_at-desc">Mới nhất</option>
                <option value="created_at-asc">Cũ nhất</option>
                <option value="visit_date-desc">Ngày ghé thăm (mới nhất)</option>
                <option value="visit_date-asc">Ngày ghé thăm (cũ nhất)</option>
                <option value="title-asc">Tên A-Z</option>
                <option value="title-desc">Tên Z-A</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Memories Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Đang tải kỷ niệm..." />
          </div>
        ) : memories.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {memories.map((memory) => (
              <motion.div
                key={memory.id}
                variants={itemVariants}
                className="card card-hover cursor-pointer interactive-scale"
                onClick={() => handleMemoryClick(memory)}
              >
                {/* Memory Image */}
                {memory.media && memory.media.length > 0 && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={apiClient.getMediaFileUrl(memory.media[0].uuid)}
                      alt={memory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 flex-1">
                      {memory.title}
                    </h3>
                    <div className="flex items-center ml-2">
                      {memory.is_public ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {memory.content}
                  </p>

                  {/* Location and Date */}
                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-2" />
                      <span className="truncate">{memory.location.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>{format(new Date(memory.visit_date), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-2" />
                      <span>{memory.user.full_name || memory.user.username}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {memory.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {memory.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{memory.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        <span>{memory.like_count}</span>
                      </div>
                      {memory.media_count > 0 && (
                        <div className="flex items-center">
                          <span>{memory.media_count} media</span>
                        </div>
                      )}
                    </div>
                    <span>{format(new Date(memory.created_at), 'dd/MM')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {showMyMemories ? 'Bạn chưa có kỷ niệm nào' : 'Chưa có kỷ niệm nào'}
            </h3>
            <p className="text-gray-500 mb-6">
              {showMyMemories
                ? 'Hãy tạo kỷ niệm đầu tiên của bạn!'
                : 'Hãy trở lại sau để khám phá những kỷ niệm mới.'
              }
            </p>
            {isAuthenticated && showMyMemories && (
              <Button
                variant="primary"
                onClick={() => router.push('/memories/create')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Tạo kỷ niệm đầu tiên
              </Button>
            )}
          </motion.div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && memories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              disabled={loading}
            >
              Xem thêm kỷ niệm
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}