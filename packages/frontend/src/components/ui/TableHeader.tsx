import styles from './TableHeader.module.css';

const TableHeader = ({ headings }: { headings: string[] }) => (
	<tr className={styles.row}>
		{headings.map((heading, i) => (
			<th key={`cell-${heading}-${String(i)}`}>{heading}</th>
		))}
	</tr>
);

export default TableHeader;
