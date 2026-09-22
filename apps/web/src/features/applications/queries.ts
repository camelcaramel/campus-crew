'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { authMeKey } from '@/features/auth/queries';
import {
  cancelMyApplication,
  createApplication,
  getMyApplication,
  ApplicationRequestError,
} from './api';
import type { CreateApplicationInput } from './types';

// 모집글만으로 key를 만들면 계정 전환 시 이전 사용자의 지원이 보일 수 있습니다.
export const myApplicationKey = (id: string | number, userId: number) =>
  ['recruitments', String(id), 'my-application', userId] as const;

function sessionChanged(error: unknown) {
  return (
    error instanceof ApplicationRequestError &&
    (error.code === 'AUTH_SESSION_CHANGED' || error.status === 401)
  );
}

async function reconcileError(
  client: QueryClient,
  id: string,
  userId: number,
  error: unknown,
) {
  if (sessionChanged(error)) {
    await client.invalidateQueries({ queryKey: authMeKey });
    return;
  }
  if (
    error instanceof ApplicationRequestError &&
    (error.status === 409 || error.status === 404)
  ) {
    await Promise.all([
      client.invalidateQueries({
        queryKey: myApplicationKey(id, userId),
        exact: true,
      }),
      ...(error.code === 'RECRUITMENT_CLOSED'
        ? [
            client.invalidateQueries({
              queryKey: ['recruitments', id],
              exact: true,
            }),
          ]
        : []),
    ]);
  }
}

export function useMyApplicationQuery(id: string, userId: number) {
  const client = useQueryClient();
  return useQuery({
    queryKey: myApplicationKey(id, userId),
    queryFn: async ({ signal }) => {
      try {
        return await getMyApplication(id, signal, userId);
      } catch (error) {
        if (sessionChanged(error))
          await client.invalidateQueries({ queryKey: authMeKey });
        throw error;
      }
    },
    retry: false,
  });
}
export function useCreateApplicationMutation(id: string, userId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApplicationInput) =>
      createApplication(id, input, userId),
    onError: (error) => reconcileError(client, id, userId, error),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: myApplicationKey(id, userId),
        exact: true,
      }),
  });
}
export function useCancelApplicationMutation(id: string, userId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => cancelMyApplication(id, userId),
    onError: (error) => reconcileError(client, id, userId, error),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: myApplicationKey(id, userId),
        exact: true,
      }),
  });
}
