import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateRecruitmentDto } from './create-recruitment.dto';

export interface Recruitment {
  id: number;
  title: string;
  content: string;
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
      content: '함께 TypeScript 기초를 공부할 팀원을 모집합니다.',
      category: 'STUDY',
      status: 'OPEN',
    },
    {
      id: 2,
      title: '캠퍼스 서비스 프로젝트 팀원 모집',
      content: '학생들을 위한 캠퍼스 서비스를 함께 만들 팀원을 모집합니다.',
      category: 'PROJECT',
      status: 'OPEN',
    },
    {
      id: 3,
      title: '대학생 공모전 팀원 모집',
      content: '대학생 공모전을 함께 준비할 팀원을 모집합니다.',
      category: 'CONTEST',
      status: 'CLOSED',
    },
  ];
  private nextId = 4;

  findAll(): Recruitment[] {
    return this.recruitments;
  }

  findOne(id: number): Recruitment {
    const recruitment = this.recruitments.find((item) => item.id === id);
    if (!recruitment) {
      throw new NotFoundException('모집글을 찾을 수 없습니다.');
    }
    return recruitment;
  }

  create(body: CreateRecruitmentDto): Recruitment {
    const recruitment: Recruitment = {
      id: this.nextId++,
      title: body.title,
      content: body.content,
      category: body.category,
      status: 'OPEN',
    };
    this.recruitments.push(recruitment);
    return recruitment;
  }
}
