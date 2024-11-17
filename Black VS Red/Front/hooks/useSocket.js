import { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket;

export const useSocket = (
  groupId, 
  username, 
  setUsername, 
  setJoined, 
  votedFor, 
  setVotedFor, 
  turnRedAbilityUsed, 
  setTurnRedAbilityUsed,
  photo,
  setIsProcessing // This is already passed as a parameter
) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [gameState, setGameState] = useState(null);
  const [phase, setPhase] = useState('waiting');
  const [playingTimer, setPlayingTimer] = useState(0);
  const [votingTimer, setVotingTimer] = useState(0);
  const [message, setMessage] = useState('');
  const [round, setRound] = useState(1);
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    if (groupId) {
      socket = io('http://localhost:3001');
      socketEvents();

      // Listen for the 'photo processed' event from the server
      socket.on('photo processed', () => {
        setIsProcessing(false);  // Stop showing the loading indicator when the photo is processed
      });

      // Clean up the event listener when the component unmounts or when socket changes
      return () => {
        socket.off('photo processed');
        socket.disconnect();
      };
    }
  }, [groupId]);

  useEffect(() => {
    let interval;
    if (phase === 'playing' && playingTimer > 0) {
      interval = setInterval(() => setPlayingTimer(prev => prev - 1), 1000);
    } else if (phase === 'voting' && votingTimer > 0) {
      interval = setInterval(() => setVotingTimer(prev => prev - 1), 1000);
    } else if (playingTimer === 0 && phase === 'playing') {
      setPhase('voting');
      setVotingTimer(20);
    } else if (votingTimer === 0 && phase === 'voting') {
      setPhase('end');
    }
    return () => clearInterval(interval);
  }, [phase, playingTimer, votingTimer]);

  const socketEvents = () => {
    socket.on('update users', (users) => setUsers(users));
    socket.on('error', (message) => {
        setError(message); // Set the error message
        setTimeout(() => {setError('');}, 5000); });
    socket.on('game started', (state) => handleGameStart(state));
    socket.on('round start', ({ round }) => {
      setRound(round);
      setPlayingTimer(30);
      setPhase('playing');
      setVotedFor('');
    });
    socket.on('voting start', () => {
      setPhase('voting');
      setVotingTimer(20);
    });
    socket.on('player eliminated', ({ eliminatedPlayer }) => handlePlayerElimination(eliminatedPlayer));
    socket.on('game over', ({ winner }) => setError(`Game Over! ${winner} wins!`));
    socket.on('turn red message', ({ from }) => {
      setMessage(`${from} turned you into a red player!`);
      setTimeout(() => setMessage(''), 10000);
    });
    socket.on('player color changed', ({ player, newColor }) => {
      setGameState((prevState) => ({
        ...prevState,
        players: prevState.players.map((p) =>
          p.name === player ? { ...p, color: newColor } : p
        ),
      }));
    });
    
    socket.on('turn red ability used', () => {
      setTurnRedAbilityUsed(true);
    });

    socket.on('game analysis', ({ analysis }) => {
      setAnalysis(analysis);
    });

    socket.on('update game state', (newState) => setGameState(newState));
  };

  const handleGameStart = (state) => {
    setGameState(state);
    setPhase('playing');
    setPlayingTimer(30);
  };

  const handlePlayerElimination = (eliminatedPlayer) => {
    // Set the elimination message
    setMessage(`${eliminatedPlayer} has been eliminated!`);
  
    // Clear the message after 5 seconds (5000 milliseconds)
    setTimeout(() => {
      setMessage('');
    }, 5000);
    
    setGameState((prevState) => {
      if (!prevState || !prevState.players) {
        return prevState;  // If there are no players or the state is invalid, return the current state
      }
  
      return {
        ...prevState,
        players: prevState.players.map((player) =>
          player.name === eliminatedPlayer ? { ...player, eliminated: true } : player
        ),
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username && groupId) {
      // Check if there's a photo
      if (photo) {
        setIsProcessing(true); // Start showing the loading indicator
      }
      
      // Emit the 'join group' event with the username, groupId, and photo
      socket.emit('join group', { groupId, username, photo });
      
      setJoined(true); // Mark the user as joined
    }
  };

  const handleStartGame = () => {
    if (groupId) {
      socket.emit('start game', { groupId });
    }
  };

  const handleVote = () => {
    if (groupId && votedFor) {
      socket.emit('submit vote', { groupId, votedFor });
      setVotedFor('');
    }
  };

  const handleTurnRed = (targetPlayer) => {
    if (groupId && targetPlayer) {
      socket.emit('turn red', { groupId, targetPlayer });
    }
  };

  const myPlayer = gameState?.players.find((player) => player.name === username);
  const activePlayers = gameState?.players.filter((player) => !player.eliminated) || [];

  return {
    socket,
    gameState,
    users,
    error,
    message,
    phase,
    round,
    playingTimer,
    votingTimer,
    handleSubmit,  
    handleStartGame,
    handleVote,
    handleTurnRed,
    myPlayer,
    activePlayers,
    analysis 
  };
};