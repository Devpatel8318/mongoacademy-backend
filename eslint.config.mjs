import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

export default [
	js.configs.recommended, // ESLint recommended rules
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				Buffer: 'readonly',
			},
			parser: tsparser,
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		plugins: {
			'@typescript-eslint': tseslint,
			prettier: prettier,
		},
		rules: {
			'prettier/prettier': 'error',
			'no-unused-vars': 'warn',
			'no-console': 'off',
		},
	},
]
