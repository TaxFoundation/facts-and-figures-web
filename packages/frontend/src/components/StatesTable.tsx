import { kebabCase } from 'lodash';
import { useEffect, useState } from 'react';

import type { StateData, TableEntry } from '../types';
import { AlternateRowTable } from './Table';
import SortedHeading from './ui/SortedHeading';
import { StyledTableRow } from './ui/TableRow';

function valueCleanup(value: string): string {
	return value.trim().replace(/[$%,-]/g, '');
}

function sortValues(
	a: string | number | string[] | undefined,
	b: string | number | string[] | undefined,
	sortAsc: boolean,
): number {
	const aStr = typeof a === 'string' ? a : '';
	const bStr = typeof b === 'string' ? b : '';
	const aNum = typeof a === 'number' ? a : NaN;
	const bNum = typeof b === 'number' ? b : NaN;

	if (!isNaN(aNum) && !isNaN(bNum)) {
		return sortAsc ? aNum - bNum : bNum - aNum;
	}

	const A = aStr ? Number(valueCleanup(aStr)) : 0;
	const B = bStr ? Number(valueCleanup(bStr)) : 0;

	if (!isNaN(A) && !isNaN(B)) {
		return sortAsc ? A - B : B - A;
	}

	return 0;
}

interface StatesTableProps {
	id: string;
	data: TableEntry;
}

const StatesTable = ({ id, data }: StatesTableProps) => {
	const [sortBy, setSortBy] = useState('fips');
	const [sortAsc, setSortAsc] = useState(true);

	// Reset sort when table changes
	useEffect(() => {
		setSortBy('fips');
		setSortAsc(true);
	}, [id]);

	const stateData = data.data as StateData;

	return (
		<AlternateRowTable>
			<caption>
				<h1>{data.title}</h1>
				{data.subtitle ? <p>{data.subtitle}</p> : null}
				<p>{data.date}</p>
			</caption>
			<thead>
				<tr>
					{stateData.headers.map((header, i) => (
						<SortedHeading
							key={`table-${id}-header-${header.id}-${String(i)}`}
							$ascending={sortAsc}
							$orderedBy={sortBy}
							$headingId={header.id === 'state' ? 'fips' : header.id}
							onClick={() => {
								if (
									header.id === sortBy ||
									(header.id === 'state' && sortBy === 'fips')
								) {
									setSortAsc(!sortAsc);
								} else {
									setSortAsc(true);
								}
								if (header.id === 'state') {
									setSortBy('fips');
								} else {
									setSortBy(header.id);
								}
							}}
						>
							<div>{header.name}</div>
						</SortedHeading>
					))}
				</tr>
			</thead>
			<tbody>
				{[...stateData.values]
					.sort((a, b) => sortValues(a[sortBy], b[sortBy], sortAsc))
					.map(row => (
						<StyledTableRow key={`table-${id}-row-${kebabCase(row.state)}`}>
							{stateData.headers.map((header, i) => {
								const cellValue = row[header.id];
								const displayValue =
									typeof cellValue === 'string' || typeof cellValue === 'number'
										? cellValue
										: '';
								return (
									<td
										key={`table-${id}-row-${kebabCase(row.state)}-${String(i)}`}
									>
										{i === 0 && row.footnotes
											? `${String(displayValue)} (${row.footnotes.join(', ')})`
											: displayValue}
									</td>
								);
							})}
						</StyledTableRow>
					))}
			</tbody>
		</AlternateRowTable>
	);
};

export default StatesTable;
