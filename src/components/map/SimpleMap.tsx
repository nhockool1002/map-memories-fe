'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'mapbox-gl/dist/mapbox-gl.css';

// Dynamic import to avoid SSR issues
const Map = dynamic(() => import('react-map-gl').then(mod => {
  console.log('React-map-gl module loaded:', mod);
  return { default: mod.Map };
}), {
  ssr: false,
  loading: () => {
    console.log('Map loading component rendered');
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Đang tải bản đồ...</div>;
  }
});

interface SimpleMapProps {
  className?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ className = "w-full h-full" }) => {
  const [viewState, setViewState] = useState({
    longitude: 105.8342,
    latitude: 21.0278,
    zoom: 10
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    console.log('SimpleMap mounted');
    console.log('Mapbox token:', process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
    console.log('Token length:', process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.length);
    console.log('Token starts with pk:', process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.startsWith('pk.'));
  }, []);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Loading State */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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

      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => {
          console.log('SimpleMap loaded successfully');
          console.log('Map element:', document.querySelector('.mapboxgl-map'));
          console.log('Canvas element:', document.querySelector('.mapboxgl-canvas'));
          setMapLoaded(true);
          setMapError(null);
        }}
        onError={(e) => {
          console.error('SimpleMap error:', e);
          console.error('Error details:', {
            type: e.type,
            target: e.target,
            error: e.error
          });
          setMapError('Không thể tải bản đồ');
        }}
        attributionControl={false}
      />
    </div>
  );
};

export default SimpleMap; 