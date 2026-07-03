import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTaskNotifications } from '../hooks/useTaskNotifications.js';
import glassStyles from '../styles/glass.module.css';
import styles from './NotificationPanel.module.css';
import TaskModal from './TaskModal.jsx';

/**
 * Bell button + dropdown panel showing overdue / due-today / due-tomorrow tasks.
 * The panel is rendered in a React portal so it never disrupts layout or z-index
 * of surrounding sections.
 */
export default function NotificationPanel() {
  const { overdue, dueToday, dueTomorrow, totalAlert, permission, requestPermission } =
    useTaskNotifications();

  const [open, setOpen]       = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [pos, setPos]          = useState({ top: 0, right: 0 });

  const bellRef  = useRef(null);
  const panelRef = useRef(null);

  function handleBellClick() {
    if (permission === 'default') requestPermission();
    if (!open && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setPos({
        top:   rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  }

  // Close panel on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const isEmpty =
    overdue.length === 0 && dueToday.length === 0 && dueTomorrow.length === 0;

  function openEdit(task) {
    setEditTask(task);
    setOpen(false);
  }

  return (
    <>
      {/* Bell trigger button — stays in navbar flow */}
      <button
        ref={bellRef}
        className={`${styles.bellBtn} ${totalAlert > 0 ? styles.hasAlert : ''}`}
        onClick={handleBellClick}
        aria-label={`Notifications${totalAlert > 0 ? ` — ${totalAlert} urgent` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className={styles.bellIcon} aria-hidden="true">🔔</span>
        {totalAlert > 0 && (
          <span className={styles.badge}>{totalAlert > 9 ? '9+' : totalAlert}</span>
        )}
      </button>

      {/* Portal: backdrop + panel rendered directly on <body> */}
      {open &&
        createPortal(
          <>
            {/* Transparent backdrop — captures outside clicks without darkening */}
            <div className={styles.backdrop} onClick={() => setOpen(false)} />

            {/* Panel */}
            <div
              ref={panelRef}
              className={`${glassStyles.glass} ${styles.panel}`}
              style={{ top: pos.top, right: pos.right }}
              role="dialog"
              aria-label="Upcoming tasks"
              aria-modal="false"
            >
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>🔔 Upcoming Tasks</span>
                <button
                  className={styles.closeBtn}
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                >
                  ✕
                </button>
              </div>

              {permission === 'default' && (
                <div className={styles.permissionBar}>
                  <span>Enable browser alerts?</span>
                  <button className={styles.enableBtn} onClick={requestPermission}>
                    Allow
                  </button>
                </div>
              )}
              {permission === 'denied' && (
                <div className={styles.permissionBar}>
                  <span className={styles.denied}>Browser notifications are blocked</span>
                </div>
              )}

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
          </>,
          document.body
        )}

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
