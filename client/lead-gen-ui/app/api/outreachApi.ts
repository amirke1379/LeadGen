const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export interface GeneratedMessage {
  body: string;
  subject?: string;
}

export interface SendMessagePayload {
  lead_id: number;
  method: 'sms' | 'email';
  message: string;
  email?: string;
  subject?: string;
}

export async function generateMessage(
  leadId: number,
  method: 'sms' | 'email'
): Promise<GeneratedMessage> {
  const res = await fetch(`${BASE_URL}/api/leads/${leadId}/generate-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Failed to generate message (${res.status})`);
  }
  return res.json();
}

export async function sendMessage(payload: SendMessagePayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/outreach/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Failed to send message (${res.status})`);
  }
}
