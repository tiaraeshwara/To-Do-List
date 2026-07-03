import { useState, useEffect, useRef } from 'react';
import { useTasks } from '../hooks/useTasks.js';
import glassStyles from '../styles/glass.module.css';
import styles from './TaskModal.module.css';

const STATUS_OPTIONS = [
  { value: 'todo',  label: 'To Do' },
  { value: 'doing', label: 'In Progress' },
  { value: 'done',  label: 'Done' },
];

/**
 * Modal for adding or editing a task.
 *
 * @param {{
 *   mode: 'add'|'edit',
 *   task?: import('../services/api.js').Task,
 *   onClose: () => void,
 * }} props
 */
export default function TaskModal({ mode, task, onClose }) {
  const { addTask, updateTask } = useTasks();
  const firstInputRef = useRef(null);

  const [form, setForm] = useState({
    title:         task?.title         ?? '',
    description:   task?.description   ?? '',
    status:        task?.status        ?? 'todo',
    timeAllocated: task?.timeAllocated ?? 0,
    dueDate:       task?.dueDate       ?? '',
  });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Focus first field + Escape listener
  useEffect(() => {
    firstInputRef.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleChange(e) {
    const { name, value, type } = e.target;
    const parsed = type === 'number' ? Number(value) : value;
    setForm((prev) => ({ ...prev, [name]: parsed }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.timeAllocated < 0) errs.timeAllocated = 'Must be 0 or more';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'add') {
        await addTask(form);
      } else {
        await updateTask(task.id, form);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={glassStyles.overlay} onClick={onClose}>
      <div
        className={`${glassStyles.glass} ${styles.modal}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'add' ? 'Add new task' : 'Edit task'}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'add' ? '✦ New Task' : '✎ Edit Task'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="modal-title">
              Title <span className={styles.required}>*</span>
            </label>
            <input
              ref={firstInputRef}
              id="modal-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              placeholder="What needs to be done?"
              maxLength={140}
              autoComplete="off"
            />
            {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="modal-desc">
              Description
            </label>
            <textarea
              id="modal-desc"
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Add details…"
              rows={3}
            />
          </div>

          {/* Status + Time row */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="modal-status">
                Status
              </label>
              <select
                id="modal-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={styles.input}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="modal-time">
                Time (minutes)
              </label>
              <input
                id="modal-time"
                name="timeAllocated"
                type="number"
                min="0"
                step="5"
                value={form.timeAllocated}
                onChange={handleChange}
                className={`${styles.input} ${errors.timeAllocated ? styles.inputError : ''}`}
              />
              {errors.timeAllocated && (
                <span className={styles.errorMsg}>{errors.timeAllocated}</span>
              )}
            </div>
          </div>

          {/* Due date */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="modal-due">
              Due Date
            </label>
            <input
              id="modal-due"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          {/* Footer buttons */}
          <div className={styles.footer}>
            <button
              type="button"
              className={glassStyles.glassBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${glassStyles.glassBtn} ${styles.submitBtn}`}
              disabled={submitting}
            >
              {submitting
                ? 'Saving…'
                : mode === 'add'
                ? '+ Add Task'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
