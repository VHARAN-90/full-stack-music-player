import React, { useState } from 'react';
import { Search, Loader2, Mic, MicOff, ChevronDown } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const handleVoiceResult = (transcript: string) => {
    setQuery(transcript);
    if (transcript.trim()) {
      onSearch(transcript.trim());
    }
  };

  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceSearch(handleVoiceResult);

  // Generate search suggestions based on input
  const generateSuggestions = (input: string): string[] => {
    if (!input.trim()) return [];
    
    const musicKeywords = [
      'songs', 'music', 'hits', 'best of', 'playlist', 'album', 'live', 'acoustic', 'remix', 'cover'
    ];
    
    const genres = [
      'bollywood', 'pop', 'rock', 'classical', 'jazz', 'electronic', 'hip hop', 'country', 'folk', 'blues'
    ];
    
    const moods = [
      'romantic', 'sad', 'happy', 'party', 'workout', 'relaxing', 'energetic', 'chill'
    ];
    
    const suggestions: string[] = [];
    const lowerInput = input.toLowerCase();
    
    // Add direct suggestions
    suggestions.push(input);
    
    // Add keyword combinations
    musicKeywords.forEach(keyword => {
      if (!lowerInput.includes(keyword)) {
        suggestions.push(`${input} ${keyword}`);
      }
    });
    
    // Add genre combinations
    genres.forEach(genre => {
      if (lowerInput.includes(genre.split(' ')[0])) {
        suggestions.push(`${input} songs`);
        suggestions.push(`best ${input} hits`);
      }
    });
    
    // Add mood combinations
    moods.forEach(mood => {
      if (lowerInput.includes(mood)) {
        suggestions.push(`${input} songs`);
        suggestions.push(`${input} playlist`);
      }
    });
    
    // Add artist-specific suggestions
    if (input.length > 2) {
      suggestions.push(`${input} all songs`);
      suggestions.push(`${input} greatest hits`);
      suggestions.push(`${input} latest songs`);
      suggestions.push(`${input} top 10`);
    }
    
    return [...new Set(suggestions)].slice(0, 8); // Remove duplicates and limit to 8
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(value.length > 0 && newSuggestions.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          setQuery(selectedSuggestion);
          setShowSuggestions(false);
          onSearch(selectedSuggestion);
        } else if (query.trim()) {
          setShowSuggestions(false);
          onSearch(query.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = query.trim();
    if (searchQuery) {
      setShowSuggestions(false);
      onSearch(searchQuery);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="mb-4 md:mb-6 relative">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 md:space-x-3">
        <div className="relative flex-1" onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
          <input
            type="text"
            value={isListening ? transcript : query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.length > 0 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={isListening ? "Listening... Speak now!" : "Search for songs, artists, or playlists"}
            className={`w-full pl-10 md:pl-12 pr-16 md:pr-20 py-2.5 md:py-3 text-sm md:text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3CAC]/50 focus:border-transparent transition-all duration-200 ${
              isListening ? 'ring-2 ring-red-500/50 border-red-500/30' : ''
            }`}
            disabled={isLoading}
          />
          <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 text-gray-300 animate-spin" />
            ) : (
              <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-300" />
            )}
          </div>
          
          {/* Dropdown indicator */}
          {suggestions.length > 0 && (
            <div className="absolute right-16 md:right-20 top-1/2 transform -translate-y-1/2">
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showSuggestions ? 'rotate-180' : ''}`} />
            </div>
          )}
          
          <button
            type="submit"
            disabled={(!query.trim() && !transcript.trim()) || isLoading}
            className="absolute right-1.5 md:right-2 top-1/2 transform -translate-y-1/2 px-2 md:px-4 py-1 md:py-1.5 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 transition-all duration-200 text-xs md:text-sm font-medium"
          >
            Search
          </button>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#2B2D42] border border-white/10 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-b-0 ${
                    index === selectedSuggestionIndex
                      ? 'bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {isSupported && (
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={isLoading}
            className={`p-2.5 md:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/25'
                : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border border-white/20'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice search'}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Mic className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </button>
        )}
      </form>
      
      {isListening && (
        <div className="mt-2 md:mt-3 p-2 md:p-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-xs md:text-sm font-medium">
              Listening... Speak clearly to search for music
            </span>
          </div>
          {transcript && (
            <div className="mt-1 md:mt-2 text-white text-xs md:text-sm">
              "{transcript}"
            </div>
          )}
        </div>
      )}
      
      {!isSupported && (
        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg backdrop-blur-sm">
          <span className="text-yellow-400 text-xs">
            Voice search is not supported in your browser
          </span>
        </div>
      )}
    </div>
  );
};