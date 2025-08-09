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
  const { isAuthenticated, isLoading, user, userItems, locations, memories } = useAuth();
  
  // Load userItems from localStorage directly if useAuth doesn't have them
  const [localUserItems, setLocalUserItems] = useState<UserShopItem[]>([]);
  const [localLocations, setLocalLocations] = useState<Location[]>([]);
  const [localMemories, setLocalMemories] = useState<Memory[]>([]);
  
  // Clear local state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear all local state when user logs out
      setLocalUserItems([]);
      setLocalLocations([]);
      setLocalMemories([]);
      setTempMarker(null);
      setShowMemoryModal(false);
      setShowViewMemoriesModal(false);
      setSelectedLocation(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    if (userItems.length === 0) {
      const storedItems = localStorage.getItem('user_items');
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);
          setLocalUserItems(parsedItems);
        } catch (error) {
          // Silent error handling
        }
      }
    }
    
    // Load locations and memories from localStorage if not available - Only for authenticated users
    if (locations.length === 0) {
      const storedLocations = localStorage.getItem('locations');
      if (storedLocations) {
        try {
          const parsedLocations = JSON.parse(storedLocations);
          setLocalLocations(parsedLocations);
        } catch (error) {
          // Silent error handling
        }
      }
    }
    
    if (memories.length === 0) {
      const storedMemories = localStorage.getItem('memories');
      if (storedMemories) {
        try {
          const parsedMemories = JSON.parse(storedMemories);
          setLocalMemories(parsedMemories);
        } catch (error) {
          // Silent error handling
        }
      }
    }
  }, [isAuthenticated, userItems.length, locations.length, memories.length]);
  
  // Save locations and memories to localStorage when they change - Only for authenticated users
  useEffect(() => {
    if (isAuthenticated && locations.length > 0) {
      localStorage.setItem('locations', JSON.stringify(locations));
    }
  }, [isAuthenticated, locations]);
  
  useEffect(() => {
    if (isAuthenticated && memories.length > 0) {
      localStorage.setItem('memories', JSON.stringify(memories));
    }
  }, [isAuthenticated, memories]);
  
  // Use localUserItems if userItems is empty - Only for authenticated users
  const effectiveUserItems = isAuthenticated ? (userItems.length > 0 ? userItems : localUserItems) : [];
  const effectiveLocations = isAuthenticated ? (locations.length > 0 ? locations : localLocations) : [];
  const effectiveMemories = isAuthenticated ? (memories.length > 0 ? memories : localMemories) : [];
  
  // Create sample data if no data available - Only for authenticated users
  useEffect(() => {
    if (isAuthenticated && effectiveUserItems.length > 0 && effectiveLocations.length === 0 && effectiveMemories.length === 0) {
      // Create sample locations based on userItems
      const sampleLocations: Location[] = effectiveUserItems.map((item, index) => ({
        id: index + 1,
        uuid: `sample-location-${index + 1}`,
        name: `${item.shop_item.name} Location`,
        description: `Sample location for ${item.shop_item.name}`,
        latitude: 21.0367 + (index * 0.01),
        longitude: 105.8344 + (index * 0.01),
        address: `Sample address ${index + 1}`,
        city: 'Hanoi',
        country: 'Vietnam',
        marker_item_id: item.shop_item.id,
        memory_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Create sample memories
      const sampleMemories: Memory[] = effectiveUserItems.map((item, index) => ({
        id: index + 1,
        uuid: `sample-memory-${index + 1}`,
        user: {
          id: 2,
          uuid: 'sample-user',
          username: 'admin',
          email: 'admin@admin.com',
          full_name: 'System Administrator',
          avatar_url: '',
          user_items: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        location: sampleLocations[index],
        title: `Sample Memory for ${item.shop_item.name}`,
        content: `This is a sample memory for ${item.shop_item.name}`,
        visit_date: '2024-01-01',
        is_public: true,
        tags: ['sample', 'test'],
        like_count: 0,
        is_liked_by_user: false,
        is_liked: false,
        media_count: 0,
        marker_item_id: item.shop_item.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      setLocalLocations(sampleLocations);
      setLocalMemories(sampleMemories);
      
      localStorage.setItem('locations', JSON.stringify(sampleLocations));
      localStorage.setItem('memories', JSON.stringify(sampleMemories));
    }
  }, [isAuthenticated, effectiveUserItems.length, effectiveLocations.length, effectiveMemories.length]);
  
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
  const [memoriesLoaded, setMemoriesLoaded] = useState(false);

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxAccessToken) {
    return (
      <div className="relative h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-red-500 text-2xl font-bold mb-4">Lỗi cấu hình</h1>
          <p className="text-gray-700 text-lg">Mapbox token không được cấu hình</p>
        </div>
      </div>
    );
  }

    const loadLocations = useCallback(async () => {
      try {
        const response = await apiClient.getLocations();
        if (response.success && response.data) {
          // Filter locations that have memories for the current user
          const userLocations = response.data.filter(location => location.memory_count > 0);
          // setLocations(userLocations); // This line is removed as locations are now from useAuth
          setLocationsLoaded(true);
        }
      } catch (error) {
        // Silent error handling
      }
    }, []);

    const loadMemories = useCallback(async () => {
      try {
        const response = await apiClient.getMemories();
        if (response.success && response.data) {
          // setMemories(response.data); // This line is removed as memories are now from useAuth
        }
      } catch (error) {
        // Silent error handling
      }
    }, []);

    useEffect(() => {
      if (!isAuthenticated) return;
      // loadLocations(); // This line is removed as locations are now from useAuth
      // loadMemories(); // This line is removed as memories are now from useAuth
    }, [isAuthenticated]);

    // Force refresh userItems when component mounts
    useEffect(() => {
      if (isAuthenticated && userItems.length === 0) {
        const storedItems = localStorage.getItem('user_items');
        if (storedItems) {
          try {
            const parsedItems = JSON.parse(storedItems);
          } catch (error) {
            // Silent error handling
          }
        }
      }
    }, [isAuthenticated, userItems.length]);

    // Set map component as loaded
    useEffect(() => {
      // setMapComponentLoaded(true); // This line is removed
    }, []);

    const handleMapClick = useCallback((event: any) => {
      if (!isAuthenticated) {
        alert('Vui lòng đăng nhập để tạo kỷ niệm');
        return;
      }

      const { lngLat } = event;
      setTempMarker({ lat: lngLat.lat, lng: lngLat.lng });

      // Reverse geocode to get country and city
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxAccessToken}`)
        .then(res => res.json())
        .then(data => {
          const country = data.features.find((f: any) => f.place_type.includes('country'))?.text || 'Unknown Country';
          const city = data.features.find((f: any) => f.place_type.includes('place'))?.text || 'Unknown City';
          setSelectedLocation({
            id: 0,
            uuid: '',
            name: 'New Location',
            description: '',
            latitude: lngLat.lat,
            longitude: lngLat.lng,
            address: '',
            country,
            city,
            memory_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setShowMemoryModal(true);
        })
        .catch(err => {
          // Silent error handling
          // Fallback if geocoding fails
          setSelectedLocation({
            id: 0,
            uuid: '',
            name: 'New Location',
            description: '',
            latitude: lngLat.lat,
            longitude: lngLat.lng,
            address: '',
            country: 'Unknown',
            city: 'Unknown',
            memory_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setShowMemoryModal(true);
        });
    }, [mapboxAccessToken, isAuthenticated]);

    const handleLocationClick = useCallback((location: Location) => {
      setSelectedLocation(location);
      setShowViewMemoriesModal(true);
    }, []);

    const handleMemoryCreated = useCallback(() => {
      setShowMemoryModal(false);
      setTempMarker(null);
      
      // Force reload all data
      setLocationsLoaded(false);
      
      // Reload data after a short delay to ensure backend has processed
      setTimeout(() => {
        loadLocations();
        loadMemories();
      }, 500);
    }, [loadLocations, loadMemories]);

    const handleMemoryDeleted = useCallback(() => {
      setShowViewMemoriesModal(false);
      setSelectedLocation(null);
      
      // Clear locations ngay lập tức để markers biến mất
      setLocationsLoaded(false);
      
      // Không reload ngay lập tức để tránh load lại location đã bị xóa
      // User có thể tự reload bằng cách click vào marker khác
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

            {/* Existing Location Markers - Only show if user is authenticated */}
            {isAuthenticated && effectiveLocations && effectiveLocations.length > 0 && effectiveLocations.map((location) => {
                return (
                  <Marker
                    key={location.id}
                    latitude={parseFloat(location.latitude.toString())}
                    longitude={parseFloat(location.longitude.toString())}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      handleLocationClick(location);
                    }}
                  >
                    <CustomMarker 
                      imageBase64={location.image_base64}
                      size="sm"
                    />
                  </Marker>
                );
              })}

              {/* Memory Markers - Only show if user is authenticated */}
              {isAuthenticated && effectiveMemories && effectiveMemories.length > 0 && effectiveMemories.map((memory) => {
                const memoryImageBase64 = memory.image_base64 || memory.location.image_base64;
                
                return (
                  <Marker
                    key={memory.id}
                    latitude={parseFloat(memory.location.latitude.toString())}
                    longitude={parseFloat(memory.location.longitude.toString())}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      handleLocationClick(memory.location);
                    }}
                  >
                    <CustomMarker 
                      imageBase64={memoryImageBase64}
                      size="sm"
                    />
                  </Marker>
                );
              })}

              {/* Temporary Marker for New Memory - Only show if user is authenticated */}
              {isAuthenticated && tempMarker && (
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
                  <p className="text-gray-700 font-medium">Đăng nhập để xem và tạo kỷ niệm</p>
                  <p className="text-gray-500 text-sm">Chỉ người dùng đã đăng nhập mới có thể xem và tạo kỷ niệm</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {/* Memory Creation Modal */}
        {showMemoryModal && tempMarker && (
          <MemoryModal
            isOpen={showMemoryModal}
            onClose={() => {
              setShowMemoryModal(false);
              setTempMarker(null);
            }}
            location={{
              id: -1,
              uuid: '',
              name: `Địa điểm tại ${tempMarker.lat.toFixed(4)}, ${tempMarker.lng.toFixed(4)}`,
              description: `Vị trí được chọn tại tọa độ ${tempMarker.lat.toFixed(4)}, ${tempMarker.lng.toFixed(4)}`,
              latitude: tempMarker.lat,
              longitude: tempMarker.lng,
              address: '',
              country: 'Việt Nam',
              city: 'Hà Nội',
              memory_count: 0,
              created_at: '',
              updated_at: '',
            }}
            onSuccess={handleMemoryCreated}
          />
        )}

        {/* View Memories Modal */}
        {showViewMemoriesModal && selectedLocation && (
          <ViewMemoriesModal
            isOpen={showViewMemoriesModal}
            onClose={() => {
              setShowViewMemoriesModal(false);
              setSelectedLocation(null);
            }}
            location={selectedLocation}
            onMemoryDeleted={handleMemoryDeleted}
          />
        )}
      </div>
    );
}