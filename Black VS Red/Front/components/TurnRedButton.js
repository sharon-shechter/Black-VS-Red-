import { useState } from 'react';
import styles from '../styles/TurnRedButton.module.css';

export function TurnRedButton({ 
  activePlayers, 
  handleTurnRed, 
  turnRedAbilityUsed 
}) {
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');

  const handleConfirm = () => {
    if (selectedPlayer) {
      handleTurnRed(selectedPlayer);
      setShowPlayerList(false);
      setSelectedPlayer('');
    }
  };

  return (
    <div className={styles.turnRedSection}>
      <button 
        onClick={() => setShowPlayerList(!showPlayerList)} 
        className={styles.button} 
        disabled={turnRedAbilityUsed}
      >
        Turn a Player Red
      </button>
      {showPlayerList && (
        <div className={styles.playerList}>
          <select 
            value={selectedPlayer} 
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            <option value="">Select a player</option>
            {activePlayers.map((player) => (
              <option key={player.name} value={player.name}>
                {player.name}
              </option>
            ))}
          </select>
          <button 
            onClick={handleConfirm} 
            className={styles.button} 
            disabled={!selectedPlayer || turnRedAbilityUsed}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}