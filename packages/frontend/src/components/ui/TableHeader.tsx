import styled from 'styled-components';

export const StyledTableHeader = styled.tr`
	border-bottom: 2px solid ${props => props.theme.tfBlue};

	th {
		font-weight: bold;
	}
`;

const TableHeader = ({ headings }: { headings: string[] }) => (
	<StyledTableHeader>
		{headings.map(heading => (
			<th key={`cell-${heading}`}>{heading}</th>
		))}
	</StyledTableHeader>
);

export default TableHeader;
