import React from 'react';
import { Link } from 'react-router-dom';
import { Music, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { TrackList } from '../components/TrackList';
import PlayerControls from '../components/PlayerControls';
import { VideoPlayer } from '../components/VideoPlayer';
import { PlaylistModal } from '../components/PlaylistModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { YouTubeVideo } from '../types/youtube';
import { Playlist } from '../types/user';

export const PlaylistsPage: React.FC = () => {
  const [likedSongs, setLikedSongs] = useLocalStorage<YouTubeVideo[]>('likedSongs', []);
  const [playlists, setPlaylists] = useLocalStorage<Playlist[]>('playlists', []);
  const [showPlaylistModal, setShowPlaylistModal] = React.useState(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = React.useState<YouTubeVideo | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<Playlist | null>(null);
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

  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks, 0);
    }
  };

  const handleTrackSelect = (index: number) => {
    playTrack(index);
  };

  const handleAddToPlaylist = (track: YouTubeVideo) => {
    setSelectedTrackForPlaylist(track);
    setShowPlaylistModal(true);
  };

  const handleRemoveFromPlaylist = (trackId: string) => {
    if (selectedPlaylist) {
      removeFromPlaylist(selectedPlaylist.id, trackId);
    }
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

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId 
        ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId), updatedAt: new Date() }
        : p
    ));
  };

  if (selectedPlaylist) {
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
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Playlists</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-full flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{selectedPlaylist.name}</h1>
                <p className="text-gray-400">
                  {selectedPlaylist.tracks.length} song{selectedPlaylist.tracks.length !== 1 ? 's' : ''}
                </p>
                {selectedPlaylist.description && (
                  <p className="text-gray-300 text-sm mt-1">{selectedPlaylist.description}</p>
                )}
              </div>
            </div>
          </div>

          {selectedPlaylist.tracks.length === 0 ? (
            <div className="text-center py-16">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">This playlist is empty</h2>
              <p className="text-gray-400 mb-6">Add some songs to get started</p>
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
                    tracks={selectedPlaylist.tracks}
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
  }

  return (
    <div className="min-h-screen bg-[#2B2D42]">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-full flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">My Playlists</h1>
                <p className="text-gray-400">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPlaylistModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Create Playlist</span>
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No playlists yet</h2>
            <p className="text-gray-400 mb-6">Create your first playlist to organize your music</p>
            <button
              onClick={() => setShowPlaylistModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Playlist</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 group"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => handlePlaylistSelect(playlist)}
                >
                  <div className="w-full aspect-square bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                    <Music className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2 truncate">{playlist.name}</h3>
                  {playlist.description && (
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{playlist.description}</p>
                  )}
                  <p className="text-gray-400 text-sm">
                    {playlist.tracks.length} song{playlist.tracks.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-500">
                    {new Date(playlist.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deletePlaylist(playlist.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            onRewind={() => {
              const rewindTime = Math.max(0, playerState.currentTime - 10);
              seekTo(rewindTime);
            }}
            onFastForward={() => {
              const forwardTime = Math.min(playerState.duration, playerState.currentTime + 10);
              seekTo(forwardTime);
            }}
          </div>
        )}
      </div>

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