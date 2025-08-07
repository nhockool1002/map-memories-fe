'use client';

import React, { useState } from 'react';
import MemoryModal from '@/components/memories/MemoryModal';
import { Memory } from '@/types/api';

export default function TestMemoryFormPage() {
  const [showModal, setShowModal] = useState(false);
  const [createdMemory, setCreatedMemory] = useState<Memory | null>(null);

  const testLocation = {
    lat: 10.8231, // Hồ Chí Minh City
    lng: 106.6297
  };

  const handleMemoryCreated = (memory: any) => {
    // Silent success handling
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Memory Form</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Mở Form Tạo Memory
        </button>
        
        {createdMemory && (
          <div className="p-4 bg-green-100 rounded">
            <h3 className="font-bold text-green-800">Memory đã được tạo:</h3>
            <pre className="text-sm">{JSON.stringify(createdMemory, null, 2)}</pre>
          </div>
        )}
      </div>

      <MemoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        location={testLocation}
        onMemoryCreated={handleMemoryCreated}
      />
    </div>
  );
} 