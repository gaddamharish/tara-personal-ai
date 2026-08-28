const OWNER_NAME = process.env.TARA_OWNER_NAME || process.env.MY_NAME || "User";

const TARA_CONFIG = Object.freeze({
  name: "TARA",
  product: "Your Personal AI Companion",
  timezone: process.env.TARA_TIMEZONE || "Asia/Kolkata",
  ownerName: OWNER_NAME,
  maxContextTurns: Number(process.env.TARA_MAX_CONTEXT_TURNS || 8),
  maxMessagesPerMinute: Number(process.env.TARA_RATE_LIMIT || 10),
  features: Object.freeze({
    reminders: true,
    routines: true,
    memory: true,
    webResearch: true,
    proactive: true,
    briefings: true,
    tasks: true,
    gmail: false,
    calendar: false,
    voice: false,
    vision: false,
    workflows: true,
  }),
});

function getTaraGreeting(isOwner, senderName = "there") {
  return isOwner
    ? `Hello ${OWNER_NAME}. TARA is online. I can manage reminders, routines, tasks, research, memory and your daily priorities.`
    : `Hello ${senderName}. I am TARA, ${OWNER_NAME}'s personal AI assistant.`;
}

module.exports = { TARA_CONFIG, getTaraGreeting };
