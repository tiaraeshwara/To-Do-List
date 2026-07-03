import { useState, useEffect } from 'react';
import { TaskProvider } from './context/TaskContext.jsx';
import { useTasks } from './hooks/useTasks.js';
import Navbar from './components/Navbar.jsx';
import Board from './components/Board.jsx';
import CalendarView from './components/CalendarView.jsx';
import DailyRoutine from './components/DailyRoutine.jsx';
import BottomNav from './components/BottomNav.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import TaskModal from './components/TaskModal.jsx';
import styles from './App.module.css';

function AppContent() {
  const [view, setView]                 = useState('board');
  const [showAddModal, setShowAddModal] = useState(false);
  const { error, offline, clearError }  = useTasks();

  // Auto-dismiss error after 5 s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 5000);
    return () => clearTimeout(t);
  }, [error, clearError]);

  return (
    <div className={styles.appWrapper}>
      {/* Animated mesh background */}
      <div className={styles.bgMesh} aria-hidden="true" />

      <Navbar view={view} onViewChange={setView} onAddTask={() => setShowAddModal(true)} />

      {offline && (
        <div className={styles.offlineBanner} role="status">
          ⚠ Offline mode — showing cached data
        </div>
      )}

      {error && (
        <div
          className={styles.errorBanner}
          role="alert"
          onClick={clearError}
          title="Click to dismiss"
        >
          ✕ {error}
        </div>
      )}

      <main className={styles.main}>
        {view === 'board'    && <Board />}
        {view === 'calendar' && <CalendarView />}
        {view === 'routine'  && <DailyRoutine />}
      </main>

      {/* Mobile bottom navigation */}
      <div className={styles.mobileOnly}>
        <BottomNav
          view={view}
          onViewChange={setView}
          onAddTask={() => setShowAddModal(true)}
        />
      </div>

      {/* Add Task modal (shared between Navbar + BottomNav FAB) */}
      {showAddModal && (
        <TaskModal mode="add" onClose={() => setShowAddModal(false)} />
      )}

      {/* PWA install prompt */}
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
