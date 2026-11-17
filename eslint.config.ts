import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', '_legacy', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
    rules: {
      // docs/SECURITY.md sections 2 and 3.
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'No raw HTML. Render text as React children.',
        },
        {
          selector:
            "JSXOpeningElement[name.name='a'] > JSXAttribute[name.name='href'][value.value=/^(https?:)?\\/\\//]",
          message: 'Use <ExternalLink> from @/components/shared/ExternalLink for off-site links.',
        },
        {
          selector: 'MemberExpression[property.name=/^(innerHTML|outerHTML)$/]',
          message: 'No raw HTML sinks.',
        },
        {
          selector: 'CallExpression[callee.property.name=/^(insertAdjacentHTML|write)$/]',
          message: 'No raw HTML sinks.',
        },
      ],
    },
  },
  {
    // shadcn output exports variants alongside components; that is fine for HMR here.
    files: ['src/components/ui/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
