'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Silent redirect handling
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleAuthSuccess = () => {
    // Silent success handling
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Map Memories
          </h2>
          <p className="text-gray-300">
            Đăng nhập để lưu giữ kỷ niệm trên bản đồ
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          {isLogin ? (
            <LoginForm 
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setIsLogin(false)} 
            />
          ) : (
            <RegisterForm 
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)} 
            />
          )}
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Map Memories. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  );
}