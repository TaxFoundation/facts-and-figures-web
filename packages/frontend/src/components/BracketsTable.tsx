import styled from 'styled-components';

import type { TableEntry } from '../types';
import { StyledTable } from './Table';
import TableHeader from './ui/TableHeader';

const BracketRow = styled.tr<{
	$highlighted: boolean;
	$firstInGroup: boolean;
}>`
	font-family: ${props => props.theme.fontFamilies.RobotoMono};
	background-color: ${props =>
		props.$highlighted ? props.theme.tfBlueHighlight : 'transparent'};
	border-top-width: ${props => (props.$firstInGroup ? '1px' : '0')};
	border-top-style: solid;
	border-top-color: ${props => props.theme.borderColor};

	td {
		padding: 0.25rem;
		text-align: center;
		border-top-width: ${props => (props.$firstInGroup ? '0' : '1px')};
		border-top-style: solid;
		border-top-color: ${props => props.theme.borderColor};
	}

	td:first-child {
		border-top: none;
	}
`;

interface BracketsTableProps {
	id: string;
	data: TableEntry;
}

const BracketsTable = ({ id, data }: BracketsTableProps) => {
	const tableData = data.data as (string | null)[][];
	const headerRow = tableData[0];
	const dataRows = tableData.slice(1);

	// Assign a group index to each row: a row with non-null cell[0]
	// starts a new group; subsequent rows with null cell[0] continue it.
	let groupIndex = -1;
	const rowGroups = dataRows.map(row => {
		if (row[0] != null) {
			groupIndex++;
		}
		const firstInGroup = row[0] != null;
		return { row, group: groupIndex, firstInGroup };
	});

	return (
		<StyledTable>
			<caption>
				<h1>{data.title}</h1>
				{data.subtitle ? <p>{data.subtitle}</p> : null}
				<p>{data.date}</p>
			</caption>
			{headerRow ? (
				<thead>
					<TableHeader headings={headerRow as string[]} />
				</thead>
			) : null}
			<tbody>
				{rowGroups.map(({ row, group, firstInGroup }, i) => (
					<BracketRow
						key={`table-${id}-row-${String(i)}`}
						$highlighted={group % 2 === 0}
						$firstInGroup={firstInGroup}
					>
						{row.map((cell, j) => (
							<td key={`table-${id}-row-${String(i)}-cell-${String(j)}`}>
								{cell}
							</td>
						))}
					</BracketRow>
				))}
			</tbody>
		</StyledTable>
	);
};

export default BracketsTable;
