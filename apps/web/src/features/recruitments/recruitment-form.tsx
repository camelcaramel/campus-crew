'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createRecruitment } from './api';
import { recruitmentFormSchema, type RecruitmentFormValues } from './schema';

export function RecruitmentForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createRecruitment,
    onSuccess: async () => {
      // 프론트 캐시를 오래된 상태로 표시합니다. DB를 수정하는 함수가 아닙니다.
      await queryClient.invalidateQueries({ queryKey: ['recruitments'] });
      router.push('/recruitments');
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruitmentFormValues>({
    resolver: zodResolver(recruitmentFormSchema),
    defaultValues: { title: '', content: '' },
  });

  function onSubmit(data: RecruitmentFormValues) {
    // handleSubmit이 Zod 검증을 통과한 값만 전달합니다.
    if (mutation.isPending) return;
    mutation.mutate(data);
  }

  return (
    <>
      {/* 브라우저 기본 검증 대신 Zod의 오류 메시지를 표시합니다. */}
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-6"
      >
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            제목
          </label>
          <input
            id="title"
            type="text"
            placeholder="제목을 입력해주세요 (2~80자)"
            {...register('title')}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'title-error' : undefined}
            className={`h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
              errors.title ? 'border-red-600' : 'border-neutral-200'
            }`}
          />
          {errors.title && (
            <p
              id="title-error"
              role="alert"
              className="mt-2 text-sm text-red-600!"
            >
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium">
            카테고리
          </label>
          <select
            id="category"
            defaultValue=""
            {...register('category')}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? 'category-error' : undefined}
            className={`h-10 w-full rounded-lg border bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
              errors.category ? 'border-red-600' : 'border-neutral-200'
            }`}
          >
            <option value="" disabled>
              카테고리를 선택해주세요
            </option>
            <option value="STUDY">스터디</option>
            <option value="PROJECT">프로젝트</option>
            <option value="CONTEST">공모전</option>
          </select>
          {errors.category && (
            <p
              id="category-error"
              role="alert"
              className="mt-2 text-sm text-red-600!"
            >
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="mb-2 block text-sm font-medium">
            내용
          </label>
          <textarea
            id="content"
            placeholder="모집 내용을 입력해주세요 (10~2000자)"
            {...register('content')}
            aria-invalid={Boolean(errors.content)}
            aria-describedby={errors.content ? 'content-error' : undefined}
            className={`block min-h-40 w-full resize-y rounded-lg border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
              errors.content ? 'border-red-600' : 'border-neutral-200'
            }`}
          />
          {errors.content && (
            <p
              id="content-error"
              role="alert"
              className="mt-2 text-sm text-red-600!"
            >
              {errors.content.message}
            </p>
          )}
        </div>

        {/* 필드별 입력 오류와 서버 요청 실패를 구분합니다. */}
        {mutation.isError && (
          <p role="alert" className="text-sm text-red-600!">
            {mutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/recruitments"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 px-5 text-sm font-medium"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="h-10 cursor-pointer rounded-lg bg-primary-600 px-5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>
    </>
  );
}
