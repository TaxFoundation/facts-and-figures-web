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

export type DataRecord = Record<string, import('shared').TableEntry>;
