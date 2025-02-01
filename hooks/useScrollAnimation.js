import { useScroll, useTransform, useSpring } from 'framer-motion';

export const useScrollAnimation = () => {
  const { scrollY } = useScroll({
    smooth: true,
    offset: ["start start", "end start"]
  });
  
  // Smooth scroll values with adjusted ranges and smoother transitions
  const heroY = useTransform(scrollY, [0, 500], [0, -50]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  const appY = useTransform(scrollY, [300, 800], [50, -50]);
  const appOpacity = useTransform(scrollY, [300, 400, 700, 800], [0.8, 1, 1, 0.8]);
  
  const featuresY = useTransform(scrollY, [600, 1100], [50, -50]);
  const featuresOpacity = useTransform(scrollY, [600, 700, 1000, 1100], [0.8, 1, 1, 0.8]);
  
  const testimonialsY = useTransform(scrollY, [900, 1400], [50, -50]);
  const testimonialsOpacity = useTransform(scrollY, [900, 1000, 1300, 1400], [0.8, 1, 1, 0.8]);

  // Spring physics with adjusted values for smoother animations
  const smoothY = useSpring(heroY, { 
    mass: 0.8,
    stiffness: 100,
    damping: 30
  });
  
  const smoothAppY = useSpring(appY, {
    mass: 0.8,
    stiffness: 100,
    damping: 30
  });
  
  const smoothFeaturesY = useSpring(featuresY, {
    mass: 0.8,
    stiffness: 100,
    damping: 30
  });
  
  const smoothTestimonialsY = useSpring(testimonialsY, {
    mass: 0.8,
    stiffness: 100,
    damping: 30
  });

  return {
    smoothY,
    smoothAppY,
    smoothFeaturesY,
    smoothTestimonialsY,
    heroOpacity,
    appOpacity,
    featuresOpacity,
    testimonialsOpacity
  };
}; 