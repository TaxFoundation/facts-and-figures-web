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

export interface TableEntry {
	type: string;
	title?: string;
	subtitle?: string;
	date?: string;
	notes?: string;
	source?: string;
	data: string[][] | StateData;
	footnotes?: string[][] | null;
}

export type DataRecord = Record<string, TableEntry>;
