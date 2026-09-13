import { z } from 'zod';

// 입력 규칙은 이 schema 한 곳에서 관리합니다.
export const recruitmentFormSchema = z.object({
  title: z
    .string()
    .min(2, '제목은 2자 이상 입력해주세요.')
    .max(80, '제목은 80자 이하로 입력해주세요.'),
  category: z.enum(['STUDY', 'PROJECT', 'CONTEST'], {
    error: '카테고리를 선택해주세요.',
  }),
  content: z
    .string()
    .min(10, '내용은 10자 이상 입력해주세요.')
    .max(2000, '내용은 2000자 이하로 입력해주세요.'),
});

// 별도 interface를 중복 작성하지 않고 schema에서 타입을 추론합니다.
export type RecruitmentFormValues = z.infer<typeof recruitmentFormSchema>;
