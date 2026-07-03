import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTasks } from '../hooks/useTasks.js';
import TaskModal from './TaskModal.jsx';
import glassStyles from '../styles/glass.module.css';
import styles from './CalendarView.module.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

/** Map task status → accent colour */
const STATUS_COLORS = {
  todo:  'var(--color-todo)',
  doing: 'var(--color-doing)',
  done:  'var(--color-done)',
};

export default function CalendarView() {
  const { tasks } = useTasks();
  const [selectedTask, setSelectedTask] = useState(null);

  /** Map tasks that have a dueDate to calendar events */
  const events = useMemo(
    () =>
      tasks
        .filter((t) => !!t.dueDate)
        .map((t) => ({
          id:       t.id,
          title:    t.title,
          start:    new Date(`${t.dueDate}T00:00:00`),
          end:      new Date(`${t.dueDate}T23:59:59`),
          resource: t,
        })),
    [tasks]
  );

  /** @param {typeof events[0]} event */
  const eventStyleGetter = useCallback((event) => {
    const color = STATUS_COLORS[event.resource.status] ?? STATUS_COLORS.todo;
    return {
      style: {
        background: `${color}1a`,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: `1.5px solid ${color}`,
        borderRadius: '8px',
        boxShadow: `0 2px 10px ${color}44`,
        color: '#fff',
        fontSize: '0.76rem',
        padding: '2px 6px',
      },
    };
  }, []);

  function handleSelectEvent(event) {
    setSelectedTask(event.resource);
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${glassStyles.glass} ${styles.calendarContainer}`}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 210px)', minHeight: '500px' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          popup
        />
      </div>

      {selectedTask && (
        <TaskModal
          mode="edit"
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
