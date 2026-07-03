import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "db.json");

/**
 * Read all tasks from the JSON file.
 * @returns {Promise<Task[]>}
 */
export async function readTasks() {
  try {
    const data = await readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    // If file doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Write the full task list to the JSON file.
 * @param {Task[]} tasks
 * @returns {Promise<void>}
 */
export async function writeTasks(tasks) {
  await writeFile(DB_PATH, JSON.stringify(tasks, null, 2), "utf-8");
}
