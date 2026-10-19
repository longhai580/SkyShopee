import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Main from './components/MainComponent';
import MyProvider from './contexts/MyProvider';

function App() {
  return (
    <MyProvider>
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </MyProvider>
  );
}
export default App;
