import { Allow } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// 전역 whitelist에서 기존 필드를 보존합니다. 값 검증은 기존 Service 동작을 유지합니다.
export class CreateRecruitmentDto {
  @Allow()
  @ApiProperty({ example: 'React 스터디 팀원 모집' })
  title!: string;

  @Allow()
  @ApiProperty({ example: '주 1회 함께 공부할 팀원을 모집합니다.' })
  content!: string;

  @Allow()
  @ApiProperty({ enum: ['STUDY', 'PROJECT', 'CONTEST'], example: 'STUDY' })
  category!: 'STUDY' | 'PROJECT' | 'CONTEST';
}
