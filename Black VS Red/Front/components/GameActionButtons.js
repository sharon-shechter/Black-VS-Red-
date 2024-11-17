import styles from '../styles/GameActionButtons.module.css'; 
import { TurnRedButton } from './TurnRedButton'; 

export const GameActionButtons = ({
    phase,
    handleStartGame,
    myPlayer,
    turnRedAbilityUsed,
    activePlayers,
    selectedPlayer,
    setSelectedPlayer,
    handleTurnRed,
    showPlayerList,
    setShowPlayerList
  }) => (
    <div className={styles.container}>
      {phase === 'waiting' && (
        <button 
          onClick={handleStartGame} 
          className={`${styles.startButton} ${styles.pulsing}`}  // Add pulsing animation class
        >
          Start the Game
        </button>
      )}
  
      {myPlayer?.color === 'red' && phase === 'playing' && !turnRedAbilityUsed && (
        <TurnRedButton 
          activePlayers={activePlayers} 
          selectedPlayer={selectedPlayer} 
          setSelectedPlayer={setSelectedPlayer} 
          handleTurnRed={handleTurnRed} 
          showPlayerList={showPlayerList} 
          setShowPlayerList={setShowPlayerList} 
        />
      )}
    </div>
  );
