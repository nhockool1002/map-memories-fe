'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Location, Memory } from '@/types/api';
import MemoryForm from './MemoryForm';
import Button from '@/components/ui/Button';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location;
  memory?: Memory;
  onSuccess?: (memory: Memory) => void;
}

const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  location,
  memory,
  onSuccess,
}) => {
  const handleSuccess = (newMemory: Memory) => {
    onSuccess?.(newMemory);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {memory ? 'Chỉnh sửa kỷ niệm' : 'Tạo kỷ niệm mới'}
                </h2>
                {location && (
                  <p className="text-gray-600 mt-1">
                    Địa điểm: {location.name}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              <MemoryForm
                memory={memory}
                preselectedLocation={location}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MemoryModal; 