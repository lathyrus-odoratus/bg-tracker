import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', 'apps/server/drizzle/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['apps/web/**'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    // 環境變數只能在 config 模組讀取
    files: ['apps/server/src/**/*.ts'],
    ignores: ['apps/server/src/config.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'process', property: 'env', message: '請透過 config 模組讀取設定' },
      ],
    },
  },
  {
    files: ['apps/web/src/**/*.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },
  {
    files: ['apps/web/src/**/*.{ts,vue}'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'import',
          property: 'meta',
          message: '前端不放環境設定，請用 GET /api/config',
        },
      ],
    },
  },
  prettier,
)
