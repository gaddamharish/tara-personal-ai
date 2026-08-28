const DEFAULT_PRIORITY_RULES = Object.freeze([
  { key: "overdue", label: "Overdue", weight: 100 },
  { key: "due_today", label: "Due today", weight: 80 },
  { key: "high", label: "High priority", weight: 70 },
  { key: "follow_up", label: "Follow-up", weight: 60 },
  { key: "upcoming", label: "Upcoming", weight: 40 },
]);

function scoreTask(task = {}) {
  let score = 0;
  if (task.overdue) score += 100;
  if (task.dueToday) score += 80;
  if (task.priority === "high") score += 70;
  if (task.followUp) score += 60;
  if (task.dueSoon) score += 40;
  return score;
}

function rankTasks(tasks = []) {
  return [...tasks].sort((a, b) => scoreTask(b) - scoreTask(a));
}

function topPriorities(tasks = [], limit = 3) {
  return rankTasks(tasks).slice(0, Math.max(1, limit));
}

module.exports = { DEFAULT_PRIORITY_RULES, scoreTask, rankTasks, topPriorities };
