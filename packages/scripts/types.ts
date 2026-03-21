export type {
	Header,
	Manifest,
	ManifestEntry,
	SectionedData,
	SectionedRow,
	SectionedRowType,
	StateData,
	StateValue,
	TableEntry,
	TableType,
} from 'shared';

export interface State {
	id: number;
	postal: string;
	abbr: string;
	name: string;
}

export type CompiledData = Record<
	string,
	import('shared').TableEntry | undefined
>;

export interface Mapping {
	sheetName: string;
	type: import('shared').TableType;
	title?: string;
	subtitle?: string;
	date?: string;
	data?: string;
	notes?: string;
	source?: string;
	footnotes?: string;
}

export interface ParsedStateTable {
	headers: import('shared').Header[];
	values: import('shared').StateValue[];
}
