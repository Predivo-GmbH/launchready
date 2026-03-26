import nextConfig from 'eslint-config-next/core-web-vitals'

export default [
  ...nextConfig,
  {
    ignores: ['out/', '.next/', 'e2e/'],
  },
  {
    rules: {
      // setState in effects is valid for reading from external sources (sessionStorage, auth state)
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]
