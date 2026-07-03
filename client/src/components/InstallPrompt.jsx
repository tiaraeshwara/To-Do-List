import { useState, useEffect } from 'react';
import glassStyles from '../styles/glass.module.css';
import styles from './InstallPrompt.module.css';

/**
 * Shows an "Install App" banner when the browser fires beforeinstallprompt.
 * Hides automatically if already running as standalone (installed).
 */
export default function InstallPrompt() {
  const [prompt, setPrompt]       = useState(null);
  const [visible, setVisible]     = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Dismissed by user this session
    const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) return;

    function onBeforeInstall(e) {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    }

    function onInstalled() {
      setInstalled(true);
      setVisible(false);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    setInstalling(true);
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setInstalling(false);
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setPrompt(null);
    setVisible(false);
  }

  function handleDismiss() {
    sessionStorage.setItem('pwa-prompt-dismissed', '1');
    setVisible(false);
  }

  if (!visible || installed) return null;

  return (
    <div className={`${glassStyles.glass} ${styles.banner}`} role="banner">
      <span className={styles.icon} aria-hidden="true">📱</span>
      <div className={styles.text}>
        <strong>Install To-Do List</strong>
        <span>Add to your home screen for a native app experience</span>
      </div>
      <button
        className={`${glassStyles.glassBtn} ${styles.installBtn}`}
        onClick={handleInstall}
        disabled={installing}
      >
        {installing ? '…' : 'Install'}
      </button>
      <button
        className={styles.closeBtn}
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
      >
        ✕
      </button>
    </div>
  );
}
