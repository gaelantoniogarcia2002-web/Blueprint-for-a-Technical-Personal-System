import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  // DB boundary: only src/repositories/** may import from src/db/schema
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/repositories/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*/db/schema', '@/db/schema'],
              message:
                'Direct imports from db/schema are only allowed inside src/repositories/**.',
            },
          ],
        },
      ],
    },
  },
];
