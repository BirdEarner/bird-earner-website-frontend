"use client";
import { useEffect } from 'react';

export const useSmoothScroll = () => {
  useEffect(() => {
    // Add smooth scroll behavior
    const html = document.documentElement;
    html.style.scrollBehavior = 'smooth';

    // Cleanup function
    return () => {
      html.style.scrollBehavior = '';
    };
  }, []);
}; 