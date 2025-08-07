'use client';

import React from 'react';
import { UserItem } from '@/types/api';
import { Heart, MapPin, Image } from 'lucide-react';

interface UserItemsDisplayProps {
  userItems: UserItem[];
  className?: string;
}

const UserItemsDisplay: React.FC<UserItemsDisplayProps> = ({ userItems, className = '' }) => {
  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'memory':
        return <Heart className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'media':
        return <Image className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'memory':
        return 'Kỷ niệm';
      case 'location':
        return 'Địa điểm';
      case 'media':
        return 'Media';
      default:
        return 'Item';
    }
  };

  if (!userItems || userItems.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-4 ${className}`}>
        <p>Chưa có item nào được lưu</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Items đã lưu</h3>
      <div className="grid gap-3">
        {userItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white">
                {getItemIcon(item.item_type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                {getItemTypeLabel(item.item_type)} • {new Date(item.created_at).toLocaleDateString('vi-VN')}
              </p>
              {item.description && (
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserItemsDisplay; 