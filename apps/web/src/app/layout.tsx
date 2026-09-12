import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus Crew',
  description: '함께 공부할 팀원을 만나는 Campus Crew',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <div className="container">
            <p className="site-name">Campus Crew</p>
            <nav aria-label="주요 메뉴">
              <Link href="/">홈</Link>
              <Link href="/recruitments">모집글</Link>
            </nav>
          </div>
        </header>

        {/* 공통 헤더 아래에 현재 URL의 page가 children으로 들어옵니다. */}
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
