import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Music } from 'lucide-react';
import { TrackList } from '../components/TrackList';
import PlayerControls from '../components/PlayerControls';
import { VideoPlayer } from '../components/VideoPlayer';
import { PlaylistModal } from '../components/PlaylistModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { YouTubeVideo } from '../types/youtube';
import { Playlist } from '../types/user';

export const LikedSongsPage: React.FC = () => {
  const [likedSongs, setLikedSongs] = useLocalStorage<YouTubeVideo[]>('likedSongs', []);
  const [playlists, setPlaylists] = useLocalStorage<Playlist[]>('playlists', []);
  const [showPlaylistModal, setShowPlaylistModal] = React.useState(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = React.useState<YouTubeVideo | null>(null);
  const [showVideo, setShowVideo] = React.useState(false);

  const {
    playerState,
    isPlayerReady,
    play,
    pause,
    setVolume,
    seekTo,
    setQueue,
    playNext,
    playPrevious,
    playTrack,
  } = useYouTubePlayer();

  React.useEffect(() => {
    if (likedSongs.length > 0) {
      setQueue(likedSongs, 0);
    }
  }, [likedSongs, setQueue]);

  const handleTrackSelect = (index: number) => {
    playTrack(index);
  };

  const handleAddToPlaylist = (track: YouTubeVideo) => {
    setSelectedTrackForPlaylist(track);
    setShowPlaylistModal(true);
  };

  const toggleVideoView = () => {
    setShowVideo(!showVideo);
  };

  const toggleLikedSong = (track: YouTubeVideo) => {
    const isLiked = likedSongs.some(song => song.id === track.id);
    if (isLiked) {
      setLikedSongs(likedSongs.filter(song => song.id !== track.id));
    } else {
      setLikedSongs([...likedSongs, track]);
    }
  };

  const isTrackLiked = (trackId: string): boolean => {
    return likedSongs.some(song => song.id === trackId);
  };

  const createPlaylist = (name: string, description?: string): Playlist => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'local',
      isPublic: false,
    };
    setPlaylists([...playlists, newPlaylist]);
    return newPlaylist;
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };

  const addToPlaylist = (playlistId: string, track: YouTubeVideo) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId && !p.tracks.some(t => t.id === track.id)
        ? { ...p, tracks: [...p.tracks, track], updatedAt: new Date() }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-[#2B2D42]">
      <div 
        id="youtube-player" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          width: '0px',
          height: '0px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      ></div>

      <div className="container mx-auto px-4 py-4 md:py-8 pb-32">
        <div className="flex items-center mb-6 md:mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Liked Songs</h1>
              <p className="text-gray-400">{likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {likedSongs.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No liked songs yet</h2>
            <p className="text-gray-400 mb-6">Songs you like will appear here</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 transition-all duration-200"
            >
              <Music className="h-5 w-5" />
              <span>Discover Music</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="order-2 lg:order-1">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                <TrackList
                  tracks={likedSongs}
                  currentTrack={playerState.currentTrack}
                  isPlaying={playerState.isPlaying}
                  onTrackSelect={handleTrackSelect}
                  onPlay={play}
                  onPause={pause}
                  onToggleVideo={toggleVideoView}
                  showVideo={showVideo}
                  onToggleLike={toggleLikedSong}
                  onAddToPlaylist={handleAddToPlaylist}
                  isTrackLiked={isTrackLiked}
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              {playerState.currentTrack && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-semibold text-white">Now Playing</h2>
                    <button
                      onClick={toggleVideoView}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg text-xs md:text-sm font-medium hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 transition-all duration-200"
                    >
                      {showVideo ? 'Hide Video' : 'Show Video'}
                    </button>
                  </div>
                  
                  <VideoPlayer
                    currentTrack={playerState.currentTrack}
                    showVideo={showVideo}
                    isPlaying={playerState.isPlaying}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isPlayerReady && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <PlayerControls
            playerState={playerState}
            onPlay={play}
            onPause={pause}
            onNext={playNext}
            onPrevious={playPrevious}
            onSeek={seekTo}
            onVolumeChange={setVolume}
            onSleepTimerComplete={pause}
            onRewind={() => {
              const rewindTime = Math.max(0, playerState.currentTime - 10);
              seekTo(rewindTime);
            }}
            onFastForward={() => {
              const forwardTime = Math.min(playerState.duration, playerState.currentTime + 10);
              seekTo(forwardTime);
            }}
          />
        </div>
      )}

      <PlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => {
          setShowPlaylistModal(false);
          setSelectedTrackForPlaylist(null);
        }}
        playlists={playlists}
        onCreatePlaylist={createPlaylist}
        onDeletePlaylist={deletePlaylist}
        onAddToPlaylist={addToPlaylist}
        selectedTrack={selectedTrackForPlaylist}
      />
    </div>
  );
};