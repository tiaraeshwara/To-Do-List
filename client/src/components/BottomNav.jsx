import glassStyles from '../styles/glass.module.css';
import styles from './BottomNav.module.css';

const TABS = [
  { id: 'board',    label: 'Board',    icon: '📋' },
  { id: 'calendar', label: 'Calendar', icon: '🗓' },
  { id: 'routine',  label: 'Routine',  icon: '📅' },
];

/**
 * Mobile-only fixed bottom navigation bar.
 *
 * @param {{
 *   view: string,
 *   onViewChange: (v: string) => void,
 *   onAddTask: () => void,
 * }} props
 */
export default function BottomNav({ view, onViewChange, onAddTask }) {
  return (
    <nav className={`${glassStyles.glass} ${styles.nav}`} aria-label="Main navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${view === tab.id ? styles.active : ''}`}
          onClick={() => onViewChange(tab.id)}
          aria-label={tab.label}
          aria-current={view === tab.id ? 'page' : undefined}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
          {view === tab.id && <span className={styles.activeDot} aria-hidden="true" />}
        </button>
      ))}

      {/* Centre FAB — Add Task */}
      <button
        className={styles.fab}
        onClick={onAddTask}
        aria-label="Add new task"
        title="Add Task"
      >
        <span className={styles.fabIcon}>+</span>
      </button>
    </nav>
  );
}
