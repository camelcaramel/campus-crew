import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateRecruitmentDto } from './create-recruitment.dto';
import type { UpdateRecruitmentDto } from './update-recruitment.dto';

// 사용자 전체를 include하지 않고 응답에 필요한 기본 정보만 선택합니다.
const authorInclude = { author: { select: { id: true, name: true } } };

@Injectable()
export class RecruitmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.recruitment.findMany({
      orderBy: { id: 'asc' },
      include: authorInclude,
    });
  }

  async findOne(id: number) {
    this.checkIdRange(id);
    const recruitment = await this.prisma.recruitment.findUnique({
      where: { id },
      include: authorInclude,
    });
    if (!recruitment) {
      throw new NotFoundException('모집글을 찾을 수 없습니다.');
    }
    return recruitment;
  }

  async create(body: CreateRecruitmentDto) {
    if (
      !Number.isInteger(body.authorId) ||
      body.authorId < 1 ||
      body.authorId > 2147483647
    ) {
      throw new BadRequestException('authorId는 양의 정수여야 합니다.');
    }
    const author = await this.prisma.user.findUnique({
      where: { id: body.authorId },
    });
    if (!author) {
      throw new BadRequestException('존재하는 사용자의 authorId를 입력하세요.');
    }
    try {
      return await this.prisma.recruitment.create({
        data: {
          title: body.title,
          content: body.content,
          category: body.category,
          authorId: body.authorId,
        },
        include: authorInclude,
      });
    } catch (error) {
      // 위 조회 직후 사용자가 삭제되어도 DB의 FK가 잘못된 저장을 막습니다.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          '존재하는 사용자의 authorId를 입력하세요.',
        );
      }
      throw error;
    }
  }

  async update(id: number, body: UpdateRecruitmentDto) {
    this.checkIdRange(id);
    try {
      return await this.prisma.recruitment.update({
        where: { id },
        // undefined 필드는 수정하지 않습니다. id/authorId/relation은 받지 않습니다.
        data: {
          title: body.title,
          content: body.content,
          category: body.category,
          status: body.status,
        },
        include: authorInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('모집글을 찾을 수 없습니다.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    this.checkIdRange(id);
    try {
      await this.prisma.recruitment.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('모집글을 찾을 수 없습니다.');
      }
      throw error;
    }
  }

  private checkIdRange(id: number) {
    // ParseIntPipe의 숫자 변환만으로는 PostgreSQL Int 범위를 보장하지 못합니다.
    if (!Number.isInteger(id) || id < -2147483648 || id > 2147483647) {
      throw new BadRequestException('id가 DB 정수 범위를 벗어났습니다.');
    }
  }
}
