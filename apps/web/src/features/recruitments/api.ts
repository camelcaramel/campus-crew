import { getJson } from '@/lib/api-client';
import type {
  CreateRecruitmentInput,
  CreateRecruitmentRequest,
  Recruitment,
  UpdateRecruitmentRequest,
} from './types';

class RecruitmentAuthorizationError extends Error {}

function checkAuthorization(response: Response): void {
  if (response.status === 401)
    throw new RecruitmentAuthorizationError(
      '로그인이 필요합니다. 다시 로그인해주세요.',
    );
  if (response.status === 403)
    throw new RecruitmentAuthorizationError(
      '작성자만 수정하거나 삭제할 수 있습니다.',
    );
}

export async function createRecruitment(
  input: CreateRecruitmentInput,
): Promise<Recruitment> {
  const payload: CreateRecruitmentRequest = {
    title: input.title,
    content: input.content,
    category: input.category,
  };

  try {
    const response = await fetch('/api/recruitments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Proxy의 HTML 오류도 JSON으로 파싱하기 전에 처리합니다.
    checkAuthorization(response);
    if (!response.ok) {
      throw new Error('Create request failed');
    }

    return (await response.json()) as Recruitment;
  } catch (error) {
    if (error instanceof RecruitmentAuthorizationError) throw error;
    // 연결 실패도 HTTP 실패와 동일하게 폼에서 안내할 수 있습니다.
    throw new Error('모집글을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
}

export function getRecruitments(): Promise<Recruitment[]> {
  return getJson<Recruitment[]>('/api/recruitments');
}

export async function updateRecruitment(
  id: number,
  input: UpdateRecruitmentRequest,
): Promise<Recruitment> {
  try {
    const response = await fetch(`/api/recruitments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    checkAuthorization(response);
    if (!response.ok) throw new Error('Update request failed');
    return (await response.json()) as Recruitment;
  } catch (error) {
    if (error instanceof RecruitmentAuthorizationError) throw error;
    throw new Error('모집글을 수정하지 못했습니다.');
  }
}

export async function deleteRecruitment(id: number): Promise<void> {
  try {
    const response = await fetch(`/api/recruitments/${id}`, {
      method: 'DELETE',
    });
    checkAuthorization(response);
    if (!response.ok) throw new Error('Delete request failed');
    // Nest는 204 No Content를 반환하므로 response.json()을 호출하지 않습니다.
  } catch (error) {
    if (error instanceof RecruitmentAuthorizationError) throw error;
    throw new Error('모집글을 삭제하지 못했습니다.');
  }
}

export function getRecruitment(id: string): Promise<Recruitment> {
  return getJson<Recruitment>(`/api/recruitments/${encodeURIComponent(id)}`);
}
