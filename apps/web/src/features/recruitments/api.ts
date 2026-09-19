import { getJson } from '@/lib/api-client';
import type { Recruitment } from './types';

export function getRecruitments(): Promise<Recruitment[]> {
  return getJson<Recruitment[]>('/api/recruitments');
}

export function getRecruitment(id: string): Promise<Recruitment> {
  return getJson<Recruitment>(`/api/recruitments/${encodeURIComponent(id)}`);
}
