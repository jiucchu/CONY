export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gray-200">
      <main className="flex min-h-screen w-full max-w-md mx-auto flex-col px-4 py-6 bg-white shadow-lg">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            CONY
          </h1>
          <p className="text-base text-gray-600">
            모바일 웹 애플리케이션
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-blue-800">
              실제 개발 영역 (max-width: 28rem / 448px)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
