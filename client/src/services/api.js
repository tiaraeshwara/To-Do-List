/**
 * @file api.js
 * @description HTTP service layer — all fetch calls to the Express backend.
 */

const BASE_URL = "/api";

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {"todo"|"doing"|"done"} status
 * @property {number} timeAllocated - minutes
 * @property {string} dueDate - ISO date string (YYYY-MM-DD)
 * @property {string} createdAt - ISO date string
 * @property {string} updatedAt - ISO date string
 */

/**
 * @returns {Promise<Task[]>}
 */
export async function fetchTasks() {
  const res = await fetch(`${BASE_URL}/tasks`);
  if (!res.ok) throw new Error(`Failed to fetch tasks (${res.status})`);
  return res.json();
}

/**
 * @param {Omit<Task, 'id'|'createdAt'|'updatedAt'>} data
 * @returns {Promise<Task>}
 */
export async function createTask(data) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to create task (${res.status})`);
  }
  return res.json();
}

/**
 * @param {string} id
 * @param {Partial<Task>} data
 * @returns {Promise<Task>}
 */
export async function updateTask(id, data) {
  const res = await fetch(`${BASE_URL}/tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to update task (${res.status})`);
  }
  return res.json();
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to delete task (${res.status})`);
  }
}
