import React, { useState, useRef } from 'react';
import styles from '../styles/CapturePhoto.module.css';

export const CapturePhoto = ({ onPhotoTaken }) => {
  const videoRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [gameAsset, setGameAsset] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Error accessing camera:', err));
  };

  const takePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 100;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setPhoto(photoData);
    onPhotoTaken(photoData);
  };

  const handleAddPlayer = () => {
    setShowCamera(true);
    startCamera();
  };

  return (
    <div className={styles.capturePhotoContainer}>
      {!showCamera ? (
        <button onClick={handleAddPlayer} className={`${styles.button} ${styles.addPlayerButton}`}>
          Add a photo
        </button>
      ) : (
        <>
          <video ref={videoRef} autoPlay width="300" height="200" className={styles.videoPreview} />
          <div className={styles.buttonContainer}>
            <button onClick={takePhoto} className={`${styles.button} ${styles.takePhoto}`}>
              Take Photo
            </button>
          </div>
          {gameAsset ? (
            <img src={gameAsset} alt="Game Asset" width="50" className={styles.photoPreview} />
          ) : (
            photo && <img src={photo} alt="Player Photo" width="50" className={styles.photoPreview} />
          )}
        </>
      )}
    </div>
  );
};