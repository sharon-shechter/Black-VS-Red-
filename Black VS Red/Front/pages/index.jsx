import { useRouter } from 'next/router';
import styles from '../styles/Index.module.css';
import { createGame } from '../api/apiService';
export default function Index() {
  const router = useRouter();

  // Function to generate a random group ID
  const generateGroupId = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let groupId = '';
    for (let i = 0; i < 8; i++) {
      groupId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return groupId;
  };

  // Function to handle group creation
  const makeGroup = async () => {
    try {
      // Generate groupId locally
      const groupId = generateGroupId();

      // Call the API to create the game in the backend
      await createGame(groupId);

      // Save the groupId to localStorage
      localStorage.setItem('groupId', groupId);

      // Redirect to the group page
      router.push(`/group?groupId=${groupId}`);
    } catch (error) {
      console.error('Error generating groupId:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.welcome}>BLACK VS RED</h1>
      <button className={styles.startButton} onClick={makeGroup}>Let's Start</button>
    </div>
  );
}
