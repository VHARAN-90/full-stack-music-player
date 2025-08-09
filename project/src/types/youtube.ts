export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  duration: string;
  publishedAt: string;
}

export interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      publishedAt: string;
    };
  }>;
}

export interface YouTubeVideoDetailsResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      publishedAt: string;
    };
    contentDetails: {
      duration: string;
    };
  }>;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrack: YouTubeVideo | null;
  queue: YouTubeVideo[];
  currentIndex: number;
}