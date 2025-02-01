import Lottie from "lottie-react";
import loaderBirdAnimation from "@/public/animations/loader-bird.json";

export function Loader({ isLoading }) {
  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-50 to-white transition-opacity duration-500 ${
        !isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-32 h-32" style={{ transform: 'scaleX(-1)' }}>
        <Lottie 
          animationData={loaderBirdAnimation} 
          loop={true}
          autoplay={true}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice'
          }}
        />
      </div>
    </div>
  );
} 