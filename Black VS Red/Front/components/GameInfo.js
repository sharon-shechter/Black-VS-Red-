import React from 'react';
import styles from '../styles/Gameinfo.module.css';

export function GameInfo({ round, timer, myPlayer, phase }) {
  return (
    <div className={styles.gameInfoContainer}>
      <div className={styles.roundInfo}>
        <h2 className={styles.roundTitle}>Round {round}</h2>
        <div className={styles.timer}>
          <span className={styles.timerIcon}>⏳</span>
          <span className={styles.timerText}>{timer}s</span>
        </div>
      </div>
      <div className={styles.phaseInfo}>
        <span className={styles.phaseLabel}>Phase:</span>
        <span className={styles.phaseValue}>{phase}</span>
      </div>
      {myPlayer && (
        <div className={`${styles.playerInfo} ${styles[myPlayer.color]}`}>
          <span className={styles.playerLabel}>Your color:</span>
          <span className={styles.playerColor}>{myPlayer.color}</span>
        </div>
      )}
    </div>
  );
}