import { expect, test } from '@playwright/test';

test('로그인 → 모집글 목록 → 상세 화면', async ({ page }) => {
  const title = `E2E Smoke 모집글 (${process.env.E2E_EMAIL})`;
  await page.goto('/login');
  await expect(
    page.getByRole('heading', { name: '로그인', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('이메일', { exact: true })).toBeVisible();
  await expect(page.getByLabel('비밀번호', { exact: true })).toBeVisible();
  await page.getByLabel('이메일', { exact: true }).fill(process.env.E2E_EMAIL!);
  await page
    .getByLabel('비밀번호', { exact: true })
    .fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: '로그인', exact: true }).click();

  await expect(page).toHaveURL('/recruitments');
  await expect(
    page.getByRole('button', { name: '로그아웃', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '함께할 팀원을 찾아보세요' }),
  ).toBeVisible();

  // Search the fixed fixture so ordering/pagination does not select a different post.
  await page.goto(`/recruitments?q=${encodeURIComponent(title)}`);
  const recruitment = page.getByRole('link', {
    name: title,
    exact: true,
  });
  await expect(recruitment).toBeVisible();
  await recruitment.click();
  await expect(page).toHaveURL(/\/recruitments\/\d+$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: title,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole('article')).toContainText(
    '브라우저에서 로그인하고 모집글 상세를 확인하는 테스트입니다.',
  );

  // A public list is not proof of login. Reload also verifies the HttpOnly session.
  await page.reload();
  await expect(
    page.getByRole('button', { name: '로그아웃', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: title,
      exact: true,
    }),
  ).toBeVisible();
});
