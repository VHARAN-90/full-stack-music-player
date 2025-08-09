import { YouTubeVideo } from './youtube';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: YouTubeVideo[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isPublic: boolean;
}

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  likedSongs: YouTubeVideo[];
  playlists: string[]; // playlist IDs
  createdAt: Date;
  updatedAt: Date;
}