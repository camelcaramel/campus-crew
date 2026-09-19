import { ApiProperty } from '@nestjs/swagger';

// 요청 body의 모양과 Swagger 설명입니다. 런타임 입력 검증은 아직 하지 않습니다.
export class CreateRecruitmentDto {
  @ApiProperty({ example: 'React 스터디 팀원 모집' })
  title!: string;

  @ApiProperty({ example: '주 1회 함께 공부할 팀원을 모집합니다.' })
  content!: string;

  @ApiProperty({ enum: ['STUDY', 'PROJECT', 'CONTEST'], example: 'STUDY' })
  category!: 'STUDY' | 'PROJECT' | 'CONTEST';

  // auth 차시에서는 body 대신 현재 로그인 사용자 id를 사용합니다.
  @ApiProperty({ example: 1 })
  authorId!: number;
}
