import { getJson } from '@/lib/api-client';
import type {
  CreateRecruitmentInput,
  CreateRecruitmentRequest,
  Recruitment,
} from './types';

// seed 및 실제 DB에서 확인한 teacher ID입니다.
// 21~23차시 auth 이후 현재 로그인 사용자 id로 교체합니다.
const DEMO_AUTHOR_ID = 1;

export async function createRecruitment(
  input: CreateRecruitmentInput,
): Promise<Recruitment> {
  const payload: CreateRecruitmentRequest = {
    ...input,
    authorId: DEMO_AUTHOR_ID,
  };

  try {
    const response = await fetch('/api/recruitments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Proxy의 HTML 오류도 JSON으로 파싱하기 전에 처리합니다.
    if (!response.ok) {
      throw new Error('Create request failed');
    }

    return (await response.json()) as Recruitment;
  } catch {
    // 연결 실패도 HTTP 실패와 동일하게 폼에서 안내할 수 있습니다.
    throw new Error('모집글을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
}

export function getRecruitments(): Promise<Recruitment[]> {
  return getJson<Recruitment[]>('/api/recruitments');
}

export function getRecruitment(id: string): Promise<Recruitment> {
  return getJson<Recruitment>(`/api/recruitments/${encodeURIComponent(id)}`);
}
