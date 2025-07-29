'use client';

import React, { useState } from 'react';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function TestMapPage() {
  const [viewState, setViewState] = useState({
    longitude: 105.8342,
    latitude: 21.0278,
    zoom: 10
  });

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-white border-b">
        <h1 className="text-xl font-bold">Test Mapbox</h1>
        <p>Token: {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Có token' : 'Không có token'}</p>
        <p>Token value: {process.env.NEXT_PUBLIC_MAPBOX_TOKEN}</p>
      </div>
      
      <div className="flex-1 w-full" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="w-full h-full border-2 border-red-500">
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
            onLoad={() => console.log('Map loaded!')}
            onError={(e) => console.error('Map error:', e)}
          />
        </div>
      </div>
    </div>
  );
} 