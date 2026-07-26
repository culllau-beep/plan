import type { NextConfig } from "next";

// GitHub Actions에서 GitHub Pages(프로젝트 사이트, /plan 서브패스)로 배포할 때만
// basePath를 붙인다. 로컬 개발(npm run dev)은 지금처럼 루트 경로를 그대로 쓴다.
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/plan" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
