import React, { useState } from 'react';
import { X, Plus, Music, Trash2 } from 'lucide-react';
import { Playlist } from '../types/user';
import { YouTubeVideo } from '../types/youtube';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onCreatePlaylist: (name: string, description?: string) => Promise<Playlist | null>;
  onDeletePlaylist: (playlistId: string) => Promise<void>;
  onAddToPlaylist: (playlistId: string, track: YouTubeVideo) => Promise<void>;
  onCreatePlaylist: (name: string, description?: string) => Playlist;
  onDeletePlaylist: (playlistId: string) => void;
  onAddToPlaylist: (playlistId: string, track: YouTubeVideo) => void;
  selectedTrack?: YouTubeVideo | null;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onAddToPlaylist,
  selectedTrack,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    setLoading(true);
    try {
      const newPlaylist = onCreatePlaylist(
        playlistName.trim(),
        playlistDescription.trim() || undefined
      );
      
      if (newPlaylist && selectedTrack) {
        onAddToPlaylist(newPlaylist.id, selectedTrack);
      }
      
      setPlaylistName('');
      setPlaylistDescription('');
      setShowCreateForm(false);
      if (selectedTrack) onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedTrack) return;
    
    try {
      onAddToPlaylist(playlistId, selectedTrack);
      onClose();
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2B2D42] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {selectedTrack ? 'Add to Playlist' : 'My Playlists'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {selectedTrack && (
          <div className="mb-6 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={selectedTrack.thumbnails.medium.url}
                alt={selectedTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{selectedTrack.title}</p>
                <p className="text-gray-400 text-sm truncate">{selectedTrack.channelTitle}</p>
              </div>
            </div>
          </div>
        )}

        {!showCreateForm ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Playlist</span>
            </button>

            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No playlists yet</p>
                <p className="text-gray-500 text-sm">Create your first playlist to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <button
                      onClick={() => selectedTrack && handleAddToPlaylist(playlist.id)}
                      className="flex-1 flex items-center space-x-3 text-left"
                      disabled={!selectedTrack}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-lg flex items-center justify-center">
                        <Music className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{playlist.name}</p>
                        <p className="text-gray-400 text-sm">
                          {playlist.tracks.length} song{playlist.tracks.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                    
                    {!selectedTrack && (
                      <button
                        onClick={() => onDeletePlaylist(playlist.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCreatePlaylist} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Playlist Name *
              </label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3CAC]/50 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Description (optional)
              </label>
              <textarea
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                placeholder="Enter playlist description"
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3CAC]/50 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setPlaylistName('');
                  setPlaylistDescription('');
                }}
                className="flex-1 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !playlistName.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};