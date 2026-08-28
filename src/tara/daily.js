const { TARA_CONFIG } = require("./config");

function formatDateIST(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TARA_CONFIG.timezone,
    dateStyle: "full",
  }).format(date);
}

function buildMorningBriefing({ tasks = [], reminders = [], events = [], news = [] } = {}) {
  const lines = [`🌅 Good morning, ${TARA_CONFIG.ownerName}.`, `📅 ${formatDateIST()}`, ""];

  if (tasks.length) {
    lines.push("🎯 Top priorities");
    tasks.slice(0, 3).forEach((task, i) => lines.push(`${i + 1}. ${task.title || task}`));
    lines.push("");
  }

  if (events.length) {
    lines.push("📅 Today");
    events.slice(0, 5).forEach((event) => lines.push(`• ${event.title || event}`));
    lines.push("");
  }

  if (reminders.length) {
    lines.push("⏰ Reminders");
    reminders.slice(0, 5).forEach((item) => lines.push(`• ${item.title || item}`));
    lines.push("");
  }

  if (news.length) {
    lines.push("📰 Worth knowing");
    news.slice(0, 5).forEach((item) => lines.push(`• ${item.title || item}`));
  }

  if (lines.length === 2) lines.push("✨ Your day is clear. Tell me what you want to accomplish.");
  return lines.join("\n").trim();
}

function buildEveningReview({ completed = [], pending = [], tomorrow = [] } = {}) {
  const lines = ["🌙 Evening review", ""];
  lines.push(`✅ Completed: ${completed.length}`);
  lines.push(`⏳ Pending: ${pending.length}`);
  if (tomorrow.length) {
    lines.push("", "📌 Tomorrow", ...tomorrow.slice(0, 5).map((item) => `• ${item.title || item}`));
  }
  return lines.join("\n");
}

module.exports = { buildMorningBriefing, buildEveningReview, formatDateIST };
