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
   *
   * A camada de domínio é a camada mais interna.
   * Ela não pode depender de nenhuma camada externa.
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
                'Clean Architecture: domain não pode depender de application, infrastructure, presentation, modules ou db.',
            },

            {
              group: [
                '@nestjs/*',
                'typeorm',
                '@nestjs/typeorm',
                'express',
                'cookie-parser',
                'amqplib',
                'amqp-connection-manager',
                'bcryptjs',
                'class-validator',
                'class-transformer',
              ],
              message:
                'Clean Architecture: domain deve permanecer independente de frameworks e adapters externos.',
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
   *
   * Application pode conhecer Domain.
   * Não pode conhecer as implementações externas.
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
                'Clean Architecture: application pode depender de domain, mas não de infrastructure, presentation, modules ou db.',
            },

            {
              group: [
                '@nestjs/*',
                'typeorm',
                '@nestjs/typeorm',
                'express',
                'cookie-parser',
                'amqplib',
                'amqp-connection-manager',
                'bcryptjs',
                'class-validator',
                'class-transformer',
              ],
              message:
                'Clean Architecture: application deve depender de Ports, não de frameworks ou adapters concretos.',
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
   *
   * Infrastructure implementa Ports definidos internamente.
   * Pode depender de Application e Domain.
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
   *
   * Presentation chama Use Cases.
   * Não deve acessar adapters concretos diretamente.
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
                'Clean Architecture: presentation deve acessar a aplicação através de Use Cases/Ports e não depender diretamente de infrastructure.',
            },
          ],
        },
      ],
    },
  },
);