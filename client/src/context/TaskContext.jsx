import { createContext, useReducer, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api.js';

export const TaskContext = createContext(null);

const STORAGE_KEY = 'todo-tasks';

/**
 * @typedef {{
 *   tasks: import('../services/api.js').Task[],
 *   loading: boolean,
 *   error: string|null,
 *   offline: boolean,
 * }} State
 */

/** @param {State} state @param {Object} action @returns {State} */
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, tasks: action.payload, offline: false };
    case 'LOAD_OFFLINE':
      return { ...state, loading: false, tasks: action.payload, offline: true };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

/** @type {State} */
const initialState = {
  tasks: [],
  loading: true,
  error: null,
  offline: false,
};

function getLocalTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * @typedef {{
 *   tasks: import('../services/api.js').Task[],
 *   loading: boolean,
 *   error: string|null,
 *   offline: boolean,
 *   addTask: (data: Partial<import('../services/api.js').Task>) => Promise<void>,
 *   updateTask: (id: string, data: Partial<import('../services/api.js').Task>) => Promise<void>,
 *   deleteTask: (id: string) => Promise<void>,
 *   moveTask: (id: string, newStatus: string) => Promise<void>,
 *   optimisticDelete: (id: string) => void,
 *   restoreTask: (task: import('../services/api.js').Task) => void,
 *   clearError: () => void,
 * }} TaskContextValue
 */

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Always-fresh reference to state — avoids stale closures in callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // ── Sync to localStorage on every task change (after initial load) ──
  useEffect(() => {
    if (!state.loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
      } catch {
        // localStorage unavailable
      }
    }
  }, [state.tasks, state.loading]);

  // ── Initial fetch ──
  useEffect(() => {
    dispatch({ type: 'LOAD_START' });
    api
      .fetchTasks()
      .then((tasks) => dispatch({ type: 'LOAD_SUCCESS', payload: tasks }))
      .catch(() => {
        dispatch({ type: 'LOAD_OFFLINE', payload: getLocalTasks() });
      });
  }, []);

  // ── Mutations (all optimistic) ──

  const addTask = useCallback(async (data) => {
    const tempId = `temp_${Date.now()}`;
    const now = new Date().toISOString();
    /** @type {import('../services/api.js').Task} */
    const optimistic = {
      id: tempId,
      title: (data.title || '').trim(),
      description: data.description || '',
      status: data.status || 'todo',
      timeAllocated: data.timeAllocated ?? 0,
      dueDate: data.dueDate || '',
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_TASK', payload: optimistic });
    try {
      const created = await api.createTask(data);
      // Replace optimistic entry with server-assigned id/timestamps
      dispatch({ type: 'DELETE_TASK', payload: tempId });
      dispatch({ type: 'ADD_TASK', payload: created });
    } catch (err) {
      dispatch({ type: 'DELETE_TASK', payload: tempId });
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const updateTask = useCallback(async (id, data) => {
    const prev = stateRef.current.tasks.find((t) => t.id === id);
    if (!prev) return;
    const optimistic = {
      ...prev,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_TASK', payload: optimistic });
    try {
      const updated = await api.updateTask(id, data);
      dispatch({ type: 'UPDATE_TASK', payload: updated });
    } catch (err) {
      // Roll back
      dispatch({ type: 'UPDATE_TASK', payload: prev });
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    const prevTasks = stateRef.current.tasks;
    dispatch({ type: 'DELETE_TASK', payload: id });
    try {
      await api.deleteTask(id);
    } catch (err) {
      dispatch({ type: 'SET_TASKS', payload: prevTasks });
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const moveTask = useCallback(
    async (id, newStatus) => {
      await updateTask(id, { status: newStatus });
    },
    [updateTask]
  );

  // Used by ConfirmDeleteDialog for the undo-window flow
  const optimisticDelete = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const restoreTask = useCallback((task) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        loading: state.loading,
        error: state.error,
        offline: state.offline,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        optimisticDelete,
        restoreTask,
        clearError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
