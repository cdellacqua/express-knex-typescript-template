module.exports = {
	env: {
		es2020: true,
		node: true,
	},
	extends: [
		'airbnb-base',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 11,
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
	],
	rules: {
		'import/extensions': 'off',
		'no-console': 'off',
		'import/prefer-default-export': 'off',
		'no-plusplus': 'off',
		'no-tabs': [
			'error',
			{
				allowIndentationTabs: true,
			},
		],
		indent: [
			'error',
			'tab',
			{
				SwitchCase: 1,
			},
		],
		'max-len': ['error', { ignoreComments: true, code: 160 }],
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_' },
		],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'class-methods-use-this': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/ban-types': 'off',
		'no-useless-constructor': 'off',
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: [
					'.js',
					'.jsx',
					'.ts',
					'.tsx',
				],
			},
		},
	},
};
