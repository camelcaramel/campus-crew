import { ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { SignupDto } from './signup.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(body: SignupDto) {
    // 숫자 cost를 전달하면 bcryptjs가 매번 새로운 salt를 생성합니다.
    const passwordHash = await hash(body.password, 10);
    try {
      return await this.prisma.user.create({
        data: { name: body.name, email: body.email, passwordHash },
        select: { id: true, email: true, name: true, createdAt: true },
      });
    } catch (error) {
      // 사전 조회만으로는 동시 가입을 막지 못하므로 DB unique 오류를 처리합니다.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          statusCode: 409,
          code: 'USER_EMAIL_ALREADY_EXISTS',
          message: '이미 사용 중인 이메일입니다.',
        });
      }
      throw error;
    }
  }
}
