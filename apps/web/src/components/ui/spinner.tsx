type SpinnerProps = {
  label?: string;
};

export function Spinner({
  label = '모집글을 불러오는 중입니다.',
}: SpinnerProps) {
  return (
    <div
      role="status"
      className="flex min-h-80 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <span
        aria-hidden="true"
        className="size-8 rounded-full border-4 border-neutral-200 border-t-primary-600 motion-safe:animate-spin"
      />
      <p>{label}</p>
    </div>
  );
}
