import { useDroppable } from '@dnd-kit/core';
import { useTasks } from '../hooks/useTasks.js';
import TaskCard from './TaskCard.jsx';
import glassStyles from '../styles/glass.module.css';
import styles from './Column.module.css';

/**
 * A kanban column — acts as a droppable zone.
 *
 * @param {{ status: string, title: string, accentColor: string }} props
 */
export default function Column({ status, title, accentColor }) {
  const { tasks, loading } = useTasks();
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const filtered = tasks.filter((t) => t.status === status);

  return (
    <div
      ref={setNodeRef}
      className={`${glassStyles.glass} ${styles.column} ${isOver ? styles.over : ''}`}
      style={{ '--accent': accentColor }}
    >
      {/* Column header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.dot} />
          <h2 className={styles.title}>{title}</h2>
        </div>
        <span className={styles.badge}>{filtered.length}</span>
      </div>

      {/* Task list */}
      <div className={styles.taskList}>
        {loading ? (
          <p className={styles.empty}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>No tasks here — drag one over!</p>
        ) : (
          filtered.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
