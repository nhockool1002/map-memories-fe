'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Plus, Heart } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, Memory } from '@/types/api';
import MemoryModal from '@/components/memories/MemoryModal';
import ViewMemoriesModal from '@/components/memories/ViewMemoriesModal';
import { useAuth } from '@/hooks/useAuth';

// Dynamic import to avoid SSR issues
const Map = dynamic(() => import('react-map-gl').then(mod => ({ default: mod.Map })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">Đang tải bản đồ...</div>
});

const NavigationControl = dynamic(() => import('react-map-gl').then(mod => ({ default: mod.NavigationControl })), {
  ssr: false
});

const GeolocateControl = dynamic(() => import('react-map-gl').then(mod => ({ default: mod.GeolocateControl })), {
  ssr: false
});

const Marker = dynamic(() => import('react-map-gl').then(mod => ({ default: mod.Marker })), {
  ssr: false
});

interface MapboxMapProps {
  locations?: Location[];
  onLocationClick?: (location: Location) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ locations = [], onLocationClick }) => {
  const [viewState, setViewState] = useState({
    longitude: 105.8342, // Hà Nội
    latitude: 21.0278,
    zoom: 10
  });
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showViewMemoriesModal, setShowViewMemoriesModal] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const mapRef = useRef<any>(null);

  // Initialize map when locations change
  useEffect(() => {
    // Map initialization logic can go here if needed
  }, [locations]);

  useEffect(() => {
    // Map ref is available when map is loaded
  }, [mapLoaded]);

  const handleMapClick = useCallback((event: any) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để tạo kỷ niệm');
      return;
    }

    const { lng, lat } = event.lngLat;
    setClickedLocation({ lng, lat });
    setShowMemoryModal(true);
  }, [isAuthenticated]);

  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    setShowViewMemoriesModal(true);
  }, []);

  const handleMemoryCreated = useCallback(() => {
    setShowMemoryModal(false);
    setClickedLocation(null);
    // Refresh locations if needed
    if (onLocationClick && selectedLocation) {
      onLocationClick(selectedLocation);
    }
  }, [onLocationClick, selectedLocation]);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    setMapError(null);
  }, []);

  const handleMapError = useCallback((e: any) => {
    console.error('Mapbox error:', e);
    setMapLoaded(false);
    setMapError('Không thể tải bản đồ');
  }, []);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
      {/* Loading State */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải bản đồ...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải bản đồ</h3>
            <p className="text-red-600 mb-4">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="w-full h-full" style={{ position: 'relative' }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          onError={handleMapError}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibmhvY2tvb2wxMDAyIiwiYSI6ImNtZG9zeXJiNjA1c2oya243cHpxY2FkYjUifQ.5hIXQrIc4Tgzp8Zkusf50Q'}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        >
          {/* Navigation Controls */}
          <NavigationControl position="top-right" />
          <GeolocateControl 
            position="top-left"
            trackUserLocation={true}
            showUserHeading={true}
          />

          {/* Location Markers */}
          {locations.map((location) => (
            <Marker
              key={location.uuid}
              longitude={location.longitude}
              latitude={location.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(location);
              }}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4 text-white fill-current" />
                </div>
                {location.memory_count > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {location.memory_count}
                  </div>
                )}
              </div>
            </Marker>
          ))}

          {/* Clicked Location Marker */}
          {clickedLocation && (
            <Marker
              longitude={clickedLocation.lng}
              latitude={clickedLocation.lat}
              anchor="bottom"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* Instructions for non-authenticated users */}
      {!isAuthenticated && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg z-10">
          <p className="text-sm text-gray-700">
            Đăng nhập để tạo kỷ niệm mới
          </p>
        </div>
      )}

      {/* Memory Creation Modal */}
      {showMemoryModal && clickedLocation && (
        <MemoryModal
          isOpen={showMemoryModal}
          onClose={() => {
            setShowMemoryModal(false);
            setClickedLocation(null);
          }}
          location={clickedLocation}
          onMemoryCreated={handleMemoryCreated}
        />
      )}

      {/* View Memories Modal */}
      {showViewMemoriesModal && selectedLocation && (
        <ViewMemoriesModal
          isOpen={showViewMemoriesModal}
          onClose={() => setShowViewMemoriesModal(false)}
          location={selectedLocation}
        />
      )}
    </div>
  );
};

export default MapboxMap; 