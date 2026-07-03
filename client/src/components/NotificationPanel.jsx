import { useEffect, useRef, useState } from 'react';
import { useTaskNotifications } from '../hooks/useTaskNotifications.js';
import glassStyles from '../styles/glass.module.css';
import styles from './NotificationPanel.module.css';
import TaskModal from './TaskModal.jsx';

/**
 * Bell button + dropdown panel showing overdue / due-today / due-tomorrow tasks.
 */
export default function NotificationPanel() {
  const { overdue, dueToday, dueTomorrow, totalAlert, permission, requestPermission } =
    useTaskNotifications();

  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const isEmpty = overdue.length === 0 && dueToday.length === 0 && dueTomorrow.length === 0;

  function openEdit(task) {
    setEditTask(task);
    setOpen(false);
  }

  return (
    <>
      <div className={styles.wrapper} ref={panelRef}>
        <button
          className={`${styles.bellBtn} ${totalAlert > 0 ? styles.hasAlert : ''}`}
          onClick={() => {
            if (permission === 'default') requestPermission();
            setOpen((v) => !v);
          }}
          aria-label={`Notifications${totalAlert > 0 ? ` — ${totalAlert} urgent` : ''}`}
          aria-expanded={open}
        >
          <span className={styles.bellIcon} aria-hidden="true">🔔</span>
          {totalAlert > 0 && (
            <span className={styles.badge}>{totalAlert > 9 ? '9+' : totalAlert}</span>
          )}
        </button>

        {open && (
          <div
            className={`${glassStyles.glass} ${styles.panel}`}
            role="dialog"
            aria-label="Upcoming tasks"
          >
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Upcoming Tasks</span>
              {permission === 'default' && (
                <button className={styles.enableBtn} onClick={requestPermission}>
                  Enable alerts
                </button>
              )}
              {permission === 'denied' && (
                <span className={styles.denied}>Notifications blocked</span>
              )}
            </div>

            {isEmpty ? (
              <p className={styles.empty}>🎉 All caught up — no upcoming tasks!</p>
            ) : (
              <div className={styles.groups}>
                {overdue.length > 0 && (
                  <TaskGroup
                    label="Overdue"
                    accent="var(--color-overdue)"
                    tasks={overdue}
                    onEdit={openEdit}
                  />
                )}
                {dueToday.length > 0 && (
                  <TaskGroup
                    label="Due Today"
                    accent="var(--color-doing)"
                    tasks={dueToday}
                    onEdit={openEdit}
                  />
                )}
                {dueTomorrow.length > 0 && (
                  <TaskGroup
                    label="Due Tomorrow"
                    accent="var(--color-todo)"
                    tasks={dueTomorrow}
                    onEdit={openEdit}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {editTask && (
        <TaskModal mode="edit" task={editTask} onClose={() => setEditTask(null)} />
      )}
    </>
  );
}

/**
 * @param {{ label: string, accent: string, tasks: import('../services/api.js').Task[], onEdit: (t: any) => void }} props
 */
function TaskGroup({ label, accent, tasks, onEdit }) {
  return (
    <div className={styles.group}>
      <div className={styles.groupLabel} style={{ '--grp-accent': accent }}>
        <span className={styles.groupDot} />
        {label}
        <span className={styles.groupCount}>{tasks.length}</span>
      </div>
      {tasks.map((task) => (
        <button key={task.id} className={styles.taskRow} onClick={() => onEdit(task)}>
          <span className={styles.taskTitle}>{task.title}</span>
          {task.dueDate && (
            <span className={styles.taskDue}>
              {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
