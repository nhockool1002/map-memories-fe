'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface MapContainerProps {
  children?: React.ReactNode;
  className?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({ children, className = '' }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`relative bg-gray-100 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Đang tải bản đồ..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

export default MapContainer;