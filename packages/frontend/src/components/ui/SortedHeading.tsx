import type { ComponentProps, KeyboardEvent } from 'react';

import styles from './SortedHeading.module.css';

interface SortedHeadingProps extends ComponentProps<'th'> {
	ascending: boolean;
	orderedBy: string;
	headingId: string;
}

const SortedHeading = ({
	ascending,
	orderedBy,
	headingId,
	children,
	onClick,
	...rest
}: SortedHeadingProps) => {
	const isActive = orderedBy === headingId;

	const handleKeyDown = (e: KeyboardEvent<HTMLTableCellElement>) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick?.(e as unknown as React.MouseEvent<HTMLTableCellElement>);
		}
	};

	return (
		<th
			className={styles.heading}
			data-active-asc={isActive && ascending}
			data-active-desc={isActive && !ascending}
			aria-sort={isActive ? (ascending ? 'ascending' : 'descending') : 'none'}
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={handleKeyDown}
			{...rest}
		>
			<div className={styles.inner}>{children}</div>
		</th>
	);
};

export default SortedHeading;
