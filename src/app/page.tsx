'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/layout/Navigation';
import { Location } from '@/types/api';
import apiClient from '@/lib/api';
import { Plus, Heart, AlertTriangle, Info } from 'lucide-react';
import MemoryModal from '@/components/memories/MemoryModal';
import ViewMemoriesModal from '@/components/memories/ViewMemoriesModal';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [viewState, setViewState] = useState({
    longitude: 106.6297, // Hồ Chí Minh City
    latitude: 10.8231,
    zoom: 10
  });
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showViewMemoriesModal, setShowViewMemoriesModal] = useState(false);
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    console.log('HomePage mounted');
    console.log('Auth state:', { isAuthenticated, isLoading });
    console.log('User:', user);
    console.log('API authenticated:', apiClient.isAuthenticated());
    console.log('Current user from API:', apiClient.getCurrentUser());
    loadLocations();
  }, [isAuthenticated, isLoading, user]);

  const loadLocations = async () => {
    try {
      const response = await apiClient.getLocations();
      if (response.success && response.data) {
        // Filter locations that have memories for the current user
        const userLocations = response.data.filter(location => location.memory_count > 0);
        setLocations(userLocations);
        console.log('User locations loaded:', userLocations);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleMapClick = useCallback((event: any) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để tạo kỷ niệm');
      return;
    }

    const { lng, lat } = event.lngLat;
    setClickedLocation({ lng, lat });
    setTempMarker({ lng, lat });
    setShowMemoryModal(true);
  }, [isAuthenticated]);

  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    setShowViewMemoriesModal(true);
  }, []);

  const handleMemoryCreated = useCallback(() => {
    setShowMemoryModal(false);
    setClickedLocation(null);
    setTempMarker(null);
    loadLocations(); // Reload locations to show new markers
  }, []);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    setMapError(null);
  }, []);

  const handleMapError = useCallback((e: any) => {
    setMapLoaded(false);
    setMapError(e.error?.message || 'Lỗi tải bản đồ');
  }, []);

  return (
    <div className="relative h-screen bg-white">
      {/* Header */}
      <Navigation />

      {/* Map Container */}
      <div className="relative h-[calc(100vh-64px)] bg-white">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          onError={handleMapError}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={mapboxAccessToken}
        >
          {/* Navigation Controls */}
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-left" />

          {/* Existing Location Markers */}
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
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
                {location.memory_count > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white">
                    {location.memory_count}
                  </div>
                )}
              </div>
            </Marker>
          ))}

          {/* Temporary Marker for New Memory */}
          {tempMarker && (
            <Marker
              longitude={tempMarker.lng}
              latitude={tempMarker.lat}
              anchor="bottom"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </Marker>
          )}
        </Map>

        {/* Loading Overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg font-medium">Đang tải bản đồ...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {mapError && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-700 text-lg font-medium mb-2">Lỗi tải bản đồ</p>
              <p className="text-gray-500 text-sm">{mapError}</p>
            </div>
          </div>
        )}

        {/* Instructions for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200 rounded-xl px-6 py-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-gray-700 font-medium">Đăng nhập để tạo kỷ niệm</p>
                <p className="text-gray-500 text-sm">Click vào bản đồ để thêm kỷ niệm mới</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showMemoryModal && tempMarker && (
        <MemoryModal
          isOpen={showMemoryModal}
          onClose={() => {
            setShowMemoryModal(false);
            setTempMarker(null);
          }}
          location={tempMarker}
          onMemoryCreated={handleMemoryCreated}
        />
      )}

      {showViewMemoriesModal && selectedLocation && (
        <ViewMemoriesModal
          isOpen={showViewMemoriesModal}
          onClose={() => {
            setShowViewMemoriesModal(false);
            setSelectedLocation(null);
          }}
          location={selectedLocation}
        />
      )}
    </div>
  );
}