import styles from './TableRow.module.css';

export const TableRowClassName = styles.row;

const TableRow = ({ row }: { row: string[] }) => (
	<tr className={styles.row}>
		{row.map((cell, i) => (
			<td key={`cell-${cell}-${String(i)}`}>{cell}</td>
		))}
	</tr>
);

export default TableRow;
