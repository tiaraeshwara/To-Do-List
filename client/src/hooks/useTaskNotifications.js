import { useEffect, useRef, useCallback, useMemo } from "react";
import { useTasks } from "./useTasks.js";

/**
 * Computes upcoming tasks and fires a one-shot browser notification on mount.
 *
 * Returns grouped task lists and a manual `notify` helper.
 *
 * @returns {{
 *   overdue: import('../services/api.js').Task[],
 *   dueToday: import('../services/api.js').Task[],
 *   dueTomorrow: import('../services/api.js').Task[],
 *   totalAlert: number,
 *   permission: NotificationPermission,
 *   requestPermission: () => Promise<void>,
 * }}
 */
export function useTaskNotifications() {
  const { tasks, loading } = useTasks();
  const notifiedRef = useRef(false);

  /** Midnight of today (local) */
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tomorrowStart = useMemo(() => {
    const d = new Date(todayStart);
    d.setDate(d.getDate() + 1);
    return d;
  }, [todayStart]);

  const dayAfterTomorrow = useMemo(() => {
    const d = new Date(tomorrowStart);
    d.setDate(d.getDate() + 1);
    return d;
  }, [tomorrowStart]);

  /** All incomplete tasks with a dueDate, sorted earliest first */
  const activeTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== "done" && !!t.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [tasks],
  );

  const overdue = useMemo(
    () =>
      activeTasks.filter((t) => new Date(`${t.dueDate}T23:59:59`) < new Date()),
    [activeTasks],
  );

  const dueToday = useMemo(
    () =>
      activeTasks.filter((t) => {
        const d = new Date(`${t.dueDate}T00:00:00`);
        return d >= todayStart && d < tomorrowStart;
      }),
    [activeTasks, todayStart, tomorrowStart],
  );

  const dueTomorrow = useMemo(
    () =>
      activeTasks.filter((t) => {
        const d = new Date(`${t.dueDate}T00:00:00`);
        return d >= tomorrowStart && d < dayAfterTomorrow;
      }),
    [activeTasks, tomorrowStart, dayAfterTomorrow],
  );

  const totalAlert = overdue.length + dueToday.length;

  // ── Browser notification helpers ──

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const sendNotification = useCallback((title, body) => {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "todo-reminder", // replace previous notification of same type
    });
  }, []);

  // ── Fire once after tasks have loaded ──
  useEffect(() => {
    if (loading || notifiedRef.current) return;
    notifiedRef.current = true;

    requestPermission().then(() => {
      if (overdue.length > 0) {
        sendNotification(
          `⚠ ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`,
          overdue
            .slice(0, 3)
            .map((t) => t.title)
            .join(", ") + (overdue.length > 3 ? "…" : ""),
        );
      } else if (dueToday.length > 0) {
        sendNotification(
          `📅 ${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today`,
          dueToday
            .slice(0, 3)
            .map((t) => t.title)
            .join(", ") + (dueToday.length > 3 ? "…" : ""),
        );
      }
    });
    // Only run once after first successful load — deps intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
    overdue,
    dueToday,
    dueTomorrow,
    totalAlert,
    permission:
      typeof Notification !== "undefined" ? Notification.permission : "denied",
    requestPermission,
  };
}
