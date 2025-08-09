import { useEffect, useRef, useState, useCallback } from 'react';
import { YouTubeVideo, PlayerState } from '../types/youtube';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const useYouTubePlayer = () => {
  const playerRef = useRef<any>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 50,
    currentTrack: null,
    queue: [],
    currentIndex: 0,
  });
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playNext = useCallback(() => {
    setPlayerState(prev => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex < prev.queue.length) {
        const nextTrack = prev.queue[nextIndex];
        if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
          setTimeout(() => {
            playerRef.current.loadVideoById(nextTrack.id);
          }, 100);
        }
        return {
          ...prev,
          currentIndex: nextIndex,
          currentTrack: nextTrack,
        };
      } else {
        return { ...prev, isPlaying: false };
      }
    });
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  const initializePlayer = () => {
    playerRef.current = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        cc_load_policy: 0,
        iv_load_policy: 3,
        autohide: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          setIsPlayerReady(true);
          playerRef.current.setVolume(50);
        },
        onStateChange: handleStateChange,
      },
    });
  };

  const handleStateChange = (event: any) => {
    const state = event.data;
    
    if (state === window.YT.PlayerState.PLAYING) {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      startTimeUpdate();
    } else if (state === window.YT.PlayerState.PAUSED) {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      stopTimeUpdate();
    } else if (state === window.YT.PlayerState.ENDED) {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      stopTimeUpdate();
      setTimeout(() => {
        playNext();
      }, 500);
    }
  };

  const startTimeUpdate = () => {
    stopTimeUpdate();
    timeUpdateIntervalRef.current = setInterval(() => {
      if (playerRef.current && 
          typeof playerRef.current.getCurrentTime === 'function' && 
          typeof playerRef.current.getDuration === 'function' &&
          typeof playerRef.current.getPlayerState === 'function') {
        
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        
        setPlayerState(prev => ({
          ...prev,
          currentTime,
          duration,
        }));

        if (playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
          stopTimeUpdate();
        }
      }
    }, 1000);
  };

  const stopTimeUpdate = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  const loadVideo = (videoId: string) => {
    if (playerRef.current && isPlayerReady && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById({
        videoId: videoId,
        startSeconds: 0,
        suggestedQuality: 'default'
      });
      // Immediately play after loading
      setTimeout(() => {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      }, 100);
    }
  };

  const play = () => {
    if (playerRef.current && isPlayerReady && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
    }
  };

  const pause = () => {
    if (playerRef.current && isPlayerReady && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
    }
  };

  const setVolume = (volume: number) => {
    if (playerRef.current && isPlayerReady && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume);
      setPlayerState(prev => ({ ...prev, volume }));
    }
  };

  const seekTo = (seconds: number) => {
    if (playerRef.current && isPlayerReady && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds);
    }
  };

  const setQueue = (queue: YouTubeVideo[], startIndex: number = 0) => {
    setPlayerState(prev => ({
      ...prev,
      queue,
      currentIndex: startIndex,
      currentTrack: queue[startIndex] || null,
    }));

    if (queue[startIndex]) {
      loadVideo(queue[startIndex].id);
    }
  };

  const playPrevious = () => {
    const prevIndex = playerState.currentIndex - 1;
    if (prevIndex >= 0) {
      const prevTrack = playerState.queue[prevIndex];
      setPlayerState(prev => ({
        ...prev,
        currentIndex: prevIndex,
        currentTrack: prevTrack,
      }));
      loadVideo(prevTrack.id);
    }
  };

  const playTrack = (index: number) => {
    if (index >= 0 && index < playerState.queue.length) {
      const track = playerState.queue[index];
      setPlayerState(prev => ({
        ...prev,
        currentIndex: index,
        currentTrack: track,
      }));
      loadVideo(track.id);
    }
  };

  return {
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
  };
};