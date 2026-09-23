import Link from 'next/link';
import { recruitmentCategoryLabels, type Recruitment } from './types';

type RecruitmentCardProps = {
  recruitment: Recruitment;
};

export function RecruitmentCard({ recruitment }: RecruitmentCardProps) {
  const isOpen = recruitment.status === 'OPEN';

  return (
    <article className="rounded-xl border border-neutral-200 p-6">
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-neutral-500">
          {recruitmentCategoryLabels[recruitment.category]}
        </span>
        <span
          className={`rounded-full px-3 py-1 ${
            isOpen ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isOpen ? '모집 중' : '모집 마감'}
        </span>
      </div>

      <h2 className="mt-4 text-xl font-semibold break-words text-neutral-900">
        <Link
          href={`/recruitments/${recruitment.id}`}
          className="hover:underline"
        >
          {recruitment.title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-2 break-words text-neutral-500">
        {recruitment.content}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
        <span>{recruitment.author.name}</span>
        <time dateTime={recruitment.createdAt}>
          {recruitment.createdAt.slice(0, 10)}
        </time>
      </div>
    </article>
  );
}
