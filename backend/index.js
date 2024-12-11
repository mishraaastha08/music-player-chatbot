const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// Check if necessary environment variables are available
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error("Missing environment variables. Please check your .env file.");
    process.exit(1);
}

// Set CORS headers manually
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4000'); // Your frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Function to get Spotify API token
const getSpotifyToken = async () => {
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(
                        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                    ).toString('base64')}`,
                },
            }
        );
        console.log('Spotify Token:', response.data.access_token); // Log the token
        return response.data.access_token;
    } catch (error) {
        console.error("Error getting Spotify token:", error.message);
        throw new Error("Failed to retrieve Spotify token.");
    }
};

// Chat API Endpoint
app.post('/chat', async (req, res) => {
    try {
        // Predefined emotions and their corresponding Spotify playlists
        const playlists = {
            Anger: '37i9dQZF1DX7d6d3LxGLF',
            Fear: '37i9dQZF1DX1B8E2XhLXlD',
            Disgust: '37i9dQZF1DX5PvDFJ1eI6h',
            Happy: '37i9dQZF1DX4JpqdjJXSoX',
            Sad: '37i9dQZF1DX0y6UvAqfY19',
            Surprise: '37i9dQZF1DX7cRh8bAoxok',
            Neutral: '37i9dQZF1DX1uZ9gThJ0fK',
        };

        // Provide emotion options to the user if none is provided
        if (!req.body.userEmotion) {
            return res.json({
                message: "Please choose one of the following emotions:",
                emotions: Object.keys(playlists),
            });
        }

        const userEmotion = req.body.userEmotion;

        // Validate the user's emotion input
        if (!playlists[userEmotion]) {
            return res.status(400).json({ error: "Invalid emotion. Please choose from the provided options." });
        }

        // Fetch the corresponding Spotify playlist
        const token = await getSpotifyToken();
        const playlistID = playlists[userEmotion];

        const playlistResponse = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistID}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        res.json({
            emotion: userEmotion,
            playlist: playlistResponse.data,
        });
    } catch (error) {
        console.error('Error in /chat:', error.message);
        res.status(500).json({ error: 'Failed to process request.' });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

