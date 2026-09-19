import { LoginForm } from '@/features/auth/login-form';

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md py-8" aria-labelledby="login-title">
      <h1 id="login-title">로그인</h1>
      <p>Campus Crew에서 함께할 팀원을 만나보세요.</p>
      <LoginForm />
    </section>
  );
}
