"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

// Dynamically import the component that uses useSearchParams
const UsersContent = dynamic(() => import('./users-content'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

export default function UsersPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UsersContent />
    </Suspense>
  );
}