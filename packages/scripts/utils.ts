/**
 * Converts a string to kebab-case, matching lodash's kebabCase behavior.
 *
 * Splits on camelCase boundaries, non-alphanumeric characters, and
 * joins the resulting words with hyphens.
 */
export function kebabCase(str: string): string {
	return str
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
		.replace(/[^a-zA-Z\d]+/g, ' ')
		.trim()
		.split(/\s+/)
		.join('-')
		.toLowerCase();
}
