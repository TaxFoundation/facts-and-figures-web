export default {
	plugins: ['@trivago/prettier-plugin-sort-imports'],
	arrowParens: 'avoid',
	printWidth: 80,
	singleQuote: true,
	useTabs: true,
	semi: true,
	importOrder: ['^[./]'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	importOrderCaseInsensitive: true,
};
