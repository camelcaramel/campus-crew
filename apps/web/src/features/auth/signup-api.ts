import type { SignupValues } from './signup-schema';

export type SignupResponse = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export async function signup(values: SignupValues): Promise<SignupResponse> {
  let response: Response;
  try {
    response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 비밀번호 확인은 화면 검증에만 사용합니다.
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });
  } catch {
    throw new Error(
      '서버에 연결하지 못했습니다. 연결 상태를 확인하고 다시 시도해주세요.',
    );
  }
  if (response.status === 409)
    throw new Error(
      '이미 사용 중인 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.',
    );
  if (response.status === 400)
    throw new Error(
      '입력값을 확인해주세요. 이름, 이메일, 비밀번호 형식을 다시 확인하세요.',
    );
  if (!response.ok)
    throw new Error('회원가입하지 못했습니다. 잠시 후 다시 시도해주세요.');
  return response.json() as Promise<SignupResponse>;
}
