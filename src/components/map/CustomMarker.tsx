'use client';

import React from 'react';
import { UserShopItem } from '@/types/api';

interface CustomMarkerProps {
  userShopItem?: UserShopItem;
  imageBase64?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function CustomMarker({ userShopItem, imageBase64, size = 'sm', onClick }: CustomMarkerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  // Use imageBase64 if provided, otherwise use userShopItem
  const imageSrc = imageBase64 || userShopItem?.shop_item.image_base64;

  // Validate base64 string
  const isValidBase64 = (str: string) => {
    if (!str) return false;
    // Check if it starts with data:image
    if (str.startsWith('data:image/')) return true;
    // Check if it's a valid base64 string
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  if (!imageSrc || !isValidBase64(imageSrc)) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
        onClick={onClick}
      >
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-lg`}
      onClick={onClick}
    >
      <img 
        src={imageSrc} 
        alt={userShopItem?.shop_item.name || 'Custom marker'}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Silent error handling
          // Fallback to default marker on error
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="${sizeClasses[size]} bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            `;
          }
        }}
      />
    </div>
  );
} 