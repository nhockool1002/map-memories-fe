'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from './Button';

interface RefreshUserItemsButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
}

const RefreshUserItemsButton: React.FC<RefreshUserItemsButtonProps> = ({ 
  onRefresh, 
  className = '' 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing user items:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`flex items-center space-x-2 ${className}`}
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
    </Button>
  );
};

export default RefreshUserItemsButton; 