import type { SectionedData, SectionedRow, TableEntry } from '../types';
import styles from './SectionedTable.module.css';
import Table from './Table';

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
				const classNames = [styles.sectionHeader];
				if (isFirstSection) classNames.push(styles.sectionHeaderFirst);
				isFirstSection = false;
				return (
					<tr key={key} className={classNames.join(' ')}>
						<td colSpan={colCount}>{row.cells.find(c => c != null)}</td>
					</tr>
				);
			}
			case 'subsection': {
				dataRowIndex = 0;
				return (
					<tr key={key} className={styles.subSectionHeader}>
						<td colSpan={colCount}>{row.cells.find(c => c != null)}</td>
					</tr>
				);
			}
			case 'columnHeader': {
				dataRowIndex = 0;
				return (
					<tr key={key} className={styles.columnHeader}>
						{row.cells.map((cell, j) => (
							<th key={`${key}-cell-${String(j)}`}>{cell}</th>
						))}
					</tr>
				);
			}
			case 'data': {
				const highlighted = dataRowIndex % 2 === 0;
				dataRowIndex++;
				const classNames = [styles.dataRow];
				if (highlighted) classNames.push(styles.dataRowHighlighted);
				return (
					<tr key={key} className={classNames.join(' ')}>
						{row.cells.map((cell, j) => (
							<td key={`${key}-cell-${String(j)}`}>{cell}</td>
						))}
					</tr>
				);
			}
		}
	};

	return (
		<Table>
			<caption>
				<h1>{data.title}</h1>
				{data.subtitle ? <p>{data.subtitle}</p> : null}
				<p>{data.date}</p>
			</caption>
			<tbody>{rows.map(renderRow)}</tbody>
		</Table>
	);
};

export default SectionedTable;
