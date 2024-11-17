import React from 'react';
import styles from '../styles/JoinForm.module.css';

export const JoinForm = ({ username, setUsername, handleSubmit }) => (
  <form className={styles.form} onSubmit={handleSubmit}>
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="Enter your name"
      className={styles.input}
    />
    <button type="submit" className={styles.button}>Join Group</button>
  </form>
);