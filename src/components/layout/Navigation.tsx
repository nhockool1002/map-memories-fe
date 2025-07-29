'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Menu, 
  X, 
  Home, 
  Heart, 
  User, 
  LogOut, 
  Settings,
  Plus 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/memories', label: 'Kỷ niệm', icon: Heart },
    { href: '/profile', label: 'Hồ sơ', icon: User },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop & Mobile Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 hover:scale-105 transition-transform"
            >
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-2">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                Map Memories
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActivePath(item.href)
                        ? 'text-green-400 bg-gray-700'
                        : 'text-gray-300 hover:text-green-400 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">
                      {user?.full_name || user?.username}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/auth')}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/auth')}
                  >
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-green-400 hover:bg-gray-700 transition-colors touch-target"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-80 bg-gray-800 shadow-xl overflow-y-auto safe-area-top safe-area-bottom"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <Link 
                  href="/" 
                  className="flex items-center space-x-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-2">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">
                    Map Memories
                  </span>
                </Link>
                
                <button
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* User Info */}
              {isAuthenticated && user && (
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="p-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors touch-target ${
                        isActivePath(item.href)
                          ? 'text-green-400 bg-gray-700'
                          : 'text-gray-300 hover:text-green-400 hover:bg-gray-700'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}

                {isAuthenticated && (
                  <>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-green-400 hover:bg-gray-700 transition-colors touch-target"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">Cài đặt</span>
                    </Link>
                  </>
                )}
              </nav>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-700 mt-auto">
                {isAuthenticated ? (
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        router.push('/auth');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => {
                        router.push('/auth');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Đăng ký
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;