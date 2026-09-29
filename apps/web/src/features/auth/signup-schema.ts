import { z } from 'zod';

// 21차시에서 단독으로 사용할 수 있도록 22차시 로그인 코드에 의존하지 않습니다.
export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .refine(
        (value) =>
          Array.from(value).length >= 2 && Array.from(value).length <= 20,
        '이름은 2~20자로 입력해주세요.',
      ),
    email: z
      .string()
      .regex(/^.+@[^@\s]+\.[^@\s]+$/u, '올바른 이메일을 입력해주세요.'),
    password: z
      .string()
      .refine(
        (value) =>
          Array.from(value).length >= 8 && Array.from(value).length <= 50,
        '비밀번호는 8~50자로 입력해주세요.',
      )
      .refine(
        (value) =>
          !/[\uD800-\uDFFF]/u.test(value) &&
          new TextEncoder().encode(value).length <= 72,
        '비밀번호는 올바른 유니코드이며 UTF-8 72바이트 이하여야 합니다.',
      ),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: '비밀번호가 일치하지 않습니다.',
  });

export type SignupValues = z.infer<typeof signupSchema>;
