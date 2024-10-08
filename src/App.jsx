// src/App.jsx
import React from 'react';
import WhiskySearch from './components/WhiskySearch';
import './css/style.css'; // スタイルをインポート

const App = () => {
  return (
    <div className="app">
      <WhiskySearch />
    </div>
  );
};

export default App;
