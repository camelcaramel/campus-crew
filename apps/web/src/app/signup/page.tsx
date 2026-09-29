import { SignupForm } from '@/features/auth/signup-form';

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-md py-8" aria-labelledby="signup-title">
      <h1 id="signup-title">회원가입</h1>
      <p>Campus Crew에서 함께할 팀원을 만나보세요.</p>
      <SignupForm />
    </section>
  );
}
