import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import {
  ApplicationStatus,
  PrismaClient,
  RecruitmentCategory,
  RecruitmentStatus,
} from '../generated/prisma/client';

config({ path: resolve(__dirname, '../../../.env'), quiet: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'Set DATABASE_URL in the repository-root .env before seeding.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.$transaction(async (tx) => {
    // Empty updates preserve existing practice data on repeated runs.
    const teacher = await tx.user.upsert({
      where: { email: 'teacher@example.com' },
      update: {},
      create: {
        email: 'teacher@example.com',
        name: 'teacher',
        passwordHash: 'PLACEHOLDER_NOT_A_REAL_PASSWORD_HASH',
      },
    });
    const student1 = await tx.user.upsert({
      where: { email: 'student1@example.com' },
      update: {},
      create: {
        email: 'student1@example.com',
        name: 'student1',
        passwordHash: 'PLACEHOLDER_NOT_A_REAL_PASSWORD_HASH',
      },
    });
    const student2 = await tx.user.upsert({
      where: { email: 'student2@example.com' },
      update: {},
      create: {
        email: 'student2@example.com',
        name: 'student2',
        passwordHash: 'PLACEHOLDER_NOT_A_REAL_PASSWORD_HASH',
      },
    });

    const recruitmentData = [
      {
        title: 'TypeScript 기초 스터디',
        content: '타입과 인터페이스를 함께 연습합니다.',
        category: RecruitmentCategory.STUDY,
        status: RecruitmentStatus.OPEN,
        authorId: teacher.id,
      },
      {
        title: '알고리즘 문제 풀이 스터디',
        content: '매주 두 문제를 풀고 풀이를 공유합니다.',
        category: RecruitmentCategory.STUDY,
        status: RecruitmentStatus.CLOSED,
        authorId: student1.id,
      },
      {
        title: 'Campus Crew 웹 프로젝트',
        content: '교내 팀원 모집 서비스를 함께 만듭니다.',
        category: RecruitmentCategory.PROJECT,
        status: RecruitmentStatus.OPEN,
        authorId: teacher.id,
      },
      {
        title: '동아리 일정 관리 프로젝트',
        content: '동아리 행사를 정리하는 웹 서비스를 만듭니다.',
        category: RecruitmentCategory.PROJECT,
        status: RecruitmentStatus.OPEN,
        authorId: student2.id,
      },
      {
        title: '교내 해커톤 참가팀',
        content: '학교 생활을 개선할 아이디어를 구현합니다.',
        category: RecruitmentCategory.CONTEST,
        status: RecruitmentStatus.OPEN,
        authorId: teacher.id,
      },
      {
        title: '공공데이터 활용 공모전',
        content: '공공데이터를 활용한 서비스 아이디어를 제안합니다.',
        category: RecruitmentCategory.CONTEST,
        status: RecruitmentStatus.CLOSED,
        authorId: student1.id,
      },
    ];

    const recruitments = [];
    for (const data of recruitmentData) {
      // The ERD has no title unique key. This sequential local seed reuses
      // an existing author/title pair instead of imposing a new DB constraint.
      const existing = await tx.recruitment.findFirst({
        where: { authorId: data.authorId, title: data.title },
        orderBy: { id: 'asc' },
      });
      recruitments.push(existing ?? (await tx.recruitment.create({ data })));
    }

    const applications = [
      {
        applicantId: student1.id,
        recruitmentId: recruitments[0].id,
        message: 'TypeScript 기초부터 함께 공부하고 싶습니다.',
        status: ApplicationStatus.PENDING,
      },
      {
        applicantId: student2.id,
        recruitmentId: recruitments[2].id,
        message: '웹 프로젝트의 화면 구현에 참여하고 싶습니다.',
        status: ApplicationStatus.APPROVED,
      },
      {
        applicantId: student1.id,
        recruitmentId: recruitments[4].id,
        message: '해커톤에서 백엔드 개발을 맡고 싶습니다.',
        status: ApplicationStatus.REJECTED,
      },
    ];

    for (const data of applications) {
      await tx.application.upsert({
        where: {
          applicantId_recruitmentId: {
            applicantId: data.applicantId,
            recruitmentId: data.recruitmentId,
          },
        },
        update: {},
        create: data,
      });
    }
  });

  console.log('Seed ready: 3 users, 6 recruitments, 3 applications.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
