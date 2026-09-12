import type { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className = '' }: ContainerProps) {
  return (
    // border-box: 본문 1120px + 좌우 padding 32px씩 = 최대 외곽 폭 1184px
    <div className={`mx-auto w-full max-w-[1184px] px-8 ${className}`}>
      {children}
    </div>
  );
}
