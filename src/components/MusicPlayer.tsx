import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Sun, Moon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeControl } from './VolumeControl';
import { PlaylistPanel } from './PlaylistPanel';
import { Tooltip } from './Tooltip';
// Define song interface
interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  audioSrc: string;
  artwork: string;
  duration: string;
}

// Helper function to extract title from filename
const getTitleFromFilename = (filename: string): string => {
  // Remove file extension and any version numbers (like V2)
  return filename
    .replace(/\.[^/.]+$/, '') // Remove file extension
    .replace(/\s*V\d+$/, '')   // Remove version numbers (V2, V3, etc.)
    .replace(/\s*\d+$/, '');   // Remove any remaining numbers at the end
};

// Real songs data
const mockSongs: Song[] = [
  {
    id: 1,
    title: getTitleFromFilename("OD&H Cyber Phunk Anthem"),
    artist: "OD&H",
    album: "Cyber Phunk Collection",
    audioSrc: "/songs/OD&H Cyber Phunk Anthem.mp3",
    artwork: "/images/OD&H Cyber Phunk Anthem.png",
    duration: "3:15"
  },
  {
    id: 2,
    title: getTitleFromFilename("Oblivion Forgotten x OD&H Anthem"),
    artist: "OD&H",
    album: "Oblivion Collection",
    audioSrc: "/songs/Oblivion Forgotten x OD&H Anthem.mp3",
    artwork: "/images/Oblivion Forgotten x OD&H Anthem.png",
    duration: "3:25"
  },
  {
    id: 3,
    title: getTitleFromFilename("Oblivion"),
    artist: "OD&H",
    album: "Oblivion Collection",
    audioSrc: "/songs/Oblivion.mp3",
    artwork: "/images/Oblivion.png",
    duration: "2:40"
  },
  {
    id: 4,
    title: getTitleFromFilename("OblivionV2"),
    artist: "OD&H",
    album: "Oblivion Collection",
    audioSrc: "/songs/OblivionV2.mp3",
    artwork: "/images/OblivionV2.png",
    duration: "3:25"
  },
  {
    id: 5,
    title: getTitleFromFilename("Welcome to OD&H"),
    artist: "OD&H",
    album: "Cyber Phunk Collection",
    audioSrc: "/songs/Welcome to OD&H.mp3",
    artwork: "/images/Welcome to OD&H.png",
    duration: "3:15"
  },
  {
    id: 6,
    title: getTitleFromFilename("Where Innovation Meets Infinity"),
    artist: "OD&H",
    album: "Cyber Phunk Collection",
    audioSrc: "/songs/Where Innovation Meets Infinity.mp3",
    artwork: "/images/Where Innovation Meets Infinity.png",
    duration: "3:15"
  },
  {
    id: 7,
    title: getTitleFromFilename("Where Innovation Meets Infinity V2"),
    artist: "OD&H",
    album: "Cyber Phunk Collection",
    audioSrc: "/songs/Where Innovation Meets Infinity V2.mp3",
    artwork: "/images/Where Innovation Meets Infinity V2.png",
    duration: "2:35"
  }
];

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song>(mockSongs[0]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [artworkKey, setArtworkKey] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(new Audio(currentSong.audioSrc));
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // Tooltip states
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);

  const [hoverProgress, setHoverProgress] = useState<{show: boolean; time: number; position: number}>({
    show: false,
    time: 0,
    position: 0
  });

  const handleSongChange = useCallback((newSong: Song) => {
    if (newSong.id === currentSong.id) return;
    
    setIsTransitioning(true);
    
    // Fade out effect
    setTimeout(() => {
      setCurrentSong(newSong);
      setArtworkKey(prev => prev + 1);
      setIsTransitioning(false);
    }, 200);
  }, [currentSong.id]);

  const nextSong = useCallback(() => {
    const currentIndex = mockSongs.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % mockSongs.length;
    handleSongChange(mockSongs[nextIndex]);
  }, [currentSong.id, handleSongChange]);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', nextSong);
    
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', nextSong);
    };
  }, [nextSong]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);
  
  // Update audio source when song changes
  useEffect(() => {
    // Create a new audio element to avoid context issues
    const newAudio = new Audio(currentSong.audioSrc);
    
    // Transfer the current time if we're in the middle of playback
    const wasPlaying = isPlaying;
    const currentTime = audioRef.current.currentTime;
    
    // Set up the new audio element
    newAudio.volume = isMuted ? 0 : volume / 100;
    newAudio.currentTime = currentTime;
    
    // Replace the old audio element
    audioRef.current.pause();
    audioRef.current = newAudio;
    
    // If we were playing, start the new audio
    if (wasPlaying) {
      newAudio.play().catch(e => {
        console.error('Error playing audio:', e);
        setIsPlaying(false);
      });
    }
    
    // Set up event listeners for the new audio element
    const updateTime = () => setCurrentTime(newAudio.currentTime);
    const updateDuration = () => setDuration(newAudio.duration);
    
    newAudio.addEventListener('timeupdate', updateTime);
    newAudio.addEventListener('loadedmetadata', updateDuration);
    newAudio.addEventListener('ended', nextSong);
    
    // Clean up function
    return () => {
      newAudio.pause();
      newAudio.removeEventListener('timeupdate', updateTime);
      newAudio.removeEventListener('loadedmetadata', updateDuration);
      newAudio.removeEventListener('ended', nextSong);
    };
  }, [currentSong.audioSrc, isPlaying, isMuted, volume, nextSong]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(position * duration, duration));
    
    setHoverProgress({
      show: true,
      time,
      position: position * 100
    });
  };

  const handleProgressLeave = () => {
    setHoverProgress(prev => ({ ...prev, show: false }));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(position * duration, duration));
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Auto dark mode based on time
  useEffect(() => {
    const hour = new Date().getHours();
    setIsDarkMode(hour < 7 || hour > 19);
  }, []);

  // Apply dark mode with smooth transition
  useEffect(() => {
    document.documentElement.style.transition = 'background 0.5s ease, color 0.5s ease';
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // Reset transition after animation
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 500);
  }, [isDarkMode]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const previousSong = () => {
    const currentIndex = mockSongs.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? mockSongs.length - 1 : currentIndex - 1;
    handleSongChange(mockSongs[prevIndex]);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get dominant color scheme based on current song (simulated)
  const getColorScheme = () => {
    const schemes = {
      1: { primary: '250 100% 65%', glow: '250 100% 70% / 0.3' },
      2: { primary: '280 100% 70%', glow: '280 100% 75% / 0.3' },
      3: { primary: '200 100% 65%', glow: '200 100% 70% / 0.3' },
      4: { primary: '320 100% 70%', glow: '320 100% 75% / 0.3' }
    };
    return schemes[currentSong.id as keyof typeof schemes] || schemes[1];
  };

  const colorScheme = getColorScheme();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-inter">
      {/* Dynamic Background with Color Extraction */}
      <motion.div 
        key={currentSong.id}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1.2 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${currentSong.artwork})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(60px) brightness(0.3)',
        }}
      />
      
      {/* Enhanced Gradient Overlay with Color Tinting */}
      <motion.div 
        key={`overlay-${currentSong.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-10"
        style={{
          background: `linear-gradient(135deg, 
            hsl(${colorScheme.primary} / 0.1) 0%, 
            hsl(var(--background) / 0.9) 50%, 
            hsl(${colorScheme.primary} / 0.05) 100%)`
        }}
      />

      {/* Enhanced Dark Mode Toggle */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 right-6 z-50"
      >
        <Button
          variant="outline"
          size="icon"
          className="glass-morphism border-glass-border hover:glow-accent transition-smooth group"
          onClick={toggleDarkMode}
        >
          <motion.div
            animate={{ rotate: isDarkMode ? 180 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 group-hover:scale-110 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* Playlist Toggle */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 right-20 z-50"
      >
        <Button
          variant="outline"
          size="icon"
          className="glass-morphism border-glass-border hover:glow-primary transition-smooth"
          onClick={() => setShowPlaylist(!showPlaylist)}
        >
          <List className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Main Player Container */}
      <motion.div 
        className="relative z-20 w-full max-w-md mx-auto"
        animate={{
          filter: isTransitioning ? 'blur(4px)' : 'blur(0px)',
          opacity: isTransitioning ? 0.7 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Player Card with Enhanced Glow */}
        <motion.div 
          className="glass-morphism rounded-3xl p-8 transition-smooth hover-lift relative"
          style={{
            boxShadow: `0 8px 32px hsl(var(--shadow-dark)), 0 0 60px hsl(${colorScheme.glow})`
          }}
          whileHover={{ y: -4 }}
        >
          
          {/* Album Artwork with Enhanced Animations */}
          <div className="relative mb-8 flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={artworkKey}
                className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl z-10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={currentSong.artwork}
                  alt={`${currentSong.title} artwork`}
                  className="w-full h-full object-cover"
                />
                {isTransitioning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                
                {/* Play/Pause Overlay */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  onClick={togglePlay}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </motion.div>
                </motion.div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 -inset-4 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
            </AnimatePresence>

            {/* Song Info with Improved Typography */}
            <div className="text-center mt-6 w-full max-w-md px-4">
              <motion.h2 
                className="text-2xl font-bold text-foreground mb-1.5 line-clamp-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentSong.title}
              </motion.h2>
              <motion.p 
                className="text-muted-foreground/90 text-base font-medium mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.9, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {currentSong.artist}
              </motion.p>
              <motion.p 
                className="text-muted-foreground/60 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentSong.album}
              </motion.p>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mb-6">
            <div 
              className="relative w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer group"
              ref={progressBarRef}
              onMouseMove={handleProgressHover}
              onMouseLeave={handleProgressLeave}
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-primary transition-all duration-300 relative z-10"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Hover indicator */}
              {hoverProgress.show && (
                <div 
                  className="absolute top-0 h-full bg-primary/30 transition-all duration-75 pointer-events-none"
                  style={{ 
                    width: `${hoverProgress.position}%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                </div>
              )}
              
              {/* Tooltip - Only show when hovering over progress bar */}
              <div 
                className={`absolute -top-8 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity duration-200 ${
                  hoverProgress.show ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ left: `${hoverProgress.position}%` }}
              >
                {formatTime(hoverProgress.time)}
              </div>
            </div>
            
            {/* Time Display */}
            <div className="flex items-center justify-between w-full mt-2">
              <span className="text-xs font-medium text-foreground">{formatTime(currentTime)}</span>
              <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Enhanced Controls with Tooltips */}
          <div className="flex items-center justify-center space-x-4">
            {/* Shuffle */}
            <Tooltip content="Shuffle" show={hoveredControl === 'shuffle'}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredControl('shuffle')}
                onMouseLeave={() => setHoveredControl(null)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`neumorphic rounded-xl transition-smooth hover-lift group ${
                    isShuffled ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  style={{
                    boxShadow: isShuffled ? `0 0 20px hsl(${colorScheme.glow})` : undefined
                  }}
                  onClick={() => setIsShuffled(!isShuffled)}
                >
                  <Shuffle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
              </motion.div>
            </Tooltip>

            {/* Previous */}
            <Tooltip content="Previous" show={hoveredControl === 'previous'}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredControl('previous')}
                onMouseLeave={() => setHoveredControl(null)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="neumorphic rounded-xl text-foreground transition-smooth hover-lift hover:glow-primary group"
                  onClick={previousSong}
                >
                  <SkipBack className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </motion.div>
            </Tooltip>

            {/* Play/Pause */}
            <Tooltip content={isPlaying ? "Pause" : "Play"} show={hoveredControl === 'play'}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredControl('play')}
                onMouseLeave={() => setHoveredControl(null)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-2xl text-primary-foreground shadow-lg transition-bouncy"
                  style={{
                    background: `linear-gradient(135deg, hsl(${colorScheme.primary}), hsl(${colorScheme.primary} / 0.8))`,
                    boxShadow: `0 8px 25px hsl(${colorScheme.glow}), 0 0 40px hsl(${colorScheme.glow})`
                  }}
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7 ml-1" />
                  )}
                </Button>
              </motion.div>
            </Tooltip>

            {/* Next */}
            <Tooltip content="Next" show={hoveredControl === 'next'}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredControl('next')}
                onMouseLeave={() => setHoveredControl(null)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="neumorphic rounded-xl text-foreground transition-smooth hover-lift hover:glow-primary group"
                  onClick={nextSong}
                >
                  <SkipForward className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </motion.div>
            </Tooltip>

            {/* Repeat */}
            <Tooltip content="Repeat" show={hoveredControl === 'repeat'}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredControl('repeat')}
                onMouseLeave={() => setHoveredControl(null)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`neumorphic rounded-xl transition-smooth hover-lift group ${
                    isRepeated ? 'text-accent' : 'text-muted-foreground'
                  }`}
                  style={{
                    boxShadow: isRepeated ? '0 0 20px hsl(var(--accent-glow))' : undefined
                  }}
                  onClick={() => setIsRepeated(!isRepeated)}
                >
                  <Repeat className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
              </motion.div>
            </Tooltip>
          </div>

          {/* Volume Control */}
          <div className="flex justify-center mt-6">
            <VolumeControl
              volume={volume}
              onVolumeChange={handleVolumeChange}
              isMuted={isMuted}
              onMuteToggle={toggleMute}
            />
          </div>
        </motion.div>

        {/* Bottom Info */}
        <motion.div 
          className="mt-6 text-center space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        >
          <p className="text-sm font-medium text-foreground/80">
            Now Playing: {currentSong.title}
          </p>
          <p className="text-xs text-muted-foreground/70">
            OD&H Player • Premium Experience
          </p>
        </motion.div>
      </motion.div>

      {/* Playlist Panel */}
      <PlaylistPanel
        isOpen={showPlaylist}
        onClose={() => setShowPlaylist(false)}
        songs={mockSongs}
        currentSong={currentSong}
        onSongSelect={handleSongChange}
      />
    </div>
  );
};