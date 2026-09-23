import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 30초 동안 같은 queryKey의 데이터를 최신으로 간주합니다.
        staleTime: 30 * 1000,
        // 수업에서 실패 상태를 바로 보고 버튼으로 다시 요청합니다.
        retry: false,
      },
    },
  });
}
