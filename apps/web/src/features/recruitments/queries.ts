'use client';

import { useQuery } from '@tanstack/react-query';
import { getRecruitment } from './api';

export function useRecruitmentQuery(id: string, refetchOnMount?: 'always') {
  return useQuery({
    // route id는 문자열입니다. invalidate에도 같은 타입을 사용합니다.
    queryKey: ['recruitments', id],
    queryFn: () => getRecruitment(id),
    refetchOnMount,
  });
}
