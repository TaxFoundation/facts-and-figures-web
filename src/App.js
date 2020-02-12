import React, { useState } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';

import Theme from './Theme';
import Select from './components/ui/Select';
import Table from './components/Table';
import StatesTable from './components/StatesTable';
import { StyledButtonLink } from './components/ui/Button';
import TableHeader from './components/ui/TableHeader';
import TableRow from './components/ui/TableRow';
import data from './data/data.json';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  html,
  body {
    font-weight: ${props => props.theme.fontWeight};
    line-height: 1.6;
    padding: 0 0 1px;
    @media screen {
      font-size: ${props => props.theme.fontSize};
    }
    @media print {
      font-size: ${props => props.theme.printSize};
    }
  }
  * {
    font-family: ${props => props.theme.fontFamilies.lato};
  }
  div,
  h1,
  h2,
  h3,
  p {
    page-break-inside: avoid;
  }
`;

const AppWrapper = styled.div`
  margin: 0 auto;
  max-width: 800px;
`;

function App() {
  const [table, setTable] = useState('1');
  const keys = Object.keys(data);

  return (
    <ThemeProvider theme={Theme}>
      <GlobalStyle />
      <AppWrapper>
        <div style={{ marginBottom: '1rem' }}>
          <Select value={table} onChange={e => setTable(e.target.value)}>
            {keys.map(key => (
              <option
                key={`table-option-${key}`}
                value={key}
              >{`Table ${key} - ${data[key].title}`}</option>
            ))}
          </Select>
          <StyledButtonLink href={`data/table-${table}.xlsx`} download>
            Download Table {table} as an Excel File
          </StyledButtonLink>
        </div>
        {data[table].type === 'states' ? (
          <StatesTable id={table} data={data[table]} />
        ) : (
          <Table>
            <caption>
              <h1>{data[table].title}</h1>
              {data[table].subtitle ? <p>{data[table].subtitle}</p> : null}
              <p>{data[table].date}</p>
            </caption>
            {data[table].data.map((row, i) =>
              i === 0 ? (
                <TableHeader key={`table-${table}-row-${i}`} headings={row} />
              ) : (
                <TableRow key={`table-${table}-row-${i}`} row={row} />
              )
            )}
          </Table>
        )}
        {data[table].footnotes
          ? data[table].footnotes.map((footnote, i) => (
              <p key={`footnote-${table}-${i}`}>{footnote[0]}</p>
            ))
          : null}
        {data[table].notes ? <p>{data[table].notes}</p> : null}
        {data[table].source ? <p>{data[table].source}</p> : null}
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
