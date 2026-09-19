export type Recruitment = {
  id: number;
  category: 'STUDY' | 'PROJECT' | 'CONTEST';
  status: 'OPEN' | 'CLOSED';
  title: string;
  content: string;
  authorId: number;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

export const recruitmentCategoryLabels: Record<
  Recruitment['category'],
  string
> = {
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CONTEST: '공모전',
};
