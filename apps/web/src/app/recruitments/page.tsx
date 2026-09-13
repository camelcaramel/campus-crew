import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { mockRecruitments } from '@/features/recruitments/mock-data';
import { RecruitmentCard } from '@/features/recruitments/recruitment-card';

type RecruitmentsPageProps = {
  searchParams: Promise<{ mode?: string | string[] }>;
};

export default async function RecruitmentsPage({
  searchParams,
}: RecruitmentsPageProps) {
  // 수업용: ?mode=loading | empty | error | data. 기본값은 기존 Mock 목록입니다.
  const { mode } = await searchParams;
  const recruitments = mode === 'empty' ? [] : mockRecruitments;

  // 이후 API 연결 시 mode 대신 isLoading, isError, data로 같은 분기를 선택합니다.
  let content;

  if (mode === 'loading') {
    content = <Spinner />;
  } else if (mode === 'error') {
    content = (
      <ErrorMessage
        message="요청을 처리하는 중 문제가 발생했습니다."
        action={
          <button
            type="button"
            disabled
            className="min-h-10 cursor-not-allowed rounded-lg border border-neutral-200 bg-gray-100 px-4 py-2 text-sm text-neutral-500"
          >
            다시 시도 (준비 중)
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
