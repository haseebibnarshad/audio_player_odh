import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1, Volume } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export const VolumeControl = ({ volume, onVolumeChange, isMuted, onMuteToggle }: VolumeControlProps) => {
  const [showSlider, setShowSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Handle click outside to close slider
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!isDragging) {
          setShowSlider(false);
        }
      }
    };

    if (showSlider) {
      // Add a small delay to prevent immediate closing when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside as EventListener);
        document.addEventListener('touchstart', handleClickOutside as EventListener);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside as EventListener);
        document.removeEventListener('touchstart', handleClickOutside as EventListener);
      };
    }
  }, [showSlider, isDragging]);

  // Calculate volume from position
  const calculateVolume = (clientY: number) => {
    if (!sliderRef.current) return volume;
    const rect = sliderRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return Math.round(100 - (position / rect.height) * 100);
  };

  // Handle slider interaction
  const startInteraction = (clientY: number) => {
    setIsDragging(true);
    const newVolume = calculateVolume(clientY);
    onVolumeChange(newVolume);
  };

  // Handle movement
  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const newVolume = calculateVolume(clientY);
    onVolumeChange(newVolume);
  };

  // Set up event listeners for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientY);
    };
    const endInteraction = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', endInteraction);
    document.addEventListener('touchend', endInteraction);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', endInteraction);
      document.removeEventListener('touchend', endInteraction);
    };
  }, [isDragging]);

  // Get volume icon based on volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 30) return <Volume className="w-5 h-5" />;
    if (volume < 70) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div 
      ref={containerRef}
      className="relative group"
    >
      <Button
        variant="ghost"
        size="icon"
        className="relative z-10 neumorphic rounded-xl text-foreground transition-all duration-300 hover:scale-110 hover:text-primary hover:glow-primary group/button"
        onClick={(e) => {
          e.stopPropagation();
          setShowSlider(!showSlider);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onMuteToggle();
        }}
      >
        {getVolumeIcon()}
      </Button>

      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          >
            <div className="glass-morphism rounded-2xl p-4 shadow-xl backdrop-blur-xl">
              <div
                ref={sliderRef}
                className="w-8 h-32 neumorphic-inset rounded-full cursor-pointer relative overflow-hidden"
                onMouseDown={(e) => startInteraction(e.clientY)}
                onTouchStart={(e) => startInteraction(e.touches[0].clientY)}
              >
                {/* Volume level indicator */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/70 rounded-full transition-all duration-200"
                  style={{ height: `${isMuted ? 0 : volume}%` }}
                  initial={false}
                  animate={{ height: `${isMuted ? 0 : volume}%` }}
                  transition={{ duration: 0.1 }}
                />
                
                {/* Volume knob */}
                <motion.div
                  className="absolute w-4 h-4 bg-white shadow-lg rounded-full left-1/2 transform -translate-x-1/2 border border-glass-border"
                  animate={{ 
                    bottom: `${isMuted ? 0 : Math.max(8, volume - 8)}%`,
                    boxShadow: isMuted ? "none" : "0 0 12px hsl(var(--primary-glow))"
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              {/* Volume percentage */}
              <div className="text-xs text-center text-muted-foreground mt-2 font-medium">
                {isMuted ? 0 : Math.round(volume)}%
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};