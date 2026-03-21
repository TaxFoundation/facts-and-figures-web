export interface Header {
	name: string;
	id: string;
	order: number;
}

export interface StateValue {
	state: string;
	fips: number;
	footnotes?: string[];
	[key: string]: string | number | string[] | undefined;
}

export interface StateData {
	headers: Header[];
	values: StateValue[];
}

export type TableType = 'states' | 'brackets' | 'table' | 'sectioned';

export type SectionedRowType =
	| 'section'
	| 'subsection'
	| 'columnHeader'
	| 'data'
	| 'separator';

export interface SectionedRow {
	type: SectionedRowType;
	cells: (string | null)[];
}

export interface SectionedData {
	rows: SectionedRow[];
}

export interface TableEntry {
	type: TableType;
	title?: string;
	subtitle?: string;
	date?: string;
	notes?: string;
	source?: string;
	data: unknown[][] | StateData | SectionedData;
	footnotes?: unknown[][] | null;
	alternateRows?: boolean;
	[key: string]: unknown;
}

export interface ManifestEntry {
	title?: string;
	type: TableType;
}

export type Manifest = Record<string, ManifestEntry>;
