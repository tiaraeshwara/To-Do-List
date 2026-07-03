import { useState, useEffect, useRef, useCallback } from 'react';
import { useTasks } from '../hooks/useTasks.js';
import * as api from '../services/api.js';
import glassStyles from '../styles/glass.module.css';
import styles from './ConfirmDeleteDialog.module.css';

const UNDO_MS = 5000;

/**
 * Two-phase delete flow:
 *  1. Confirm dialog — ask before acting.
 *  2. Toast phase — optimistic remove + 5-second undo window before the API fires.
 *
 * @param {{ task: import('../services/api.js').Task, onClose: () => void }} props
 */
export default function ConfirmDeleteDialog({ task, onClose }) {
  const { optimisticDelete, restoreTask } = useTasks();
  const [phase, setPhase]       = useState('confirm'); // 'confirm' | 'toast'
  const [progress, setProgress] = useState(100);

  const timerRef = useRef(null);
  const rafRef   = useRef(null);
  const startRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Keyboard: Escape to cancel / undo
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return;
      if (phase === 'confirm') onClose();
      else handleUndo();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleUndo = useCallback(() => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    restoreTask(task);
    onClose();
  }, [restoreTask, task, onClose]);

  function handleConfirm() {
    // Optimistically remove from local state
    optimisticDelete(task.id);
    setPhase('toast');
    setProgress(100);
    startRef.current = Date.now();

    // Animate progress bar
    function tick() {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / UNDO_MS) * 100);
      setProgress(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    // Fire real DELETE after the undo window
    timerRef.current = setTimeout(async () => {
      cancelAnimationFrame(rafRef.current);
      try {
        await api.deleteTask(task.id);
      } catch {
        // API failed — restore the task
        restoreTask(task);
      }
      onClose();
    }, UNDO_MS);
  }

  /* ── Toast phase ── */
  if (phase === 'toast') {
    return (
      <div className={styles.toastWrapper} role="status" aria-live="polite">
        <div className={`${glassStyles.glass} ${styles.toast}`}>
          <span className={styles.toastMsg}>
            🗑 "<strong>{task.title}</strong>" deleted
          </span>
          <button
            className={`${glassStyles.glassBtn} ${styles.undoBtn}`}
            onClick={handleUndo}
            autoFocus
          >
            Undo
          </button>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }

  /* ── Confirm phase ── */
  return (
    <div className={glassStyles.overlay} onClick={onClose}>
      <div
        className={`${glassStyles.glass} ${styles.dialog}`}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label="Confirm task deletion"
      >
        <div className={styles.icon} aria-hidden="true">🗑</div>
        <h3 className={styles.heading}>Delete this task?</h3>
        <p className={styles.body}>
          "<strong>{task.title}</strong>" will be removed. You'll have 5 seconds
          to undo after confirming.
        </p>
        <div className={styles.actions}>
          <button className={glassStyles.glassBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${glassStyles.glassBtn} ${glassStyles.glassDanger}`}
            onClick={handleConfirm}
            autoFocus
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
