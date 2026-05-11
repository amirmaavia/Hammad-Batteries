'use client';

import { useEffect, useState } from 'react';

export default function DatabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/test-db');
        const result = await response.json();

        if (result.success) {
          setConnectionStatus('✅ Database Connected');
          console.log('Database connection successful:', result.message);
        } else {
          setConnectionStatus('❌ Database Connection Failed');
          console.error('Database connection failed:', result.message);
        }
      } catch (error) {
        setConnectionStatus('❌ Database Connection Error');
        console.error('Database connection test error:', error);
      }
    };

    testConnection();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      {connectionStatus}
    </div>
  );
}
