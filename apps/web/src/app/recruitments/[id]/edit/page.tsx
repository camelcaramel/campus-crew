'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ErrorMessage } from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { updateRecruitment } from '@/features/recruitments/api';
import { useRecruitmentQuery } from '@/features/recruitments/queries';
import { RecruitmentForm } from '@/features/recruitments/recruitment-form';
import type { RecruitmentFormValues } from '@/features/recruitments/schema';

export default function EditRecruitmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  // 수정 화면에 진입할 때는 캐시뿐 아니라 DB의 최신 값을 확인합니다.
  const query = useRecruitmentQuery(id, 'always');
  const mutation = useMutation({
    mutationFn: (values: RecruitmentFormValues) =>
      updateRecruitment(Number(id), values),
    onSuccess: async () => {
      // exact로 목록과 상세의 갱신 범위를 각각 명확히 보여줍니다.
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['recruitments'],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ['recruitments', id],
          exact: true,
        }),
      ]);
      router.push(`/recruitments/${id}`);
    },
  });

  return (
    <section className="mx-auto max-w-[720px]">
      <Link
        href="/recruitments"
        className="text-sm text-primary-600 hover:underline"
      >
        모집글 목록으로
      </Link>
      <h1 className="mt-6">모집글 수정</h1>
      {query.isPending || (!query.isFetchedAfterMount && query.isFetching) ? (
        <Spinner />
      ) : query.isError &&
        (!query.data ||
          query.error.message === '모집글을 찾을 수 없습니다.') ? (
        <ErrorMessage
          message={query.error.message}
          action={
            <button
              type="button"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
              className="min-h-10 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-primary-600 disabled:opacity-50"
            >
              다시 시도
            </button>
          }
        />
      ) : query.data ? (
        <>
          {query.isError && (
            <p role="alert" className="mt-4 text-sm text-red-600!">
              최신 정보를 다시 불러오지 못했습니다. 입력 중인 내용은 유지됩니다.
            </p>
          )}
          <RecruitmentForm
            key={id}
            mode="edit"
            defaultValues={{
              title: query.data.title,
              content: query.data.content,
              category: query.data.category,
            }}
            onSubmit={(values) => mutation.mutate(values)}
            isPending={mutation.isPending}
            errorMessage={mutation.error?.message}
            cancelHref={`/recruitments/${id}`}
          />
        </>
      ) : null}
    </section>
  );
}
