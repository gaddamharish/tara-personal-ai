# TARA application layer

This directory is the boundary for TARA-specific capabilities built on top of the imported WhatsApp foundation.

## Modules

- `memory.js` — durable personal-memory abstraction; keeps storage isolated from the webhook handler.
- `proactive.js` — proactive workflow registry and safe dispatch boundary.
- `briefings.js` — morning/evening/weekly briefing orchestration.
- `integrations.js` — optional external integration registry for Calendar/Gmail and future services.

The existing Manvi-derived files remain the compatibility/runtime foundation while functionality is migrated into these modules incrementally.
