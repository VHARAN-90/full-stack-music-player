import { useState, useEffect } from 'react';
import { YouTubeVideo } from '../types/youtube';
import { useLocalStorage } from './useLocalStorage';

interface UserPreferences {
  skippedGenres: { [genre: string]: number };
  preferredGenres: { [genre: string]: number };
  skipPatterns: { trackId: string; timestamp: number }[];
  likedArtists: { [artist: string]: number };
}

interface AIAutoplayHook {
  preferences: UserPreferences;
  recordSkip: (track: YouTubeVideo) => void;
  recordLike: (track: YouTubeVideo) => void;
  shouldSkipTrack: (track: YouTubeVideo) => boolean;
  getRecommendedGenre: () => string | null;
  adaptivePlaylist: YouTubeVideo[];
  updateAdaptivePlaylist: (tracks: YouTubeVideo[]) => void;
}

export const useAIAutoplay = (): AIAutoplayHook => {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('aiPreferences', {
    skippedGenres: {},
    preferredGenres: {},
    skipPatterns: [],
    likedArtists: {},
  });

  const [adaptivePlaylist, setAdaptivePlaylist] = useState<YouTubeVideo[]>([]);

  const extractGenre = (track: YouTubeVideo): string => {
    const title = track.title.toLowerCase();
    const channel = track.channelTitle.toLowerCase();
    
    // Genre detection patterns
    const genres = {
      'bollywood': ['bollywood', 'hindi', 'filmi', 'desi'],
      'classical': ['classical', 'carnatic', 'hindustani', 'raga'],
      'pop': ['pop', 'mainstream', 'chart', 'hit'],
      'rock': ['rock', 'metal', 'punk', 'alternative'],
      'electronic': ['electronic', 'edm', 'techno', 'house', 'dubstep'],
      'jazz': ['jazz', 'blues', 'swing'],
      'folk': ['folk', 'traditional', 'acoustic'],
      'devotional': ['devotional', 'bhajan', 'kirtan', 'spiritual'],
      'regional': ['tamil', 'telugu', 'malayalam', 'kannada', 'punjabi', 'bengali'],
    };

    for (const [genre, keywords] of Object.entries(genres)) {
      if (keywords.some(keyword => title.includes(keyword) || channel.includes(keyword))) {
        return genre;
      }
    }

    return 'general';
  };

  const recordSkip = (track: YouTubeVideo) => {
    const genre = extractGenre(track);
    const now = Date.now();
    
    setPreferences(prev => {
      const newSkipPatterns = [...prev.skipPatterns, { trackId: track.id, timestamp: now }]
        .filter(pattern => now - pattern.timestamp < 24 * 60 * 60 * 1000) // Keep only last 24 hours
        .slice(-100); // Keep only last 100 skips

      // Count recent skips for this genre
      const recentGenreSkips = newSkipPatterns.filter(pattern => {
        // This is simplified - in a real app, you'd store genre with skip pattern
        return now - pattern.timestamp < 60 * 60 * 1000; // Last hour
      }).length;

      return {
        ...prev,
        skippedGenres: {
          ...prev.skippedGenres,
          [genre]: (prev.skippedGenres[genre] || 0) + 1,
        },
        skipPatterns: newSkipPatterns,
        // Decrease preference for genres that are skipped frequently
        preferredGenres: {
          ...prev.preferredGenres,
          [genre]: Math.max(0, (prev.preferredGenres[genre] || 0) - (recentGenreSkips > 2 ? 2 : 0.5)),
        },
      };
    });
  };

  const recordLike = (track: YouTubeVideo) => {
    const genre = extractGenre(track);
    const artist = track.channelTitle;
    
    setPreferences(prev => ({
      ...prev,
      preferredGenres: {
        ...prev.preferredGenres,
        [genre]: (prev.preferredGenres[genre] || 0) + 2,
      },
      likedArtists: {
        ...prev.likedArtists,
        [artist]: (prev.likedArtists[artist] || 0) + 1,
      },
    }));
  };

  const shouldSkipTrack = (track: YouTubeVideo): boolean => {
    const genre = extractGenre(track);
    const skippedCount = preferences.skippedGenres[genre] || 0;
    const preferredScore = preferences.preferredGenres[genre] || 0;
    
    // Skip if genre has been skipped more than 3 times and has low preference
    return skippedCount > 3 && preferredScore < 1;
  };

  const getRecommendedGenre = (): string | null => {
    const sortedGenres = Object.entries(preferences.preferredGenres)
      .sort(([, a], [, b]) => b - a)
      .filter(([genre, score]) => score > 0);
    
    if (sortedGenres.length === 0) return null;
    
    // Return top preferred genre with some randomness
    const topGenres = sortedGenres.slice(0, 3);
    const randomIndex = Math.floor(Math.random() * topGenres.length);
    return topGenres[randomIndex][0];
  };

  const updateAdaptivePlaylist = (tracks: YouTubeVideo[]) => {
    // Filter out tracks that should be skipped
    const filteredTracks = tracks.filter(track => !shouldSkipTrack(track));
    
    // Sort by preference score
    const scoredTracks = filteredTracks.map(track => {
      const genre = extractGenre(track);
      const artist = track.channelTitle;
      
      const genreScore = preferences.preferredGenres[genre] || 0;
      const artistScore = preferences.likedArtists[artist] || 0;
      const skipPenalty = preferences.skippedGenres[genre] || 0;
      
      const totalScore = genreScore + artistScore - (skipPenalty * 0.5);
      
      return { track, score: totalScore };
    });
    
    // Sort by score and add some randomness
    const sortedTracks = scoredTracks
      .sort((a, b) => b.score - a.score)
      .map(({ track }) => track);
    
    // Mix high-scoring tracks with some variety
    const adaptedPlaylist = [];
    const highScoring = sortedTracks.slice(0, Math.ceil(sortedTracks.length * 0.7));
    const variety = sortedTracks.slice(Math.ceil(sortedTracks.length * 0.7));
    
    for (let i = 0; i < sortedTracks.length; i++) {
      if (i % 4 === 0 && variety.length > 0) {
        // Add variety track every 4th position
        adaptedPlaylist.push(variety.shift()!);
      } else if (highScoring.length > 0) {
        adaptedPlaylist.push(highScoring.shift()!);
      } else if (variety.length > 0) {
        adaptedPlaylist.push(variety.shift()!);
      }
    }
    
    setAdaptivePlaylist(adaptedPlaylist);
  };

  return {
    preferences,
    recordSkip,
    recordLike,
    shouldSkipTrack,
    getRecommendedGenre,
    adaptivePlaylist,
    updateAdaptivePlaylist,
  };
};