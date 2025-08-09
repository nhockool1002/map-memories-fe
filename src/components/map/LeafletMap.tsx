'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Plus, Heart, Calendar, User, Edit } from 'lucide-react';
import { Location, Memory } from '@/types/api';
import Button from '@/components/ui/Button';
import MemoryModal from '@/components/memories/MemoryModal';
import { format } from 'date-fns';
import MarkerDetailModal from '@/components/memories/MarkerDetailModal';

// Fix for default markers in Next.js
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color: string = '#16a34a') => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="7" fill="white"/>
      <circle cx="12.5" cy="12.5" r="4" fill="${color}"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

const memoryIcon = createCustomIcon('#16a34a');
const newLocationIcon = createCustomIcon('#dc2626');

interface LeafletMapProps {
  locations: Location[];
  memories: Memory[];
  center?: [number, number];
  zoom?: number;
  onLocationClick?: (location: Location) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onAddMemory?: (location: Location) => void;
  onMemoryUpdated?: (memory: Memory) => void;
  newLocationMarker?: { lat: number; lng: number } | null;
  className?: string;
}

// Component to handle map click events
const MapClickHandler: React.FC<{
  onMapClick?: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  locations = [],
  memories = [],
  center = [21.0285, 105.8542], // Default to Hanoi
  zoom = 13,
  onLocationClick,
  onMapClick,
  onAddMemory,
  onMemoryUpdated,
  newLocationMarker,
  className = '',
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMarkerDetailModal, setShowMarkerDetailModal] = useState(false);

  const handleLocationClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    onLocationClick?.(location);
    setShowMarkerDetailModal(true);
  }, [onLocationClick]);

  const handleAddMemory = useCallback((location: Location) => {
    setSelectedLocation(location);
    setSelectedMemory(null);
    setIsModalOpen(true);
    onAddMemory?.(location);
  }, [onAddMemory]);

  const handleEditMemory = useCallback((memory: Memory) => {
    setSelectedLocation(memory.location);
    setSelectedMemory(memory);
    setIsModalOpen(true);
  }, []);

  const handleModalSuccess = useCallback((memory: Memory) => {
    onMemoryUpdated?.(memory);
    setIsModalOpen(false);
  }, [onMemoryUpdated]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLocation(null);
    setSelectedMemory(null);
  }, []);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={onMapClick} />

        {/* Existing location markers */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={memoryIcon}
            eventHandlers={{
              click: () => handleLocationClick(location),
            }}
          >
            <Popup closeButton={false} className="custom-popup">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-2 min-w-[250px]"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-800 leading-tight">
                    {location.name}
                  </h3>
                  <div className="flex items-center text-primary-600 text-sm ml-2">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{location.memory_count}</span>
                  </div>
                </div>
                
                {location.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {location.description}
                  </p>
                )}
                
                <div className="text-xs text-gray-500 mb-3">
                  <div className="flex items-center mb-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}</span>
                  </div>
                  {location.city && location.country && (
                    <span>{location.city}, {location.country}</span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAddMemory(location)}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm kỷ niệm
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLocationClick(location)}
                    className="flex-1"
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </motion.div>
            </Popup>
          </Marker>
        ))}

        {/* Memory markers (if different from location markers) */}
        {memories
          .filter(memory => 
            !locations.some(loc => 
              loc.latitude === memory.location.latitude && 
              loc.longitude === memory.location.longitude
            )
          )
          .map((memory) => (
          <Marker
            key={memory.id}
            position={[memory.location.latitude, memory.location.longitude]}
            icon={memoryIcon}
          >
            <Popup closeButton={false}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-2 min-w-[250px]"
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {memory.title}
                </h3>
                
                <div className="text-sm text-gray-600 mb-3">
                  <div className="flex items-center mb-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{memory.location.name}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {format(new Date(memory.visit_date), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center mb-1">
                    <User className="h-3 w-3 mr-1" />
                    <span>{memory.user.full_name || memory.user.username}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                  {memory.content}
                </p>

                {memory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {memory.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {memory.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{memory.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleEditMemory(memory)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLocationClick(memory.location)}
                    className="flex-1"
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </motion.div>
            </Popup>
          </Marker>
        ))}

        {/* New location marker */}
        {newLocationMarker && (
          <Marker
            position={[newLocationMarker.lat, newLocationMarker.lng]}
            icon={newLocationIcon}
          >
            <Popup closeButton={false}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-2"
              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  Vị trí mới
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Lat: {newLocationMarker.lat.toFixed(6)}<br />
                  Lng: {newLocationMarker.lng.toFixed(6)}
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    const tempLocation: Location = {
                      id: -1,
                      uuid: '',
                      name: `Địa điểm tại ${newLocationMarker.lat.toFixed(4)}, ${newLocationMarker.lng.toFixed(4)}`,
                      description: `Vị trí được chọn tại tọa độ ${newLocationMarker.lat.toFixed(4)}, ${newLocationMarker.lng.toFixed(4)}`,
                      latitude: newLocationMarker.lat,
                      longitude: newLocationMarker.lng,
                      address: '',
                      country: 'Việt Nam',
                      city: 'Hà Nội',
                      memory_count: 0,
                      created_at: '',
                      updated_at: '',
                    };
                    setSelectedLocation(tempLocation);
                    setSelectedMemory(null);
                    setIsModalOpen(true);
                  }}
                >
                  Tạo kỷ niệm
                </Button>
              </motion.div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Memory Modal */}
      <MemoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        location={selectedLocation || undefined}
        memory={selectedMemory || undefined}
        onSuccess={handleModalSuccess}
      />

      {showMarkerDetailModal && selectedLocation && (
        <MarkerDetailModal
          isOpen={showMarkerDetailModal}
          onClose={() => setShowMarkerDetailModal(false)}
          location={selectedLocation}
        />
      )}
    </div>
  );
};

export default LeafletMap;