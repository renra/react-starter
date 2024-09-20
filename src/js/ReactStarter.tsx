import * as React from 'react';
import * as ReactDOM from 'react-dom';

function App(): JSX.Element {
  return <h1>Hello World!</h1>
}

const init = (outletId : string) : void => {
  ReactDOM.render(
    <App/ >,
    document.getElementById(outletId)
  );
}

declare global {
    interface Window { ReactStarter: (outletId: string) => void; }
}

window.ReactStarter = init;
