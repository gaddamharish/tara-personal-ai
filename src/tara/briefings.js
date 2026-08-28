const { getUsage } = require("../usage");
const { recentConversation } = require("./memory");

/**
 * Build the data envelope used by TARA's future morning/evening/weekly
 * briefing generators. Keeping collection separate from presentation makes
 * it possible to deliver the same briefing through WhatsApp or another UI.
 */
async function collectBriefingContext(phone, type = "morning") {
  const [usage, conversation] = await Promise.all([
    getUsage(),
    recentConversation(phone, 8),
  ]);

  return {
    type,
    timezone: "Asia/Kolkata",
    generatedAt: new Date().toISOString(),
    usage,
    conversation,
  };
}

module.exports = { collectBriefingContext };
