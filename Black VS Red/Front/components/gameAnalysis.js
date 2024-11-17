import { useEffect, useState } from 'react';
import styles from '../styles/GameAnalysis.module.css';

export const GameAnalysis = ({ analysis }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (analysis) {
      setShowAnalysis(true);

      const intervalId = setInterval(() => {
        setFrame((prevFrame) => (prevFrame + 1) % 5);
      }, 200); 

      const timeoutId = setTimeout(() => {
        setShowAnalysis(false);
        clearInterval(intervalId);
      }, 15000);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }
  }, [analysis]);

  return (
    showAnalysis && (
      <div className={styles.popup}>
        <img
          src={`/assets/craftpix-577002-wizard-character-free-sprite/PNG/wizard_ice/1_IDLE_00${frame}.png`}
          alt="Wizard Animation"
          className={styles.wizardImage}
        />
        <h2 className={styles.title}>Wizard Prediction</h2>
        <p className={styles.text}>{analysis}</p>
      </div>
    )
  );
};
