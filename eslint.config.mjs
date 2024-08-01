import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es6,
        ...globals.node
      }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      quotes: ['error', 'single'],
      'arrow-parens': ['error', 'always'],
      'computed-property-spacing': ['error', 'never'],
      'brace-style': 'error',
      'no-irregular-whitespace': 'error',
      indent: ['error', 2],
      'comma-dangle': ['error', 'never'],
      semi: ['error', 'never']
    }
  }
]
