import React, { useState } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';

import Theme from './Theme';
import Select from './components/Select';
import Table from './components/Table';
import TableHeader from './components/TableHeader';
import TableRow from './components/TableRow';
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
        <div>
          <Select value={table} onChange={e => setTable(e.target.value)}>
            {keys.map(key => (
              <option value={key}>{`Table ${key} - ${data[key].title}`}</option>
            ))}
          </Select>
        </div>
        <Table>
          <caption>
            <h1>{data[table].title}</h1>
            {data[table].subtitle ? <p>{data[table].subtitle}</p> : null}
            <p>{data[table].date}</p>
          </caption>
          {data[table].data.map((row, i) =>
            i === 0 ? <TableHeader headings={row} /> : <TableRow row={row} />
          )}
        </Table>
        {data[table].footnotes
          ? data[table].footnotes.map(footnote => <p>{footnote[0]}</p>)
          : null}
        {data[table].notes ? <p>{data[table].notes}</p> : null}
        {data[table].source ? <p>{data[table].source}</p> : null}
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
