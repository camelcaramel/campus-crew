import { CreateRecruitmentForm } from '@/features/recruitments/create-recruitment-form';

export default function NewRecruitmentPage() {
  return (
    <section className="mx-auto max-w-[720px]">
      <h1>모집글 작성</h1>
      <p>함께할 팀원을 모집해보세요.</p>

      <CreateRecruitmentForm />
    </section>
  );
}
