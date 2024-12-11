import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState(null);

  const emotions = ['Happy', 'Sad', 'Anger', 'Disgust', 'Surprise', 'Fear', 'Neutral'];

  const handleEmotionClick = async (emotion) => {
    try {
      setError(null);
      setPlaylist(null);

      const response = await axios.post('http://localhost:5000/chat', { userEmotion: emotion });
      setPlaylist(response.data.playlist);
    } catch (err) {
      setError('Failed to fetch playlist. Please try again.');
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Emotion-Based Playlist Recommender</h1>
      <p className="subtitle">Choose your emotion to get a personalized playlist</p>

      <div className="button-container">
        {emotions.map((emotion) => (
          <button
            key={emotion}
            className="emotion-button"
            onClick={() => handleEmotionClick(emotion)}
          >
            {emotion}
          </button>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}

      {playlist && (
        <div className="playlist-container">
          <h2>Recommended Playlist:</h2>
          <p><strong>Name:</strong> {playlist.name}</p>
          <p><strong>Description:</strong> {playlist.description}</p>
          <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            Open Playlist on Spotify
          </a>
        </div>
      )}
    </div>
  );
};

export default App;


