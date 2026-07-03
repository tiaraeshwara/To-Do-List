import { useState, useEffect, useMemo, useRef } from 'react';
import glassStyles from '../styles/glass.module.css';
import styles from './DailyRoutine.module.css';
import CelebrationOverlay from './CelebrationOverlay.jsx';

const STORAGE_KEY = 'daily-routine-state';

/**
 * @typedef {{ id: string, time: string, label: string, emoji: string, duration: number|null, category: string }} RoutineItem
 */

/** Full 6 AM → 10 PM schedule */
/** @type {RoutineItem[]} */
const ROUTINE = [
  { id: 'wake-up',       time: '06:00', label: 'Wake Up',                      emoji: '🌅', duration: 10,  category: 'morning'   },
  { id: 'prayer',        time: '06:10', label: 'Morning Meditation / Prayer',   emoji: '🙏', duration: 15,  category: 'morning'   },
  { id: 'freshen',       time: '06:25', label: 'Brush & Freshen Up',            emoji: '🪥', duration: 20,  category: 'morning'   },
  { id: 'exercise',      time: '06:45', label: 'Morning Exercise / Stretching', emoji: '🏃', duration: 30,  category: 'morning'   },
  { id: 'breakfast',     time: '07:15', label: 'Healthy Breakfast',             emoji: '🍳', duration: 30,  category: 'morning'   },
  { id: 'get-ready',     time: '07:45', label: 'Get Dressed & Ready',           emoji: '👔', duration: 20,  category: 'morning'   },
  { id: 'pack-bag',      time: '08:05', label: 'Pack Bag & Prep',               emoji: '🎒', duration: 10,  category: 'morning'   },
  { id: 'commute-to',    time: '08:15', label: 'Commute to University',         emoji: '🚌', duration: 45,  category: 'university'},
  { id: 'class-am1',     time: '09:00', label: 'Morning Classes',               emoji: '📚', duration: 120, category: 'university'},
  { id: 'break-coffee',  time: '11:00', label: 'Short Break / Coffee',          emoji: '☕', duration: 15,  category: 'break'     },
  { id: 'class-am2',     time: '11:15', label: 'Continue Classes',              emoji: '📖', duration: 90,  category: 'university'},
  { id: 'lunch',         time: '12:45', label: 'Lunch Break',                   emoji: '🍱', duration: 45,  category: 'break'     },
  { id: 'class-pm',      time: '13:30', label: 'Afternoon Classes',             emoji: '🎓', duration: 120, category: 'university'},
  { id: 'commute-back',  time: '15:30', label: 'Commute Back Home',             emoji: '🏠', duration: 45,  category: 'afternoon' },
  { id: 'rest',          time: '16:15', label: 'Rest / Power Nap',              emoji: '😴', duration: 30,  category: 'afternoon' },
  { id: 'snack',         time: '16:45', label: 'Snack Time',                    emoji: '🍎', duration: 15,  category: 'afternoon' },
  { id: 'study',         time: '17:00', label: 'Study & Assignments',           emoji: '💻', duration: 90,  category: 'afternoon' },
  { id: 'walk',          time: '18:30', label: 'Evening Walk / Exercise',       emoji: '🚶', duration: 30,  category: 'evening'   },
  { id: 'shower',        time: '19:00', label: 'Shower & Freshen Up',           emoji: '🚿', duration: 20,  category: 'evening'   },
  { id: 'dinner',        time: '19:20', label: 'Dinner',                        emoji: '🍽️', duration: 40,  category: 'evening'   },
  { id: 'freetime',      time: '20:00', label: 'Free Time / Hobbies',           emoji: '🎮', duration: 60,  category: 'evening'   },
  { id: 'review',        time: '21:00', label: 'Review Day & Plan Tomorrow',    emoji: '📝', duration: 30,  category: 'night'     },
  { id: 'reading',       time: '21:30', label: 'Wind Down / Reading',           emoji: '📖', duration: 30,  category: 'night'     },
  { id: 'sleep-prep',    time: '22:00', label: 'Sleep Preparation',             emoji: '🌙', duration: null, category: 'night'   },
];

const CATEGORY_LABELS = {
  morning:    { label: 'Morning',    color: 'var(--color-doing)' },
  university: { label: 'University', color: 'var(--color-todo)'  },
  break:      { label: 'Break',      color: '#a78bfa'            },
  afternoon:  { label: 'Afternoon',  color: 'var(--color-done)'  },
  evening:    { label: 'Evening',    color: '#f472b6'            },
  night:      { label: 'Night',      color: '#94a3b8'            },
};

/** Format "HH:MM" to "h:mm AM/PM" */
function fmt(time) {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

/** Format minutes into "Xh Ym" */
function fmtDuration(min) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Get today as YYYY-MM-DD */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Load completed set from localStorage, reset if it's a new day */
function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (raw.date === todayKey()) return new Set(raw.completed || []);
  } catch {}
  return new Set();
}

