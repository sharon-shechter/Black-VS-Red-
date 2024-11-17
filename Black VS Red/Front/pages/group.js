import { useState } from 'react';  
import { useRouter } from 'next/router';
import styles from '../styles/Group.module.css'; 
import { CapturePhoto } from '../components/CapturePhoto';
import { JoinForm } from '../components/JoinForm';
import { GameInfo } from '../components/GameInfo';
import { VotingSection } from '../components/VotingSection';
import { GameActionButtons } from '../components/GameActionButtons';
import { GameAnalysis } from '../components/gameAnalysis';
import { InviteFriendsButton } from '../components/InviteFriendsButton'; // Import the InviteFriendsButton
import { useSocket } from '../hooks/useSocket';

export default function Group() {
  const [username, setUsername] = useState('');
  const [photo, setPhoto] = useState(null);
  const [joined, setJoined] = useState(false);
  const [votedFor, setVotedFor] = useState('');
  const [turnRedAbilityUsed, setTurnRedAbilityUsed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);  

  const router = useRouter();
  const { groupId } = router.query;

  const {
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
  } = useSocket(groupId, username, setUsername, setJoined, votedFor, setVotedFor, turnRedAbilityUsed, setTurnRedAbilityUsed, photo, setIsProcessing); 

  const handlePhotoTaken = (photoData) => {
    setPhoto(photoData);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>RED VS BLACK</h1>
      {message && <h2 className={styles.messageHeader}>{message}</h2>}
      {error && <p className={styles.error}>{error}</p>}

      {!joined ? (
        <div className={styles.joinSection}>
          <JoinForm 
            username={username} 
            setUsername={setUsername} 
            handleSubmit={handleSubmit}
          />
          <CapturePhoto onPhotoTaken={handlePhotoTaken} />
        </div>
      ) : (
        <>
          
          
          {/* Show Invite Friends button before the game starts */}
          <InviteFriendsButton phase={phase} />

          <GameActionButtons
            phase={phase}
            handleStartGame={handleStartGame}
            myPlayer={myPlayer}
            activePlayers={activePlayers.filter(player => player.name !== username && player.color !== 'red')}
            handleTurnRed={handleTurnRed}
            turnRedAbilityUsed={turnRedAbilityUsed}
          />

          <GameInfo 
            round={round} 
            timer={phase === 'playing' ? playingTimer : votingTimer} 
            myPlayer={myPlayer} 
            phase={phase} 
          />

          {phase === 'voting' && !myPlayer?.eliminated && (
            <VotingSection 
              activePlayers={activePlayers}
              username={username}
              votedFor={votedFor} 
              setVotedFor={setVotedFor} 
              handleVote={handleVote} 
            />
          )}
          {isProcessing && (
            <div className={styles.loadingContainer}>
              <p>Processing your photo...</p>
              <div className={styles.spinner}></div>
            </div>
          )}

          <ul className={styles.userList}>
            {users.map((user, index) => (
              <li key={index} className={styles.userListItem}>
                <span className={styles.userName}>{user.name}</span>
                {user.photo && <img src={user.photo} alt={`${user.name}'s Photo`} />}
              </li>
            ))}
          </ul>
          <GameAnalysis analysis={analysis} />
        </>
      )}
    </div>
  );
}
