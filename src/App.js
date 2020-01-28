import React from 'react';

import data from './data/data.json';

function App() {
  const keys = Object.keys(data);
  return (
    <div>
      {keys.map(key => {
        return <div>{data[key].map(row => {
          return <div>{row.map(cell => <span>{cell}</span>)}</div>
        })}</div>
      })}
    </div>
  );
}

export default App;
