import { mockRecruitments } from '@/features/recruitments/mock-data';
import { RecruitmentCard } from '@/features/recruitments/recruitment-card';

export default function RecruitmentsPage() {
  return (
    <section>
      <h1>함께할 팀원을 찾아보세요</h1>
      <p>스터디와 프로젝트를 함께할 사람을 찾아보세요.</p>

      <ul className="mt-8 space-y-4">
        {mockRecruitments.map((recruitment) => (
          // key는 React가 각 항목을 구분하도록 반복 결과의 최상위 요소에 둡니다.
          <li key={recruitment.id}>
            <RecruitmentCard recruitment={recruitment} />
          </li>
        ))}
      </ul>
    </section>
  );
}
