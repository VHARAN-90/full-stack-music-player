# 🎵 Harsha Music Player

A modern, feature-rich music player built with React, TypeScript, and the YouTube API. Search, play, and organize your favorite music with an intuitive interface and powerful features.

![Harsha Music Player](https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### 🎧 Core Music Features
- **YouTube Integration**: Search and play millions of songs from YouTube
- **Smart Search**: Text and voice search with music-focused results
- **Continuous Playback**: Auto-play queue with seamless track transitions
- **High-Quality Audio**: Stream music with optimal audio quality
- **Artist Recognition**: Intelligent extraction of artist names from video titles

### 🎮 Player Controls
- **Full Media Controls**: Play, pause, skip, previous, volume control
- **Progress Seeking**: Click anywhere on the progress bar to jump to that position
- **Volume Control**: Smooth volume adjustment with visual feedback
- **Queue Management**: View and control your current playlist queue

### 💤 Sleep Timer
- **Flexible Duration**: Set timer for 15, 30, 45, 60, 90, or 120 minutes
- **Custom Timer**: Set any duration from 1 to 480 minutes
- **Timer Controls**: Pause, resume, and reset the sleep timer
- **Visual Countdown**: Real-time countdown display with hours:minutes:seconds format
- **Auto-Stop**: Music automatically pauses when timer reaches zero

### 📱 User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient themes with glassmorphism effects
- **Dark Theme**: Eye-friendly dark interface with vibrant accents
- **Smooth Animations**: Micro-interactions and hover effects
- **Voice Search**: Hands-free music discovery with speech recognition

### 💾 Data Management
- **Local Storage**: All data stored locally in your browser
- **Liked Songs**: Save your favorite tracks for quick access
- **Custom Playlists**: Create and organize multiple playlists
- **Persistent Data**: Your music library persists across browser sessions
- **No Account Required**: Use immediately without registration

### 🎥 Video Features
- **Video Toggle**: Switch between audio-only and video playback
- **Thumbnail Display**: Beautiful album art and video thumbnails
- **Full-Screen Support**: Watch music videos in full-screen mode

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/harsha-music-player.git
   cd harsha-music-player
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to start using the music player.

### YouTube API Setup (Optional)
The app comes with a pre-configured YouTube API key for immediate use. For production deployment or heavy usage, you may want to set up your own:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Replace the API key in `src/services/youtubeApi.ts`

## 🎯 How to Use

### Basic Usage
1. **Search for Music**: Use the search bar to find songs, artists, or albums
2. **Voice Search**: Click the microphone icon for hands-free search
3. **Play Music**: Click on any track to start playing
4. **Control Playback**: Use the bottom player controls for full media control

### Sleep Timer
1. **Access Timer**: Click the clock icon in the player controls
2. **Set Duration**: Choose from preset times (15-120 minutes) or set custom duration
3. **Start Timer**: Click "Start Timer" to begin countdown
4. **Manage Timer**: Pause, resume, or reset the timer as needed
5. **Auto-Stop**: Music will automatically pause when timer reaches zero

### Managing Your Library
1. **Like Songs**: Click the heart icon to add songs to your liked collection
2. **Create Playlists**: Use the "+" button to create custom playlists
3. **Organize Music**: Add songs to playlists using the menu button
4. **Access Collections**: Navigate between search results, liked songs, and playlists

### Advanced Features
- **Queue Control**: View current queue and jump to any track
- **Video Mode**: Toggle between audio and video playback
- **Responsive Controls**: All features work seamlessly on mobile devices

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with excellent IDE support
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Vite**: Fast build tool and development server

### APIs & Services
- **YouTube Data API v3**: Music search and metadata
- **YouTube Player API**: Embedded video/audio playback
- **Web Speech API**: Voice recognition for search

### Browser APIs
- **Local Storage**: Client-side data persistence
- **Media Session API**: System media controls integration
- **Intersection Observer**: Performance-optimized scrolling

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── PlayerControls.tsx    # Main player interface
│   ├── SearchBar.tsx         # Search with voice support
│   ├── TrackList.tsx         # Song list display
│   ├── VideoPlayer.tsx       # Video/audio player
│   ├── SleepTimer.tsx        # Sleep timer component
│   └── PlaylistModal.tsx     # Playlist management
├── hooks/              # Custom React hooks
│   ├── useYouTubePlayer.ts   # YouTube player logic
│   ├── useVoiceSearch.ts     # Voice recognition
│   ├── useLocalStorage.ts    # Local data management
│   └── useSleepTimer.ts      # Sleep timer functionality
├── pages/              # Main application pages
│   ├── HomePage.tsx          # Main music interface
│   ├── LikedSongsPage.tsx    # Liked songs collection
│   └── PlaylistsPage.tsx     # Playlist management
├── services/           # External API services
│   └── youtubeApi.ts         # YouTube API integration
├── types/              # TypeScript type definitions
│   ├── youtube.ts            # YouTube-related types
│   └── user.ts               # User data types
└── App.tsx             # Main application component
```

## 🎨 Customization

### Themes
The app uses CSS custom properties for easy theming. Main color variables:
- `--primary`: #FF3CAC (Pink)
- `--secondary`: #784BA0 (Purple)
- `--background`: #2B2D42 (Dark Blue)

### API Configuration
Modify `src/services/youtubeApi.ts` to:
- Change search parameters
- Adjust result limits
- Modify artist name extraction logic

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Quality
- **ESLint**: Configured with React and TypeScript rules
- **TypeScript**: Strict mode enabled for type safety
- **Prettier**: Code formatting (configure as needed)

## 🌟 Features in Detail

### Sleep Timer
The sleep timer is perfect for bedtime listening:
- **Preset Options**: Quick selection of common durations
- **Custom Duration**: Set any time from 1 minute to 8 hours
- **Visual Feedback**: Clear countdown display with time remaining
- **Pause/Resume**: Full control over timer state
- **Graceful Stop**: Music fades out smoothly when timer completes

### Voice Search
Hands-free music discovery:
- **Browser Support**: Works in Chrome, Edge, and Safari
- **Real-time Feedback**: See your speech converted to text
- **Auto-search**: Automatically searches when speech is complete
- **Visual Indicators**: Clear UI feedback for listening state

### Smart Artist Detection
Advanced algorithm for extracting artist names:
- **Pattern Recognition**: Identifies common naming patterns
- **Channel Analysis**: Evaluates channel names for artist info
- **Fallback Logic**: Multiple strategies for accurate detection
- **Clean Results**: Removes promotional text and formatting

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Add proper error handling
- Include JSDoc comments for complex functions
- Test on multiple browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **YouTube API**: For providing access to millions of songs
- **React Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide Icons**: For beautiful, consistent icons
- **Pexels**: For high-quality stock images

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/harsha-music-player/issues) page
2. Create a new issue with detailed information
3. Include browser version and steps to reproduce

## 🔮 Roadmap

Future features we're considering:
- **Equalizer**: Audio frequency adjustment
- **Lyrics Display**: Real-time lyrics synchronization
- **Social Features**: Share playlists with friends
- **Offline Mode**: Download songs for offline listening
- **Themes**: Multiple color schemes and customization
- **Keyboard Shortcuts**: Power user controls
- **Last.fm Integration**: Scrobbling and recommendations

---

**Made with ❤️ by Harsha** - Enjoy your music! 🎵