module.exports = {
  preset: 'jest-expo',
  // No CI (GitHub Actions), workers do TanStack Query podem deixar timers abertos e o Jest
  // sair com código ≠ 0; forceExit evita job vermelho com testes passando.
  ...(process.env.CI ? { forceExit: true } : {}),
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*|@gorhom/.*|@rn-primitives/.*)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  resetMocks: false,
  resetModules: false,
};
