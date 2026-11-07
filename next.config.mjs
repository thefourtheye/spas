/** @type {import('next').NextConfig} */
const nextConfig = {
    // static HTML export, served by the blog under /apps
    output: "export",
    basePath: "/apps",
    assetPrefix: "/apps",
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
