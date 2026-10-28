import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from './app.js';
import { resetStore } from './store.js';

beforeEach(() => resetStore());
describe('simulation API', () => {
  it('starts a session and records only safe metadata', async () => {
    const start = await request(app).post('/api/simulation/start').send({});
    expect(start.status).toBe(201);
    const result = await request(app).post('/api/simulation/event').send({ sessionId: start.body.sessionId, eventType: 'demo_form_submitted' });
    expect(result.status).toBe(201);
    const events = await request(app).get('/api/admin/events').set('x-admin-password', 'change-this-local-password');
    expect(events.status).toBe(200);
    expect(JSON.stringify(events.body)).not.toContain('password');
  });
  it('rejects unknown event types and sensitive fields', async () => {
    const start = await request(app).post('/api/simulation/start');
    const response = await request(app).post('/api/simulation/event').send({ sessionId: start.body.sessionId, eventType: 'credential_captured', password: 'secret' });
    expect(response.status).toBe(400);
  });
  it('stores safe demo-login data and rejects password fields', async () => {
    const start = await request(app).post('/api/simulation/start');
    const payload = { demo_username: 'fictional-student', password_field_filled: true, timestamp: new Date().toISOString(), session_id: start.body.sessionId };
    const saved = await request(app).post('/api/demo-login').send(payload);
    expect(saved.status).toBe(201);
    const records = await request(app).get('/api/admin/demo-logins').set('x-admin-password', 'change-this-local-password');
    expect(records.body.records).toHaveLength(1);
    expect(records.body.records[0]).toMatchObject(payload);
    expect(JSON.stringify(records.body)).not.toContain('secret');
    const rejected = await request(app).post('/api/demo-login').send({ ...payload, password: 'secret' });
    expect(rejected.status).toBe(400);
    expect((await request(app).get('/api/admin/demo-logins').set('x-admin-password', 'change-this-local-password')).body.records).toHaveLength(1);
  });
  it('protects administrator endpoints and reports zero events', async () => {
    expect((await request(app).get('/api/admin/summary')).status).toBe(401);
    const summary = await request(app).get('/api/admin/summary').set('x-admin-password', 'change-this-local-password');
    expect(summary.body).toEqual({ totalSessions: 0, formSubmissions: 0, trainingReveals: 0, quizzesCompleted: 0, revealRate: 0 });
  });
});