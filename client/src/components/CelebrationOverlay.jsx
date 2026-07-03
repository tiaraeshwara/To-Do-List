import { useEffect, useMemo, useCallback } from 'react';
import styles from './CelebrationOverlay.module.css';

const COLORS = [
  '#4ade80', '#86efac', '#bbf7d0',  // greens
  '#fbbf24', '#fde68a',             // golds
  '#f472b6', '#fbcfe8',             // pinks
  '#60a5fa', '#bfdbfe',             // blues
  '#a78bfa', '#ddd6fe',             // purples
  '#fb923c', '#fff',                // orange + white
];

const EMOJIS = ['🎉', '🎊', '🏆', '⭐', '✨', '🌟', '🥳', '🎈', '💪', '🔥'];

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max)); }

/** Generate confetti + emoji particle data once */
function makeParticles() {
  const pieces = Array.from({ length: 90 }, (_, i) => ({
    id:       `p${i}`,
    type:     'confetti',
    left:     rand(0, 100),
    width:    rand(6, 14),
    height:   rand(8, 18),
    color:    COLORS[randInt(0, COLORS.length)],
    delay:    rand(0, 2.5),
    duration: rand(3, 6),
    drift:    rand(-60, 60),     // horizontal drift px
    spin:     rand(180, 720),    // rotation deg
    shape:    randInt(0, 3),     // 0=rect, 1=circle, 2=ribbon
  }));

  const floaters = Array.from({ length: 14 }, (_, i) => ({
    id:       `e${i}`,
    type:     'emoji',
    emoji:    EMOJIS[i % EMOJIS.length],
    left:     rand(2, 95),
    size:     rand(1.4, 2.6),
    delay:    rand(0, 1.8),
    duration: rand(4, 7),
    drift:    rand(-40, 40),
  }));

  return [...pieces, ...floaters];
}

/**
 * Full-screen celebration overlay shown when every routine item is done.
 *
 * @param {{ onClose: () => void, completedCount: number, totalCount: number }} props
 */
export default function CelebrationOverlay({ onClose, completedCount, totalCount }) {
  const particles = useMemo(makeParticles, []);

  // Auto-dismiss after 10 s
  useEffect(() => {
    const t = setTimeout(onClose, 10_000);
    return () => clearTimeout(t);
  }, [onClose]);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e) => { if (e.target === e.currentTarget) onClose(); },
    [onClose]
  );

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Celebration">
      {/* ── Particles ── */}
      {particles.map((p) =>
        p.type === 'confetti' ? (
          <div
            key={p.id}
            className={`${styles.piece} ${
              p.shape === 1 ? styles.circle : p.shape === 2 ? styles.ribbon : ''
            }`}
            style={{
              left:             `${p.left}%`,
              width:            `${p.width}px`,
              height:           `${p.height}px`,
              background:       p.color,
              animationDelay:   `${p.delay}s`,
              animationDuration:`${p.duration}s`,
              '--drift':        `${p.drift}px`,
              '--spin':         `${p.spin}deg`,
            }}
          />
        ) : (
          <div
            key={p.id}
            className={styles.floatEmoji}
            style={{
              left:             `${p.left}%`,
              fontSize:         `${p.size}rem`,
              animationDelay:   `${p.delay}s`,
              animationDuration:`${p.duration}s`,
              '--drift':        `${p.drift}px`,
            }}
          >
            {p.emoji}
          </div>
        )
      )}

      {/* ── Central card ── */}
      <div className={styles.card}>
        {/* Trophy burst */}
        <div className={styles.trophyRing} aria-hidden="true">
          <span className={styles.trophyEmoji}>🏆</span>
        </div>

        <h2 className={styles.title}>All Done!</h2>
        <p className={styles.subtitle}>You crushed every routine today!</p>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{completedCount}</span>
            <span className={styles.statLabel}>Tasks</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>Complete</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>⭐</span>
            <span className={styles.statLabel}>Perfect Day</span>
          </div>
        </div>

        <p className={styles.dateText}>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long', month: 'long', day: 'numeric',
          })}
        </p>

        <div className={styles.msgRow}>
          {['🎉', '💪', '🔥', '🌟', '🎊'].map((e, i) => (
            <span key={i} className={styles.msgEmoji} style={{ animationDelay: `${i * 0.12}s` }}>
              {e}
            </span>
          ))}
        </div>

        <button className={styles.closeBtn} onClick={onClose} autoFocus>
          Awesome! Let's go 🚀
        </button>
      </div>
    </div>
  );
}
