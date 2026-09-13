'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { recruitmentFormSchema, type RecruitmentFormValues } from './schema';

export function RecruitmentForm() {
  // 입력마다 state를 만들지 않고, 마지막 유효한 제출 결과만 보관합니다.
  const [submittedData, setSubmittedData] =
    useState<RecruitmentFormValues | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruitmentFormValues>({
    resolver: zodResolver(recruitmentFormSchema),
    defaultValues: { title: '', content: '' },
  });

  function onSubmit(data: RecruitmentFormValues) {
    // handleSubmit이 Zod 검증을 통과한 값만 전달합니다. API 호출은 없습니다.
    setSubmittedData(data);
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

        <div className="flex justify-end gap-3">
          <Link
            href="/recruitments"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 px-5 text-sm font-medium"
          >
            취소
          </Link>
          <button
            type="submit"
            className="h-10 cursor-pointer rounded-lg bg-primary-600 px-5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            등록
          </button>
        </div>
      </form>

      {submittedData && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4"
        >
          <h2 className="font-semibold text-green-800">
            마지막 유효한 제출 값
          </h2>
          <p className="mt-1 text-sm text-green-800!">
            입력 검증을 통과했습니다. 아직 API로 전송하거나 저장하지 않았습니다.
          </p>
          <pre className="mt-3 text-sm whitespace-pre-wrap break-words">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}
