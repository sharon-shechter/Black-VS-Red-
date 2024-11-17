const { handleJoinGroup, handleStartGame, handleSubmitVote, handleTurnRed, handleDisconnect } = require('./gameLogic');
const { groups } = require('./gameState');
const { deleteGame, getGame } = require('../api/apiService');  // Import getGame and deleteGame from apiService
// Create an object to store all connected users, even after they disconnect
let allConnectedUsers = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join group', (data) => {
      handleJoinGroup(io, socket, data);

      // Add the user to the allConnectedUsers object
      allConnectedUsers[socket.id] = data.username;

      // After joining the group, print the number of users connected to the group (game)
      printConnectedUsersForGroup(io, data.groupId);  // Pass io here
      
      // Print the list of all users that have ever connected
      printAllConnectedUsers();
    });

    socket.on('start game', (data) => handleStartGame(io, socket, data));
    socket.on('submit vote', (data) => handleSubmitVote(io, socket, data));
    socket.on('turn red', (data) => handleTurnRed(io, socket, data));

    socket.on('disconnect', () => {
      handleDisconnect(io, socket);

      // Remove the user from active groups but keep them in the allConnectedUsers list
      delete allConnectedUsers[socket.id]; // Remove the user from the active list
      
      // Check all groups and print updated connected users after disconnect
      Object.keys(groups).forEach(groupId => printConnectedUsersForGroup(io, groupId));  // Pass io here

      // Print the list of all users that have ever connected
      printAllConnectedUsers();
    });
  });
};

// Function to print the number of connected users and their names for a specific groupId
async function printConnectedUsersForGroup(io, groupId) {
  const group = groups[groupId];

  if (!group || group.length === 0) {
    // Add a delay before checking connected users to avoid race conditions
    await new Promise(resolve => setTimeout(resolve, 1000));  // Delay for 1 second

    // Recheck if the group is still empty after the delay
    if (!groups[groupId] || groups[groupId].length === 0) {
      console.log(`Group_id: ${groupId} - Connected users: 0`);

      // Check if the game is still in the database before attempting to delete
      try {
        const gameData = await getGame(groupId);  // Ensure getGame is imported from apiService
        if (!gameData || gameData.message === 'Game not found') {
          console.log(`Game ${groupId} was already deleted or not found in the database.`);
          return;  // Exit if the game is already deleted
        }
      } catch (error) {
        console.error(`Failed to check game existence for ${groupId}:`, error);
        return;  // Exit if there's an error checking the game
      }

      // Call the deleteGame API since there are no more connected users and the game still exists
      try {
        await deleteGame(groupId);  // Use the deleteGame function from apiService
        console.log(`Game ${groupId} deleted successfully.`);
        io.to(groupId).emit('game_deleted', { message: `Game ${groupId} has been deleted.` });
        io.in(groupId).socketsLeave(groupId);

        const socketsInRoom = await io.in(groupId).fetchSockets();
        socketsInRoom.forEach((socket) => {
          socket.disconnect();
        });
      } catch (error) {
        console.error(`Failed to delete game ${groupId}:`, error);
      }

      return;
    }
  }

  const userCount = group.length;
  const userNames = group.map(user => user.name);
  console.log(`Group_id: ${groupId} - Connected users: ${userCount}`);
  console.log(`Usernames: ${userNames.join(', ')}`);
}
// Function to print all users who have ever connected to the server
function printAllConnectedUsers() {
  const userCount = Object.keys(allConnectedUsers).length;
  const userNames = Object.values(allConnectedUsers);
  console.log(`Total users ever connected: ${userCount}`);
  console.log(`Usernames: ${userNames.join(', ')}`);
}
