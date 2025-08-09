import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LikedSongsPage } from './pages/LikedSongsPage';
import { PlaylistsPage } from './pages/PlaylistsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/liked" element={<LikedSongsPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
      </Routes>
    </Router>
  );
}

export default App;