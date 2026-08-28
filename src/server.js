const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { performance } = require("perf_hooks");
require("dotenv").config();

const supabase = require("./supabase");
const sendWhatsAppMessage = require("./sendMessage");
const { analyzeMessage } = require("./gemini");
const { searchWeb } = require("./search");
const { getUsage, ensureRowExists, LIMITS } = require("./usage");
const { version } = require("../package.json");
const { getHeartbeats, runReminderDispatch, runRoutineDispatch, runRecurringDispatch } = require("./scheduler");

process.on("uncaughtException", (err) => console.error("[process] Uncaught exception:", err));
process.on("unhandledRejection", (reason) => console.error("[process] Unhandled rejection:", reason));

const app = express();
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.static(path.join(__dirname, "../public")));

function verifyWebhookSignature(req) {
  if (!process.env.WEBHOOK_APP_SECRET) return true;
  const sig = req.headers["x-hub-signature-256"];
  if (!sig) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", process.env.WEBHOOK_APP_SECRET).update(req.rawBody).digest("hex");
  const sigBuf = Buffer.from(sig), expBuf = Buffer.from(expected);
  return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
}

const _rateLimitMap = new Map();
function isRateLimited(phone) {
  const now = Date.now(), entry = _rateLimitMap.get(phone);
  if (!entry || now > entry.resetAt) { _rateLimitMap.set(phone, { count: 1, resetAt: now + 60000 }); return false; }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

const publicFile = (name) => path.join(__dirname, "../public", name);
app.get("/", (_req, res) => res.sendFile(publicFile("index.html"), (err) => {
  if (err && !res.headersSent) res.status(200).type("text").send("TARA is online. Open /status or /api/ping.");
}));
app.get("/documentation", (_req, res) => res.sendFile(publicFile("documentation.html"), (err) => { if (err && !res.headersSent) res.status(404).send("Documentation not available yet."); }));
app.get("/status", (_req, res) => res.sendFile(publicFile("status.html"), (err) => { if (err && !res.headersSent) res.status(200).json({ service: "TARA", status: "online" }); }));

function buildReminderDate(timeString, dateString = null) {
  const now = new Date();
  if (dateString) return new Date(`${dateString}T${timeString}+05:30`).toISOString();
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
  const parts = formatter.formatToParts(now), year = parts.find(p => p.type === "year").value, month = parts.find(p => p.type === "month").value, day = parts.find(p => p.type === "day").value;
  const reminderDate = new Date(`${year}-${month}-${day}T${timeString}+05:30`);
  if (reminderDate < now) reminderDate.setDate(reminderDate.getDate() + 1);
  return reminderDate.toISOString();
}
function formatTimeDisplay(rawTime) { return new Date(`1970-01-01T${rawTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }); }
async function replyAndLog(phone, name, incomingMsg, botReply) {
  await sendWhatsAppMessage(phone, botReply);
  await supabase.from("interaction_logs").insert([{ sender_name: name, sender_phone: phone, message: incomingMsg, bot_response: botReply }]);
}

app.get("/api/ping", async (_req, res) => {
  const start = performance.now();
  const { error } = await supabase.from("api_usage").select("usage_date").limit(1);
  res.status(error ? 500 : 200).json({ status: error ? "degraded" : "ok", latency_ms: Math.round(performance.now() - start), timestamp: new Date().toISOString() });
});

app.get("/api/tick", async (req, res) => {
  const incoming = req.query.secret || req.headers["x-cron-secret"];
  if (!process.env.CRON_SECRET || incoming !== process.env.CRON_SECRET) return res.sendStatus(403);
  await Promise.allSettled([runReminderDispatch(), runRoutineDispatch(), runRecurringDispatch()]);
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/api/status", async (_req, res) => {
  try {
    const stats = await getUsage();
    const { data: routineFireData } = await supabase.from("daily_routines").select("last_fired_date").eq("is_active", true).not("last_fired_date", "is", null).order("last_fired_date", { ascending: false }).limit(1);
    const lastRoutineFired = routineFireData?.[0]?.last_fired_date || null;
    const uptimeSeconds = process.uptime();
    const { data: dbJobs } = await supabase.from("system_jobs").select("*");
    const heartbeats = getHeartbeats();
    const CRON_STALE_MS = 10 * 60 * 1000, now = Date.now();
    const minuteJobNames = ["Reminder Dispatch", "Routine Dispatch", "Recurring Task Dispatch"];
    const cronHealthy = uptimeSeconds < 600 ? true : minuteJobNames.every(name => { const ts = dbJobs?.find(j => j.job_name === name)?.last_fired || heartbeats[name]; return ts && (now - new Date(ts).getTime()) < CRON_STALE_MS; });
    const jobs = [
      { name: "Webhook Listener", schedule: "Event-Driven", description: "Inbound message processor and AI intent router", layman: "The 24/7 Receptionist: Instantly reads your message and hands it to the right department.", status: "active", lastFired: "Live" },
      { name: "Reminder & Interval Dispatch", schedule: "* * * * *", description: "Fires pending one-off and interval reminders past their scheduled time", layman: "The Watcher: Checks every minute for due reminders.", status: "scheduled", lastFired: dbJobs?.find(j => j.job_name === "Reminder Dispatch")?.last_fired || heartbeats["Reminder Dispatch"] },
      { name: "Routine Dispatch", schedule: "* * * * *", description: "Matches current IST time against active daily routines", layman: "The Habits Manager: Ensures recurring daily habits never get missed.", status: "scheduled", lastFired: dbJobs?.find(j => j.job_name === "Routine Dispatch")?.last_fired || heartbeats["Routine Dispatch"] },
      { name: "Recurring Task Dispatch", schedule: "* * * * *", description: "Fires weekly and monthly recurring tasks on their scheduled day and time", layman: "The Calendar: Handles recurring reminders.", status: "scheduled", lastFired: dbJobs?.find(j => j.job_name === "Recurring Task Dispatch")?.last_fired || heartbeats["Recurring Task Dispatch"] },
      { name: "Event Alert", schedule: "30 8 * * *", description: "Double-lock birthday and event alerts at 08:30 IST", layman: "The Announcer: Alerts you of birthdays or anniversaries.", status: "scheduled", lastFired: dbJobs?.find(j => j.job_name === "Event Alert")?.last_fired || heartbeats["Event Alert"] }
    ];
    res.json({ success: true, version, uptime: { days: Math.floor(uptimeSeconds / 86400), hours: Math.floor((uptimeSeconds % 86400) / 3600), minutes: Math.floor((uptimeSeconds % 3600) / 60), seconds: Math.floor(uptimeSeconds % 60) }, limits: LIMITS, stats, jobs, cronHealthy, lastRoutineFired });
  } catch (err) { console.error("[status] Failed to fetch system status:", err); res.status(500).json({ success: false, error: "Failed to fetch system status" }); }
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"], token = req.query["hub.verify_token"], challenge = req.query["hub.challenge"];
  if (mode && token === process.env.VERIFY_TOKEN) return res.status(200).send(challenge);
  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  if (!verifyWebhookSignature(req)) return res.sendStatus(403);
  res.sendStatus(200);
  try {
    const messageData = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!messageData) return;
    if (!messageData?.text?.body) {
      const mediaTypes = ["audio", "image", "video", "document", "sticker"], msgType = messageData.type;
      if (mediaTypes.includes(msgType)) await sendWhatsAppMessage(messageData.from, `I can only read text messages right now. I cannot process ${msgType === "audio" ? "voice notes" : `${msgType}s`}. Please type your request.`);
      return;
    }
    const message = messageData.text.body, senderPhone = messageData.from, lowerMsg = message.toLowerCase().trim();
    if (isRateLimited(senderPhone)) return;
    let senderName = "Guest", isOwner = false;
    if (senderPhone === process.env.MY_PHONE_NUMBER) { senderName = "Viswanath"; isOwner = true; }
    else { const { data: contact } = await supabase.from("contacts").select("name").eq("phone", senderPhone).single(); if (contact) senderName = contact.name.charAt(0).toUpperCase() + contact.name.slice(1); }
    if (lowerMsg === "/limit") { const u = await getUsage(); return await replyAndLog(senderPhone, senderName, message, `System Limits\n\nAI Engines\nGemini: ${u.gemini} / ${LIMITS.gemini}\nGroq: ${u.groq} / ${LIMITS.groq}\nOpenRouter: ${u.openrouter} / ${LIMITS.openrouter}\n\nSearch Engines\nTavily (monthly): ${u.tavily} / ${LIMITS.tavily}\nSerper (lifetime): ${u.serper} / ${LIMITS.serper}\n\nStatus: Operational`); }
    if (["hi", "hello", "hey"].includes(lowerMsg)) { const text = isOwner ? `Hello Viswanath. Manvi online. You can set reminders, routines, events, search the web, or query your schedule.` : `Hello ${senderName}. I am Manvi, Viswanath's personal assistant.`; return await replyAndLog(senderPhone, senderName, message, text); }
    const { data: historyRows } = await supabase.from("interaction_logs").select("message, bot_response").eq("sender_phone", senderPhone).order("created_at", { ascending: true }).limit(4);
    const history = (historyRows || []).map(row => ({ userMessage: row.message, botResponse: row.bot_response }));
    const aiResult = await analyzeMessage(message, false, history);
    if (!aiResult) return await replyAndLog(senderPhone, senderName, message, "I couldn't understand that. Please try again.");
    const responseText = aiResult.reply || aiResult.message || "Done.";
    return await replyAndLog(senderPhone, senderName, message, responseText);
  } catch (err) { console.error("[webhook] Processing error:", err); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`TARA listening on ${PORT}`));
