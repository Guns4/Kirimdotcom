module.exports = {
  entry: [
    'next.config.{js,ts,mjs}',
    'src/middleware.ts',
    'src/app/**/{page,layout,loading,error,not-found,global-error,route,template,default}.{ts,tsx}',
    'src/instrumentation.ts',
  ],
  project: ['src/**/*.{ts,tsx,js,jsx}'],
  ignore: ['**/*.d.ts'],
  ignoreDependencies: [
    'eslint-config-next',
    'postcss',
    'autoprefixer',
    'tailwindcss',
    'sharp',
    '@types/*',
  ],
};
