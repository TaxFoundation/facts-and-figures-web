import { useEffect, useState } from 'react';

import type { TableEntry } from '../types';

const cache = new Map<string, TableEntry>();

/**
 * Fetches a single table's data on demand, caching results in memory.
 * Returns the table entry and a loading flag.
 */
export function useTableData(tableId: string): {
	table: TableEntry | null;
	loading: boolean;
} {
	const [table, setTable] = useState<TableEntry | null>(
		cache.get(tableId) ?? null,
	);
	const [loading, setLoading] = useState(!cache.has(tableId));

	useEffect(() => {
		const cached = cache.get(tableId);
		if (cached) {
			setTable(cached);
			setLoading(false);
			return;
		}

		setLoading(true);
		setTable(null);

		fetch(`data/table-${tableId}.json`)
			.then(res => {
				if (!res.ok) throw new Error(`Failed to fetch table ${tableId}`);
				return res.json() as Promise<TableEntry>;
			})
			.then(data => {
				cache.set(tableId, data);
				setTable(data);
				setLoading(false);
			})
			.catch((err: unknown) => {
				console.error(err);
				setLoading(false);
			});
	}, [tableId]);

	return { table, loading };
}
