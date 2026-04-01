import type { ReactNode } from 'react';

import styles from './Table.module.css';

interface TableProps {
	children: ReactNode;
	alternateRows?: boolean;
}

const Table = ({ children, alternateRows }: TableProps) => {
	const classNames = [styles.table];
	if (alternateRows) classNames.push(styles.alternateRows);
	return <table className={classNames.join(' ')}>{children}</table>;
};

export default Table;
