const { buildDailyAgenda, rankPriorities } = require("./priorities");

/**
 * Build a deterministic personal command-center snapshot.
 * Data providers can be plugged in later without changing WhatsApp handlers.
 */
function buildCommandCenter({ tasks = [], calendar = [], reminders = [], now = new Date() } = {}) {
  const agenda = buildDailyAgenda({ tasks, calendar, reminders, now });
  return {
    generatedAt: now.toISOString(),
    timezone: "Asia/Kolkata",
    priorities: rankPriorities(tasks, now).slice(0, 5),
    agenda,
    counts: {
      tasks: tasks.length,
      calendarItems: calendar.length,
      reminders: reminders.length,
    },
  };
}

function formatCommandCenter(snapshot) {
  const lines = [
    "*TARA — Your Day*",
    "",
    `🎯 Top priorities: ${snapshot.priorities.length}`,
    `📋 Tasks: ${snapshot.counts.tasks}`,
    `📅 Calendar: ${snapshot.counts.calendarItems}`,
    `⏰ Reminders: ${snapshot.counts.reminders}`,
  ];

  if (snapshot.priorities.length) {
    lines.push("", "*Priority queue*");
    snapshot.priorities.forEach((task, i) => {
      lines.push(`${i + 1}. ${task.title}`);
    });
  }

  return lines.join("\n");
}

module.exports = { buildCommandCenter, formatCommandCenter };
