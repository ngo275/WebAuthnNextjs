/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')(['@simplewebauthn/browser']); // pass the modules you would like to see transpiled
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig;
module.exports = withTM({});
