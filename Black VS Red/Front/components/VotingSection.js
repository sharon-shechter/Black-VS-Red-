import React from 'react';
import styles from '../styles/VotingSection.module.css';

export function VotingSection({ activePlayers, username, votedFor, setVotedFor, handleVote }) {
  return (
    <div className={styles.votingContainer}>
      <select 
        className={styles.selectPlayer}
        value={votedFor} 
        onChange={(e) => setVotedFor(e.target.value)}
      >
        <option value="">Select a player</option>
        {activePlayers
          .filter(player => player.name !== username)
          .map((player, index) => (
            <option key={index} value={player.name}>{player.name}</option>
          ))}
      </select>
      <button 
        onClick={handleVote} 
        className={styles.voteButton}
        disabled={!votedFor}
      >
        Vote
      </button>
    </div>
  );
}