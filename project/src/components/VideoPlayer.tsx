import React from 'react';
import { YouTubeVideo } from '../types/youtube';
import { Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  currentTrack: YouTubeVideo | null;
  showVideo: boolean;
  isPlaying: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentTrack,
  showVideo,
  isPlaying,
}) => {
  if (!currentTrack) {
    return (
      <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <Play className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <p className="text-sm md:text-base">No song selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        {showVideo ? (
          <iframe
            src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=${isPlaying ? 1 : 0}&controls=1&modestbranding=1&rel=0&showinfo=0`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentTrack.title}
          />
        ) : (
          <div className="relative w-full h-full">
            <img
              src={currentTrack.thumbnails.high.url}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  {isPlaying ? (
                    <Pause className="h-8 w-8 md:h-10 md:w-10" />
                  ) : (
                    <Play className="h-8 w-8 md:h-10 md:w-10" />
                  )}
                </div>
                <p className="text-xs md:text-sm opacity-80">Click "Show Video" to watch</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-white text-sm md:text-base line-clamp-2">
          {currentTrack.title}
        </h3>
        <p className="text-gray-400 text-xs md:text-sm">
          {currentTrack.channelTitle}
        </p>
      </div>
    </div>
  );
};