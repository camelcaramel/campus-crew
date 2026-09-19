import { Allow } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRecruitmentDto {
  @Allow()
  @ApiPropertyOptional({ example: 'React 스터디 추가 모집' })
  title?: string;

  @Allow()
  @ApiPropertyOptional({ example: '매주 토요일에 함께 공부합니다.' })
  content?: string;

  @Allow()
  @ApiPropertyOptional({ enum: ['STUDY', 'PROJECT', 'CONTEST'] })
  category?: 'STUDY' | 'PROJECT' | 'CONTEST';

  @Allow()
  @ApiPropertyOptional({ enum: ['OPEN', 'CLOSED'], example: 'CLOSED' })
  status?: 'OPEN' | 'CLOSED';
}
