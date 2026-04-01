import { type ChangeEvent, useMemo } from 'react';

import styles from './App.module.css';
import BracketsTable from './components/BracketsTable';
import ErrorBoundary from './components/ErrorBoundary';
import SectionedTable from './components/SectionedTable';
import StatesTable from './components/StatesTable';
import Table from './components/Table';
import { ButtonLink } from './components/ui/Button';
import Select from './components/ui/Select';
import TableHeader from './components/ui/TableHeader';
import TableRow from './components/ui/TableRow';
import manifest from './data/manifest.json';
import { useHashParam } from './hooks/useHashParam';
import { useTableData } from './hooks/useTableData';
import type { Manifest } from './types';

const typedManifest = manifest as Manifest;
const keys = Object.keys(typedManifest);
const validKeys = new Set(keys);

function App() {
	const [tableId, setTableId] = useHashParam('table', '1', validKeys);
	const { table: currentTable, loading } = useTableData(tableId);

	const tableData = useMemo(
		() => (currentTable?.data as string[][] | undefined) ?? [],
		[currentTable],
	);

	return (
		<div className={styles.wrapper}>
			<div style={{ marginBottom: '1rem' }}>
				<Select
					value={tableId}
					onChange={(e: ChangeEvent<HTMLSelectElement>) => {
						setTableId(e.target.value);
					}}
				>
					{keys.map(key => {
						const entry = typedManifest[key];
						return (
							<option
								key={`table-option-${key}`}
								value={key}
							>{`Table ${key} - ${entry?.title ?? ''}`}</option>
						);
					})}
				</Select>
				<ButtonLink href={`data/table-${tableId}.xlsx`} download>
					Download Table {tableId} as an Excel File
				</ButtonLink>
			</div>
			<div aria-live="polite" className={styles.srOnly}>
				{currentTable
					? `Now showing Table ${tableId}: ${currentTable.title ?? ''}`
					: ''}
			</div>
			{loading ? (
				<p>Loading...</p>
			) : !currentTable ? (
				<p>Table not found.</p>
			) : (
				<>
					<ErrorBoundary key={tableId}>
						{currentTable.type === 'states' ? (
							<StatesTable id={tableId} data={currentTable} />
						) : currentTable.type === 'brackets' ? (
							<BracketsTable id={tableId} data={currentTable} />
						) : currentTable.type === 'sectioned' ? (
							<SectionedTable id={tableId} data={currentTable} />
						) : (
							<Table alternateRows={currentTable.alternateRows}>
								<caption>
									<h1>{currentTable.title}</h1>
									{currentTable.subtitle ? (
										<p>{currentTable.subtitle}</p>
									) : null}
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
											key={`table-${tableId}-row-${String(i + 1)}`}
											row={row}
										/>
									))}
								</tbody>
							</Table>
						)}
					</ErrorBoundary>
					{currentTable.footnotes
						? (currentTable.footnotes as string[][]).map((footnote, i) => (
								<p key={`footnote-${tableId}-${String(i)}`}>{footnote[0]}</p>
							))
						: null}
					{currentTable.notes ? <p>{currentTable.notes}</p> : null}
					{currentTable.source ? <p>{currentTable.source}</p> : null}
				</>
			)}
		</div>
	);
}

export default App;
