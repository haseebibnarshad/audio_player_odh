import { motion, AnimatePresence } from 'framer-motion';
import { Play, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: string;
}

interface PlaylistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  currentSong: Song;
  onSongSelect: (song: Song) => void;
}

export const PlaylistPanel = ({ isOpen, onClose, songs, currentSong, onSongSelect }: PlaylistPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.23, 1, 0.32, 1] // Custom easing for smooth motion
            }}
            className="fixed right-0 top-0 h-full w-80 z-40 glass-morphism border-l border-glass-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-glass-border">
              <h3 className="text-lg font-semibold text-foreground">Now Playing</h3>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl neumorphic hover-lift"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Queue */}
            <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-80px)]">
              {songs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                    currentSong.id === song.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted-glass border border-transparent'
                  }`}
                  onClick={() => onSongSelect(song)}
                >
                  {/* Artwork */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={song.artwork}
                      alt={song.album}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* Currently playing indicator */}
                    {currentSong.id === song.id && (
                      <div className="absolute bottom-1 right-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Song info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate transition-colors ${
                      currentSong.id === song.id ? 'text-primary' : 'text-foreground'
                    }`}>
                      {song.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="text-xs text-muted-foreground">
                    {song.duration}
                  </div>

                  {/* More options */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};