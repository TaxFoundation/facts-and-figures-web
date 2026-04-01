import type { ComponentProps } from 'react';

import styles from './Button.module.css';

export const ButtonLink = (props: ComponentProps<'a'>) => (
	<a className={[styles.button, styles.link].join(' ')} {...props} />
);
