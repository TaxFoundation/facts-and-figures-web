import type { TableEntry } from '../types';
import styles from './BracketsTable.module.css';
import Table from './Table';
import TableHeader from './ui/TableHeader';

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
		<Table>
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
				{rowGroups.map(({ row, group, firstInGroup }, i) => {
					const classNames = [styles.row];
					if (group % 2 === 0) classNames.push(styles.highlighted);
					if (firstInGroup) classNames.push(styles.firstInGroup);

					return (
						<tr
							key={`table-${id}-row-${String(i)}`}
							className={classNames.join(' ')}
						>
							{row.map((cell, j) => (
								<td key={`table-${id}-row-${String(i)}-cell-${String(j)}`}>
									{cell}
								</td>
							))}
						</tr>
					);
				})}
			</tbody>
		</Table>
	);
};

export default BracketsTable;
