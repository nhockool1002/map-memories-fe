'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/layout/Navigation';
import MemoryForm from '@/components/memories/MemoryForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Location, Memory } from '@/types/api';
import apiClient from '@/lib/api';

export default function CreateMemoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [preselectedLocation, setPreselectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);

  // Get location ID from query params
  const locationId = searchParams.get('locationId');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load preselected location if provided
  useEffect(() => {
    if (locationId && isAuthenticated) {
      const loadLocation = async () => {
        try {
          setLoading(true);
          // Find location by ID in the locations list
          const locationsResponse = await apiClient.getLocations({ limit: 100 });
          if (locationsResponse.success && locationsResponse.data) {
            const location = locationsResponse.data.find(loc => loc.id === parseInt(locationId));
            if (location) {
              setPreselectedLocation(location);
            }
          }
        } catch (error) {
          // Silent error handling
        } finally {
          setLoading(false);
        }
      };

      loadLocation();
    }
  }, [locationId]);

  const handleSuccess = (memory: Memory) => {
    // API mới không trả về uuid, sử dụng id thay thế
    if (memory.uuid) {
      router.push(`/memories/${memory.uuid}`);
    } else {
      // Fallback to memories list page
      router.push('/memories');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemoryForm
          preselectedLocation={preselectedLocation || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}