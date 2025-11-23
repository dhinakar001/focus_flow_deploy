/**
 * Main App Component
 * 
 * Root component with error boundary and global error handling
 * 
 * @module App
 */

import React, { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { SkeletonCard } from './components/ui/Skeleton';
import './index.css';

// Lazy load Dashboard for code splitting
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <SkeletonCard className="w-full max-w-4xl" />
        </div>
      }>
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
