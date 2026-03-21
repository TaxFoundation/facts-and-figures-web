import { type ChangeEvent, useState } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';

import BracketsTable from './components/BracketsTable';
import ErrorBoundary from './components/ErrorBoundary';
import SectionedTable from './components/SectionedTable';
import StatesTable from './components/StatesTable';
import Table, { AlternateRowTable } from './components/Table';
import { StyledButtonLink } from './components/ui/Button';
import Select from './components/ui/Select';
import TableHeader from './components/ui/TableHeader';
import TableRow from './components/ui/TableRow';
import data from './data/data.json';
import Theme from './Theme';
import type { DataRecord } from './types';

const typedData = data as DataRecord;

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  html,
  body {
    font-weight: ${props => props.theme.fontWeight};
    line-height: 1.6;
    padding: 0 0 1px;
    @media screen {
      font-size: ${props => props.theme.fontSize};
    }
    @media print {
      font-size: ${props => props.theme.printSize};
    }
  }
  thead,
  caption,
  a,
  caption p,
  th {
    font-family: ${props => props.theme.fontFamilies.RobotoFlex};
  }
  tbody,
  td,
  tfoot,
  td p {
    font-family: ${props => props.theme.fontFamilies.RobotoMono};
    font-size: .9rem;
  }
  p {
    font-family: ${props => props.theme.fontFamilies.RobotoMono};
    font-size: .7rem;
  }
  div,
  h1,
  h2,
  h3,
  p {
    page-break-inside: avoid;
  }
`;

const AppWrapper = styled.div`
	margin: 0 auto;
	max-width: 800px;
`;

function App() {
	const [table, setTable] = useState('1');
	const keys = Object.keys(typedData);

	const currentTable = typedData[table];
	if (!currentTable) return null;

	const tableData = currentTable.data as string[][];
	const GenericTable = currentTable.alternateRows ? AlternateRowTable : Table;

	return (
		<ThemeProvider theme={Theme}>
			<GlobalStyle />
			<AppWrapper>
				<div style={{ marginBottom: '1rem' }}>
					<Select
						value={table}
						onChange={(e: ChangeEvent<HTMLSelectElement>) => {
							setTable(e.target.value);
						}}
					>
						{keys.map(key => {
							const entry = typedData[key];
							return (
								<option
									key={`table-option-${key}`}
									value={key}
								>{`Table ${key} - ${entry?.title ?? ''}`}</option>
							);
						})}
					</Select>
					<StyledButtonLink href={`data/table-${table}.xlsx`} download>
						Download Table {table} as an Excel File
					</StyledButtonLink>
				</div>
				<ErrorBoundary key={table}>
					{currentTable.type === 'states' ? (
						<StatesTable id={table} data={currentTable} />
					) : currentTable.type === 'brackets' ? (
						<BracketsTable id={table} data={currentTable} />
					) : currentTable.type === 'sectioned' ? (
						<SectionedTable id={table} data={currentTable} />
					) : (
						<GenericTable>
							<caption>
								<h1>{currentTable.title}</h1>
								{currentTable.subtitle ? <p>{currentTable.subtitle}</p> : null}
								<p>{currentTable.date}</p>
							</caption>
							{tableData[0] ? (
								<thead>
									<TableHeader headings={tableData[0]} />
								</thead>
							) : null}
							<tbody>
								{tableData.slice(1).map((row, i) => (
									<TableRow
										key={`table-${table}-row-${String(i + 1)}`}
										row={row}
									/>
								))}
							</tbody>
						</GenericTable>
					)}
				</ErrorBoundary>
				{currentTable.footnotes
					? currentTable.footnotes.map((footnote, i) => (
							<p key={`footnote-${table}-${String(i)}`}>{footnote[0]}</p>
						))
					: null}
				{currentTable.notes ? <p>{currentTable.notes}</p> : null}
				{currentTable.source ? <p>{currentTable.source}</p> : null}
			</AppWrapper>
		</ThemeProvider>
	);
}

export default App;
