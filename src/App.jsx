// App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PatientList from './components/PatientList';
import PatientForm from './components/PatientForm';
import QueryInterface from './components/QueryInterface';
import { getDb } from './services/db';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [initializationTime, setInitializationTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const initializeDb = async () => {
      try {
        const db = await getDb();
        const elapsed = Date.now() - startTime;
        setInitializationTime(elapsed);
        setDbReady(true);
        console.log('Database initialized successfully in', elapsed, 'ms');
      } catch (error) {
        console.error('Database initialization failed:', error);
        setDbError(error.message);
      }
    };
    
    initializeDb();
  }, []);

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Database Error</h1>
            <p className="mt-2 text-gray-600">Failed to initialize the database:</p>
            <p className="mt-1 text-sm text-red-600">{dbError}</p>
            <p className="mt-4 text-sm text-gray-500">Please try refreshing the page or check browser console for details.</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Patient Registry</h1>
          <p className="mt-2 text-gray-600">Initializing database...</p>
          <p className="mt-1 text-sm text-gray-500">This may take a moment on first load.</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PatientList />} />
          <Route path="register" element={<PatientForm />} />
          <Route path="query" element={<QueryInterface />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
