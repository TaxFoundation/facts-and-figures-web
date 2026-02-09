export interface State {
  id: number;
  postal: string;
  abbr: string;
  name: string;
}

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
  data: unknown[][] | StateData;
  footnotes?: unknown[][] | null;
  [key: string]: unknown;
}

export interface CompiledData {
  [key: string]: TableEntry;
}

export interface Mapping {
  sheetName: string;
  type: string;
  title?: string;
  subtitle?: string;
  date?: string;
  data?: string;
  notes?: string;
  source?: string;
  footnotes?: string;
}

export interface ParsedStateTable {
  headers: Header[];
  values: StateValue[];
}
