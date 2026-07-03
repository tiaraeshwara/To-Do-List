import { useContext } from "react";
import { TaskContext } from "../context/TaskContext.jsx";

/**
 * Convenience hook to access the TaskContext value.
 *
 * @returns {import('../context/TaskContext.jsx').TaskContextValue}
 */
export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTasks must be used inside <TaskProvider>");
  }
  return ctx;
}
