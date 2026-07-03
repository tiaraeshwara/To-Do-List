import { useState } from 'react';
import glassStyles from '../styles/glass.module.css';
import styles from './Navbar.module.css';
import TaskModal from './TaskModal.jsx';
import NotificationPanel from './NotificationPanel.jsx';

/**
 * Top navigation bar with app title, view toggle, and Add Task button.
 *
 * @param {{ view: 'board'|'calendar', onViewChange: (v: string) => void }} props
 */
export default function Navbar({ view, onViewChange }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <nav className={`${glassStyles.glass} ${styles.navbar}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>✦</span>
          <h1 className={styles.title}>To-Do List</h1>
        </div>

        <div className={styles.controls}>
          <div className={styles.viewToggle} role="group" aria-label="View selector">
            <button
              className={`${styles.toggleBtn} ${view === 'board' ? styles.active : ''}`}
              onClick={() => onViewChange('board')}
              aria-pressed={view === 'board'}
            >
              Board
            </button>
            <button
              className={`${styles.toggleBtn} ${view === 'calendar' ? styles.active : ''}`}
              onClick={() => onViewChange('calendar')}
              aria-pressed={view === 'calendar'}
            >
              Calendar
            </button>
          </div>

          <NotificationPanel />

          <button
            className={`${glassStyles.glassBtn} ${styles.addBtn}`}
            onClick={() => setShowAddModal(true)}
          >
            + Add Task
          </button>
        </div>
      </nav>

      {showAddModal && (
        <TaskModal mode="add" onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
}
