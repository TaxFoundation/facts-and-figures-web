import styled from 'styled-components';

import type { SectionedData, SectionedRow, TableEntry } from '../types';
import { StyledTable } from './Table';

const SectionHeaderRow = styled.tr<{ $first: boolean }>`
	td {
		font-family: ${p => p.theme.fontFamilies.RobotoFlex};
		font-weight: bold;
		color: ${p => p.theme.tfBlue};
		font-size: 1.1rem;
		padding: 0.25rem;
		padding-top: ${p => (p.$first ? '0' : '1rem')};
		border: none;
	}
`;

const SubSectionHeaderRow = styled.tr`
	td {
		font-family: ${p => p.theme.fontFamilies.RobotoFlex};
		font-weight: bold;
		font-style: italic;
		color: ${p => p.theme.tfBlue};
		font-size: 0.95rem;
		padding: 0.25rem;
		padding-top: 0.5rem;
		border: none;
	}
`;

const ColumnHeaderRow = styled.tr`
	border-bottom: 2px solid ${p => p.theme.tfBlue};

	th {
		font-weight: bold;
		padding: 0.25rem;
	}
`;

const DataRow = styled.tr<{ $highlighted: boolean }>`
	font-family: ${p => p.theme.fontFamilies.RobotoMono};
	background-color: ${p =>
		p.$highlighted ? p.theme.tfBlueHighlight : 'transparent'};

	td {
		padding: 0.25rem;
		text-align: center;
	}

	td:first-child {
		text-align: left;
	}
`;

interface SectionedTableProps {
	id: string;
	data: TableEntry;
}

const SectionedTable = ({ id, data }: SectionedTableProps) => {
	const sectionedData = data.data as SectionedData;
	const { rows } = sectionedData;
	const colCount = Math.max(...rows.map(r => r.cells.length));

	let dataRowIndex = 0;
	let isFirstSection = true;

	const renderRow = (row: SectionedRow, i: number) => {
		const key = `table-${id}-row-${String(i)}`;

		switch (row.type) {
			case 'separator':
				dataRowIndex = 0;
				return null;
			case 'section': {
				dataRowIndex = 0;
				const first = isFirstSection;
				isFirstSection = false;
				return (
					<SectionHeaderRow key={key} $first={first}>
						<td colSpan={colCount}>{row.cells.find(c => c != null)}</td>
					</SectionHeaderRow>
				);
			}
			case 'subsection': {
				dataRowIndex = 0;
				return (
					<SubSectionHeaderRow key={key}>
						<td colSpan={colCount}>{row.cells.find(c => c != null)}</td>
					</SubSectionHeaderRow>
				);
			}
			case 'columnHeader': {
				dataRowIndex = 0;
				return (
					<ColumnHeaderRow key={key}>
						{row.cells.map((cell, j) => (
							<th key={`${key}-cell-${String(j)}`}>{cell}</th>
						))}
					</ColumnHeaderRow>
				);
			}
			case 'data': {
				const highlighted = dataRowIndex % 2 === 0;
				dataRowIndex++;
				return (
					<DataRow key={key} $highlighted={highlighted}>
						{row.cells.map((cell, j) => (
							<td key={`${key}-cell-${String(j)}`}>{cell}</td>
						))}
					</DataRow>
				);
			}
		}
	};

	return (
		<StyledTable>
			<caption>
				<h1>{data.title}</h1>
				{data.subtitle ? <p>{data.subtitle}</p> : null}
				<p>{data.date}</p>
			</caption>
			<tbody>{rows.map(renderRow)}</tbody>
		</StyledTable>
	);
};

export default SectionedTable;
