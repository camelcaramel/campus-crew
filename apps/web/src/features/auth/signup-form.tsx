'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signup } from './signup-api';
import { signupSchema, type SignupValues } from './signup-schema';

const fields = [
  { name: 'name', label: '이름', type: 'text', autoComplete: 'name' },
  { name: 'email', label: '이메일', type: 'email', autoComplete: 'username' },
  {
    name: 'password',
    label: '비밀번호',
    type: 'password',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    label: '비밀번호 확인',
    type: 'password',
    autoComplete: 'new-password',
  },
] as const;

export function SignupForm() {
  const [complete, setComplete] = useState(false);
  const mutation = useMutation({ mutationFn: signup, retry: false, gcTime: 0 });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  function submit(values: SignupValues) {
    if (mutation.isPending) return;
    mutation.mutate(values, {
      onSuccess: () => {
        reset();
        mutation.reset();
        setComplete(true);
      },
    });
  }

  if (complete) {
    return (
      <div className="mt-8 space-y-6">
        <p
          role="status"
          tabIndex={-1}
          ref={(node) => {
            node?.focus();
          }}
          className="rounded-lg bg-green-50 p-4 text-green-800"
        >
          회원가입이 완료되었습니다. 가입한 이메일과 비밀번호로 로그인해주세요.
        </p>
        <Link
          href="/login"
          className="flex min-h-11 items-center justify-center rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white"
        >
          로그인
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      className="mt-8 space-y-6"
      aria-busy={mutation.isPending}
    >
      <fieldset disabled={mutation.isPending} className="space-y-6">
        <legend className="sr-only">회원가입 정보</legend>
        {fields.map((field) => {
          const error = errors[field.name];
          const id = `signup-${field.name}`;
          return (
            <div key={field.name}>
              <label htmlFor={id} className="mb-2 block text-sm font-medium">
                {field.label}
              </label>
              <input
                id={id}
                type={field.type}
                autoComplete={field.autoComplete}
                {...register(field.name)}
                aria-invalid={Boolean(error)}
                aria-describedby={
                  [
                    error ? `${id}-error` : '',
                    field.name === 'password' ? 'signup-password-help' : '',
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined
                }
                className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary-600 disabled:opacity-60"
              />
              {field.name === 'password' && (
                <p
                  id="signup-password-help"
                  className="mt-2 text-sm text-neutral-500"
                >
                  8~50자, UTF-8 72바이트 이하로 입력해주세요.
                </p>
              )}
              {error && (
                <p
                  id={`${id}-error`}
                  role="alert"
                  className="mt-2 text-sm text-red-600!"
                >
                  {error.message}
                </p>
              )}
            </div>
          );
        })}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="h-11 w-full rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
        >
          {mutation.isPending ? '가입 중…' : '회원가입'}
        </button>
      </fieldset>
      {mutation.error && (
        <p role="alert" className="text-sm text-red-600!">
          {mutation.error.message}
        </p>
      )}
      <p className="text-sm text-neutral-500">
        이미 계정이 있나요?{' '}
        <Link href="/login" className="text-primary-600 underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
