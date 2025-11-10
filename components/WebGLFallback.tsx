'use client';

export function WebGLFallback() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          WebGL非対応
        </h1>
        <p className="text-base sm:text-lg text-gray-300 mb-6">
          お使いのブラウザまたはデバイスはWebGLをサポートしていないため、このゲームをプレイできません。
        </p>
        <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg text-sm sm:text-base text-left space-y-2">
          <p className="font-semibold">推奨環境:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Chrome、Firefox、Safari、Edge（最新版）</li>
            <li>WebGL対応のグラフィックスカード</li>
            <li>ハードウェアアクセラレーションが有効</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
