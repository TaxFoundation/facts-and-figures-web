import eslint from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'*.config.mjs',
						'packages/frontend/eslint.config.mjs',
					],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// Ensure CommonJS require() is an error - THE KEY RULE TO PREVENT THE BUG
			// (keeping this explicit even if included in strict to make it clear)
			'@typescript-eslint/no-require-imports': 'error',

			// Allow unused vars that start with underscore (common pattern for ignored args)
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
		},
	},
	// styled-components files have theme type resolution issues with typescript-eslint
	// TypeScript itself compiles fine, so we disable these rules for UI components
	{
		files: [
			'**/components/**/*.tsx',
			'**/components/**/*.ts',
			'**/App.tsx',
		],
		rules: {
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
		},
	},
	// Prettier configuration
	{
		files: ['**/*.{js,ts,tsx}'],
		plugins: {
			prettier,
		},
		rules: {
			'prettier/prettier': 'error',
		},
	},
	{
		ignores: [
			'dist/',
			'node_modules/',
			'*.config.js',
			'**/public/**/*.js',
			'**/*.test.ts',
			'**/*.test.tsx',
			'**/data/*.json',
		],
	},
);
