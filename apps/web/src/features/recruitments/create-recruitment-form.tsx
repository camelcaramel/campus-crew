'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createRecruitment } from './api';
import { RecruitmentForm } from './recruitment-form';

export function CreateRecruitmentForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createRecruitment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recruitments'] });
      router.push('/recruitments');
    },
  });

  return (
    <RecruitmentForm
      mode="create"
      onSubmit={(values) => mutation.mutate(values)}
      isPending={mutation.isPending}
      errorMessage={mutation.error?.message}
    />
  );
}
