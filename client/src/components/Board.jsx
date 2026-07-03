import { useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useTasks } from '../hooks/useTasks.js';
import Column from './Column.jsx';
import TaskCard from './TaskCard.jsx';
import styles from './Board.module.css';

const COLUMNS = [
  { status: 'todo',  title: 'To Do',       accentColor: 'var(--color-todo)' },
  { status: 'doing', title: 'In Progress',  accentColor: 'var(--color-doing)' },
  { status: 'done',  title: 'Done',         accentColor: 'var(--color-done)' },
];

const VALID_STATUSES = new Set(['todo', 'doing', 'done']);

export default function Board() {
  const { tasks, moveTask } = useTasks();
  const [activeTask, setActiveTask] = useState(null);

  /** @param {import('@dnd-kit/core').DragStartEvent} event */
  function handleDragStart(event) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  /** @param {import('@dnd-kit/core').DragEndEvent} event */
  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const newStatus = String(over.id);
    if (!VALID_STATUSES.has(newStatus)) return;
    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      moveTask(String(active.id), newStatus);
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            status={col.status}
            title={col.title}
            accentColor={col.accentColor}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
