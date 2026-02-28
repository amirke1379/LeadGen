const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export interface Lead {
  id: number;
  place_id: string;
  name: string;
  category: string | null;
  rating: number | null;
  review_count: number | null;
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  distance: number | null;
  google_url: string | null;
  status: string;
  contacted_at: string | null;
  contact_method: string | null;
  found_at: string | null;
}

export interface ScanConfig {
  location: string;
  radius_km: number;
  min_rating: number;
  max_rating: number;
  category: string;
}

export interface ScanResult {
  new_leads_found: number;
  leads: Lead[];
}

export async function scanLeads(config: ScanConfig): Promise<ScanResult> {
  const res = await fetch(`${BASE_URL}/api/leads/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Scan failed (${res.status})`);
  }
  return res.json();
}

export async function getLeads(): Promise<Lead[]> {
  const res = await fetch(`${BASE_URL}/api/leads`);
  if (!res.ok) {
    throw new Error(`Failed to fetch leads (${res.status})`);
  }
  return res.json();
}

export async function getLeadById(id: number): Promise<Lead> {
  const res = await fetch(`${BASE_URL}/api/leads/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch lead (${res.status})`);
  }
  return res.json();
}
