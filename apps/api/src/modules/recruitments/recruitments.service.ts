import { Injectable } from '@nestjs/common';

export interface Recruitment {
  id: number;
  title: string;
  category: 'STUDY' | 'PROJECT' | 'CONTEST';
  status: 'OPEN' | 'CLOSED';
}

@Injectable()
export class RecruitmentsService {
  // DB 연결 전에는 Service 내부의 메모리 데이터를 사용합니다.
  private readonly recruitments: Recruitment[] = [
    {
      id: 1,
      title: 'TypeScript 스터디 팀원 모집',
      category: 'STUDY',
      status: 'OPEN',
    },
    {
      id: 2,
      title: '캠퍼스 서비스 프로젝트 팀원 모집',
      category: 'PROJECT',
      status: 'OPEN',
    },
    {
      id: 3,
      title: '대학생 공모전 팀원 모집',
      category: 'CONTEST',
      status: 'CLOSED',
    },
  ];

  findAll(): Recruitment[] {
    return this.recruitments;
  }
}
