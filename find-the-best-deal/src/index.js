import React from 'react';
import ReactDOM from 'react-dom';
import {App,Filter} from './App';



export const cards = ReactDOM.render(<App />, document.getElementById('root'));
export const filter = ReactDOM.render(<Filter />, document.getElementById('filter'));
