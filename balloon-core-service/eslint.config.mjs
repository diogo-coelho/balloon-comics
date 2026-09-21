// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const architectureIgnores = [
  '**/*.spec.ts',
  '**/*.test.ts',
  '**/tests/**',
];

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'coverage/**',
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },

  /*
   * ==========================================================
   * DOMAIN
   * ==========================================================
   */
  {
    files: ['src/domain/**/*.ts'],
    ignores: architectureIgnores,

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/application/**',
                '**/infrastructure/**',
                '**/presentation/**',
                '**/modules/**',
                '**/db/**',
              ],
              message:
                'Clean Architecture: domain não pode depender de camadas externas.',
            },

            {
              group: [
                '@nestjs/*',
                'typeorm',
                '@nestjs/typeorm',
                'express',
                'amqplib',
                'amqp-connection-manager',
                '@aws-sdk/*',
                'sharp',
                'passport',
                'passport-jwt',
                'class-validator',
                'class-transformer',
              ],
              message:
                'Clean Architecture: domain deve permanecer independente de frameworks, bibliotecas de infraestrutura e adapters externos.',
            },
          ],
        },
      ],
    },
  },

  /*
   * ==========================================================
   * APPLICATION
   * ==========================================================
   */
  {
    files: ['src/application/**/*.ts'],
    ignores: architectureIgnores,

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/infrastructure/**',
                '**/presentation/**',
                '**/modules/**',
                '**/db/**',
              ],
              message:
                'Clean Architecture: application pode depender de domain, mas não das camadas externas.',
            },

            {
              group: [
                '@nestjs/*',
                'typeorm',
                '@nestjs/typeorm',
                'express',
                'amqplib',
                'amqp-connection-manager',
                '@aws-sdk/*',
                'sharp',
                'passport',
                'passport-jwt',
                'class-validator',
                'class-transformer',
              ],
              message:
                'Clean Architecture: application deve usar Ports em vez de frameworks ou adapters concretos.',
            },
          ],
        },
      ],
    },
  },

  /*
   * ==========================================================
   * INFRASTRUCTURE
   * ==========================================================
   */
  {
    files: ['src/infrastructure/**/*.ts'],
    ignores: architectureIgnores,

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/presentation/**',
                '**/modules/**',
              ],
              message:
                'Clean Architecture: infrastructure não deve depender de presentation ou modules.',
            },
          ],
        },
      ],
    },
  },

  /*
   * ==========================================================
   * PRESENTATION
   * ==========================================================
   */
  {
    files: ['src/presentation/**/*.ts'],
    ignores: architectureIgnores,

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/infrastructure/**',
                '**/modules/**',
                '**/db/**',
              ],
              message:
                'Clean Architecture: presentation deve chamar Use Cases e não depender diretamente de adapters de infrastructure.',
            },
          ],
        },
      ],
    },
  },
);