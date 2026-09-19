// HTTP 실패는 빈 배열로 숨기지 않고 Query의 error 상태로 전달합니다.
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? '모집글을 찾을 수 없습니다.'
        : '모집글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
  }

  return response.json() as Promise<T>;
}
