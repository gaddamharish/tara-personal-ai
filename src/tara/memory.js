const supabase = require("../supabase");

/**
 * TARA memory boundary.
 *
 * The foundation already stores interaction history in interaction_logs.
 * This module provides a dedicated, future-proof interface so durable
 * personal memory can evolve without coupling memory rules to server.js.
 */
async function recentConversation(phone, limit = 8) {
  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 50);
  const { data, error } = await supabase
    .from("interaction_logs")
    .select("message, bot_response, created_at")
    .eq("sender_phone", phone)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) throw error;
  return (data || []).reverse();
}

module.exports = { recentConversation };
