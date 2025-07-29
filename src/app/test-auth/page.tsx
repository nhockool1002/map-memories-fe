'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api';

export default function TestAuthPage() {
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('test2@example.com');
  const [password, setPassword] = useState('123456');
  const [testResult, setTestResult] = useState<string>('');

  const handleLogin = async () => {
    const success = await login({ email, password });
    if (success) {
      setTestResult('Đăng nhập thành công!');
    } else {
      setTestResult('Đăng nhập thất bại!');
    }
  };

  const testCreateMemory = async () => {
    try {
      const response = await apiClient.createMemory({
        location_id: 1,
        title: 'Test Memory',
        content: 'Test content',
        visit_date: '2024-01-15',
        is_public: true,
        tags: ['test']
      });
      setTestResult(`Tạo memory: ${JSON.stringify(response)}`);
    } catch (error: any) {
      setTestResult(`Lỗi tạo memory: ${error.message}`);
    }
  };

  const testGetMemories = async () => {
    try {
      const response = await apiClient.getMemories();
      setTestResult(`Get memories: ${JSON.stringify(response)}`);
    } catch (error: any) {
      setTestResult(`Lỗi get memories: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Authentication</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Đăng nhập
        </button>
        
        <div className="mt-4">
          <p>Authentication status: {isAuthenticated ? '✅ Đã đăng nhập' : '❌ Chưa đăng nhập'}</p>
          <p>User: {user ? JSON.stringify(user) : 'None'}</p>
          <p>API Token: {apiClient.isAuthenticated() ? '✅ Có token' : '❌ Không có token'}</p>
        </div>
        
        {isAuthenticated && (
          <div className="space-y-2">
            <button
              onClick={testCreateMemory}
              className="px-4 py-2 bg-green-500 text-white rounded mr-2"
            >
              Test Create Memory
            </button>
            
            <button
              onClick={testGetMemories}
              className="px-4 py-2 bg-purple-500 text-white rounded"
            >
              Test Get Memories
            </button>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Test Result:</h3>
          <pre className="text-sm">{testResult}</pre>
        </div>
      </div>
    </div>
  );
} 