'use client';

import React from 'react';
import { UserShopItem } from '@/types/api';

interface CustomMarkerProps {
  userShopItem?: UserShopItem;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ 
  userShopItem, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  if (!userShopItem) {
    // Default marker
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ${className}`}>
        <svg className="w-1/2 h-1/2 text-white fill-current" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src={userShopItem.shop_item.image_url}
        alt={userShopItem.shop_item.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs hidden`}>
        {userShopItem.shop_item.name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
};

export default CustomMarker; 