'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TestFlowPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const { login, isLoading, user, isAuthenticated } = useAuth();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async () => {
    addLog('Bắt đầu test login...');
    
    try {
      const success = await login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      addLog(`Login result: ${success}`);
      addLog(`User: ${JSON.stringify(user)}`);
      addLog(`Is authenticated: ${isAuthenticated}`);
    } catch (error) {
      addLog(`Login error: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Flow Page</h1>
        
        <div className="mb-8 space-y-4">
          <button
            onClick={testLogin}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Đang test...' : 'Test Login Flow'}
          </button>
          
          <button
            onClick={clearLogs}
            className="ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Logs
          </button>
        </div>
        
        <div className="bg-white p-4 rounded border">
          <h3 className="font-bold mb-2">Current State:</h3>
          <div className="text-sm space-y-1">
            <div>Loading: {isLoading.toString()}</div>
            <div>Authenticated: {isAuthenticated.toString()}</div>
            <div>User: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
          </div>
        </div>
        
        {logs.length > 0 && (
          <div className="mt-8 bg-white p-4 rounded border">
            <h3 className="font-bold mb-2">Logs:</h3>
            <div className="bg-gray-100 p-4 rounded text-sm max-h-96 overflow-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 