import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep the classroom scaffold free of automatically generated agent files.
  agentRules: false,
};

export default nextConfig;
