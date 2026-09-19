import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Container } from '@/components/layout/container';
import { Header } from '@/components/layout/header';
import { Providers } from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus Crew',
  description: '함께 공부할 팀원을 만나는 Campus Crew',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Header />

          {/* 공통 헤더 아래에 현재 URL의 page가 children으로 들어옵니다. */}
          <main className="py-8">
            <Container>{children}</Container>
          </main>
        </Providers>
      </body>
    </html>
  );
}
