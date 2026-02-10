import styled from 'styled-components';

export const StyledTableRow = styled.tr`
	border-bottom: 1px solid ${props => props.theme.borderColor};
	border-top: 1px solid ${props => props.theme.borderColor};
	font-family: ${props => props.theme.fontFamilies.RobotoMono};

	td {
		padding: 0.25rem;
		text-align: center;
	}
`;

const TableRow = ({ row }: { row: string[] }) => (
	<StyledTableRow>
		{row.map((cell, i) => (
			<td key={`cell-${cell}-${String(i)}`}>{cell}</td>
		))}
	</StyledTableRow>
);

export default TableRow;
