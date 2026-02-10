import type { ReactNode } from 'react';
import styled from 'styled-components';

const StyledTable = styled.table`
	border-collapse: collapse;
	width: 100%;

	caption {
		margin: 2rem;
		color: ${props => props.theme.tfBlue};

		h1 {
			font-size: 1.75rem;
			font-weight: 700;
			line-height: 1;
			margin: 0;
		}

		p {
			font-size: 1.25rem;
			font-style: italic;
			margin: 0;
		}

		tr {
			font-family: ${props => props.theme.fontFamilies.RobotoMono};
		}
	}
`;

export const AlternateRowTable = styled(StyledTable)`
	tr:nth-child(even) {
		background-color: ${props => props.theme.tfBlueHighlight};
	}
`;

interface TableProps {
	children: ReactNode;
}

const Table = ({ children }: TableProps) => {
	return <StyledTable>{children}</StyledTable>;
};

export default Table;
