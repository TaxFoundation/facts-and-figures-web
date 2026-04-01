import { useCallback, useEffect, useState } from 'react';

/**
 * Reads a parameter from the URL hash (e.g., #table=7 → "7").
 */
function getHashParam(key: string): string | null {
	const hash = window.location.hash.slice(1); // remove #
	const params = new URLSearchParams(hash);
	return params.get(key);
}

/**
 * Syncs a state value with a URL hash parameter.
 * Reads the initial value from the hash, and updates the hash on changes.
 */
export function useHashParam(
	key: string,
	defaultValue: string,
	validValues?: Set<string>,
): [string, (value: string) => void] {
	const [value, setValueState] = useState(() => {
		const hashValue = getHashParam(key);
		if (hashValue && (!validValues || validValues.has(hashValue))) {
			return hashValue;
		}
		return defaultValue;
	});

	const setValue = useCallback(
		(newValue: string) => {
			setValueState(newValue);
			window.location.hash = `${key}=${newValue}`;
		},
		[key],
	);

	useEffect(() => {
		const onHashChange = () => {
			const hashValue = getHashParam(key);
			if (hashValue && (!validValues || validValues.has(hashValue))) {
				setValueState(hashValue);
			}
		};
		window.addEventListener('hashchange', onHashChange);
		return () => {
			window.removeEventListener('hashchange', onHashChange);
		};
	}, [key, validValues]);

	return [value, setValue];
}
