'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Location } from '@/types/api';
import MemoryForm from './MemoryForm';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { lat: number; lng: number };
  onMemoryCreated: () => void;
}

const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  location,
  onMemoryCreated,
}) => {
  // Create a location object from coordinates
  const preselectedLocation: Location = {
    id: 0, // This will be created by the API
    uuid: '',
    name: `Địa điểm tại ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
    description: `Vị trí được chọn tại tọa độ ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
    latitude: location.lat,
    longitude: location.lng,
    address: '',
    country: '',
    city: '',
    memory_count: 0,
    created_at: '',
    updated_at: '',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <MemoryForm
                  preselectedLocation={preselectedLocation}
                  onSuccess={onMemoryCreated}
                  onCancel={onClose}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MemoryModal; 