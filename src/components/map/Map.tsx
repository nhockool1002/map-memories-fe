'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Location, Memory } from '@/types/api';
import MapContainer from './MapContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Dynamic import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <LoadingSpinner size="lg" text="Đang tải bản đồ..." />
    </div>
  ),
});

interface MapProps {
  locations?: Location[];
  memories?: Memory[];
  center?: [number, number];
  zoom?: number;
  onLocationClick?: (location: Location) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onAddMemory?: (location: Location) => void;
  newLocationMarker?: { lat: number; lng: number } | null;
  className?: string;
  height?: string;
}

const Map: React.FC<MapProps> = ({
  locations = [],
  memories = [],
  center,
  zoom,
  onLocationClick,
  onMapClick,
  onAddMemory,
  newLocationMarker,
  className = '',
  height = 'h-96',
}) => {
  return (
    <MapContainer className={`${height} ${className}`}>
      <LeafletMap
        locations={locations}
        memories={memories}
        center={center}
        zoom={zoom}
        onLocationClick={onLocationClick}
        onMapClick={onMapClick}
        onAddMemory={onAddMemory}
        newLocationMarker={newLocationMarker}
      />
    </MapContainer>
  );
};

export default Map;