import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, ValidateBy } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: '김학생', minLength: 2, maxLength: 20 })
  @IsString()
  @Length(2, 20)
  name!: string;

  @ApiProperty({ example: 'student3@example.com', format: 'email' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    maxLength: 50,
    format: 'password',
    writeOnly: true,
    description: '8~50자, UTF-8 최대 72바이트 (bcrypt 입력 제한)',
  })
  @IsString()
  @Length(8, 50)
  @ValidateBy({
    name: 'isBcryptInput',
    validator: {
      // IsByteLength의 encodeURI는 잘못된 surrogate에서 예외를 던집니다.
      validate: (value: unknown) =>
        typeof value === 'string' &&
        !/[\uD800-\uDFFF]/u.test(value) &&
        Buffer.byteLength(value, 'utf8') <= 72,
      defaultMessage: () =>
        'password는 올바른 유니코드이며 UTF-8 기준 72바이트 이하여야 합니다.',
    },
  })
  password!: string;
}
