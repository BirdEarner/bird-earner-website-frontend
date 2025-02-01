"use client";

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const useLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Define routes that should show the loader
  const loaderRoutes = ['/', '/sign-in', '/dashboard', '/dashboard/users', '/dashboard/upload_files'];

  useEffect(() => {
    // Only show loader for specific routes
    if (!loaderRoutes.includes(pathname)) {
      setIsLoading(false);
      return;
    }

    // Start loading
    setIsLoading(true);

    // Minimum loading time of 3 seconds
    const minLoadTime = 3000;
    const startTime = Date.now();

    const timer = setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);

      // Ensure minimum loading time is met
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    }, 100); // Initial delay to ensure loader is visible

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return { isLoading, setIsLoading };
}; 