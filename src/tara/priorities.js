const DEFAULT_PRIORITY_RULES = Object.freeze([
  { key: "overdue", label: "Overdue", weight: 100 },
  { key: "due_today", label: "Due today", weight: 80 },
  { key: "high", label: "High priority", weight: 70 },
  { key: "follow_up", label: "Follow-up", weight: 60 },
  { key: "upcoming", label: "Upcoming", weight: 40 },
]);

function scoreTask(task = {}, now = new Date()) {
  let score = 0;
  if (task.overdue) score += 100;
  if (task.dueToday) score += 80;
  if (task.priority === "high" || Number(task.priority) >= 3) score += 70;
  if (task.followUp) score += 60;
  if (task.dueSoon) score += 40;

  const due = task.dueAt ? new Date(task.dueAt) : null;
  if (due && !Number.isNaN(due.getTime())) {
    const hours = (due.getTime() - now.getTime()) / 3600000;
    if (hours < 0) score += 50;
    else if (hours <= 4) score += 35;
    else if (hours <= 24) score += 20;
  }
  if (task.important) score += 20;
  return score;
}

function rankTasks(tasks = [], now = new Date()) {
  return [...tasks].sort((a, b) => scoreTask(b, now) - scoreTask(a, now));
}

function rankPriorities(tasks = [], now = new Date()) {
  return rankTasks(tasks, now).map((task) => ({
    ...task,
    score: scoreTask(task, now),
  }));
}

function topPriorities(tasks = [], limit = 3) {
  return rankTasks(tasks).slice(0, Math.max(1, limit));
}

function buildDailyAgenda({ tasks = [], calendar = [], reminders = [] } = {}) {
  return [
    ...tasks.map((x) => ({ ...x, kind: "task", at: x.dueAt || null })),
    ...calendar.map((x) => ({ ...x, kind: "calendar", at: x.startAt || x.dueAt || null })),
    ...reminders.map((x) => ({ ...x, kind: "reminder", at: x.dueAt || null })),
  ].sort((a, b) => {
    if (!a.at) return 1;
    if (!b.at) return -1;
    return new Date(a.at) - new Date(b.at);
  });
}

module.exports = {
  DEFAULT_PRIORITY_RULES,
  scoreTask,
  rankTasks,
  rankPriorities,
  topPriorities,
  buildDailyAgenda,
};
