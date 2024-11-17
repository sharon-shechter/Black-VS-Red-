const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
const { GAME_PHASES, groups, games } = require('./gameState');

// Consolidate all imports from apiService into one
const { deleteGame,  addPlayerToGame, updatePlayerVotes, savePlayerPhoto, convertPhotoToAsset, analyzeGame, updatePlayerColor } = require('../api/apiService');

let gameTimeouts = {};  // Store timeout IDs for each game

async function handleJoinGroup(io, socket, { groupId, username, photo = null }) {
  console.log("handle join has started");

  // Ensure the group exists
  if (!groups[groupId]) {
    groups[groupId] = [];
  }

  // Add the player to the group immediately, even before photo processing
  groups[groupId].push({ id: socket.id, name: username, photo: null });

  try {
    let playerAsset = null;

    if (photo) {
      // Emit 'photo processing' to the client to show the loading spinner
      io.to(socket.id).emit('photo processing', { message: 'Processing your photo...' });

      // Save player's photo
      await savePlayerPhoto(groupId, username, photo);

      // Convert photo to game asset
      playerAsset = await convertPhotoToAsset(groupId, username);

      // Update the player's photo in the group
      const playerInGroup = groups[groupId].find(player => player.id === socket.id);
      if (playerInGroup) {
        playerInGroup.photo = playerAsset;
      }

      // Emit 'photo processed' to the client when the photo processing is done
      io.to(socket.id).emit('photo processed', { playerAsset });
    }

    // Add player to the game with their asset or null if no photo
    await addPlayerToGame(groupId, username, 'black', playerAsset);

    // Notify all users in the group about the new player
    io.to(groupId).emit('update users', groups[groupId].map(user => ({ name: user.name, photo: user.photo })));
  } catch (error) {
    console.error('Failed to process photo or join game:', error);
  }

  // Ensure the player is part of the group in Socket.io
  socket.join(groupId);
  io.to(groupId).emit('update users', groups[groupId].map(user => ({ name: user.name, photo: user.photo })));
}


function handleSubmitVote(io, socket, { groupId, votedFor }) {
  if (games[groupId] && games[groupId].phase === GAME_PHASES.VOTING) {
    const player = games[groupId].players.find(p => p.id === socket.id);
    if (player && !player.eliminated) {
      player.votedFor = votedFor;
    }
  }
}


function handleTurnRed(io, socket, { groupId, targetPlayer }) {
  const game = games[groupId];
  if (!game) return;

  const senderPlayer = game.players.find(p => p.id === socket.id);
  const targetPlayerObj = game.players.find(p => p.name === targetPlayer);

  if (senderPlayer && targetPlayerObj && senderPlayer.color === 'red' && !game.turnRedAbilityUsed) {
    game.turnRedAbilityUsed = true;
    targetPlayerObj.color = 'red';

    io.to(groupId).emit('player color changed', { player: targetPlayerObj.name, newColor: 'red' });
    io.to(groupId).emit('turn red ability used');
    io.to(groupId).emit('update game state', game);
    io.to(targetPlayerObj.id).emit('turn red message', { from: senderPlayer.name });
  } else {
    socket.emit('error', 'Unable to use turn red ability.');
  }
}

function handleDisconnect(io, socket) {
  for (let groupId in groups) {
    groups[groupId] = groups[groupId].filter(user => user.id !== socket.id);
    io.to(groupId).emit('update users', groups[groupId].map(user => user.name));
  }
}


function handleStartGame(io, socket, { groupId }) {
  if (groups[groupId] && groups[groupId].length < 2) {
    socket.emit('error', 'At least two players are required to start the game.');
  } else {
    startGame(io, groupId);  // Assuming startGame is responsible for the game logic.
  }
}

function startGame(io, groupId) {
  let players = groups[groupId];
  const redPlayer = _.sample(players);  // Randomly select the red player

  games[groupId] = {
    id: groupId,  
    phase: GAME_PHASES.PLAYING,
    round: 1,
    turnRedAbilityUsed: false,
    players: players.map(player => ({
      id: player.id,
      name: player.name,
      color: player.id === redPlayer.id ? 'red' : 'black',
      score: 0,
      votedFor: null,
      eliminated: false
    }))
  };

  // Notify players that the game has started
  io.to(groupId).emit('game started', games[groupId]);

  // Send API call to update the red player's color in the game database
  updatePlayerColor(groupId, redPlayer.name, 'red')
    .then(response => {
      console.log(`Updated color for player ${redPlayer.name}:`, response);
    })
    .catch(error => {
      console.error(`Failed to update color for player ${redPlayer.name}:`, error);
    });

  // Start the game loop
  runGameLoop(io, groupId);
}

