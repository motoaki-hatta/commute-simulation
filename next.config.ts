import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 生成ファイルをESLintチェックから除外し、手動で書いたコードのみチェック
    dirs: ['src/app', 'src/components', 'src/lib', 'src/utils', 'src/types'],
    ignoreDuringBuilds: false, // 本番品質を保つためfalseに設定
  },
  typescript: {
    // TypeScriptエラーは厳密にチェック
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
