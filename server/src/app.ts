import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { addDemoLogin, addEvent, createSession, EVENT_TYPES, getSummary, hasSession, listDemoLogins, listEvents, resetStore } from './store.js';

const app = express();
const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-local-password';
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '8kb' }));
app.use(rateLimit({ windowMs: 60_000, limit: Number(process.env.RATE_LIMIT_MAX || 120), standardHeaders: true, legacyHeaders: false }));

const eventSchema = z.object({
  sessionId: z.string().uuid(),
  eventType: z.enum(EVENT_TYPES),
  correctAnswers: z.number().int().min(0).max(3).optional(),
  totalQuestions: z.number().int().min(1).max(3).optional()
}).strict();
const demoLoginSchema = z.object({
  demo_username: z.string().trim().min(1).max(80),
  password_field_filled: z.boolean(),
  timestamp: z.string().datetime({ offset: true }),
  session_id: z.string().uuid()
}).strict();

function requireAdmin(request: express.Request, response: express.Response, next: express.NextFunction) {
  if (request.header('x-admin-password') !== adminPassword) { response.status(401).json({ error: 'Administrator authentication required.' }); return; }
  next();
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.post('/api/simulation/start', (_request, response) => {
  const sessionId = createSession();
  addEvent({ sessionId, eventType: 'simulation_started' });
  response.status(201).json({ success: true, sessionId });
});
app.post('/api/simulation/event', (request, response) => {
  const parsed = eventSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: 'Only safe, allowlisted event fields are accepted.' }); return; }
  if (!hasSession(parsed.data.sessionId)) { response.status(400).json({ error: 'Unknown simulation session.' }); return; }
  const saved = addEvent(parsed.data);
  response.status(201).json({ success: true, eventId: saved.id });
});
app.post('/api/demo-login', (request, response) => {
  const parsed = demoLoginSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: 'Only safe demonstration fields are accepted.' }); return; }
  if (!hasSession(parsed.data.session_id)) { response.status(400).json({ error: 'Unknown simulation session.' }); return; }
  const saved = addDemoLogin(parsed.data);
  addEvent({ sessionId: parsed.data.session_id, eventType: 'demo_form_submitted' });
  response.status(201).json({ success: true, record_id: saved.id });
});
app.get('/api/admin/summary', requireAdmin, (_request, response) => response.json(getSummary()));
app.get('/api/admin/events', requireAdmin, (_request, response) => response.json({ events: listEvents() }));
app.get('/api/admin/demo-logins', requireAdmin, (_request, response) => response.json({ records: listDemoLogins() }));
app.post('/api/admin/reset', requireAdmin, (_request, response) => { resetStore(); response.json({ success: true }); });
app.use((_request, response) => response.status(404).json({ error: 'Route not found.' }));

export { app };