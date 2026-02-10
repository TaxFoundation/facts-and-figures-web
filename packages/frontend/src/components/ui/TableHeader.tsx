import styled from 'styled-components';

export const StyledTableHeader = styled.tr`
	border-bottom: 2px solid ${props => props.theme.tfBlue};

	th {
		font-weight: bold;
	}
`;

const TableHeader = ({ headings }: { headings: string[] }) => (
	<StyledTableHeader>
		{headings.map((heading, i) => (
			<th key={`cell-${heading}-${String(i)}`}>{heading}</th>
		))}
	</StyledTableHeader>
);

export default TableHeader;
