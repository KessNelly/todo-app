const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const { TASK_STATUSES } = require("../models/Task");
const logger = require("../utils/logger");

// GET /tasks
const getTasks = async (req, res, next) => {
  try {
    const filter = req.query.filter || "all";
    const userId = req.session.userId;

    const query = { user: userId, status: { $ne: TASK_STATUSES.DELETED } };

    if (filter === "pending") query.status = TASK_STATUSES.PENDING;
    else if (filter === "completed") query.status = TASK_STATUSES.COMPLETED;

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    const counts = await Task.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId.createFromHexString(userId.toString()),
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskCounts = { pending: 0, completed: 0, deleted: 0 };
    counts.forEach(({ _id, count }) => {
      taskCounts[_id] = count;
    });

    logger.debug(
      `Tasks fetched | user=${req.session.username} | filter=${filter} | count=${tasks.length}`
    );

    res.render("tasks/index", {
      title: "My Tasks",
      tasks,
      filter,
      taskCounts,
      layout: "layouts/main",
    });
  } catch (error) {
    next(error);
  }
};

// POST /tasks
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/tasks");
    }

    const { title, description } = req.body;
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      user: req.session.userId,
    });

    logger.info(
      `Task created | user=${req.session.username} | taskId=${task._id} | title="${task.title}"`
    );
    req.flash("success", "Task created successfully!");
    res.redirect("/tasks");
  } catch (error) {
    next(error);
  }
};

// PATCH /tasks/:id/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(TASK_STATUSES).includes(status)) {
      req.flash("error", "Invalid status.");
      return res.redirect("/tasks");
    }

    const task = await Task.findOne({ _id: id, user: req.session.userId });
    if (!task) {
      const error = new Error("Task not found.");
      error.status = 404;
      return next(error);
    }

    const prevStatus = task.status;
    task.status = status;
    await task.save();

    logger.info(
      `Task status updated | user=${req.session.username} | taskId=${id} | ${prevStatus}->${status}`
    );
    req.flash("success", `Task marked as ${status}.`);
    res.redirect("back");
  } catch (error) {
    next(error);
  }
};

// DELETE /tasks/:id (soft delete)
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, user: req.session.userId });
    if (!task) {
      const error = new Error("Task not found.");
      error.status = 404;
      return next(error);
    }

    task.status = TASK_STATUSES.DELETED;
    await task.save();

    logger.info(
      `Task deleted | user=${req.session.username} | taskId=${id} | title="${task.title}"`
    );
    req.flash("success", "Task removed.");
    res.redirect("back");
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTaskStatus, deleteTask };
