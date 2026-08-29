import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  duration = 2400
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(() => {
      onFinish();
    }, 320);
  };

  return (
    <motion.div
      id="splash-screen"
      onClick={handleFinish}
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="relative w-full h-full min-h-[100dvh] md:min-h-[850px] bg-white flex items-center justify-center p-6 select-none cursor-pointer overflow-hidden"
    >
      {/* Centered User Brand LOGO with Handwriting Animation */}
      <div className="w-52 h-52 sm:w-64 sm:h-64 max-w-full flex items-center justify-center">
        <svg
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-black drop-shadow-2xs"
        >
          {/* Handwriting Stroke Motion */}
          <motion.path
            d="M 108 854 
               C 170 700 305 470 470 330 
               C 585 230 670 190 690 235 
               C 708 275 675 385 615 505 
               C 555 625 488 728 460 728 
               C 438 728 428 688 452 612 
               C 478 532 555 480 628 530 
               C 668 558 668 640 692 660 
               C 724 685 780 660 892 506"
            stroke="currentColor"
            strokeWidth="52"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1 
            }}
            transition={{
              pathLength: { 
                duration: 1.4, 
                ease: [0.42, 0, 0.58, 1], // Smooth cursive calligraphy easing
                delay: 0.15 
              },
              opacity: { 
                duration: 0.2, 
                delay: 0.1 
              }
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
};
