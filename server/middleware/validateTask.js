const VALID_STATUSES = ["todo", "doing", "done"];

/**
 * Validation middleware for POST /api/tasks and PUT /api/tasks/:id.
 * Returns 400 with { error } if validation fails.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validateTask(req, res, next) {
  const { title, status, timeAllocated } = req.body;
  const errors = [];
  const isPost = req.method === "POST";

  if (isPost) {
    if (!title || typeof title !== "string" || title.trim() === "") {
      errors.push("title is required and must be a non-empty string");
    }
  } else {
    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim() === "")
    ) {
      errors.push("title must be a non-empty string when provided");
    }
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (timeAllocated !== undefined) {
    const n = Number(timeAllocated);
    if (!Number.isFinite(n) || n < 0) {
      errors.push("timeAllocated must be a non-negative number");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join("; ") });
  }

  next();
}
