/** @type {import('next').NextConfig} */
export default {
  output: 'export',          // static HTML into out/
  trailingSlash: true,       // /tours -> out/tours/index.html
  images: { unoptimized: true },
};
