export type Recruitment = {
  id: number;
  category: '스터디' | '프로젝트';
  status: 'OPEN' | 'CLOSED';
  title: string;
  content: string;
  author: {
    name: string;
  };
  createdAt: string;
};
