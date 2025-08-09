import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart, 
  Shuffle, 
  Repeat,
  Clock,
  RotateCcw,
  FastForward
} from 'lucide-react';
import { PlayerState } from '../types/youtube';
import { SleepTimer } from './SleepTimer';
import { WaveformScrubber } from './WaveformScrubber';

interface PlayerControlsProps {
  playerState: PlayerState;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSleepTimerComplete: () => void;
  onRewind?: () => void;
  onFastForward?: () => void;
  audioData?: Uint8Array;
}

export default function PlayerControls({
  playerState,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onSleepTimerComplete,
  onRewind,
  onFastForward,
  audioData
}: PlayerControlsProps) {
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(50);

  const { isPlaying, currentTime, duration, volume, currentTrack } = playerState;

  // Dynamic colors based on current track
  const getTrackColors = () => {
    if (!currentTrack) return { primary: '#FF3CAC', secondary: '#784BA0' };
    
    const title = currentTrack.title.toLowerCase();
    const channel = currentTrack.channelTitle.toLowerCase();
    
    // Color mapping for different genres/moods
    if (title.includes('rock') || title.includes('metal')) {
      return { primary: '#FF6B6B', secondary: '#4ECDC4' };
    }
    if (title.includes('electronic') || title.includes('edm')) {
      return { primary: '#00D4FF', secondary: '#FF0080' };
    }
    if (title.includes('classical') || title.includes('piano')) {
      return { primary: '#E6E6FA', secondary: '#DDA0DD' };
    }
    if (title.includes('bollywood') || title.includes('hindi')) {
      return { primary: '#FF6347', secondary: '#FFD700' };
    }
    if (title.includes('sad') || title.includes('slow')) {
      return { primary: '#4682B4', secondary: '#708090' };
    }
    if (title.includes('happy') || title.includes('party')) {
      return { primary: '#FFD700', secondary: '#FF69B4' };
    }
    
    // Generate unique colors from video ID
    const hash = currentTrack.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 120) % 360;
    
    return {
      primary: `hsl(${hue1}, 70%, 60%)`,
      secondary: `hsl(${hue2}, 70%, 60%)`,
    };
  };

  const trackColors = getTrackColors();

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      onVolumeChange(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    onVolumeChange(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = clickX / rect.width;
    const seekTime = progress * duration;
    onSeek(seekTime);
  };

  if (!currentTrack) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-[#2B2D42]/95 backdrop-blur-sm border-t border-white/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Waveform Scrubber */}
        <div className="mb-4">
          <WaveformScrubber
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
            audioData={audioData}
            isPlaying={isPlaying}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img
              src={currentTrack.thumbnails.medium.url}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-medium truncate text-sm">
                {currentTrack.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {currentTrack.channelTitle}
              </p>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center space-x-4 mx-8">
            {/* Secondary Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffled 
                    ? 'text-[#FF3CAC] bg-[#FF3CAC]/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="h-4 w-4" />
              </button>

              {onRewind && (
                <button
                  onClick={onRewind}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}

              {onFastForward && (
                <button
                  onClick={onFastForward}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Forward 10 seconds"
                >
                  <FastForward className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Primary Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onPrevious}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Previous"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="p-3 text-white rounded-full transition-all duration-200 shadow-lg"
                style={{
                  background: `linear-gradient(45deg, ${trackColors.primary}, ${trackColors.secondary})`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(45deg, ${trackColors.primary}CC, ${trackColors.secondary}CC)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(45deg, ${trackColors.primary}, ${trackColors.secondary})`;
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </button>
              
              <button
                onClick={onNext}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Next"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Loop Control */}
            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-colors relative ${
                repeatMode !== 'off' 
                  ? 'text-[#FF3CAC] bg-[#FF3CAC]/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="h-4 w-4" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 text-xs bg-[#FF3CAC] text-white rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            {/* Sleep Timer */}
            <SleepTimer onTimerComplete={onSleepTimerComplete} />

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleVolumeToggle}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                title={`Volume: ${volume}%`}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FF3CAC, #784BA0);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FF3CAC, #784BA0);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}