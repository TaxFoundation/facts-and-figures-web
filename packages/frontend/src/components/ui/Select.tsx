import type { ComponentProps } from 'react';

import styles from './Select.module.css';

const Select = (props: ComponentProps<'select'>) => (
	<select className={styles.select} {...props} />
);

export default Select;