function runGameLoop(io, groupId) {
  const game = games[groupId];
  if (!game.id) {
    console.log(`Game ${groupId} no longer exists. Stopping game loop.`);
    return;  // Stop running the game loop if the game no longer exists
  }

  game.phase = GAME_PHASES.PLAYING;

  io.to(groupId).emit('round start', { round: game.round });

  // If the round is even, call the GPT API to analyze the game
  if (game.round === 2 || game.round === 4) {
        analyzeGame(groupId)
      .then(analysis => {
        if (games[groupId]) {
          io.to(groupId).emit('game analysis', { analysis });
        } else {
          console.log(`Game ${groupId} was deleted before analysis could be emitted.`);
        }
      })
      .catch(error => {
        console.error('Error getting game analysis:', error);
      });
  }

  // Clear any existing timeouts for this game
  if (gameTimeouts[groupId]) {
    clearTimeout(gameTimeouts[groupId]);
  }

  // Set a timeout for the next game phase
  gameTimeouts[groupId] = setTimeout(() => {
    if (!games[groupId]) {
      console.log(`Game ${groupId} was deleted. Stopping further execution.`);
      clearTimeout(gameTimeouts[groupId]);  // Clear the timeout if game is deleted
      return;
    }

    game.phase = GAME_PHASES.VOTING;
    io.to(groupId).emit('voting start');

    // Clear any existing voting timeout
    if (gameTimeouts[groupId]) {
      clearTimeout(gameTimeouts[groupId]);
    }

    // Set a timeout for processing votes
    gameTimeouts[groupId] = setTimeout(() => {
      if (!games[groupId]) {
        console.log(`Game ${groupId} was deleted. Stopping further execution.`);
        clearTimeout(gameTimeouts[groupId]);  // Clear the timeout if game is deleted
        return;
      }

      processVotes(groupId);
      eliminatePlayer(io, groupId);

      if (checkWinCondition(groupId)) {
        endGame(io, groupId);  // If the game ends, the game state will be cleaned up here
      } else {
        game.round++;
        resetVotes(groupId);
        runGameLoop(io, groupId);  // Continue the game loop only if the game still exists
      }
    }, 20000);  // 20 seconds for voting
  }, 30000);  // 30 seconds for playing
}
function processVotes(groupId) {
  const game = games[groupId];

  const votingResults = {};

  game.players.forEach(player => {
      if (!player.eliminated && player.votedFor) {
          const votedPlayer = game.players.find(p => p.name === player.votedFor && !p.eliminated);
          if (votedPlayer) {
              votedPlayer.score++;

              // Update the voting results count
              if (!votingResults[votedPlayer.name]) {
                  votingResults[votedPlayer.name] = 0;
              }
              votingResults[votedPlayer.name]++;

              // Make the API call to update vote count in the Flask server
              updatePlayerVotes(groupId, votedPlayer.name, votingResults[votedPlayer.name])
                  .then(response => console.log(`Updated vote count for player ${votedPlayer.name}:`, response))
                  .catch(error => console.error('Error updating vote count:', error));
          }
      }
  });
}
  

function eliminatePlayer(io, groupId) {
  const game = games[groupId];
  const activePlayers = game.players.filter(p => !p.eliminated);
  const maxScore = Math.max(...activePlayers.map(p => p.score));
  const playersToEliminate = activePlayers.filter(p => p.score === maxScore);

  if (playersToEliminate.length === 1) {
    const eliminatedPlayer = playersToEliminate[0];
    eliminatedPlayer.eliminated = true;
    io.to(groupId).emit('player eliminated', { eliminatedPlayer: eliminatedPlayer.name });
  }
  // If there's a tie, no one gets eliminated this round
}

function checkWinCondition(groupId) {
  const game = games[groupId];
  const redPlayers = game.players.filter(p => p.color === 'red' && !p.eliminated);
  const activePlayers = game.players.filter(p => !p.eliminated);

  if (redPlayers.length === 0) {
    // All red players are eliminated, so black wins
    return 'black';
  } else if (redPlayers.length === activePlayers.length) {
    // All remaining active players are red, so red wins
    return 'red';
  }

  // No team has won yet
  return null;
}

async function endGame(io, groupId) {
  console.log(`Attempting to end game ${groupId}`);
  if (!games[groupId]) return;

  // Check which team won
  const winningTeam = checkWinCondition(groupId);

  // Emit the game over event with the winning team
  if (winningTeam) {
    io.to(groupId).emit('game over', { winner: `${winningTeam} team` });
    console.log(`Game Over! The ${winningTeam} team wins!`);
  } else {
    io.to(groupId).emit('game over', { winner: 'No winner' });
    console.log('Game Over! No winner');
  }

  // Attempt to delete the game from the server
  try {
    await deleteGame(groupId);  // Call delete API when game ends
    console.log(`Game ${groupId} deleted successfully from the server.`);
  } catch (error) {
    console.error(`Failed to delete game ${groupId}:`, error);
  }

  // Cleanup game state
  delete games[groupId];

  // Clear any game-related timeouts
  if (gameTimeouts[groupId]) {
    clearTimeout(gameTimeouts[groupId]);
    delete gameTimeouts[groupId];
  }
}

function resetVotes(groupId) {
  const game = games[groupId];
  game.players.forEach(player => {
    player.votedFor = null;
    player.score = 0;  // Reset scores each round
  });
}

module.exports = {
  handleJoinGroup,
  handleStartGame,
  handleSubmitVote,
  handleTurnRed,
  handleDisconnect,
  startGame,
  runGameLoop,
  processVotes,
  eliminatePlayer,
  checkWinCondition,
  endGame,
  resetVotes
};