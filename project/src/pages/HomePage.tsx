import React, { useState, useEffect } from 'react';
import { Music, Heart, LogOut } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { TrackList } from '../components/TrackList';
import PlayerControls from '../components/PlayerControls';
import { VideoPlayer } from '../components/VideoPlayer';
import { PlaylistModal } from '../components/PlaylistModal';
import { SynestheticBackground } from '../components/SynestheticBackground';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAIAutoplay } from '../hooks/useAIAutoplay';
import { youtubeApi, YouTubeApiService } from '../services/youtubeApi';
import { YouTubeVideo } from '../types/youtube';
import { Playlist } from '../types/user';

export const HomePage: React.FC = () => {
  const [apiService] = useState<YouTubeApiService>(youtubeApi);
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<YouTubeVideo | null>(null);
  const [currentView, setCurrentView] = useState<'search' | 'liked' | 'playlists'>('search');

  const [likedSongs, setLikedSongs] = useLocalStorage<YouTubeVideo[]>('likedSongs', []);
  const [playlists, setPlaylists] = useLocalStorage<Playlist[]>('playlists', []);
  const [audioData, setAudioData] = React.useState<Uint8Array>();
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);

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
  
  const {
    preferences,
    recordSkip,
    recordLike,
    shouldSkipTrack,
    getRecommendedGenre,
    adaptivePlaylist,
    updateAdaptivePlaylist,
  } = useAIAutoplay();

  // Initialize audio analysis
  React.useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        
        analyserRef.current.fftSize = 256;
        
        const updateAudioData = () => {
          if (analyserRef.current) {
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);
            setAudioData(dataArray);
          }
          requestAnimationFrame(updateAudioData);
        };
        
        updateAudioData();
      } catch (error) {
        console.log('Audio analysis not available');
      }
    };
    
    initAudio();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getCurrentTracks = () => {
    switch (currentView) {
      case 'liked':
        return likedSongs;
      case 'playlists':
        return []; // Will be handled separately
      default:
        return searchResults;
    }
  };

  const getCurrentTitle = () => {
    switch (currentView) {
      case 'liked':
        return `Liked Songs (${likedSongs.length})`;
      case 'playlists':
        return 'My Playlists';
      default:
        return isSearching ? 'Searching...' : `Found ${searchResults.length} tracks`;
    }
  };

  const handleSearch = async (query: string) => {
    setCurrentView('search');
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await apiService.searchVideos(query, 20);
      setSearchResults(results);
      
      // Update AI adaptive playlist
      updateAdaptivePlaylist(results);
      
      // Don't automatically set queue on search - let user select a track
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrackSelect = (index: number) => {
    const currentTracks = getCurrentTracks();
    if (currentTracks.length > 0 && index >= 0 && index < currentTracks.length) {
      const selectedTrack = currentTracks[index];
      if (selectedTrack) {
        // Set queue and immediately play the selected track
        setQueue(currentTracks, index);
        // Force immediate playback
        setTimeout(() => {
          play();
        }, 300);
      }
    }
  };

  const toggleVideoView = () => {
    setShowVideo(!showVideo);
  };

  const handleShowLikedSongs = () => {
    setCurrentView('liked');
    if (likedSongs.length > 0) {
      setQueue(likedSongs, 0);
    }
  };

  const handleShowPlaylists = () => {
    setCurrentView('playlists');
    setShowPlaylistModal(true);
  };

  const handleAddToPlaylist = (track: YouTubeVideo) => {
    setSelectedTrackForPlaylist(track);
    setShowPlaylistModal(true);
  };

  const handleLikeToggle = (track: YouTubeVideo) => {
    const isLiked = likedSongs.some(song => song.id === track.id);
    if (isLiked) {
      setLikedSongs(likedSongs.filter(song => song.id !== track.id));
    } else {
      setLikedSongs([...likedSongs, track]);
      recordLike(track); // Record for AI learning
    }
  };
  
  const handleSkipTrack = () => {
    if (playerState.currentTrack) {
      recordSkip(playerState.currentTrack); // Record for AI learning
    }
    playNext();
  };
  
  const handleRewind = () => {
    const rewindTime = Math.max(0, playerState.currentTime - 10);
    seekTo(rewindTime);
  };

  const handleFastForward = () => {
    const forwardTime = Math.min(playerState.duration, playerState.currentTime + 10);
    seekTo(forwardTime);
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
      {/* Synesthetic Background */}
      <SynestheticBackground
        currentTrack={playerState.currentTrack}
        isPlaying={playerState.isPlaying}
        audioData={audioData}
      />
      
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

      <div className="container mx-auto px-4 py-4 md:py-8 pb-32 relative z-10">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-full flex items-center justify-center">
                <Music className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] bg-clip-text text-transparent">
                Harsha Music Player
              </h1>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base px-2">
              Search and play your favorite songs with text or voice search. Songs will automatically play one after another with continuous auto-play.
            </p>
          </div>
        </div>

        {currentView === 'search' && (
          <div className="max-w-2xl mx-auto mb-6 md:mb-8">
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          </div>
        )}

        {currentView !== 'search' && (
          <div className="max-w-2xl mx-auto mb-6 md:mb-8 text-center">
            <button
              onClick={() => setCurrentView('search')}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              ← Back to Search
            </button>
          </div>
        )}

        {currentView === 'playlists' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-6">My Playlists</h2>
              {playlists.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No playlists yet</p>
                  <button
                    onClick={() => setShowPlaylistModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 transition-all duration-200"
                  >
                    Create Your First Playlist
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        if (playlist.tracks.length > 0) {
                          setQueue(playlist.tracks, 0);
                          setCurrentView('search');
                        }
                      }}
                    >
                      <div className="w-full aspect-square bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-lg flex items-center justify-center mb-3">
                        <Music className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-white font-medium truncate">{playlist.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {playlist.tracks.length} song{playlist.tracks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView !== 'playlists' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="order-2 lg:order-1">
              {((currentView === 'search' && hasSearched && (searchResults.length > 0 || isSearching)) || 
                (currentView === 'liked' && likedSongs.length > 0)) && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-semibold text-white">
                      {getCurrentTitle()}
                    </h2>
                    {getCurrentTracks().length > 0 && (
                      <div className="text-xs md:text-sm text-gray-300">
                        {playerState.currentIndex + 1} of {playerState.queue.length}
                      </div>
                    )}
                  </div>

                  {(isSearching && currentView === 'search') ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center p-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-lg mr-3 md:mr-4"></div>
                            <div className="flex-1">
                              <div className="h-3 md:h-4 bg-white/10 rounded mb-2 w-3/4"></div>
                              <div className="h-2 md:h-3 bg-white/10 rounded w-1/2"></div>
                            </div>
                            <div className="w-8 md:w-12 h-3 md:h-4 bg-white/10 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <TrackList
                      tracks={getCurrentTracks()}
                      currentTrack={playerState.currentTrack}
                      isPlaying={playerState.isPlaying}
                      onTrackSelect={handleTrackSelect}
                      onPlay={play}
                      onPause={pause}
                      onToggleVideo={toggleVideoView}
                      showVideo={showVideo}
                      onToggleLike={handleLikeToggle}
                      onAddToPlaylist={handleAddToPlaylist}
                      isTrackLiked={isTrackLiked}
                    />
                  )}
                </div>
              )}
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

        {currentView === 'search' && !hasSearched && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Welcome to Harsha Music Player</h2>
            <p className="text-gray-400 mb-6">Search for your favorite songs to get started</p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300">Try: "Bollywood hits"</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300">Try: "AR Rahman"</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300">Try: "Tamil songs"</span>
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
            onNext={handleSkipTrack}
            onPrevious={playPrevious}
            onSeek={seekTo}
            onVolumeChange={setVolume}
            onSleepTimerComplete={pause}
            onRewind={handleRewind}
            onFastForward={handleFastForward}
            audioData={audioData}
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