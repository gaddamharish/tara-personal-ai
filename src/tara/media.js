const axios = require("axios");

async function downloadWhatsAppMedia(mediaId) {
  if (!mediaId) throw new Error("mediaId is required");
  if (!process.env.WHATSAPP_TOKEN) throw new Error("WHATSAPP_TOKEN is not configured");

  const meta = await axios.get(`https://graph.facebook.com/v23.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    timeout: 15000,
  });

  if (!meta.data?.url) throw new Error("WhatsApp media URL was not returned");

  const media = await axios.get(meta.data.url, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    responseType: "arraybuffer",
    timeout: 30000,
  });

  return {
    buffer: Buffer.from(media.data),
    mimeType: meta.data.mime_type || media.headers["content-type"] || "application/octet-stream",
    fileSize: Buffer.byteLength(media.data),
  };
}

module.exports = { downloadWhatsAppMedia };
