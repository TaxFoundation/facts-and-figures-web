import React, { useState } from 'react';

import data from './data/data.json';

function App() {
  const [table, setTable] = useState('1');
  const keys = Object.keys(data);

  return (
    <div>
      <div>
        <select value={table} onChange={e => setTable(e.target.value)}>
          {keys.map(key => <option value={key}>{key}</option>)}
        </select>
      </div>
      <div>
        {data[table].map(row => {
          return <div>{row.map(cell => <span>{cell}</span>)}</div>
        })}
      </div>
    </div>
  );
}

export default App;