/** Persist completed set */
function saveState(set) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: todayKey(), completed: [...set] })
    );
  } catch {}
}

/** Return current HH:MM (24h) */
function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Find the index of the currently active routine item */
function activeIndex(now) {
  for (let i = ROUTINE.length - 1; i >= 0; i--) {
    if (ROUTINE[i].time <= now) return i;
  }
  return -1;
}

export default function DailyRoutine() {
  const [completed, setCompleted] = useState(() => loadState());
  const [now, setNow] = useState(nowHHMM);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebratedRef = useRef(false);

  // Tick every minute
  useEffect(() => {
    const id = setInterval(() => setNow(nowHHMM()), 60_000);
    return () => clearInterval(id);
  }, []);

  const currentIdx = useMemo(() => activeIndex(now), [now]);
  const doneCount  = completed.size;
  const totalCount = ROUTINE.length;
  const pct        = Math.round((doneCount / totalCount) * 100);

  // Trigger celebration when every item is checked off
  useEffect(() => {
    if (doneCount === totalCount && totalCount > 0 && !celebratedRef.current) {
      celebratedRef.current = true;
      // Small delay so the last checkmark animation plays first
      const t = setTimeout(() => setShowCelebration(true), 500);
      return () => clearTimeout(t);
    }
    if (doneCount < totalCount) {
      celebratedRef.current = false;
    }
  }, [doneCount, totalCount]);

  function toggle(id) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveState(next);
      return next;
    });
  }

  function resetAll() {
    setCompleted(new Set());
    saveState(new Set());
    celebratedRef.current = false;
    setShowCelebration(false);
  }

  /** Group items by category for section headers */
  const groups = useMemo(() => {
    const result = [];
    let lastCat  = null;
    for (const item of ROUTINE) {
      if (item.category !== lastCat) {
        result.push({ type: 'header', category: item.category });
        lastCat = item.category;
      }
      result.push({ type: 'item', item });
    }
    return result;
  }, []);

  return (
    <div className={styles.wrapper}>
      {showCelebration && (
        <CelebrationOverlay
          onClose={() => setShowCelebration(false)}
          completedCount={doneCount}
          totalCount={totalCount}
        />
      )}
      {/* ── Header card ── */}
      <div className={`${glassStyles.glass} ${styles.headerCard}`}>
        <div className={styles.headerTop}>
          <div>
            <h2 className={styles.heading}>📅 Daily Routine</h2>
            <p className={styles.subheading}>
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <button className={`${glassStyles.glassBtn} ${styles.resetBtn}`} onClick={resetAll}>
            ↺ Reset Day
          </button>
        </div>

        {/* Progress bar */}
        <div className={styles.progressWrap}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.progressLabel}>
            {doneCount} / {totalCount} completed ({pct}%)
          </span>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className={styles.timeline}>
        {groups.map((entry, gi) => {
          if (entry.type === 'header') {
            const cat = CATEGORY_LABELS[entry.category];
            return (
              <div
                key={`hdr-${entry.category}`}
                className={styles.sectionHeader}
                style={{ '--cat-color': cat.color }}
              >
                <span className={styles.sectionDot} />
                {cat.label}
              </div>
            );
          }

          const { item } = entry;
          const isDone    = completed.has(item.id);
          const isActive  = ROUTINE.indexOf(item) === currentIdx;
          const isPast    = item.time < now && !isDone;

          return (
            <div
              key={item.id}
              className={`${glassStyles.glass} ${styles.card}
                ${isDone    ? styles.done   : ''}
                ${isActive  ? styles.active : ''}
                ${isPast    ? styles.past   : ''}`}
            >
              {/* Left: time */}
              <div className={styles.timeCol}>
                <span className={styles.timeText}>{fmt(item.time)}</span>
                {item.duration && (
                  <span className={styles.durationBadge}>
                    ⏱ {fmtDuration(item.duration)}
                  </span>
                )}
              </div>

              {/* Centre: activity */}
              <div className={styles.activityCol}>
                <span className={styles.emoji} aria-hidden="true">{item.emoji}</span>
                <span className={`${styles.label} ${isDone ? styles.labelDone : ''}`}>
                  {item.label}
                </span>
                {isActive && !isDone && (
                  <span className={styles.nowPill}>Now</span>
                )}
              </div>

              {/* Right: action button */}
              <button
                className={`${styles.doneBtn} ${isDone ? styles.doneBtnActive : ''}`}
                onClick={() => toggle(item.id)}
                aria-label={isDone ? `Undo: ${item.label}` : `Mark done: ${item.label}`}
                title={isDone ? 'Click to undo' : 'Mark as done'}
              >
                {isDone ? '✓ Done' : 'Mark Done'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
