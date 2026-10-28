const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export type EventType = 'demo_form_submitted' | 'training_reveal_opened' | 'quiz_completed';
export type DemoLoginPayload = { demo_username: string; password_field_filled: boolean; timestamp: string; session_id: string };
export async function startSession() { const response = await fetch(`${API}/simulation/start`, { method: 'POST' }); if (!response.ok) throw new Error('Could not start the training session.'); return response.json() as Promise<{ sessionId: string }>; }
export async function recordEvent(sessionId: string, eventType: EventType, result?: { correctAnswers: number; totalQuestions: number }) {
  const response = await fetch(`${API}/simulation/event`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, eventType, ...result }) });
  if (!response.ok) throw new Error('The training event could not be recorded.');
}
export async function adminFetch<T>(path: string, password: string, options?: RequestInit) {
  const response = await fetch(`${API}/admin/${path}`, { ...options, headers: { 'Content-Type': 'application/json', 'x-admin-password': password, ...options?.headers } });
  if (!response.ok) throw new Error(response.status === 401 ? 'That administrator password was not accepted.' : 'The dashboard service is unavailable.');
  return response.json() as Promise<T>;
}
export async function submitDemoLogin(payload: DemoLoginPayload) {
  const response = await fetch(`${API}/demo-login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('The demonstration could not be recorded.');
  return response.json() as Promise<{ success: boolean; record_id: string }>;
}