export const EVENT_TYPES = ['simulation_started', 'demo_form_submitted', 'training_reveal_opened', 'quiz_completed'] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export type SafeEvent = { id: string; sessionId: string; eventType: EventType; timestamp: string; correctAnswers?: number; totalQuestions?: number };
export type DemoLoginRecord = { id: string; demo_username: string; password_field_filled: boolean; timestamp: string; session_id: string };

const events: SafeEvent[] = [];
const demoLoginRecords: DemoLoginRecord[] = [];
const sessions = new Set<string>();

export function createSession() { const sessionId = crypto.randomUUID(); sessions.add(sessionId); return sessionId; }
export function hasSession(sessionId: string) { return sessions.has(sessionId); }
export function addEvent(event: Omit<SafeEvent, 'id' | 'timestamp'>) {
  const saved = { ...event, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
  events.push(saved);
  return saved;
}
export function listEvents() { return [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp)); }
export function addDemoLogin(record: Omit<DemoLoginRecord, 'id'>) {
  const saved = { ...record, id: crypto.randomUUID() };
  demoLoginRecords.push(saved);
  return saved;
}
export function listDemoLogins() { return [...demoLoginRecords].sort((a, b) => b.timestamp.localeCompare(a.timestamp)); }
export function getSummary() {
  const count = (type: EventType) => events.filter((event) => event.eventType === type).length;
  const totalSessions = sessions.size;
  const reveals = count('training_reveal_opened');
  return { totalSessions, formSubmissions: count('demo_form_submitted'), trainingReveals: reveals, quizzesCompleted: count('quiz_completed'), revealRate: totalSessions ? Math.round((reveals / totalSessions) * 100) : 0 };
}
export function resetStore() { events.length = 0; demoLoginRecords.length = 0; sessions.clear(); }