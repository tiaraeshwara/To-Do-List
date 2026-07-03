import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { readTasks, writeTasks } from "../db.js";
import { validateTask } from "../middleware/validateTask.js";

const router = Router();

/**
 * GET /api/tasks
 * Returns all tasks.
 */
router.get("/", async (req, res, next) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tasks
 * Creates a new task. Requires title (non-empty). Status defaults to 'todo'.
 */
router.post("/", validateTask, async (req, res, next) => {
  try {
    const {
      title,
      description = "",
      status = "todo",
      timeAllocated = 0,
      dueDate = "",
    } = req.body;

    const now = new Date().toISOString();
    /** @type {Task} */
    const task = {
      id: uuidv4(),
      title: title.trim(),
      description,
      status,
      timeAllocated: Number(timeAllocated),
      dueDate,
      createdAt: now,
      updatedAt: now,
    };

    const tasks = await readTasks();
    tasks.push(task);
    await writeTasks(tasks);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/tasks/:id
 * Updates an existing task. Returns 404 if not found.
 */
router.put("/:id", validateTask, async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const allowedFields = [
      "title",
      "description",
      "status",
      "timeAllocated",
      "dueDate",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    if (updates.title) updates.title = updates.title.trim();
    if (updates.timeAllocated !== undefined)
      updates.timeAllocated = Number(updates.timeAllocated);

    const updated = {
      ...tasks[index],
      ...updates,
      id: tasks[index].id,
      createdAt: tasks[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updated;
    await writeTasks(tasks);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/tasks/:id
 * Removes a task. Returns 404 if not found.
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    tasks.splice(index, 1);
    await writeTasks(tasks);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
