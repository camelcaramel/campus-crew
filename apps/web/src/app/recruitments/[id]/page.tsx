'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorMessage } from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { getRecruitment } from '@/features/recruitments/api';
import { recruitmentCategoryLabels } from '@/features/recruitments/types';

export default function RecruitmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: recruitment,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['recruitments', id],
    queryFn: () => getRecruitment(id),
  });

  if (isPending || isError) {
    return (
      <section className="pt-4">
        <Link
          href="/recruitments"
          className="text-sm text-primary-600 hover:underline"
        >
          모집글 목록으로
        </Link>
        <div className="mt-6">
          {isPending ? (
            <Spinner />
          ) : (
            <ErrorMessage
              message={
                error.message === '모집글을 찾을 수 없습니다.'
                  ? error.message
                  : '모집글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
              }
              action={
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                  className="min-h-10 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-primary-600 disabled:opacity-50"
                >
                  다시 시도
                </button>
              }
            />
          )}
        </div>
      </section>
    );
  }

  const isOpen = recruitment.status === 'OPEN';

  return (
    // 기존 layout의 위쪽 여백 32px + 이 페이지의 16px = 48px
    <section className="pt-4">
      <Link
        href="/recruitments"
        className="text-sm text-primary-600 hover:underline"
      >
        모집글 목록으로
      </Link>

      <article className="mt-6 max-w-3xl rounded-xl border border-neutral-200 p-6 sm:p-8">
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-neutral-500">
            {recruitmentCategoryLabels[recruitment.category]}
          </span>
          <span
            className={`rounded-full px-3 py-1 ${
              isOpen
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isOpen ? '모집 중' : '모집 마감'}
          </span>
        </div>

        <h1 className="mt-4 text-3xl! leading-snug font-bold break-words text-neutral-900 sm:text-4xl!">
          {recruitment.title}
        </h1>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
          <span>{recruitment.author.name}</span>
          <time dateTime={recruitment.createdAt}>
            {recruitment.createdAt.slice(0, 10)}
          </time>
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-8">
          <p className="leading-8 break-words whitespace-pre-wrap text-neutral-900!">
            {recruitment.content}
          </p>
        </div>
      </article>
    </section>
  );
}
