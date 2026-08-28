# TARA implementation roadmap

## Phase 1 — Foundation
- [x] Import Manvi foundation
- [x] CI pipeline
- [x] TARA runtime identity/configuration
- [x] Smart priority engine foundation
- [x] Morning/evening briefing engine foundation
- [x] WhatsApp media ingestion foundation
- [ ] Remove remaining legacy Manvi branding from runtime/UI
- [ ] Add automated unit tests for TARA modules

## Phase 2 — Personal command center
- [ ] Unified task model
- [ ] Daily agenda aggregation
- [ ] Priority ranking from due dates, urgency and follow-ups
- [ ] Morning briefing scheduler
- [ ] Evening review scheduler
- [ ] Weekly review
- [ ] Personal preferences

## Phase 3 — Integrations
- [ ] Google Calendar OAuth + read/write actions
- [ ] Gmail OAuth + search/read/draft actions
- [ ] Integration permission registry
- [ ] Token encryption/rotation strategy

## Phase 4 — Proactive intelligence
- [ ] Follow-up detector
- [ ] Deadline/change watcher
- [ ] Important-event alerts
- [ ] User-configurable quiet hours
- [ ] Idempotent notification delivery

## Phase 5 — Multimodal
- [ ] WhatsApp voice-note download
- [ ] Speech-to-text adapter
- [ ] Image understanding adapter
- [ ] Document extraction adapter
- [ ] Attachment lifecycle and retention policy

## Phase 6 — Production
- [ ] Supabase migrations for TARA tables
- [ ] Render deployment configuration
- [ ] External cron reliability
- [ ] Observability and structured logs
- [ ] End-to-end WhatsApp test suite
- [ ] Security review
- [ ] Backup/recovery runbook

## Design rule
TARA should extend the proven Manvi foundation incrementally. Avoid a parallel rewrite until measurable limitations justify one.
