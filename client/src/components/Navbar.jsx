import glassStyles from '../styles/glass.module.css';
import styles from './Navbar.module.css';
import NotificationPanel from './NotificationPanel.jsx';

/**
 * Top navigation bar.
 *
 * @param {{
 *   view: 'board'|'calendar'|'routine',
 *   onViewChange: (v: string) => void,
 *   onAddTask: () => void,
 * }} props
 */
export default function Navbar({ view, onViewChange, onAddTask }) {
  return (
    <nav className={`${glassStyles.glass} ${styles.navbar}`}>
      <div className={styles.brand}>
        <span className={styles.logo}>✦</span>
        <h1 className={styles.title}>To-Do List</h1>
      </div>

      <div className={styles.controls}>
        {/* View toggle — hidden on mobile (BottomNav handles it) */}
        <div className={`${styles.viewToggle} ${styles.desktopOnly}`} role="group" aria-label="View selector">
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
          <button
            className={`${styles.toggleBtn} ${view === 'routine' ? styles.active : ''}`}
            onClick={() => onViewChange('routine')}
            aria-pressed={view === 'routine'}
          >
            📅 Routine
          </button>
        </div>

        <NotificationPanel />

        {/* Add button — hidden on mobile (FAB in BottomNav handles it) */}
        <button
          className={`${glassStyles.glassBtn} ${styles.addBtn} ${styles.desktopOnly}`}
          onClick={onAddTask}
        >
          + Add Task
        </button>
      </div>
    </nav>
  );
}
