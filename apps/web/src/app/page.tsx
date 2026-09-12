export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-semibold text-indigo-700">
        4차시 · 프로젝트 시작
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-slate-950">
        Campus Crew
      </h1>
      <p className="text-lg leading-8 text-slate-700">
        함께 만들 캠퍼스 커뮤니티의 첫 페이지입니다.
      </p>
      <p className="leading-7 text-slate-600">
        지금은 개발 환경을 확인하는 시작 화면입니다. 다음 차시부터 Figma
        디자인을 바탕으로 화면과 기능을 구현합니다.
      </p>
    </main>
  );
}
