import { ApiProperty } from '@nestjs/swagger';

// Swagger에도 공개할 필드만 선언합니다. 실제 응답은 Prisma select로 제한합니다.
export class SignupResponseDto {
  @ApiProperty({ example: 4 })
  id!: number;

  @ApiProperty({ example: 'student3@example.com' })
  email!: string;

  @ApiProperty({ example: '김학생' })
  name!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
