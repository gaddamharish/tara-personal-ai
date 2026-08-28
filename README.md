# TARA — Your Personal AI Companion

TARA is a WhatsApp-first personal AI assistant designed to help manage everyday life through natural conversation.

## Vision

**One message. TARA handles the rest.**

TARA combines reminders, routines, memory, research, tasks, calendar/email integrations, proactive briefings, and multimodal interaction behind a simple WhatsApp interface.

## Product direction

TARA is being developed as a modular personal AI platform, using the proven Manvi WhatsApp assistant as the functional starting point while selectively incorporating useful patterns from other personal-assistant projects.

### Core capabilities

- WhatsApp conversational assistant
- One-off and recurring reminders
- Daily routines
- Weekly/monthly recurring tasks
- Birthdays and events
- Contacts and contact messaging
- Web research/search
- Conversational memory
- Follow-up questions
- Task editing/deletion
- IST / Asia-Kolkata scheduling
- Usage tracking and scheduler reliability
- Health/status monitoring

### TARA+ roadmap

- Morning briefing
- Evening review
- Weekly personal review
- Smart priorities and task management
- Google Calendar integration
- Gmail integration
- Proactive notifications and alerts
- Follow-up tracking
- Long-term personal memory
- Voice-note transcription
- Image/document understanding
- Draft/reply assistance
- Automated workflows
- Modular integrations
- Privacy-first controls

## Architecture

```text
WhatsApp
   |
   v
TARA Assistant
   |
   +-- Conversation / Intent Engine
   +-- Memory Engine
   +-- Reminder & Routine Scheduler
   +-- Task Engine
   +-- Research / Search Engine
   +-- Proactive Workflow Engine
   +-- Gmail / Calendar Integrations
   +-- Multimodal Engine
   |
   v
Supabase / PostgreSQL
   |
   v
Render
```

## Development principles

1. Build production-quality, modular components.
2. Preserve proven Manvi functionality before adding new capabilities.
3. Prefer official APIs and stable integrations.
4. Protect user data and credentials.
5. Make automation explicit, observable, and recoverable.
6. Keep integrations optional and independently deployable.
7. Add tests with each major feature.

## Starting point

The initial implementation is based on the public Manvi project:
https://github.com/viswabnath/whatsapp-reminder-bot

Manvi provides the initial WhatsApp, reminder, routine, contacts, search, conversational-memory, scheduler, Supabase, Render, and Meta Cloud API foundation.

## Status

**Phase 0 — Repository initialized.**

Next: import and adapt the Manvi application into TARA, establish configuration and database migrations, then implement TARA+ modules incrementally.

## License

To be determined before public distribution.
