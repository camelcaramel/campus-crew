import Link from 'next/link';
import { Container } from './container';

export function Header() {
  return (
    <header className="h-16 border-b border-neutral-200 bg-white">
      <Container className="flex h-full items-center justify-between gap-6">
        <Link href="/" className="shrink-0 text-xl font-bold text-primary-600">
          Campus Crew
        </Link>

        <nav aria-label="주요 메뉴" className="flex items-center gap-6 text-sm">
          <Link href="/recruitments" className="text-neutral-900">
            모집글
          </Link>
          {/* 인증 화면은 후속 차시에서 연결합니다. */}
          <button
            type="button"
            disabled
            title="인증 차시에서 구현 예정"
            className="text-neutral-500"
          >
            로그인
          </button>
          <button
            type="button"
            disabled
            title="인증 차시에서 구현 예정"
            className="text-neutral-500"
          >
            회원가입
          </button>
        </nav>
      </Container>
    </header>
  );
}
