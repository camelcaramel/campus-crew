'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { getRecruitments } from '@/features/recruitments/api';
import { RecruitmentCard } from '@/features/recruitments/recruitment-card';

export default function RecruitmentsPage() {
  const {
    data: recruitments,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['recruitments'],
    queryFn: getRecruitments,
  });

  let content;

  if (isPending) {
    content = <Spinner />;
  } else if (isError) {
    content = (
      <ErrorMessage
        message="모집글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
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
    );
  } else if (recruitments.length === 0) {
    content = (
      <EmptyState
        message="아직 등록된 모집글이 없습니다. 첫 번째 모집글을 작성해보세요."
        action={
          <Link
            href="/recruitments/new"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          >
            모집글 작성
          </Link>
        }
      />
    );
  } else {
    content = (
      <ul className="space-y-4">
        {recruitments.map((recruitment) => (
          // key는 React가 각 항목을 구분하도록 반복 결과의 최상위 요소에 둡니다.
          <li key={recruitment.id}>
            <RecruitmentCard recruitment={recruitment} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section>
      <h1>함께할 팀원을 찾아보세요</h1>
      <p>스터디와 프로젝트를 함께할 사람을 찾아보세요.</p>

      <div className="mt-8 min-h-80">{content}</div>
    </section>
  );
}
