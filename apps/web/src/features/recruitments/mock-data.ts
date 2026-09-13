import type { Recruitment } from './types';

// 서버 연결 전에 화면을 만들어 보는 연습용 데이터입니다.
export const mockRecruitments: Recruitment[] = [
  {
    id: 1,
    category: '스터디',
    status: 'OPEN',
    title: 'React 기초부터 함께 공부할 팀원을 구해요',
    content:
      '매주 화요일 저녁에 모여 컴포넌트와 props를 공부해요. 각자 작은 화면을 만들어 보고 코드를 설명하며 함께 배울 분을 기다립니다.',
    author: { name: '김민지' },
    createdAt: '2026-09-13',
  },
  {
    id: 2,
    category: '프로젝트',
    status: 'OPEN',
    title: '교내 동아리 소개 웹사이트를 함께 만들어요',
    content:
      '동아리를 쉽게 찾을 수 있는 웹사이트를 만들려고 합니다. Figma로 화면을 정리하고 Next.js로 구현하면서 기획부터 배포까지 경험해 봐요.',
    author: { name: '이준호' },
    createdAt: '2026-09-12',
  },
  {
    id: 3,
    category: '스터디',
    status: 'CLOSED',
    title: 'TypeScript로 시작하는 알고리즘 스터디',
    content:
      '일주일에 두 문제씩 풀고 서로의 풀이를 나누는 스터디입니다. 정답뿐 아니라 문제를 어떻게 나누고 생각했는지 설명하는 연습을 함께합니다.',
    author: { name: '박서연' },
    createdAt: '2026-09-11',
  },
  {
    id: 4,
    category: '프로젝트',
    status: 'OPEN',
    title: '캠퍼스 중고 교재 나눔 서비스를 만들 팀원 모집',
    content:
      '다음 학기에 필요한 교재를 찾고 나눌 수 있는 서비스를 만들어 봐요. 작은 기능부터 완성하며 Git으로 협업하는 경험을 쌓고 싶은 분을 모집합니다.',
    author: { name: '최지우' },
    createdAt: '2026-09-10',
  },
];
