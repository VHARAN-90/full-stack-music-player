import React from 'react';
import { YouTubeVideo } from '../types/youtube';
import { youtubeApi } from '../services/youtubeApi';
import { Play, Pause, Heart, MoreVertical, Plus } from 'lucide-react';

interface TrackListProps {
  tracks: YouTubeVideo[];
  currentTrack: YouTubeVideo | null;
  isPlaying: boolean;
  onTrackSelect: (index: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onToggleVideo: () => void;
  showVideo: boolean;
  onToggleLike?: (track: YouTubeVideo) => void;
  onAddToPlaylist?: (track: YouTubeVideo) => void;
  isTrackLiked?: (trackId: string) => boolean;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onPlay,
  onPause,
  onToggleVideo,
  showVideo,
  onToggleLike,
  onAddToPlaylist,
  isTrackLiked,
}) => {
  const [showMenu, setShowMenu] = React.useState<string | null>(null);

  const handleTrackClick = (track: YouTubeVideo, index: number) => {
    // Immediately select and play the track
    onTrackSelect(index);
    // Force play after a short delay to ensure the track is loaded
    setTimeout(() => {
      onPlay();
    }, 200);
  };

  const handleMenuClick = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    setShowMenu(showMenu === trackId ? null : trackId);
  };

  const handleLikeClick = (e: React.MouseEvent, track: YouTubeVideo) => {
    e.stopPropagation();
    onToggleLike?.(track);
  };

  const handleAddToPlaylistClick = (e: React.MouseEvent, track: YouTubeVideo) => {
    e.stopPropagation();
    onAddToPlaylist?.(track);
    setShowMenu(null);
  };

  return (
    <div className="space-y-2 relative">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentlyPlaying = isCurrentTrack && isPlaying;

        return (
          <div
            key={track.id}
            className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              isCurrentTrack
                ? 'bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 border border-[#FF3CAC]/30'
                : 'bg-white/5 hover:bg-white/10 border border-transparent'
            }`}
          >
            <div 
              className="relative flex-shrink-0 mr-4"
              onClick={() => handleTrackClick(track, index)}
            >
              <img
                src={track.thumbnails.medium.url}
                alt={track.title}
                className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                {isCurrentlyPlaying ? (
                  <Pause className="h-4 w-4 md:h-5 md:w-5 text-white" />
                ) : (
                  <Play className="h-4 w-4 md:h-5 md:w-5 text-white" />
                )}
              </div>
            </div>

            <div 
              className="flex-1 min-w-0"
              onClick={() => handleTrackClick(track, index)}
            >
              <h3 className={`font-medium truncate text-sm md:text-base ${
                isCurrentTrack ? 'text-white' : 'text-gray-200'
              }`}>
                {track.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-300 truncate">
                {track.channelTitle}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-300">
              {onToggleLike && (
                <button
                  onClick={(e) => handleLikeClick(e, track)}
                  className={`p-1.5 rounded-full transition-colors ${
                    isTrackLiked?.(track.id)
                      ? 'text-red-500 hover:text-red-400'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart 
                    className={`h-4 w-4 ${isTrackLiked?.(track.id) ? 'fill-current' : ''}`} 
                  />
                </button>
              )}
              
              <span>{youtubeApi.formatDuration(track.duration)}</span>
              
              {onAddToPlaylist && (
                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick(e, track.id)}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {showMenu === track.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[#2B2D42] border border-white/10 rounded-lg shadow-xl z-50">
                        <button
                          onClick={(e) => handleAddToPlaylistClick(e, track)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Playlist</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {isCurrentlyPlaying && (
                <div className="flex space-x-1">
                  <div className="w-1 h-3 md:h-4 bg-[#FF3CAC] rounded-full animate-pulse"></div>
                  <div className="w-1 h-3 md:h-4 bg-[#784BA0] rounded-full animate-pulse animation-delay-75"></div>
                  <div className="w-1 h-3 md:h-4 bg-[#FF3CAC] rounded-full animate-pulse animation-delay-150"></div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};