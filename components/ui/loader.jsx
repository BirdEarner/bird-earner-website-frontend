"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import loaderBirdAnimation from "@/public/animations/loader-bird.json";

export function Loader({ isLoading }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-50 to-white transition-opacity duration-500 ${!isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      <div className="w-32 h-32" style={{ transform: 'scaleX(-1)' }}>
        {isClient && (
          <Lottie
            animationData={loaderBirdAnimation}
            loop={true}
            autoplay={true}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice'
            }}
          />
        )}
      </div>
    </div>
  );
}