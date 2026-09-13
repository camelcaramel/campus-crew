import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockRecruitments } from '@/features/recruitments/mock-data';

type RecruitmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecruitmentDetailPage({
  params,
}: RecruitmentDetailPageProps) {
  // [id]에 해당하는 URL 값은 문자열이므로 Mock 데이터의 숫자 id와 맞춥니다.
  const { id } = await params;
  const recruitmentId = Number(id);
  const recruitment = mockRecruitments.find(
    (item) => item.id === recruitmentId,
  );

  if (!recruitment) {
    notFound();
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
            {recruitment.category}
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
          <time dateTime={recruitment.createdAt}>{recruitment.createdAt}</time>
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
