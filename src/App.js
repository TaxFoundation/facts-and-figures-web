import React, { useState } from 'react';

import data from './data/data.json';

function App() {
  const [table, setTable] = useState('1');
  const keys = Object.keys(data);

  return (
    <div>
      <div>
        <select value={table} onChange={e => setTable(e.target.value)}>
          {keys.map(key => <option value={key}>{`Table ${key} - ${data[key].title}`}</option>)}
        </select>
      </div>
      <table>
        <caption>{data[table].title}<br />{data[table].date}</caption>
        {data[table].data.map(row => {
          return <tr>{row.map(cell => <td>{cell}</td>)}</tr>
        })}
      </table>
      {data[table].footnotes ? <p>{data[table].footnotes}</p> : null}
      {data[table].notes ? <p>{data[table].notes}</p> : null}
      {data[table].source ? <p>{data[table].source}</p> : null}
    </div>
  );
}

export default App;
