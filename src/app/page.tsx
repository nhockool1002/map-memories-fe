'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/layout/Navigation';
import { Location, Memory, UserShopItem } from '@/types/api';
import apiClient from '@/lib/api';
import { Plus, Heart, AlertTriangle, Info } from 'lucide-react';
import MemoryModal from '@/components/memories/MemoryModal';
import ViewMemoriesModal from '@/components/memories/ViewMemoriesModal';
import CustomMarker from '@/components/map/CustomMarker';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function HomePage() {
  const { isAuthenticated, isLoading, user, userItems } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [viewState, setViewState] = useState({
    longitude: 106.6297, // Hồ Chí Minh City
    latitude: 10.8231,
    zoom: 6
  });
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showViewMemoriesModal, setShowViewMemoriesModal] = useState(false);
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locationsLoaded, setLocationsLoaded] = useState(false);

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const loadLocations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await apiClient.getLocations();
      if (response.success && response.data) {
        // Filter locations that have memories for the current user
        const userLocations = response.data.filter(location => location.memory_count > 0);
        setLocations(userLocations);
        setLocationsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  }, [isAuthenticated]);

  const loadMemories = useCallback(async () => {
    try {
      console.log('Loading memories...');
      const response = await apiClient.getMemories({ limit: 100 });
      console.log('Memories API response:', response);
      if (response.success && response.data) {
        console.log('Setting memories:', response.data);
        setMemories(response.data);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  }, [isAuthenticated]);

  const getUserItemForMemory = useCallback((memory: Memory) => {
    // Check if memory has marker_item_id first
    if (memory.marker_item_id) {
      console.log('Memory has marker_item_id:', memory.marker_item_id);
      const userShopItem = userItems.find(item => item.id === memory.marker_item_id);
      console.log('Looking for marker_item_id in memory:', memory.marker_item_id, 'Found:', userShopItem);
      return userShopItem || undefined;
    }
    
    // If memory doesn't have marker_item_id, check location
    if (memory.location && memory.location.marker_item_id) {
      console.log('Location has marker_item_id:', memory.location.marker_item_id);
      const userShopItem = userItems.find(item => item.id === memory.location.marker_item_id);
      console.log('Looking for marker_item_id in location:', memory.location.marker_item_id, 'Found:', userShopItem);
      return userShopItem || undefined;
    }
    
    console.log('Neither memory nor location has marker_item_id:', memory.uuid);
    return undefined;
  }, [userItems]);

  // Debug logging
  console.log('HomePage - userItems:', userItems);
  console.log('HomePage - memories:', memories);
  console.log('HomePage - memories with marker_item_id:', memories.filter(m => m.marker_item_id));

  useEffect(() => {
    if (!isLoading && !locationsLoaded && isAuthenticated) {
      loadLocations();
      loadMemories();
    }
  }, [isLoading, locationsLoaded, isAuthenticated, loadLocations, loadMemories]);

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
    console.log('Memory created, reloading data...');
    setShowMemoryModal(false);
    setTempMarker(null);
    
    // Force reload all data
    setLocationsLoaded(false);
    setMemories([]); // Clear memories to force reload
    setLocations([]); // Clear locations to force reload
    
    // Reload data after a short delay to ensure backend has processed
    setTimeout(() => {
      console.log('Reloading locations and memories...');
      loadLocations();
      loadMemories();
    }, 500);
    
    // Note: userItems will be reloaded automatically by useAuth hook
  }, [loadLocations, loadMemories]);

  const handleMemoryDeleted = useCallback(() => {
    console.log('Memory deleted, clearing map state...');
    setShowViewMemoriesModal(false);
    setSelectedLocation(null);
    
    // Clear locations ngay lập tức để markers biến mất
    setLocations([]);
    setLocationsLoaded(false);
    
    // Không reload ngay lập tức để tránh load lại location đã bị xóa
    // User có thể tự reload bằng cách click vào marker khác
    console.log('Map state cleared, no immediate reload');
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
          {locations.map((location) => {
            const userShopItem = userItems.find(item => item.id === location.marker_item_id);
            console.log('Rendering location marker:', {
              locationId: location.id,
              locationUuid: location.uuid,
              markerItemId: location.marker_item_id,
              userShopItem: userShopItem,
              userShopItemName: userShopItem?.shop_item.name
            });
            return (
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
                <div className="relative cursor-pointer hover:scale-110 transition-transform">
                  <CustomMarker userShopItem={userShopItem} size="sm" />
                </div>
              </Marker>
            );
          })}

          {/* Memory Markers with Custom Markers */}
          {memories.map((memory) => {
            const userShopItem = getUserItemForMemory(memory);
            console.log('Rendering memory marker:', {
              memoryId: memory.id,
              memoryUuid: memory.uuid,
              markerItemId: memory.marker_item_id,
              userShopItem: userShopItem,
              userShopItemName: userShopItem?.shop_item.name
            });
            return (
              <Marker
                key={`memory-${memory.uuid}`}
                longitude={memory.location.longitude}
                latitude={memory.location.latitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(memory.location);
                }}
              >
                <div className="relative cursor-pointer hover:scale-110 transition-transform">
                  <CustomMarker userShopItem={userShopItem} size="sm" />
                </div>
              </Marker>
            );
          })}

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

      {/* View Memories Modal */}
      {showViewMemoriesModal && selectedLocation && (
        <ViewMemoriesModal
          isOpen={showViewMemoriesModal}
          onClose={() => setShowViewMemoriesModal(false)}
          location={selectedLocation}
          onMemoryDeleted={handleMemoryDeleted}
        />
      )}
    </div>
  );
}