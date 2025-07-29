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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleAuthSuccess = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-full p-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <MapPin className="h-16 w-16 text-white" />
              </motion.div>
            </div>
            
            <h1 className="text-6xl font-bold mb-6">
              Map Memories
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-md">
              Lưu giữ những kỷ niệm đẹp nhất của bạn trên bản đồ. 
              Khám phá lại những nơi đã đến và những câu chuyện đã trải qua.
            </p>

            <motion.div
              className="flex items-center justify-center space-x-2 text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Heart className="h-5 w-5" />
              <span>Được tạo nên với tình yêu</span>
              <Heart className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-full"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-12 h-12 bg-white/10 rounded-full"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <motion.div
            className="lg:hidden text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-primary rounded-full p-3">
                <MapPin className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold gradient-text">
              Map Memories
            </h1>
          </motion.div>

          {/* Auth form container */}
          <motion.div
            className="card p-8"
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToRegister={() => setIsLogin(false)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegisterForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToLogin={() => setIsLogin(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-8 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">
                Chính sách bảo mật
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}