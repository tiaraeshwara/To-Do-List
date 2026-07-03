import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import glassStyles from '../styles/glass.module.css';
import styles from './TaskCard.module.css';
import TaskModal from './TaskModal.jsx';
import ConfirmDeleteDialog from './ConfirmDeleteDialog.jsx';

/**
 * Format minutes into a human-readable "Xh Ym" string.
 * @param {number} minutes
 * @returns {string|null}
 */
function formatTime(minutes) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * A single task card — draggable, clickable for edit, with delete confirmation.
 *
 * @param {{ task: import('../services/api.js').Task, isDragOverlay?: boolean }} props
 */
export default function TaskCard({ task, isDragOverlay = false }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: isDragOverlay,
  });

  const cardStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  };

  const dueDisplay = task.dueDate
    ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(`${task.dueDate}T23:59:59`) < new Date();

  const timeDisplay = formatTime(task.timeAllocated);

  return (
    <>
      <div
        ref={setNodeRef}
        style={cardStyle}
        className={`${glassStyles.glass} ${styles.card} ${isDragging ? styles.dragging : ''}`}
      >
        {/* Drag handle */}
        <button
          className={styles.dragHandle}
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to move task"
          title="Drag to move"
          tabIndex={-1}
        >
          <span aria-hidden="true">⠿</span>
        </button>

        {/* Clickable body — opens edit modal */}
        <div
          className={styles.body}
          onClick={() => !isDragOverlay && setShowEdit(true)}
          onKeyDown={(e) => e.key === 'Enter' && setShowEdit(true)}
          role="button"
          tabIndex={0}
          aria-label={`Edit task: ${task.title}`}
        >
          <h3 className={styles.title}>{task.title}</h3>

          {task.description && (
            <p className={styles.description}>{task.description}</p>
          )}

          <div className={styles.meta}>
            {dueDisplay && (
              <span
                className={`${styles.metaChip} ${isOverdue ? styles.overdue : ''}`}
              >
                📅 {dueDisplay}
              </span>
            )}
            {timeDisplay && (
              <span className={styles.metaChip}>⏱ {timeDisplay}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
            aria-label="Edit task"
            title="Edit"
          >
            ✎
          </button>
          <button
            className={`${styles.iconBtn} ${styles.deleteBtn}`}
            onClick={(e) => { e.stopPropagation(); setShowDelete(true); }}
            aria-label="Delete task"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {showEdit && (
        <TaskModal mode="edit" task={task} onClose={() => setShowEdit(false)} />
      )}
      {showDelete && (
        <ConfirmDeleteDialog task={task} onClose={() => setShowDelete(false)} />
      )}
    </>
  );
}
