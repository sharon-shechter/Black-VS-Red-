const axios = require('axios');

const BASE_URL = 'http://localhost:5000';  // Your Flask server URL


// Function to create a new game
async function createGame(gameId) {
    try {
        const response = await axios.post(`${BASE_URL}/create_game/${gameId}`);
        return response.data;
    } catch (error) {
        console.error('Error creating game:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to delete a game
async function deleteGame(gameId) {
    try {
        const response = await axios.delete(`${BASE_URL}/delete_game/${gameId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting game:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to get game details
async function getGame(gameId) {
    try {
        const response = await axios.get(`${BASE_URL}/get_game/${gameId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting game:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to add a player to a game
async function addPlayerToGame(gameId, playerName, playerColor, playerPhoto) {
    try {
        const response = await axios.post(`${BASE_URL}/add_player/${gameId}`, {
            name: playerName,
            color: playerColor,
            photo: playerPhoto  // Include the photo in the request
        });
        return response.data;
    } catch (error) {
        console.error('Error adding player to game:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to update the player's vote count
async function updatePlayerVotes(gameId, playerName, votes) {
    try {
        const response = await axios.patch(`${BASE_URL}/update_player_votes/${gameId}/${playerName}`, {
            votes: votes
        });
        return response.data;
    } catch (error) {
        console.error('Error updating player votes:', error.response ? error.response.data : error.message);
        throw error;
    }
}
async function analyzeGame(gameId) {
    try {
        const response = await axios.get(`${BASE_URL}/analyze_game/${gameId}`);
        return response.data.analysis;
    } catch (error) {
        console.error('Error analyzing game:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to save the player's photo
async function savePlayerPhoto(gameId, playerName, playerPhoto) {
    try {
        const response = await axios.post(`${BASE_URL}/save_photo`, {
            game_id: gameId,
            player_name: playerName,
            photo: playerPhoto
        });
        return response.data;
    } catch (error) {
        console.error('Error saving player photo:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to convert the player's photo into a game asset using DALL·E
async function convertPhotoToAsset(gameId, playerName) {
    try {
        const response = await axios.post(`${BASE_URL}/convert_to_asset`, {
            game_id: gameId,
            player_name: playerName
        });
        return response.data.asset;  // Return only the asset URL
    } catch (error) {
        console.error('Error converting photo to game asset:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// API call to update player's color
async function updatePlayerColor(gameId, playerName, newColor) {
    try {
        const response = await axios.patch(`${BASE_URL}/update_player_color/${gameId}/${playerName}`, {
            color: newColor
        });
        return response.data;
    } catch (error) {
        console.error('Error updating player color:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = {
    savePlayerPhoto,
    convertPhotoToAsset,
    createGame,
    deleteGame,
    addPlayerToGame,
    updatePlayerVotes,
    analyzeGame,
    getGame,
    updatePlayerColor  
};