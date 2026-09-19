import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupResponseDto } from './signup-response.dto';
import { SignupDto } from './signup.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입 — 비밀번호를 hash로 저장' })
  @ApiCreatedResponse({ type: SignupResponseDto })
  @ApiBadRequestResponse({ description: '입력값 검증 실패' })
  @ApiConflictResponse({
    description: '이미 사용 중인 이메일',
    schema: {
      example: {
        statusCode: 409,
        code: 'USER_EMAIL_ALREADY_EXISTS',
        message: '이미 사용 중인 이메일입니다.',
      },
    },
  })
  signup(@Body() body: SignupDto): Promise<SignupResponseDto> {
    return this.authService.signup(body);
  }
}
