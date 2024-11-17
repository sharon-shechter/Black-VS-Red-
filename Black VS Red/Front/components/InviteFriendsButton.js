import { useState } from 'react';
import styles from '../styles/InviteFriendsButton.module.css'; // Import the CSS module

export const InviteFriendsButton = ({ phase }) => {
    const [copied, setCopied] = useState(false);
  
    // Function to copy the URL to the clipboard
    const handleCopyClick = () => {
      const url = window.location.href; // Get the current URL
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Show "Copied!" for 2 seconds
      });
    };
  
    // Function to generate the WhatsApp sharing URL
    const handleWhatsAppClick = () => {
      const url = window.location.href; // Get the current URL
      const message = `Join this awesome game: ${url}`;
      const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(whatsappURL, '_blank'); // Open WhatsApp in a new tab
    };
  
    // If the game has started, hide the button
    if (phase !== 'waiting') {
      return null;
    }
  
    return (
      <div className={styles.inviteContainer}>
        <button className={styles.inviteButton} onClick={handleCopyClick}>
          Copy Invition Link
        </button>
  
        <button className={styles.whatsappButton} onClick={handleWhatsAppClick}>
          Share via WhatsApp
        </button>
  
        {copied && <p className={styles.copiedMessage}>Copied!</p>}
      </div>
    );
  };